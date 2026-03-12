# 🚀 Quick Start Guide - Geofencing System

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: v18+ installed
3. **MAPOG Account**: (Optional) For creating zones visually

---

## Setup in 5 Minutes

### Step 1: Install Dependencies (1 min)

```bash
cd Tourist-Safety-and-Management-new-main
npm install
```

### Step 2: Create Supabase Project (2 min)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose organization, name your project
4. Set database password
5. Wait for project to be ready (~2 minutes)

### Step 3: Get Supabase Credentials (1 min)

1. In Supabase Dashboard → Settings → API
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 4: Set Environment Variables (30 sec)

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Run Database Migration (1 min)

1. In Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Open `supabase/migrations/001_geofencing_setup.sql`
4. Copy entire contents
5. Paste in SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. ✅ Verify: Check "Tables" in sidebar - should see `zones`, `zone_events`, `user_profiles`

### Step 6: Run Frontend (30 sec)

```bash
npm run dev
```

Open http://localhost:5173 (or the port shown)

---

## Test It Works

### Test 1: View Zones
1. Navigate to **Geofences** page
2. Should see map with sample zones (Kaziranga, Tawang, etc.)

### Test 2: Create Zone
1. Click **"Create Geofence"** button
2. Click on map to set center
3. Drag handle to adjust radius
4. Fill form: Name = "Test Zone", Type = "SAFE"
5. Click **"Create"**
6. ✅ Zone should appear on map

### Test 3: Import from MAPOG (Optional)
1. Go to [mapog.com](https://mapog.com)
2. Draw a polygon or place a point
3. For circles: Add property `radius: 500` (meters)
4. Export as GeoJSON
5. In app: Click **"Import from MAPOG"**
6. Upload GeoJSON file
7. ✅ Zone should import

### Test 4: GPS Location (Chrome DevTools)
1. Open DevTools (F12)
2. More Tools → Sensors
3. Set location to: `26.5775, 93.1711` (Kaziranga)
4. Reload page
5. Watch console for ENTER events
6. ✅ Events should log to `zone_events` table

---

## Verify Database

### Check Zones Created

In Supabase Dashboard → Table Editor → `zones`:

```sql
SELECT id, name, zone_type, status FROM zones;
```

### Check Events Logged

In Supabase Dashboard → Table Editor → `zone_events`:

```sql
SELECT * FROM zone_events ORDER BY created_at DESC LIMIT 10;
```

---

## Next Steps

### Enable Notifications (Optional)

1. **FCM Push Notifications**:
   - Get FCM Server Key from Firebase Console
   - Deploy Edge Function: `supabase functions deploy notify`
   - Set secret: `FCM_SERVER_KEY=your-key`

2. **WhatsApp Notifications**:
   - Get Twilio credentials
   - Deploy Edge Function: `supabase functions deploy notify`
   - Set secrets: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`

### Deploy to Production

1. **Frontend**: Deploy to Vercel
2. **Database**: Already on Supabase (managed)
3. **Edge Functions**: Deploy via Supabase CLI

---

## Troubleshooting

### Zones not loading?
- ✅ Check `.env` file has correct Supabase URL and key
- ✅ Verify migration ran successfully
- ✅ Check browser console for errors

### Can't create zones?
- ✅ You must be logged in (Supabase Auth)
- ✅ User must have `role = 'admin'` in `user_profiles` table

### GPS not working?
- ✅ Grant location permission in browser
- ✅ Use HTTPS (geolocation requires secure context)

### Need help?
- 📖 Read full documentation: `GEOFENCING_SYSTEM_README.md`
- 🔍 Check troubleshooting section in README

---

## 🎉 You're Ready!

The geofencing system is now set up and ready to use!

**Key Features Available**:
- ✅ Create zones on map
- ✅ Import zones from MAPOG
- ✅ Real-time location tracking
- ✅ ENTER/EXIT event logging
- ✅ Color-coded zones
- ✅ Statistics tracking

Enjoy building your tourism safety system! 🗺️✨

