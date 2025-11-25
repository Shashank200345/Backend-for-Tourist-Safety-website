-- Enable real-time for the alerts table
-- This allows the frontend to receive real-time updates when alerts change

-- Add the alerts table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Verify real-time is enabled (this will show in Supabase dashboard under Database > Replication)
-- If the table is already in the publication, this will show a notice but won't error


