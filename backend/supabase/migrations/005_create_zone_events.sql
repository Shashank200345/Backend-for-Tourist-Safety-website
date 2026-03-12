-- ============================================
-- ZONE_EVENTS TABLE CREATION
-- ============================================
-- This migration creates the zone_events table for tracking
-- ENTER/EXIT events when users enter or leave geofence zones
-- ============================================

-- Enable PostGIS extension if not already enabled (required for spatial operations)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- CREATE ZONE_EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS zone_events (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to zones table
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  
  -- Foreign key to auth.users (can be null for anonymous events)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Event type: ENTER or EXIT
  event_type TEXT NOT NULL CHECK (event_type IN ('ENTER', 'EXIT')),
  
  -- Visitor location at time of event (required)
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  
  -- PostGIS geometry point (auto-generated from lat/lng)
  location_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  ) STORED,
  
  -- Distance from zone center (for circles) or edge (for polygons) in meters
  distance_meters FLOAT,
  
  -- Additional metadata stored as JSONB
  device_info JSONB DEFAULT '{}'::jsonb,
  
  -- Location accuracy in meters (from GPS)
  accuracy_meters FLOAT,
  
  -- Timestamp (auto-set on insert)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index on zone_id and event_type for fast zone-specific queries
CREATE INDEX IF NOT EXISTS zone_events_zone_idx 
  ON zone_events (zone_id, event_type);

-- Index on user_id for user-specific event queries
CREATE INDEX IF NOT EXISTS zone_events_user_idx 
  ON zone_events (user_id) 
  WHERE user_id IS NOT NULL;

-- Index on created_at for time-based queries (DESC for recent events first)
CREATE INDEX IF NOT EXISTS zone_events_created_at_idx 
  ON zone_events (created_at DESC);

-- Spatial index on location_point for geographic queries
CREATE INDEX IF NOT EXISTS zone_events_location_idx 
  ON zone_events USING GIST (location_point);

-- Composite index for common query patterns (zone + time)
CREATE INDEX IF NOT EXISTS zone_events_zone_time_idx 
  ON zone_events (zone_id, created_at DESC);

-- Index on event_type for filtering by event type
CREATE INDEX IF NOT EXISTS zone_events_event_type_idx 
  ON zone_events (event_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on zone_events table
ALTER TABLE zone_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own events
-- Allows users to log events where user_id matches their auth.uid()
CREATE POLICY "Users can insert their own events"
  ON zone_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Anyone can read events (for monitoring/analytics)
-- Public read access for dashboard and analytics
CREATE POLICY "Events are viewable by everyone"
  ON zone_events FOR SELECT
  USING (true);

-- Policy: Users can update their own events
-- Allows users to update events they created
CREATE POLICY "Users can update their own events"
  ON zone_events FOR UPDATE
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users can delete their own events
-- Allows users to delete events they created (prevents accidental deletion)
CREATE POLICY "Users can delete their own events"
  ON zone_events FOR DELETE
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE zone_events IS 'Stores ENTER/EXIT events when users enter or leave geofence zones';
COMMENT ON COLUMN zone_events.zone_id IS 'Reference to the zone that was entered/exited';
COMMENT ON COLUMN zone_events.user_id IS 'User who triggered the event (can be null for anonymous events)';
COMMENT ON COLUMN zone_events.event_type IS 'Type of event: ENTER or EXIT';
COMMENT ON COLUMN zone_events.latitude IS 'Latitude of user location at time of event';
COMMENT ON COLUMN zone_events.longitude IS 'Longitude of user location at time of event';
COMMENT ON COLUMN zone_events.location_point IS 'PostGIS Point geometry auto-generated from lat/lng';
COMMENT ON COLUMN zone_events.distance_meters IS 'Distance from zone center/edge in meters';
COMMENT ON COLUMN zone_events.device_info IS 'JSONB object containing device metadata (userAgent, platform, etc.)';
COMMENT ON COLUMN zone_events.accuracy_meters IS 'GPS accuracy in meters';
COMMENT ON COLUMN zone_events.created_at IS 'Timestamp when the event occurred';

-- ============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================

-- Uncomment to verify table creation:
-- SELECT 
--   table_name, 
--   column_name, 
--   data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'zone_events'
-- ORDER BY ordinal_position;

-- Uncomment to check indexes:
-- SELECT 
--   indexname, 
--   indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'zone_events';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- The zone_events table is now ready to use!
-- 
-- Example INSERT:
-- INSERT INTO zone_events (zone_id, user_id, event_type, latitude, longitude, distance_meters, device_info)
-- VALUES (
--   'zone-uuid-here',
--   'user-uuid-here',
--   'ENTER',
--   26.5775,
--   93.1711,
--   150.5,
--   '{"userAgent": "Mozilla/5.0", "platform": "Android"}'::jsonb
-- );
-- ============================================

