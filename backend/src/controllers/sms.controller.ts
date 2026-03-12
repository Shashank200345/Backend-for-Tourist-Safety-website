/**
 * SMS Controller
 * 
 * REST API endpoints for SMS service management and manual triggers
 * 
 * @module controllers/sms.controller
 */

import { Request, Response } from 'express';
import { sendGeofenceSMSAlert, isSMSServiceReady, sendTestSMS, sendGeofenceAlertWithCall } from '../services/smsService';
import { getWatcherStatus } from '../services/geofenceSMSWatcher';

/**
 * Manually trigger SMS alert for testing/administration
 * POST /api/sms/trigger
 * Body: { userId, zoneId, zoneName?, zoneType? }
 */
export const triggerSMS = async (req: Request, res: Response) => {
  try {
    const { userId, zoneId, zoneName, zoneType } = req.body;
    
    // Validate required fields
    if (!userId || !zoneId) {
      return res.status(400).json({
        error: 'Missing required fields: userId and zoneId are required',
      });
    }
    
    // Check if SMS service is ready
    if (!isSMSServiceReady()) {
      return res.status(503).json({
        error: 'SMS service not configured',
        message: 'Twilio credentials are not set in environment variables',
      });
    }
    
    // Send SMS alert
    const result = await sendGeofenceSMSAlert(userId, zoneId, zoneName, zoneType);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error triggering SMS:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Get SMS service status
 * GET /api/sms/status
 */
export const getSMSStatus = async (req: Request, res: Response) => {
  try {
    const watcherStatus = getWatcherStatus();
    
    return res.status(200).json({
      smsServiceReady: isSMSServiceReady(),
      watcher: {
        isWatching: watcherStatus.isWatching,
        channelStatus: watcherStatus.channelStatus,
      },
    });
  } catch (error: any) {
    console.error('Error getting SMS status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Send a test SMS to verify Twilio integration
 * POST /api/sms/test
 * Body: { phoneNumber: string }
 */
export const testSMS = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Missing required field: phoneNumber',
        message: 'Please provide a phone number to send test SMS (e.g., +919876543210 or 9876543210)',
      });
    }

    // Check if SMS service is ready
    if (!isSMSServiceReady()) {
      return res.status(503).json({
        error: 'SMS service not configured',
        message: 'Twilio credentials are not set in environment variables. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in backend/.env',
      });
    }

    // Send test SMS
    const result = await sendTestSMS(phoneNumber);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        sid: result.sid,
        info: 'Test SMS sent successfully! Check your phone for the message.',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error sending test SMS:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Simulate user inside geofence and send SMS + phone call alert
 * POST /api/sms/simulate-geofence-alert
 * Body: { phoneNumber?, zoneName?, zoneType? }
 */
export const simulateGeofenceAlert = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, zoneName, zoneType } = req.body;
    
    // Check if SMS service is ready
    if (!isSMSServiceReady()) {
      return res.status(503).json({
        error: 'SMS service not configured',
        message: 'Twilio credentials are not set in environment variables',
      });
    }

    // Send SMS and make phone call
    const result = await sendGeofenceAlertWithCall(phoneNumber, zoneName, zoneType);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        smsSid: result.smsSid,
        callSid: result.callSid,
        details: {
          phoneNumber: phoneNumber || process.env.HARDCODED_TEST_PHONE || '+919876543210',
          zoneName: zoneName || 'High Risk Area',
          zoneType: zoneType || 'RESTRICTED',
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error simulating geofence alert:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * TwiML endpoint for voice call (reads the alert message)
 * GET /api/sms/voice-alert
 */
export const voiceAlert = async (req: Request, res: Response) => {
  try {
    const { zoneName, zoneType } = req.query;
    
    const HARDCODED_ZONE_NAME = (zoneName as string) || 'High Risk Area';
    const HARDCODED_ZONE_TYPE = (zoneType as string) || 'RESTRICTED';

    let alertMessage = '';
    let precautionText = '';

    if (HARDCODED_ZONE_TYPE === 'RESTRICTED') {
      alertMessage = `High Risk Alert. You have entered a Restricted zone: ${HARDCODED_ZONE_NAME}.`;
      precautionText = 'Please exercise extreme caution. Avoid this area if possible. Stay alert and follow all safety guidelines. Contact local authorities if needed.';
    } else if (HARDCODED_ZONE_TYPE === 'EMERGENCY') {
      alertMessage = `Emergency Alert. You have entered an Emergency zone: ${HARDCODED_ZONE_NAME}.`;
      precautionText = 'This is a high-risk area. Please leave immediately if safe to do so. Contact emergency services if needed. Stay with a group and avoid isolated areas.';
    } else {
      alertMessage = `Alert. You have entered zone: ${HARDCODED_ZONE_NAME}.`;
      precautionText = 'Please stay alert and follow local guidelines. Keep your emergency contacts informed of your location.';
    }

    const fullMessage = `${alertMessage} Precaution: ${precautionText}. Tourist Safety System - Safe Yatra.`;

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${fullMessage}</Say>
  <Pause length="2"/>
  <Say voice="alice" language="en-US">This is an automated safety alert. Please take necessary precautions.</Say>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error: any) {
    console.error('Error generating voice alert:', error);
    res.status(500).send('Error generating voice alert');
  }
};

