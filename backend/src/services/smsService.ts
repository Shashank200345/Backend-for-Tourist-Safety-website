/**
 * SMS Service for Geofence-Based Alerts
 * 
 * This service sends SMS alerts to users when they enter geofenced zones.
 * Features:
 * - Sends SMS only for ENTER events (not EXIT)
 * - Implements cooldown mechanism to prevent spam
 * - Respects user notification preferences
 * - Scalable and secure implementation
 * 
 * @module services/smsService
 */

import twilio from 'twilio';
import supabase from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Cooldown Configuration (in milliseconds)
// Prevents sending multiple SMS for the same user-zone combination within this time window
const SMS_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes default

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('✅ SMS Service: Twilio client initialized');
} else {
  console.warn('⚠️ SMS Service: Twilio credentials not configured. SMS alerts will be disabled.');
}

/**
 * Cooldown cache to track recent SMS sends
 * Format: `${userId}:${zoneId}` -> timestamp
 */
const smsCooldownCache: Map<string, number> = new Map();

/**
 * Clean up cooldown cache periodically (every hour)
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, timestamp] of smsCooldownCache.entries()) {
    if (now - timestamp > SMS_COOLDOWN_MS) {
      smsCooldownCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 SMS Service: Cleaned ${cleaned} expired cooldown entries`);
  }
}, 60 * 60 * 1000); // Run every hour

/**
 * Check if SMS can be sent (cooldown check)
 * @param userId User ID
 * @param zoneId Zone ID
 * @returns true if SMS can be sent, false if in cooldown
 */
function canSendSMS(userId: string, zoneId: string): boolean {
  const key = `${userId}:${zoneId}`;
  const lastSent = smsCooldownCache.get(key);
  
  if (!lastSent) {
    return true;
  }
  
  const timeSinceLastSent = Date.now() - lastSent;
  return timeSinceLastSent >= SMS_COOLDOWN_MS;
}

/**
 * Mark SMS as sent (update cooldown cache)
 * @param userId User ID
 * @param zoneId Zone ID
 */
function markSMSSent(userId: string, zoneId: string): void {
  const key = `${userId}:${zoneId}`;
  smsCooldownCache.set(key, Date.now());
}

/**
 * Format phone number to E.164 format (required by Twilio)
 * @param phoneNumber Phone number in any format
 * @returns Formatted phone number or null if invalid
 */
function formatPhoneNumber(phoneNumber: string): string | null {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If doesn't start with +, assume it's a local number and needs country code
  // Default to +91 (India) if no country code present
  if (!cleaned.startsWith('+')) {
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    // Add +91 for India
    cleaned = '+91' + cleaned;
  }
  
  // Basic validation: should be 10-15 digits after +
  const digits = cleaned.replace('+', '');
  if (digits.length < 10 || digits.length > 15) {
    console.warn(`⚠️ Invalid phone number format: ${phoneNumber}`);
    return null;
  }
  
  return cleaned;
}

/**
 * Get user's phone number from users table and notification preferences
 * Handles mapping between auth.users.id and users.id (via direct match or email)
 * @param userId User ID (typically from auth.users.id)
 * @returns User data with phone number and preferences or null
 */
