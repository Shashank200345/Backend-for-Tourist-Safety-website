# Zone Events Table Setup Guide

## Overview
The `zone_events` table stores all ENTER/EXIT events when users enter or leave geofence zones. This table is essential for:
- Tracking user movements
- Generating heatmaps
- Analytics and statistics
- SMS alert triggers

## Quick Setup

### Option 1: Run Migration File (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `backend/supabase/migrations/005_create_zone_events.sql`
3. Click "Run" to execute

### Option 2: Manual Setup
Run the SQL commands step by step in Supabase SQL Editor.

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `zone_id` | UUID | Foreign key to `zones` table |
| `user_id` | UUID | Foreign key to `auth.users` (nullable) |
| `event_type` | TEXT | Either 'ENTER' or 'EXIT' |
| `latitude` | FLOAT | User's latitude at event time |
| `longitude` | FLOAT | User's longitude at event time |
| `location_point` | GEOMETRY | PostGIS point (auto-generated) |
| `distance_meters` | FLOAT | Distance from zone center/edge |
| `device_info` | JSONB | Device metadata (userAgent, platform, etc.) |
| `accuracy_meters` | FLOAT | GPS accuracy |
| `created_at` | TIMESTAMP | Event timestamp (auto-set) |

## Indexes Created

1. **zone_events_zone_idx** - Fast queries by zone and event type
2. **zone_events_user_idx** - Fast queries by user
3. **zone_events_created_at_idx** - Time-based queries
4. **zone_events_location_idx** - Spatial queries (GIST index)
5. **zone_events_zone_time_idx** - Composite index for zone + time queries
6. **zone_events_event_type_idx** - Filter by event type

## Row Level Security (RLS)

- ✅ **INSERT**: Users can insert their own events
- ✅ **SELECT**: Public read access (anyone can view)
- ✅ **UPDATE**: Only admins can update
- ✅ **DELETE**: Only admins can delete

## Example Queries

### Insert an Event
```sql
INSERT INTO zone_events (
  zone_id, 
  user_id, 
  event_type, 
  latitude, 
  longitude, 
  distance_meters,
  device_info
)
VALUES (
  'your-zone-uuid',
  'your-user-uuid',
  'ENTER',
  26.5775,
  93.1711,
  150.5,
  '{"userAgent": "Mozilla/5.0", "platform": "Android"}'::jsonb
);
```

### Get Recent Events
```sql
SELECT * FROM zone_events
ORDER BY created_at DESC
LIMIT 10;
```

### Get Events for a Specific Zone
```sql
SELECT * FROM zone_events
WHERE zone_id = 'your-zone-uuid'
AND event_type = 'ENTER'
ORDER BY created_at DESC;
```

### Get Events by Date Range
```sql
SELECT * FROM zone_events
WHERE created_at >= '2024-01-01'
AND created_at <= '2024-01-31'
ORDER BY created_at DESC;
```

## Verification

After running the migration, verify the table exists:

```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'zone_events';

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'zone_events'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'zone_events';
```

## Integration with Your App

The table is automatically used by:
- ✅ **Geofences Component** - Logs ENTER/EXIT events
- ✅ **Geofence API** - `/api/geofence/events` endpoint
- ✅ **Heatmap API** - `/api/heatmap/data` endpoint
- ✅ **SMS Service** - Triggers SMS alerts on ENTER events

## Troubleshooting

### Table Already Exists
If you get an error that the table already exists, it means the migration was already run. You can skip this step.

### Foreign Key Error
Make sure the `zones` table exists first. Run the zones migration before this one.

### PostGIS Error
If you get a PostGIS error, enable the extension:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Next Steps

1. ✅ Run the migration
2. ✅ Verify table creation
3. ✅ Test with a sample INSERT
4. ✅ Check that your frontend can insert events
5. ✅ Test the API endpoints

---

**The zone_events table is now ready!** 🚀

