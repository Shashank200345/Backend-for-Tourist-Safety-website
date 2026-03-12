# API Key Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Create API Keys Table

Run this SQL in Supabase SQL Editor:

```sql
-- Copy contents from: backend/supabase/api_keys_simple.sql
-- Or run the migration: backend/supabase/migrations/006_create_api_keys.sql
```

### Step 2: Generate Your First API Key

```bash
curl -X POST http://localhost:3001/api/api-keys/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First API Key",
    "permissions": ["geofence", "heatmap"]
  }'
```

**Save the `key` value from the response!**

### Step 3: Use the API Key

```bash
# Replace YOUR_API_KEY with the key from Step 2
curl http://localhost:3001/api/geofence/zones \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## ✅ What's Protected?

All these endpoints now require API key:

- ✅ `/api/geofence/zones` - Get zones
- ✅ `/api/geofence/zones/:id` - Get single zone
- ✅ `/api/geofence/events` - Get events
- ✅ `/api/geofence/stats` - Get statistics
- ✅ `/api/heatmap/data` - Get heatmap data
- ✅ `/api/heatmap/stats` - Get heatmap stats

---

## 📝 Example: Complete Flow

```bash
# 1. Generate API key
curl -X POST http://localhost:3001/api/api-keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "Test App"}'

# Response: {"data": {"key": "tss_key_abc123..."}}
# Save this key!

# 2. Use API key to get zones
curl http://localhost:3001/api/geofence/zones \
  -H "X-API-Key: tss_key_abc123..."

# 3. Use API key to get heatmap
curl http://localhost:3001/api/heatmap/data \
  -H "X-API-Key: tss_key_abc123..."
```

---

## 🔑 API Key Format

- **Format:** `tss_key_<32 random hex characters>`
- **Example:** `tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Prefix:** First 8 chars (e.g., `a1b2c3d4`) - shown in management endpoints

---

## 📚 Full Documentation

See `backend/API_KEY_USAGE_GUIDE.md` for complete documentation.

---

**That's it! Your APIs are now secure!** 🔐

