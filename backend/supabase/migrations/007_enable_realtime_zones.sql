-- Enable Realtime for the 'zones' table
-- This allows the frontend to receive real-time updates when zones are created, updated, or deleted
-- 
-- To apply this:
-- 1. Run this SQL in Supabase SQL Editor, OR
-- 2. Go to Supabase Dashboard -> Database -> Replication
--    - Find the 'zones' table
--    - Toggle "Enable Replication" to ON

ALTER PUBLICATION supabase_realtime ADD TABLE zones;

