-- ============================================
-- API KEYS TABLE CREATION
-- ============================================
-- This table stores API keys for external users to access geofence and heatmap APIs
-- ============================================

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- API key (hashed for security)
  key_hash TEXT NOT NULL UNIQUE,
  
  -- Key prefix (first 8 chars) for identification
  key_prefix TEXT NOT NULL,
  
  -- Key name/description
  name TEXT NOT NULL,
  
  -- Key owner/creator
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Permissions (JSONB array of allowed endpoints)
  permissions JSONB DEFAULT '["geofence", "heatmap"]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Rate limiting (requests per hour)
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Usage tracking
  last_used_at TIMESTAMP WITH TIME ZONE,
  total_requests BIGINT DEFAULT 0,
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys (key_hash);
CREATE INDEX IF NOT EXISTS api_keys_key_prefix_idx ON api_keys (key_prefix);
CREATE INDEX IF NOT EXISTS api_keys_is_active_idx ON api_keys (is_active);
CREATE INDEX IF NOT EXISTS api_keys_created_by_idx ON api_keys (created_by);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can view all API keys
CREATE POLICY "Admins can view all API keys"
  ON api_keys FOR SELECT
  USING (true); -- For now, allow all reads (can be restricted later)

-- Only admins can create API keys
CREATE POLICY "Admins can create API keys"
  ON api_keys FOR INSERT
  WITH CHECK (true); -- For now, allow all inserts (can be restricted later)

-- Only admins can update API keys
CREATE POLICY "Admins can update API keys"
  ON api_keys FOR UPDATE
  USING (true); -- For now, allow all updates (can be restricted later)

-- Only admins can delete API keys
CREATE POLICY "Admins can delete API keys"
  ON api_keys FOR DELETE
  USING (true); -- For now, allow all deletes (can be restricted later)

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_key_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_api_key_timestamp
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_timestamp();

-- Comments
COMMENT ON TABLE api_keys IS 'Stores API keys for external API access';
COMMENT ON COLUMN api_keys.key_hash IS 'Hashed API key (never store plain text)';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8 characters of key for identification';
COMMENT ON COLUMN api_keys.permissions IS 'JSONB array of allowed endpoints: ["geofence", "heatmap"]';
COMMENT ON COLUMN api_keys.rate_limit_per_hour IS 'Maximum requests allowed per hour';

