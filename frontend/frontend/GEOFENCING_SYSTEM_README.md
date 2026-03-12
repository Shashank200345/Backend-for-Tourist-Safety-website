# Complete Geofencing System Documentation

**Production-Ready Geofencing System for Northeast India Tourism Safety**

Built with: Supabase + PostGIS + Edge Functions + React + Leaflet + Turf.js + MAPOG Integration

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Setup (Supabase + PostGIS)](#database-setup-supabase--postgis)
4. [Frontend Setup](#frontend-setup)
5. [MAPOG Integration Guide](#mapog-integration-guide)
6. [Edge Functions](#edge-functions)
7. [Notifications](#notifications)
8. [Real-time Location Detection](#real-time-location-detection)
9. [Security & RLS](#security--rls)
10. [Testing Guide](#testing-guide)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

This is a complete geofencing solution that allows:

- **Zone Management**: Create polygon or circle zones with PostGIS
- **Real-time Detection**: Monitor visitor location and detect ENTER/EXIT events
- **Event Logging**: All events stored in Supabase with spatial queries
- **Notifications**: Push notifications (FCM) and WhatsApp (Twilio)
- **MAPOG Integration**: Import zones from MAPOG by exporting GeoJSON
- **Northeast India Focus**: Pre-configured for Northeast India states

### Key Features

✅ Polygon and Circle zone support  
✅ Real-time GPS location tracking  
✅ ENTER/EXIT event detection with deduping (30s cooldown)  
✅ Color-coded zones: SAFE (green), MONITORED (yellow), RESTRICTED (red), EMERGENCY (purple)  
✅ Interactive zone creation with draggable radius handle  
✅ MAPOG GeoJSON import  
✅ Supabase Realtime subscriptions  
✅ Row Level Security (RLS) policies  
✅ Edge Functions for notifications  

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Geofences   │  │  GeoImport   │  │  Location    │     │
│  │  Component   │  │  Component   │  │  Tracker     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase Client│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   Supabase     │  │   Edge Functions│  │   PostGIS      │
│   Database     │  │                 │  │   (Spatial)    │
│                │  │  • check-location│  │                │
│  • zones       │  │  • notify       │  │  • ST_Contains │
│  • zone_events │  │                 │  │  • ST_Distance │
│  • user_profiles│ └─────────────────┘  └────────────────┘
└────────────────┘
        │
        │ Triggers
        │
┌───────▼────────┐
│  Notifications │
│                │
│  • FCM (Push)  │
│  • Twilio WA   │
└────────────────┘
```

### Component Flow

```
User Location Update
       │
       ▼
navigator.geolocation.watchPosition()
       │
       ▼
handleUserLocation([lat, lng])
       │
       ├─► Turf.js: Check distance for circles
       │   ├─► booleanPointInPolygon() for polygons
       │   └─► distance <= radius for circles
       │
       ├─► ENTER detected?
       │   ├─► Log to zone_events (Supabase)
       │   ├─► Update zone statistics
       │   ├─► Call /notify Edge Function
       │   └─► Send FCM/WhatsApp if enabled
       │
       └─► EXIT detected?
           ├─► Log to zone_events (Supabase)
           ├─► Update zone statistics
           └─► Call /notify Edge Function (optional)
```

---

## 🗄️ Database Setup (Supabase + PostGIS)

### Step 1: Enable PostGIS Extension

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Step 2: Run Migration

Execute the migration file:

```bash
# In Supabase Dashboard → SQL Editor
# Copy and paste contents of:
supabase/migrations/001_geofencing_setup.sql
```

This creates:
- `zones` table with PostGIS geometry column
- `zone_events` table for ENTER/EXIT logging
- `user_profiles` table for notifications
- RLS policies
- Triggers for auto-updating geometry
- Spatial indexes (GiST)

### Step 3: Verify Tables

Check that tables were created:

```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('zones', 'zone_events', 'user_profiles');
```

---

## 💻 Frontend Setup

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js leaflet @turf/turf
npm install --save-dev @types/leaflet
```

### Step 2: Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard → Settings → API**

### Step 3: Verify Components

Ensure these files exist:
- `src/lib/supabaseClient.ts` - Supabase client configuration
- `src/components/Geofences.tsx` - Main geofencing component
- `src/components/GeoImport.tsx` - MAPOG import component

### Step 4: Run Development Server

```bash
npm run dev
```

---

## 🗺️ MAPOG Integration Guide

### How to Export from MAPOG

1. **Draw Zone in MAPOG**:
   - Go to [MAPOG.com](https://mapog.com)
   - Use drawing tools to create polygon or place point
   - For circle zones: Click point → Add property `radius` (in meters)

2. **Set Properties** (Optional but recommended):
   ```json
   {
     "name": "Kaziranga National Park",
     "zone_type": "SAFE",
     "risk_level": "LOW",
     "state": "Assam",
     "district": "Nagaon",
     "radius": 3000,
     "rules": ["Stay on safari path", "Wildlife caution zone"]
   }
   ```

3. **Export GeoJSON**:
   - Click "Export" → Choose "GeoJSON" format
   - Download the `.json` or `.geojson` file

### GeoJSON Format Examples

#### Circle Zone (Point + Radius)

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [93.1711, 26.5775]
  },
  "properties": {
    "name": "Kaziranga National Park",
    "radius": 3000,
    "zone_type": "SAFE",
    "risk_level": "LOW"
  }
}
```

#### Polygon Zone

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [93.1, 26.5],
      [93.2, 26.5],
      [93.2, 26.6],
      [93.1, 26.6],
      [93.1, 26.5]
    ]]
  },
  "properties": {
    "name": "Protected Area",
    "zone_type": "RESTRICTED",
    "risk_level": "HIGH"
  }
}
```

### How to Import in App

1. Click **"Import from MAPOG"** button in Geofences component
2. Upload your GeoJSON file
3. Preview shows number of features found
4. Click **"Import Zones"** to save to Supabase
5. Zones appear on map automatically

### Supported Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Zone name |
| `radius` | number | Yes (for Point) | Radius in meters |
| `zone_type` | string | No | SAFE, MONITORED, RESTRICTED, EMERGENCY |
| `risk_level` | string | No | LOW, MEDIUM, HIGH, CRITICAL |
| `state` | string | No | State name |
| `district` | string | No | District name |
| `rules` | array | No | Array of rule strings |

---

## ⚡ Edge Functions

### Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy check-location
supabase functions deploy notify
```

### Environment Variables for Edge Functions

In Supabase Dashboard → Edge Functions → Settings:

```env
FCM_SERVER_KEY=your-fcm-server-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Function: check-location

**Endpoint**: `/functions/v1/check-location`

**Request**:
```json
{
  "lat": 26.5775,
  "lng": 93.1711,
  "userId": "user-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "zones": [
    {
      "zone_id": "uuid",
      "zone_name": "Kaziranga National Park",
      "zone_type": "SAFE",
      "distance_meters": 450.2
    }
  ]
}
```

### Function: notify

**Endpoint**: `/functions/v1/notify`

**Request**:
```json
{
  "userId": "user-uuid",
  "zoneId": "zone-uuid",
  "zoneName": "Restricted Zone",
  "zoneType": "RESTRICTED",
  "eventType": "ENTER",
  "methods": ["push", "whatsapp"]
}
```

---

## 🔔 Notifications

### FCM (Firebase Cloud Messaging) Setup

1. **Get FCM Server Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project → Settings → Cloud Messaging
   - Copy "Server key"

2. **Set Environment Variable**:
   ```env
   FCM_SERVER_KEY=your-server-key
   ```

3. **Client-side Setup** (if needed):
   - Install Firebase SDK
   - Request notification permission
   - Get FCM token and store in `user_profiles.fcm_token`

### Twilio WhatsApp Setup

1. **Get Twilio Credentials**:
   - Go to [Twilio Console](https://console.twilio.com/)
   - Copy Account SID and Auth Token

2. **Enable WhatsApp Sandbox** (or production):
   - Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join sandbox

3. **Set Environment Variables**:
   ```env
   TWILIO_ACCOUNT_SID=your-sid
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

### Notification Flow

```
Zone Event (ENTER/EXIT)
       │
       ▼
zone_events table insert
       │
       ▼
Database Trigger (optional)
       │
       ▼
Call /notify Edge Function
       │
       ├─► Check user notification preferences
       │
       ├─► FCM Push (if enabled & token exists)
       │   └─► Send to user's device
       │
       └─► WhatsApp (if enabled & phone exists)
           └─► Send via Twilio API
```

---

## 📍 Real-time Location Detection

### Implementation

The system uses `navigator.geolocation.watchPosition()` to track user location continuously.

**Code Location**: `src/components/Geofences.tsx` → `handleUserLocation()`

### Detection Logic

1. **Circle Zones**:
   ```javascript
   const distance = turf.distance(center, user, { units: 'kilometers' }) * 1000;
   const isInside = distance <= zone.radius_meters;
   ```

2. **Polygon Zones**:
   ```javascript
   const point = turf.point([lng, lat]);
   const polygon = turf.polygon(zone.geometry.coordinates);
   const isInside = turf.booleanPointInPolygon(point, polygon);
   ```

### Deduplication

- **Cooldown Period**: 30 seconds
- Prevents duplicate ENTER/EXIT events
- Tracked in `lastEventTimeRef.current`

### Event Logging

Every ENTER/EXIT event is logged to `zone_events` table with:
- Zone ID
- User ID
- Event type (ENTER/EXIT)
- Latitude/Longitude
- Distance from zone center
- Timestamp

---

## 🔒 Security & RLS

### Row Level Security Policies

**zones table**:
- ✅ **SELECT**: Everyone can view zones (public)
- ❌ **INSERT**: Only admins can create zones
- ❌ **UPDATE**: Only admins can update zones
- ❌ **DELETE**: Only admins can delete zones

**zone_events table**:
- ✅ **SELECT**: Everyone can view events (for monitoring)
- ✅ **INSERT**: Users can insert their own events

**user_profiles table**:
- ✅ **SELECT**: Everyone can view profiles
- ✅ **UPDATE**: Users can update their own profile
- ✅ **INSERT**: Users can insert their own profile

### JWT Claims

The system uses Supabase Auth JWT tokens. Claims include:
- `sub` - User ID
- `role` - User role (from `user_profiles.role`)
- `email` - User email

### Safe Architecture

- **Client-side validation** + **Server-side RLS** = Double protection
- **Edge Functions** run with service role key (trusted)
- **PostGIS functions** use parameterized queries
- **Rate limiting** via cooldown periods (30s)

---

## 🧪 Testing Guide

### Test MAPOG Import

1. **Create Test GeoJSON**:
   ```json
   {
     "type": "Feature",
     "geometry": {
       "type": "Point",
       "coordinates": [93.1711, 26.5775]
     },
     "properties": {
       "name": "Test Zone",
       "radius": 500,
       "zone_type": "SAFE"
     }
   }
   ```

2. **Import in App**:
   - Click "Import from MAPOG"
   - Upload test file
   - Verify zone appears on map

### Test GPS Location (Chrome DevTools)

1. **Open DevTools** (F12)
2. **More Tools → Sensors**
3. **Set location**:
   - Latitude: `26.5775`
   - Longitude: `93.1711`
   - Or choose preset: "Kolkata"
4. **Reload page**
5. **Watch console** for ENTER/EXIT logs

### Test ENTER/EXIT Events

1. **Check `zone_events` table**:
   ```sql
   SELECT * FROM zone_events 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

2. **Verify event data**:
   - `event_type` = 'ENTER' or 'EXIT'
   - `zone_id` matches zone
   - `latitude` / `longitude` are valid
   - `distance_meters` is correct

### Debug Geometry Issues

**SQL to check zone geometry**:
```sql
SELECT 
  id,
  name,
  geometry->>'type' as geometry_type,
  ST_AsText(geom) as geom_wkt,
  ST_IsValid(geom) as is_valid
FROM zones
WHERE id = 'your-zone-id';
```

**Example Test Coordinates (Northeast India)**:
- Kaziranga: `26.5775, 93.1711`
- Tawang: `27.586, 91.866`
- Shillong: `25.547, 91.878`
- Nathula Pass: `27.3867, 88.828`

### SQL Queries for Debugging

```sql
-- Check all active zones
SELECT id, name, zone_type, status 
FROM zones 
WHERE status = 'ACTIVE';

-- Check recent events
SELECT 
  ze.*,
  z.name as zone_name
FROM zone_events ze
JOIN zones z ON z.id = ze.zone_id
ORDER BY ze.created_at DESC
LIMIT 20;

-- Check zone statistics
SELECT 
  z.name,
  z.active_visitors,
  z.total_visits,
  COUNT(ze.id) as total_events
FROM zones z
LEFT JOIN zone_events ze ON ze.zone_id = z.id
GROUP BY z.id, z.name, z.active_visitors, z.total_visits;
```

---

## 🚀 Deployment

### Supabase Deployment

1. **Run SQL Migration**:
   - Supabase Dashboard → SQL Editor
   - Paste `supabase/migrations/001_geofencing_setup.sql`
   - Execute

2. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy check-location
   supabase functions deploy notify
   ```

3. **Set Environment Variables**:
   - Dashboard → Edge Functions → Settings
   - Add FCM and Twilio credentials

### Vercel Deployment (Frontend)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add geofencing system"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import GitHub repository
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**:
   - Vercel auto-deploys on push
   - Check build logs for errors

### Environment Variables Summary

**Frontend (.env)**:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**Supabase Edge Functions**:
```env
FCM_SERVER_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=...
```

---

## 🐛 Troubleshooting

### Issue: Zones not appearing on map

**Check**:
1. Zones exist in database: `SELECT * FROM zones WHERE status = 'ACTIVE';`
2. Geometry is valid: `SELECT ST_IsValid(geom) FROM zones;`
3. Frontend loaded zones: Check browser console for errors
4. Map initialized: Check Leaflet map ref exists

**Fix**:
- Reload zones: Call `loadZones()` function
- Check Supabase client connection
- Verify RLS policies allow SELECT

### Issue: ENTER/EXIT events not logging

**Check**:
1. User logged in: `await getCurrentUser()`
2. Geolocation permission granted
3. Cooldown period passed (30 seconds)
4. Zone status is 'ACTIVE'

**Fix**:
- Check browser console for errors
- Verify `zone_events` table RLS allows INSERT
- Check network tab for Supabase requests

### Issue: Notifications not sending

**Check**:
1. Edge Function deployed: `supabase functions list`
2. Environment variables set in Supabase
3. User profile has FCM token / phone number
4. Notification preferences enabled

**Fix**:
- Check Edge Function logs: `supabase functions logs notify`
- Verify FCM/Twilio credentials
- Test Edge Function manually via Supabase Dashboard

### Issue: MAPOG import failing

**Check**:
1. GeoJSON file is valid JSON
2. Geometry type is supported (Point, Polygon, MultiPolygon)
3. Properties include required fields (name, radius for circles)

**Fix**:
- Validate GeoJSON: Use [GeoJSONLint](http://geojsonlint.com/)
- Check console errors in browser
- Verify user is admin (for zone creation)

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Turf.js Documentation](https://turfjs.org/)
- [MAPOG Documentation](https://mapog.com/documentation)

---

## 📝 License

This project is part of the Tourist Safety and Management System.

---

**Built with ❤️ for Northeast India Tourism Safety**

