-- ============================================
-- GEOFENCING SYSTEM - SUPABASE + POSTGIS SETUP
-- Focus: Northeast India States
-- ============================================

-- Enable PostGIS extension (required for spatial operations)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- 1. ZONES TABLE
-- ============================================
-- Stores geofence zones (polygons or circles with radius)
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Zone type: SAFE, MONITORED, RESTRICTED, EMERGENCY
  zone_type TEXT NOT NULL CHECK (zone_type IN ('SAFE', 'MONITORED', 'RESTRICTED', 'EMERGENCY')),
  
  -- Risk level: LOW, MEDIUM, HIGH, CRITICAL
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  
  -- Geometry storage (JSONB for GeoJSON format)
  -- For polygons: GeoJSON Polygon
  -- For circles: GeoJSON Point with radius property
  geometry JSONB NOT NULL,
  
  -- PostGIS geometry column (computed from geometry JSONB)
  -- For polygons: ST_GeomFromGeoJSON
  -- For circles: ST_Buffer(ST_GeomFromGeoJSON(point), radius_meters)
  geom GEOMETRY(Geometry, 4326) GENERATED ALWAYS AS (
    CASE
      -- If geometry is a Polygon or MultiPolygon, convert directly
      WHEN (geometry->>'type') IN ('Polygon', 'MultiPolygon') THEN
        ST_SetSRID(ST_GeomFromGeoJSON(geometry::text), 4326)
      -- If geometry is a Point (circle zone), we need to create a buffer
      -- Note: radius is stored in properties.radius (meters)
      WHEN (geometry->>'type') = 'Point' AND (geometry->'properties'->>'radius') IS NOT NULL THEN
        ST_Buffer(
          ST_SetSRID(ST_GeomFromGeoJSON(geometry::text), 4326)::geography,
          (geometry->'properties'->>'radius')::float
        )::geometry
      ELSE
        NULL
    END
  ) STORED,
  
  -- Circle-specific: center point and radius (for easier querying)
  -- Only populated when geometry type is Point
  center_lat FLOAT,
  center_lng FLOAT,
  radius_meters FLOAT CHECK (radius_meters IS NULL OR radius_meters > 0),
  
  -- Zone properties
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'STANDBY')),
  
  -- Notification settings
  notifications JSONB DEFAULT '{"entry": true, "exit": true, "extended_stay": false}'::jsonb,
  
  -- Rules/guidelines for this zone
  rules JSONB DEFAULT '[]'::jsonb,
  
  -- Statistics (computed/cached)
  active_visitors INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_alerts INTEGER DEFAULT 0,
  
  -- Metadata
  region TEXT DEFAULT 'Northeast India',
  state TEXT,
  district TEXT,
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create GiST spatial index on geom column for fast spatial queries
CREATE INDEX IF NOT EXISTS zones_geom_idx ON zones USING GIST (geom);

-- Index on zone_type and status for filtering
CREATE INDEX IF NOT EXISTS zones_type_status_idx ON zones (zone_type, status);

-- Index on center coordinates (for circle zones)
CREATE INDEX IF NOT EXISTS zones_center_idx ON zones (center_lat, center_lng) WHERE center_lat IS NOT NULL;

-- Index on region (for Northeast India focus)
CREATE INDEX IF NOT EXISTS zones_region_idx ON zones (region) WHERE region = 'Northeast India';

-- ============================================
-- 2. TRIGGER: Auto-update geom when geometry changes
-- ============================================
CREATE OR REPLACE FUNCTION update_zone_geometry()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract center and radius if geometry is a Point with radius
  IF NEW.geometry->>'type' = 'Point' AND NEW.geometry->'properties'->>'radius' IS NOT NULL THEN
    NEW.center_lat := (NEW.geometry->>'coordinates')::jsonb->>1;
    NEW.center_lng := (NEW.geometry->>'coordinates')::jsonb->>0;
    NEW.radius_meters := (NEW.geometry->'properties'->>'radius')::float;
  END IF;
  
  -- Update timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_zone_geometry
  BEFORE INSERT OR UPDATE OF geometry ON zones
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_geometry();

