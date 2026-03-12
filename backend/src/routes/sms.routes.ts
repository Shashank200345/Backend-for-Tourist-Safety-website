/**
 * SMS Routes
 * 
 * API routes for SMS service management
 * 
 * @module routes/sms.routes
 */

import { Router } from 'express';
import { triggerSMS, getSMSStatus, testSMS, simulateGeofenceAlert, voiceAlert } from '../controllers/sms.controller';

const router = Router();

/**
 * POST /api/sms/test
 * Send a test SMS to verify Twilio integration
 * Body: { phoneNumber: string } - e.g., "+919876543210" or "9876543210"
 */
router.post('/test', testSMS);

/**
 * POST /api/sms/trigger
 * Manually trigger SMS alert
 * Body: { userId, zoneId, zoneName?, zoneType? }
 */
router.post('/trigger', triggerSMS);

/**
 * GET /api/sms/status
 * Get SMS service status
 */
router.get('/status', getSMSStatus);

/**
 * POST /api/sms/simulate-geofence-alert
 * Simulate user inside geofence and send SMS + phone call
 * Body: { phoneNumber?, zoneName?, zoneType? }
 */
router.post('/simulate-geofence-alert', simulateGeofenceAlert);

/**
 * GET /api/sms/voice-alert
 * TwiML endpoint for voice call (reads the alert message)
 */
router.get('/voice-alert', voiceAlert);

export default router;

