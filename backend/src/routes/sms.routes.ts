/**
 * SMS Routes
 * 
 * API routes for SMS service management
 * 
 * @module routes/sms.routes
 */

import { Router } from 'express';
import { triggerSMS, getSMSStatus } from '../controllers/sms.controller';

const router = Router();

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

export default router;