-- ============================================
-- 3. ZONE_EVENTS TABLE
-- ============================================
-- Logs all ENTER/EXIT events for visitors in zones
CREATE TABLE IF NOT EXISTS zone_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Event type: ENTER or EXIT
  event_type TEXT NOT NULL CHECK (event_type IN ('ENTER', 'EXIT')),
  
  -- Visitor location at time of event
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  ) STORED,
  
  -- Distance from zone center (for circles) or edge (for polygons)
  distance_meters FLOAT,
  
  -- Additional metadata
  device_info JSONB,
  accuracy_meters FLOAT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on zone_id and event_type for fast queries
CREATE INDEX IF NOT EXISTS zone_events_zone_idx ON zone_events (zone_id, event_type);

-- Index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS zone_events_user_idx ON zone_events (user_id);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS zone_events_created_at_idx ON zone_events (created_at DESC);

-- Spatial index on location_point
CREATE INDEX IF NOT EXISTS zone_events_location_idx ON zone_events USING GIST (location_point);

-- ============================================
-- 4. USERS TABLE (Optional - for notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact info for notifications
  phone_number TEXT,
  email TEXT,
  
  -- Notification preferences
  notification_preferences JSONB DEFAULT '{
    "push": true,
    "sms": false,
    "whatsapp": false,
    "email": true
  }'::jsonb,
  
  -- FCM token for push notifications
  fcm_token TEXT,
  
  -- Current location (updated via geolocation)
  current_latitude FLOAT,
  current_longitude FLOAT,
  location_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  full_name TEXT,
  role TEXT DEFAULT 'visitor' CHECK (role IN ('admin', 'dispatcher', 'officer', 'visitor', 'viewer')),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on role
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles (role);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ZONES TABLE POLICIES
-- Public read access (anyone can view zones)
CREATE POLICY "Zones are viewable by everyone"
  ON zones FOR SELECT
  USING (true);

-- Only admins can create zones
CREATE POLICY "Only admins can create zones"
  ON zones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can update zones
CREATE POLICY "Only admins can update zones"
  ON zones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can delete zones
CREATE POLICY "Only admins can delete zones"
  ON zones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ZONE_EVENTS TABLE POLICIES
-- Users can insert their own events
CREATE POLICY "Users can insert their own events"
  ON zone_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can read events (for monitoring/analytics)
CREATE POLICY "Events are viewable by everyone"
  ON zone_events FOR SELECT
  USING (true);

-- USER_PROFILES TABLE POLICIES
-- Users can view all profiles (for basic info)
CREATE POLICY "Profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to check if a point is inside a zone
CREATE OR REPLACE FUNCTION check_point_in_zone(
  p_latitude FLOAT,
  p_longitude FLOAT,
  p_zone_id UUID DEFAULT NULL
)
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  zone_type TEXT,
  risk_level TEXT,
  distance_meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    z.id,
    z.name,
    z.zone_type,
    z.risk_level,
    CASE
      -- For circle zones, calculate distance from center
      WHEN z.geometry->>'type' = 'Point' THEN
        ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(z.center_lng, z.center_lat), 4326),
          ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)
        )
      -- For polygon zones, calculate distance from edge
      ELSE
        ST_DistanceSphere(
          z.geom,
          ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)
        )
    END AS distance_meters
  FROM zones z
  WHERE z.status = 'ACTIVE'
    AND (
      p_zone_id IS NULL OR z.id = p_zone_id
    )
    AND (
      -- For circle zones: check if distance <= radius
      (z.geometry->>'type' = 'Point' 
        AND ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(z.center_lng, z.center_lat), 4326),
          ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)
        ) <= z.radius_meters
      )
      OR
      -- For polygon zones: check if point is inside
      (z.geometry->>'type' IN ('Polygon', 'MultiPolygon')
        AND ST_Contains(
          z.geom,
          ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)
        )
      )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update zone statistics
