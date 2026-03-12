/**
 * API Key Routes
 * 
 * API routes for API key management
 * 
 * @module routes/apiKey.routes
 */

import { Router } from 'express';
import {
  generateAPIKey,
  getAPIKeys,
  revokeAPIKeyEndpoint,
  getAPIKeyStats,
} from '../controllers/apiKey.controller';

const router = Router();

/**
 * POST /api/api-keys/generate
 * Generate a new API key
 * Body: { name, permissions?, rateLimitPerHour?, expiresAt? }
 */
router.post('/generate', generateAPIKey);

/**
 * GET /api/api-keys
 * Get all API keys (for management)
 */
router.get('/', getAPIKeys);

/**
 * DELETE /api/api-keys/:id
 * Revoke an API key
 */
router.delete('/:id', revokeAPIKeyEndpoint);

/**
 * GET /api/api-keys/:id/stats
 * Get API key usage statistics
 */
router.get('/:id/stats', getAPIKeyStats);

export default router;

