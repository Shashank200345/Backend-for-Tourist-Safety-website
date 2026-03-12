/**
 * API Key Controller
 * 
 * REST API endpoints for API key management
 * 
 * @module controllers/apiKey.controller
 */

import { Request, Response } from 'express';
import {
  createAPIKey,
  getAllAPIKeys,
  revokeAPIKey,
  APIKeyRecord,
} from '../services/apiKeyService';

/**
 * Generate a new API key
 * POST /api/api-keys/generate
 * Body: { name, permissions?, rateLimitPerHour?, expiresAt? }
 */
export const generateAPIKey = async (req: Request, res: Response) => {
  try {
    const {
      name,
      permissions = ['geofence', 'heatmap'],
      rateLimitPerHour = 1000,
      expiresAt,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
        message: 'Please provide a name for the API key',
      });
    }

    const result = await createAPIKey(
      name,
      permissions,
      rateLimitPerHour,
      expiresAt
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to generate API key',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: result.data,
      warning: '⚠️ Save this API key now! It will not be shown again.',
    });
  } catch (error: any) {
    console.error('Error generating API key:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Get all API keys (for management)
 * GET /api/api-keys
 */
export const getAPIKeys = async (req: Request, res: Response) => {
  try {
    const result = await getAllAPIKeys();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch API keys',
      });
    }

    // Remove sensitive data (key_hash) from response
    const safeKeys = result.data?.map((key: APIKeyRecord) => ({
      id: key.id,
      keyPrefix: key.key_prefix,
      name: key.name,
      permissions: key.permissions,
      isActive: key.is_active,
      rateLimitPerHour: key.rate_limit_per_hour,
      lastUsedAt: key.last_used_at,
      totalRequests: key.total_requests,
      expiresAt: key.expires_at,
      createdAt: key.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: safeKeys || [],
      count: safeKeys?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Revoke an API key
 * DELETE /api/api-keys/:id
 */
export const revokeAPIKeyEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'API key ID is required',
      });
    }

    const result = await revokeAPIKey(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to revoke API key',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error: any) {
    console.error('Error revoking API key:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Get API key usage statistics
 * GET /api/api-keys/:id/stats
 */
export const getAPIKeyStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // This would fetch stats from database
    // For now, return basic info
    return res.status(200).json({
      success: true,
      message: 'API key statistics endpoint - to be implemented',
    });
  } catch (error: any) {
    console.error('Error fetching API key stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