CREATE OR REPLACE FUNCTION update_zone_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'ENTER' THEN
    UPDATE zones
    SET 
      active_visitors = active_visitors + 1,
      total_visits = total_visits + 1,
      updated_at = NOW()
    WHERE id = NEW.zone_id;
  ELSIF NEW.event_type = 'EXIT' THEN
    UPDATE zones
    SET 
      active_visitors = GREATEST(active_visitors - 1, 0),
      updated_at = NOW()
    WHERE id = NEW.zone_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_zone_statistics
  AFTER INSERT ON zone_events
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_statistics();

-- ============================================
-- 7. SAMPLE DATA (Northeast India Zones)
-- ============================================

-- Insert sample zones for Northeast India
INSERT INTO zones (name, description, zone_type, risk_level, geometry, region, state, rules) VALUES
(
  'Kaziranga National Park',
  'World Heritage Site - Home to one-horned rhinoceros',
  'SAFE',
  'LOW',
  '{
    "type": "Point",
    "coordinates": [93.1711, 26.5775],
    "properties": {"radius": 3000}
  }'::jsonb,
  'Northeast India',
  'Assam',
  '["Stay on safari path", "Wildlife caution zone", "No feeding animals"]'::jsonb
),
(
  'Tawang Monastery Zone',
  'Ancient Buddhist monastery - Restricted entry after 7 PM',
  'MONITORED',
  'MEDIUM',
  '{
    "type": "Point",
    "coordinates": [91.866, 27.586],
    "properties": {"radius": 1200}
  }'::jsonb,
  'Northeast India',
  'Arunachal Pradesh',
  '["Respect religious guidelines", "Restricted entry after 7 PM", "Photography restrictions"]'::jsonb
),
(
  'Nathula Pass (Border Zone)',
  'Indo-China border area - High security zone',
  'RESTRICTED',
  'HIGH',
  '{
    "type": "Point",
    "coordinates": [88.828, 27.3867],
    "properties": {"radius": 2000}
  }'::jsonb,
  'Northeast India',
  'Sikkim',
  '["Permit mandatory", "Border area – follow army instructions", "No photography"]'::jsonb
),
(
  'Shillong Peak View Area',
  'Scenic viewpoint - Safe zone for tourists',
  'SAFE',
  'LOW',
  '{
    "type": "Point",
    "coordinates": [91.878, 25.547],
    "properties": {"radius": 1500}
  }'::jsonb,
  'Northeast India',
  'Meghalaya',
  '["Photography allowed", "No littering", "Follow safety guidelines"]'::jsonb
);

-- ============================================
-- USER LOCATIONS TRACKING TABLE
-- ============================================
-- Stores continuous location tracking data from mobile devices
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Location coordinates
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  
  -- PostGIS point geometry for spatial queries
  location_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  ) STORED,
  
  -- Location accuracy and metadata
  accuracy_meters FLOAT,
  altitude FLOAT,
  heading FLOAT, -- Direction of travel (0-360 degrees)
  speed FLOAT, -- Speed in m/s
  
  -- Device information
  device_info JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for fast location queries
CREATE INDEX IF NOT EXISTS user_locations_point_idx 
  ON user_locations USING GIST (location_point);

-- Index on user_id and created_at for user tracking history
CREATE INDEX IF NOT EXISTS user_locations_user_time_idx 
  ON user_locations (user_id, created_at DESC);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS user_locations_time_idx 
  ON user_locations (created_at DESC);

-- ============================================
-- RLS POLICIES FOR USER_LOCATIONS
-- ============================================
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Users can insert their own locations
CREATE POLICY "Users can insert their own locations"
  ON user_locations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR auth.uid() IS NULL
  );

-- Users can view their own location history
CREATE POLICY "Users can view their own locations"
  ON user_locations FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() IS NULL
  );

-- Admins can view all locations
CREATE POLICY "Admins can view all locations"
  ON user_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- FUNCTION: Update user profile current location
-- ============================================
CREATE OR REPLACE FUNCTION update_user_current_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles with latest location
  UPDATE user_profiles
  SET 
    current_latitude = NEW.latitude,
    current_longitude = NEW.longitude,
    location_updated_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user_profiles when location is inserted
CREATE TRIGGER trigger_update_user_location
  AFTER INSERT ON user_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_current_location();

-- ============================================
-- END OF SETUP
-- ============================================

