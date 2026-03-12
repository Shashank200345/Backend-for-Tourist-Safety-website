/**
 * Geofence Routes
 * 
 * API routes for geofence data endpoints
 * 
 * @module routes/geofence.routes
 */

import { Router } from 'express';
import {
  getZones,
  getZoneById,
  getZoneEvents,
  getGeofenceStats,
} from '../controllers/geofence.controller';
import { authenticateAPIKey, requirePermission } from '../middleware/apiKey.middleware';

const router = Router();

// Apply API key authentication to all geofence routes
router.use(authenticateAPIKey);
router.use(requirePermission('geofence'));

/**
 * GET /api/geofence/zones
 * Get all zones with optional filters
 * Query params: zone_type?, status?, region?, state?, district?
 */
router.get('/zones', getZones);

/**
 * GET /api/geofence/zones/:id
 * Get single zone by ID
 */
router.get('/zones/:id', getZoneById);

/**
 * GET /api/geofence/events
 * Get zone events with optional filters
 * Query params: zone_id?, user_id?, event_type?, start_date?, end_date?, limit?, offset?
 */
router.get('/events', getZoneEvents);

/**
 * GET /api/geofence/stats
 * Get geofence statistics
 */
router.get('/stats', getGeofenceStats);

export default router;

