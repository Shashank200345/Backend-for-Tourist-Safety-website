/**
 * API Key Authentication Middleware
 * 
 * Validates API keys from request headers
 * 
 * @module middleware/apiKey.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { validateAPIKey, hasPermission, APIKeyRecord } from '../services/apiKeyService';

export interface APIKeyRequest extends Request {
  apiKey?: APIKeyRecord;
}

/**
 * Middleware to authenticate requests using API key
 * Expects API key in header: X-API-Key or Authorization: Bearer <key>
 */
export async function authenticateAPIKey(
  req: APIKeyRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get API key from headers
    const apiKey =
      req.headers['x-api-key'] ||
      req.headers['X-API-Key'] ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!apiKey || typeof apiKey !== 'string') {
      res.status(401).json({
        success: false,
        error: 'API key required',
        message: 'Please provide an API key in X-API-Key header or Authorization header',
      });
      return;
    }

    // Validate API key
    const validation = await validateAPIKey(apiKey);

    if (!validation.valid || !validation.keyData) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: validation.error || 'The provided API key is invalid or expired',
      });
      return;
    }

    // Attach key data to request
    req.apiKey = validation.keyData;

    next();
  } catch (error: any) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred while validating your API key',
    });
  }
}

/**
 * Middleware to check if API key has permission for specific endpoint
 */
export function requirePermission(endpoint: 'geofence' | 'heatmap') {
  return (req: APIKeyRequest, res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required',
      });
      return;
    }

    if (!hasPermission(req.apiKey, endpoint)) {
      res.status(403).json({
        success: false,
        error: 'Permission denied',
        message: `Your API key does not have permission to access ${endpoint} endpoints`,
      });
      return;
    }

    next();
  };
}

