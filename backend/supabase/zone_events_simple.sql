-- ============================================
-- ZONE_EVENTS TABLE - SIMPLE SETUP
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- This creates the zone_events table with all indexes and policies
-- ============================================

-- Step 1: Enable PostGIS (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Step 2: Create zone_events table
CREATE TABLE IF NOT EXISTS zone_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('ENTER', 'EXIT')),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  ) STORED,
  distance_meters FLOAT,
  device_info JSONB DEFAULT '{}'::jsonb,
  accuracy_meters FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS zone_events_zone_idx ON zone_events (zone_id, event_type);
CREATE INDEX IF NOT EXISTS zone_events_user_idx ON zone_events (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS zone_events_created_at_idx ON zone_events (created_at DESC);
CREATE INDEX IF NOT EXISTS zone_events_location_idx ON zone_events USING GIST (location_point);
CREATE INDEX IF NOT EXISTS zone_events_zone_time_idx ON zone_events (zone_id, created_at DESC);
CREATE INDEX IF NOT EXISTS zone_events_event_type_idx ON zone_events (event_type);

-- Step 4: Enable Row Level Security
ALTER TABLE zone_events ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
-- Policy: Users can insert their own events
CREATE POLICY "Users can insert their own events"
  ON zone_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Anyone can read events
CREATE POLICY "Events are viewable by everyone"
  ON zone_events FOR SELECT
  USING (true);

-- Policy: Users can update their own events
CREATE POLICY "Users can update their own events"
  ON zone_events FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can delete their own events
CREATE POLICY "Users can delete their own events"
  ON zone_events FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- VERIFICATION (Optional - uncomment to check)
-- ============================================
-- SELECT 'zone_events table created successfully!' AS status;
-- SELECT COUNT(*) AS total_events FROM zone_events;

