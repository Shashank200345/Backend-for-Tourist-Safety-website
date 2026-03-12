/**
 * Heatmap Routes
 * 
 * API routes for heatmap data endpoints
 * 
 * @module routes/heatmap.routes
 */

import { Router } from 'express';
import {
  getHeatmapData,
  getHeatmapStats,
} from '../controllers/heatmap.controller';
import { authenticateAPIKey, requirePermission } from '../middleware/apiKey.middleware';

const router = Router();

// Apply API key authentication to all heatmap routes
router.use(authenticateAPIKey);
router.use(requirePermission('heatmap'));

/**
 * GET /api/heatmap/data
 * Get heatmap data points
 * Query params: start_date?, end_date?, source?, intensity_threshold?, limit?
 */
router.get('/data', getHeatmapData);

/**
 * GET /api/heatmap/stats
 * Get heatmap statistics
 * Query params: start_date?, end_date?, source?
 */
router.get('/stats', getHeatmapStats);

export default router;