async function getUserPreferences(userId: string): Promise<{
  phone_number: string | null;
  notification_preferences: {
    sms?: boolean;
  } | null;
} | null> {
  try {
    // Strategy 1: Direct match - try to find user by ID in users table
    // (If users.id = auth.users.id)
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('contact_number, email')
      .eq('id', userId)
      .single();
    
    // Strategy 2: If not found by ID, try to find by auth user's email
    // (If users.email = auth.users.email, but IDs differ)
    if (userError && userError.code === 'PGRST116') {
      // PGRST116 = no rows returned
      // Try to get auth user email and match with users.email
      try {
        // Use admin API to get auth user details
        const { data: authUsers, error: authError } = await supabase.auth.admin.getUserById(userId);
        
        if (!authError && authUsers?.user?.email) {
          // Find user in users table by email
          const { data: userByEmail, error: emailError } = await supabase
            .from('users')
            .select('contact_number, email')
            .eq('email', authUsers.user.email)
            .single();
          
          if (!emailError && userByEmail) {
            userData = userByEmail;
            userError = null;
          }
        }
      } catch (authErr) {
        // If admin API fails, continue with error
        console.warn('Could not fetch auth user details for mapping:', authErr);
      }
    }
    
    // If still no user found, return null
    if (userError || !userData) {
      console.error('Error fetching user from users table:', userError);
      
      // Fallback: Try user_profiles table (if it exists for backward compatibility)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('phone_number, notification_preferences')
        .eq('id', userId)
        .single();
      
      if (!profileError && profileData) {
        return {
          phone_number: profileData.phone_number,
          notification_preferences: profileData.notification_preferences,
        };
      }
      
      return null;
    }
    
    // Convert numeric contact_number to string
    // Handle both numeric and string formats
    let phoneNumber: string | null = null;
    if (userData.contact_number !== null && userData.contact_number !== undefined) {
      phoneNumber = String(userData.contact_number);
      console.log(`📱 Found phone number for user ${userId}: ${phoneNumber} (from users.contact_number)`);
    } else {
      console.warn(`⚠️ User ${userId} found in users table but contact_number is null/empty`);
    }
    
    // Try to get notification preferences from user_profiles (if exists)
    // Otherwise default to SMS enabled
    let notificationPreferences: { sms?: boolean } | null = { sms: true };
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single();
      
      if (profileData?.notification_preferences) {
        notificationPreferences = profileData.notification_preferences;
      }
    } catch (err) {
      // user_profiles might not exist, that's okay - use default
      console.log('user_profiles not found or error fetching preferences, using defaults');
    }
    
    return {
      phone_number: phoneNumber,
      notification_preferences: notificationPreferences,
    };
  } catch (error) {
    console.error('Exception fetching user preferences:', error);
    return null;
  }
}

/**
 * Get zone information
 * @param zoneId Zone ID
 * @returns Zone data or null
 */
async function getZoneInfo(zoneId: string): Promise<{
  name: string;
  zone_type: string;
  risk_level?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('name, zone_type, risk_level')
      .eq('id', zoneId)
      .single();
    
    if (error) {
      console.error('Error fetching zone info:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching zone info:', error);
    return null;
  }
}

/**
 * Generate SMS message based on zone type and risk level
 * @param zoneName Zone name
 * @param zoneType Zone type (SAFE, MONITORED, RESTRICTED, EMERGENCY)
 * @param riskLevel Risk level (LOW, MEDIUM, HIGH, CRITICAL)
 * @returns Formatted SMS message
 */
function generateSMSMessage(
  zoneName: string,
  zoneType: string,
  riskLevel?: string
): string {
  // This function is only called for RED zones (RESTRICTED/EMERGENCY)
  // since the watcher filters before calling SMS service
  if (zoneType === 'RESTRICTED') {
    return `🚨 HIGH RISK ALERT: You have entered a RESTRICTED zone: "${zoneName}".

⚠️ Please exercise extreme caution. Avoid this area if possible.

Stay alert and follow all safety guidelines.
Tourist Safety System - Safe Yatra`;
  } else if (zoneType === 'EMERGENCY') {
    return `🚨 EMERGENCY ALERT: You have entered an EMERGENCY zone: "${zoneName}".

⚠️ This is a high-risk area. Please leave immediately if safe to do so.

Contact emergency services if needed.
Tourist Safety System - Safe Yatra`;
  } else {
    // Fallback (shouldn't reach here for SMS, but for completeness)
    return `📍 Alert: You have entered zone "${zoneName}".

Please stay alert.
Tourist Safety System - Safe Yatra`;
  }
}

/**
 * Send SMS alert to user
 * @param userId User ID
 * @param zoneId Zone ID
 * @param zoneName Zone name (optional, will be fetched if not provided)
 * @param zoneType Zone type (optional, will be fetched if not provided)
 * @returns Success status and message
 */
