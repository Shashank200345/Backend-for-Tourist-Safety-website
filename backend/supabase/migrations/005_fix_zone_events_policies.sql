-- ============================================
-- FIX ZONE_EVENTS RLS POLICIES
-- ============================================
-- Run this if you got an error about user_profiles table
-- This removes the old policies and creates new ones without user_profiles dependency
-- ============================================

-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Only admins can update events" ON zone_events;
DROP POLICY IF EXISTS "Only admins can delete events" ON zone_events;
DROP POLICY IF EXISTS "Users can update their own events" ON zone_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON zone_events;

-- Create new policies without user_profiles dependency
CREATE POLICY "Users can update their own events"
  ON zone_events FOR UPDATE
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can delete their own events"
  ON zone_events FOR DELETE
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- Uncomment to verify policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'zone_events';

