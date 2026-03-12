/**
 * API Key Service
 * 
 * Handles API key generation, validation, and management
 * 
 * @module services/apiKeyService
 */

import crypto from 'crypto';
import supabase from '../config/database';

export interface APIKeyData {
  id: string;
  key: string; // Full key (only returned on creation)
  keyPrefix: string; // First 8 chars for identification
  name: string;
  permissions: string[];
  rateLimitPerHour: number;
  expiresAt?: string;
  createdAt: string;
}

export interface APIKeyRecord {
  id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  permissions: string[];
  is_active: boolean;
  rate_limit_per_hour: number;
  last_used_at: string | null;
  total_requests: number;
  expires_at: string | null;
  created_at: string;
}

/**
 * Generate a new API key
 * Format: tss_key_<32 random hex characters>
 */
export function generateAPIKey(): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `tss_key_${randomBytes}`;
}

/**
 * Hash API key for storage (SHA-256)
 */
export function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Get key prefix (first 8 chars after tss_key_)
 */
export function getKeyPrefix(key: string): string {
  const parts = key.split('_');
  if (parts.length >= 3) {
    return parts[2].substring(0, 8);
  }
  return key.substring(0, 8);
}

/**
 * Create a new API key
 */
export async function createAPIKey(
  name: string,
  permissions: string[] = ['geofence', 'heatmap'],
  rateLimitPerHour: number = 1000,
  expiresAt?: string,
  createdBy?: string
): Promise<{ success: boolean; data?: APIKeyData; error?: string }> {
  try {
    // Generate new key
    const apiKey = generateAPIKey();
    const keyHash = hashAPIKey(apiKey);
    const keyPrefix = getKeyPrefix(apiKey);

    // Insert into database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name,
        permissions,
        rate_limit_per_hour: rateLimitPerHour,
        expires_at: expiresAt || null,
        created_by: createdBy || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return {
        success: false,
        error: error.message || 'Failed to create API key',
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        key: apiKey, // Return full key only once
        keyPrefix: data.key_prefix,
        name: data.name,
        permissions: data.permissions as string[],
        rateLimitPerHour: data.rate_limit_per_hour,
        expiresAt: data.expires_at || undefined,
        createdAt: data.created_at,
      },
    };
  } catch (error: any) {
    console.error('Exception creating API key:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Validate API key
 */
export async function validateAPIKey(
  apiKey: string
): Promise<{ valid: boolean; keyData?: APIKeyRecord; error?: string }> {
  try {
    const keyHash = hashAPIKey(apiKey);
    const keyPrefix = getKeyPrefix(apiKey);

    // First try to find by prefix (faster lookup)
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', keyPrefix)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return {
        valid: false,
        error: 'Invalid API key',
      };
    }

    // Verify hash matches
    if (data.key_hash !== keyHash) {
      return {
        valid: false,
        error: 'Invalid API key',
      };
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return {
        valid: false,
        error: 'API key has expired',
      };
    }

    // Update last used and request count
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        total_requests: (data.total_requests || 0) + 1,
      })
      .eq('id', data.id);

    return {
      valid: true,
      keyData: data as APIKeyRecord,
    };
  } catch (error: any) {
    console.error('Exception validating API key:', error);
    return {
      valid: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Get all API keys (for management)
 */
export async function getAllAPIKeys(): Promise<{
  success: boolean;
  data?: APIKeyRecord[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch API keys',
      };
    }

    return {
      success: true,
      data: data as APIKeyRecord[],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Revoke API key (set is_active to false)
 */
export async function revokeAPIKey(keyId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to revoke API key',
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Check if API key has permission for endpoint
 */
export function hasPermission(
  keyData: APIKeyRecord,
  endpoint: 'geofence' | 'heatmap'
): boolean {
  const permissions = keyData.permissions || [];
  return permissions.includes(endpoint);
}