export async function sendGeofenceSMSAlert(
  userId: string,
  zoneId: string,
  zoneName?: string,
  zoneType?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  // Check if Twilio is configured
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    return {
      success: false,
      message: 'SMS service not configured',
      error: 'Twilio credentials not set',
    };
  }
  
  // Check cooldown
  if (!canSendSMS(userId, zoneId)) {
    const key = `${userId}:${zoneId}`;
    const lastSent = smsCooldownCache.get(key) || 0;
    const minutesAgo = Math.floor((Date.now() - lastSent) / 60000);
    
    console.log(
      `⏭️ SMS Skipped: Cooldown active for user ${userId} (zone: ${zoneId}). Last sent ${minutesAgo} minutes ago.`
    );
    
    return {
      success: false,
      message: 'SMS skipped due to cooldown',
      error: `Cooldown active. Last sent ${minutesAgo} minutes ago.`,
    };
  }
  
  // Get user preferences
  const userPrefs = await getUserPreferences(userId);
  if (!userPrefs) {
    return {
      success: false,
      message: 'User preferences not found',
      error: 'Unable to fetch user profile',
    };
  }
  
  // Check if SMS notifications are enabled
  const smsEnabled = userPrefs.notification_preferences?.sms !== false; // Default to true if not specified
  if (!smsEnabled) {
    console.log(`⚠️ SMS Skipped: SMS notifications disabled for user ${userId}`);
    return {
      success: false,
      message: 'SMS notifications disabled',
      error: 'User has disabled SMS notifications',
    };
  }
  
  // Get phone number
  const phoneNumber = userPrefs.phone_number;
  if (!phoneNumber) {
    console.log(`⚠️ SMS Skipped: No phone number found for user ${userId}`);
    return {
      success: false,
      message: 'Phone number not found',
      error: 'User does not have a phone number on file',
    };
  }
  
  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return {
      success: false,
      message: 'Invalid phone number format',
      error: 'Unable to format phone number',
    };
  }
  
  // Get zone information if not provided
  if (!zoneName || !zoneType) {
    const zoneInfo = await getZoneInfo(zoneId);
    if (!zoneInfo) {
      return {
        success: false,
        message: 'Zone information not found',
        error: 'Unable to fetch zone details',
      };
    }
    zoneName = zoneInfo.name;
    zoneType = zoneInfo.zone_type;
  }
  
  // Generate message
  const message = generateSMSMessage(zoneName, zoneType);
  
  // Send SMS via Twilio
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    
    // Mark SMS as sent (update cooldown)
    markSMSSent(userId, zoneId);
    
    console.log(
      `✅ SMS Alert Sent: Zone "${zoneName}" entered by user ${userId}. Twilio SID: ${result.sid}`
    );
    
    return {
      success: true,
      message: 'SMS sent successfully',
    };
  } catch (error: any) {
    console.error('❌ Twilio SMS Error:', error);
    
    return {
      success: false,
      message: 'Failed to send SMS',
      error: error.message || 'Unknown Twilio error',
    };
  }
}

/**
 * Check if SMS service is configured and ready
 * @returns true if SMS service is ready
 */
export function isSMSServiceReady(): boolean {
  return twilioClient !== null && TWILIO_PHONE_NUMBER !== undefined;
}

/**
 * Send a test SMS directly to verify Twilio integration
 * This bypasses user preferences and cooldown for testing purposes
 * @param phoneNumber Phone number to send test SMS to (E.164 format or will be formatted)
 * @returns Success status and message
 */
export async function sendTestSMS(
  phoneNumber: string
): Promise<{ success: boolean; message: string; error?: string; sid?: string }> {
  // Check if Twilio is configured
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    return {
      success: false,
      message: 'SMS service not configured',
      error: 'Twilio credentials not set. Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env file',
    };
  }

  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return {
      success: false,
      message: 'Invalid phone number format',
      error: `Unable to format phone number: ${phoneNumber}. Please provide a valid phone number (e.g., +919876543210 or 9876543210)`,
    };
  }

  // Generate test message
  const testMessage = `✅ Twilio SMS Test - Safe Yatra

This is a test SMS to verify Twilio integration is working correctly.

If you received this message, your SMS service is properly configured!

Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Tourist Safety System`;

  try {
    console.log(`📤 Sending test SMS to: ${formattedPhone} from: ${TWILIO_PHONE_NUMBER}`);
    
    const result = await twilioClient.messages.create({
      body: testMessage,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`✅ Test SMS sent successfully! Twilio SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   To: ${formattedPhone}`);
    console.log(`   From: ${TWILIO_PHONE_NUMBER}`);

    return {
      success: true,
      message: 'Test SMS sent successfully!',
      sid: result.sid,
    };
  } catch (error: any) {
    console.error('❌ Twilio Test SMS Error:', error);
    
    // Provide helpful error messages
    let errorMessage = error.message || 'Unknown Twilio error';
    if (error.code === 21211) {
      errorMessage = 'Invalid phone number. Please check the number format.';
    } else if (error.code === 21608) {
      errorMessage = 'The phone number is not verified in your Twilio trial account. Verify it in Twilio Console.';
    } else if (error.code === 21214) {
      errorMessage = 'Invalid "from" phone number. Check TWILIO_PHONE_NUMBER in .env file.';
    }

    return {
      success: false,
      message: 'Failed to send test SMS',
      error: errorMessage,
    };
  }
}

