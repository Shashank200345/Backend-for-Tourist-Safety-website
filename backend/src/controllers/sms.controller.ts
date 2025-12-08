/**
 * SMS Controller
 * 
 * REST API endpoints for SMS service management and manual triggers
 * 
 * @module controllers/sms.controller
 */

import { Request, Response } from 'express';
import { sendGeofenceSMSAlert, isSMSServiceReady } from '../services/smsService';
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

