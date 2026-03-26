-- ============================================
-- ALERTS TABLE SETUP
-- ============================================
-- The React dashboard expects an `alerts` table with:
-- - id (uuid), created_at
-- - alert_type, severity, tourist_id, status
-- - optional: location_name, description, latitude, longitude
-- - optional analytics: response_time, resolved_at
--
-- NOTE: This migration is intended to restore missing schema in the new
-- Supabase project. It creates the table + basic RLS policies so the
-- frontend can at least SELECT data.

-- ============================================
-- Minimal user_profiles (frontend depends on it)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  email TEXT,
  notification_preferences JSONB DEFAULT '{
    "push": true,
    "sms": false,
    "whatsapp": false,
    "email": true
  }'::jsonb,
  fcm_token TEXT,
  current_latitude FLOAT,
  current_longitude FLOAT,
  location_updated_at TIMESTAMPTZ,
  full_name TEXT,
  role TEXT DEFAULT 'visitor' CHECK (role IN ('admin', 'dispatcher', 'officer', 'visitor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles (role);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Profiles are viewable by everyone"
      ON user_profiles
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Alert metadata
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  tourist_id TEXT,

  -- Workflow status used by the UI
  status TEXT NOT NULL,

  -- Optional fields used by UI
  location_name TEXT,
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,

  -- Optional analytics used by dashboard stats
  response_time INTEGER,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Basic indexes for faster dashboard filtering
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_status ON alerts (severity, status);
CREATE INDEX IF NOT EXISTS idx_alerts_tourist_id ON alerts (tourist_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved_at ON alerts (resolved_at DESC);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Public read access (dashboard listing)
CREATE POLICY "Alerts are viewable by everyone"
  ON alerts
  FOR SELECT
  USING (true);

-- Allow inserts only if you have an authenticated app role.
-- If you insert alerts from the backend using the service role key,
-- you typically do not need this policy for server-side writes.
CREATE POLICY "Authenticated users can insert alerts"
  ON alerts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow updates only for staff roles defined in `user_profiles`.
-- This requires that the user is logged in and that `user_profiles` exists.
DO $$
BEGIN
  -- Only create the update policy if `user_profiles` exists in this project.
  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    CREATE POLICY "Staff can update alerts"
      ON alerts
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1
          FROM user_profiles
          WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'dispatcher', 'officer')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM user_profiles
          WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'dispatcher', 'officer')
        )
      );
  END IF;
END $$;