/**
 * Send SMS and make phone call for geofence alert (hardcoded for testing)
 * @param phoneNumber Phone number to send alert to (hardcoded if not provided)
 * @param zoneName Zone name
 * @param zoneType Zone type
 * @returns Success status and message
 */
export async function sendGeofenceAlertWithCall(
  phoneNumber?: string,
  zoneName?: string,
  zoneType?: string
): Promise<{ success: boolean; message: string; smsSid?: string; callSid?: string; error?: string }> {
  // Check if Twilio is configured
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    return {
      success: false,
      message: 'SMS service not configured',
      error: 'Twilio credentials not set',
    };
  }

  // HARDCODED VALUES
  const HARDCODED_PHONE = phoneNumber || process.env.HARDCODED_TEST_PHONE || '+919876543210';
  const HARDCODED_ZONE_NAME = zoneName || 'High Risk Area';
  const HARDCODED_ZONE_TYPE = zoneType || 'RESTRICTED';

  // Format phone number
  const formattedPhone = formatPhoneNumber(HARDCODED_PHONE);
  if (!formattedPhone) {
    return {
      success: false,
      message: 'Invalid phone number format',
      error: 'Unable to format phone number',
    };
  }

  // Generate alert message with precaution description
  let alertMessage = '';
  let precautionText = '';

  if (HARDCODED_ZONE_TYPE === 'RESTRICTED') {
    alertMessage = `🚨 HIGH RISK ALERT: You have entered a RESTRICTED zone: "${HARDCODED_ZONE_NAME}".`;
    precautionText = 'Please exercise extreme caution. Avoid this area if possible. Stay alert and follow all safety guidelines. Contact local authorities if needed.';
  } else if (HARDCODED_ZONE_TYPE === 'EMERGENCY') {
    alertMessage = `🚨 EMERGENCY ALERT: You have entered an EMERGENCY zone: "${HARDCODED_ZONE_NAME}".`;
    precautionText = 'This is a high-risk area. Please leave immediately if safe to do so. Contact emergency services if needed. Stay with a group and avoid isolated areas.';
  } else {
    alertMessage = `📍 Alert: You have entered zone "${HARDCODED_ZONE_NAME}".`;
    precautionText = 'Please stay alert and follow local guidelines. Keep your emergency contacts informed of your location.';
  }

  const fullMessage = `${alertMessage}\n\n⚠️ Precaution: ${precautionText}\n\nTourist Safety System - Safe Yatra`;

  try {
    // Send SMS
    const smsResult = await twilioClient.messages.create({
      body: fullMessage,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`✅ SMS sent to ${formattedPhone}. SID: ${smsResult.sid}`);

    // Make phone call with the same message
    // Twilio will use text-to-speech to read the message
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const voiceUrl = `${backendUrl}/api/sms/voice-alert?zoneName=${encodeURIComponent(HARDCODED_ZONE_NAME)}&zoneType=${encodeURIComponent(HARDCODED_ZONE_TYPE)}`;
    
    const callResult = await twilioClient.calls.create({
      url: voiceUrl,
      to: formattedPhone,
      from: TWILIO_PHONE_NUMBER,
      method: 'GET',
    });

    console.log(`✅ Phone call initiated to ${formattedPhone}. Call SID: ${callResult.sid}`);

    return {
      success: true,
      message: 'SMS and phone call sent successfully',
      smsSid: smsResult.sid,
      callSid: callResult.sid,
    };
  } catch (error: any) {
    console.error('❌ Error sending geofence alert:', error);
    return {
      success: false,
      message: 'Failed to send alert',
      error: error.message || 'Unknown error occurred',
    };
  }
}

