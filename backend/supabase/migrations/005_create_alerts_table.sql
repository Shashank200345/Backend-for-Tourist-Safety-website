-- Create alerts table for tourist safety monitoring
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id TEXT NOT NULL REFERENCES users(tourist_id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,                     -- e.g., 'panic', 'geo-breach'
  severity TEXT NOT NULL DEFAULT 'medium',      -- 'low' | 'medium' | 'high'
  description TEXT,
  location_name TEXT,                           -- optional friendly label
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_tourist_id ON alerts(tourist_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- Enable Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy 1: Allow all users to SELECT (read) alerts
CREATE POLICY "Allow public read access to alerts"
  ON alerts
  FOR SELECT
  USING (true);

-- Policy 2: Allow all users to INSERT alerts
CREATE POLICY "Allow public insert access to alerts"
  ON alerts
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Allow all users to UPDATE alerts
CREATE POLICY "Allow public update access to alerts"
  ON alerts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow all users to DELETE alerts (optional - remove if you want to restrict)
CREATE POLICY "Allow public delete access to alerts"
  ON alerts
  FOR DELETE
  USING (true);

-- Enable realtime for the alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;


