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
 * Get user's notification preferences and phone number
 * @param userId User ID
 * @returns User profile with preferences or null
 */
async function getUserPreferences(userId: string): Promise<{
  phone_number: string | null;
  notification_preferences: {
    sms?: boolean;
  } | null;
} | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('phone_number, notification_preferences')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
    
    return data;
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
  let prefix = '';
  
  if (zoneType === 'RESTRICTED') {
    prefix = '⚠️ HIGH RISK: ';
  } else if (zoneType === 'EMERGENCY') {
    prefix = '🚨 EMERGENCY: ';
  } else if (zoneType === 'MONITORED') {
    prefix = '📍 MONITORED: ';
  } else {
    prefix = '📍 SAFE: ';
  }
  
  const message = `${prefix}You have entered zone "${zoneName}".
  
Please stay alert and follow safety guidelines.

Tourist Safety System`;

  return message;
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

