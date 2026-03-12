-- ============================================
-- API KEYS TABLE - SIMPLE SETUP
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- This creates the api_keys table for API key management
-- ============================================

-- Step 1: Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '["geofence", "heatmap"]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  last_used_at TIMESTAMP WITH TIME ZONE,
  total_requests BIGINT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys (key_hash);
CREATE INDEX IF NOT EXISTS api_keys_key_prefix_idx ON api_keys (key_prefix);
CREATE INDEX IF NOT EXISTS api_keys_is_active_idx ON api_keys (is_active);

-- Step 3: Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies (allow all for now - can restrict later)
CREATE POLICY "Allow all operations on API keys"
  ON api_keys FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 5: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_api_key_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_key_timestamp
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_timestamp();

-- ============================================
-- VERIFICATION (Optional - uncomment to check)
-- ============================================
-- SELECT 'api_keys table created successfully!' AS status;
-- SELECT COUNT(*) AS total_keys FROM api_keys;

