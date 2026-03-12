/**
 * Supabase Edge Function: notify
 * 
 * Sends notifications via:
 * - FCM (Firebase Cloud Messaging) for push notifications
 * - Twilio WhatsApp API for WhatsApp messages
 * 
 * Triggered by zone_events table insert via database trigger or webhook
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  zoneId: string;
  zoneName: string;
  zoneType: string;
  eventType: 'ENTER' | 'EXIT';
  methods?: string[]; // ['push', 'whatsapp', 'sms', 'email']
}

// Send FCM push notification
async function sendFCMNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY');
  if (!FCM_SERVER_KEY) {
    console.warn('FCM_SERVER_KEY not configured');
    return { success: false, error: 'FCM not configured' };
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${FCM_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title,
          body,
          sound: 'default',
          badge: '1',
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        priority: 'high',
      }),
    });

    const result = await response.json();
    return { success: response.ok, result };
  } catch (error: any) {
    console.error('FCM error:', error);
    return { success: false, error: error.message };
  }
}

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
) {
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
  const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM'); // Format: whatsapp:+14155238886

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.warn('Twilio credentials not configured');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Format phone number (add country code if needed)
    const formattedNumber = phoneNumber.startsWith('whatsapp:')
      ? phoneNumber
      : `whatsapp:${phoneNumber.replace(/^\+/, '')}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_FROM,
          To: formattedNumber,
          Body: message,
        }),
      }
    );

    const result = await response.json();
    return { success: response.ok, result };
  } catch (error: any) {
    console.error('Twilio WhatsApp error:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const notification: NotificationRequest = await req.json();
    const {
      userId,
      zoneId,
      zoneName,
      zoneType,
      eventType,
      methods = ['push', 'whatsapp'],
    } = notification;

    if (!userId || !zoneId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or zoneId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

       // Get user profile for notification preferences and contact info
       const { data: userProfile, error: profileError } = await supabase
       .from('user_profiles')
       .select('*')
       .eq('id', userId)
       .single();
 
     // Handle missing profile gracefully (for testing)
     if (profileError || !userProfile) {
       console.warn('User profile not found, skipping notifications');
       return new Response(
         JSON.stringify({
           success: true,
           results: { 
             message: 'User profile not found, notifications skipped',
             profile_exists: false 
           },
           notification: {
             userId,
             zoneId,
             zoneName,
             eventType,
           },
         }),
         {
           status: 200,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         }
       );
     }


    // Check notification preferences
    const prefs = userProfile.notification_preferences || {};
    const results: Record<string, any> = {};

    // Prepare notification message
    const eventText = eventType === 'ENTER' ? 'entered' : 'exited';
    const riskLevel = zoneType === 'RESTRICTED' ? '⚠️ HIGH RISK' : zoneType === 'EMERGENCY' ? '🚨 EMERGENCY' : '';
    const title = `${eventType === 'ENTER' ? '📍 Entered' : '📍 Exited'} Zone: ${zoneName}`;
    const body = `You have ${eventText} the zone "${zoneName}". ${riskLevel}`;

    // Send push notification via FCM
    if (methods.includes('push') && prefs.push && userProfile.fcm_token) {
      const pushResult = await sendFCMNotification(
        userProfile.fcm_token,
        title,
        body,
        {
          zoneId,
          zoneName,
          zoneType,
          eventType,
          userId,
        }
      );
      results.push = pushResult;
    }

    // Send WhatsApp message via Twilio
    if (
      methods.includes('whatsapp') &&
      prefs.whatsapp &&
      userProfile.phone_number
    ) {
      const whatsappResult = await sendWhatsAppMessage(
        userProfile.phone_number,
        `${title}\n\n${body}\n\nStay safe!`
      );
      results.whatsapp = whatsappResult;
    }

    // Send SMS via Twilio (similar to WhatsApp)
    if (methods.includes('sms') && prefs.sms && userProfile.phone_number) {
      // Similar implementation to WhatsApp but using SMS endpoint
      results.sms = { success: false, message: 'SMS not yet implemented' };
    }

    // Send email notification
    if (methods.includes('email') && prefs.email && userProfile.email) {
      // Email implementation would go here (e.g., using SendGrid, Resend, etc.)
      results.email = { success: false, message: 'Email not yet implemented' };
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        notification: {
          userId,
          zoneId,
          zoneName,
          eventType,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in notify function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

