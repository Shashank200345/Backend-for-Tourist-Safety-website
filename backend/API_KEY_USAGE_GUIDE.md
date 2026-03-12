# API Key Usage Guide

## Overview

Your Geofence and Heatmap APIs are now protected with API key authentication. External users need an API key to access your data.

---

## Step 1: Generate an API Key

### Using API Endpoint

**POST** `/api/api-keys/generate`

**Request Body:**
```json
{
  "name": "My Application",
  "permissions": ["geofence", "heatmap"],
  "rateLimitPerHour": 1000,
  "expiresAt": "2025-12-31T23:59:59Z"  // Optional
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3001/api/api-keys/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "permissions": ["geofence", "heatmap"],
    "rateLimitPerHour": 1000
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "API key generated successfully",
  "data": {
    "id": "uuid",
    "key": "tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "keyPrefix": "a1b2c3d4",
    "name": "My App",
    "permissions": ["geofence", "heatmap"],
    "rateLimitPerHour": 1000,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "warning": "⚠️ Save this API key now! It will not be shown again."
}
```

**⚠️ IMPORTANT:** Save the `key` value immediately! It will not be shown again.

---

## Step 2: Use API Key to Access Endpoints

### Method 1: Using X-API-Key Header (Recommended)

```bash
curl http://localhost:3001/api/geofence/zones \
  -H "X-API-Key: tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### Method 2: Using Authorization Header

```bash
curl http://localhost:3001/api/geofence/zones \
  -H "Authorization: Bearer tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

## Step 3: Example API Calls

### Get All Zones

```bash
curl http://localhost:3001/api/geofence/zones \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

### Get Zone Events

```bash
curl "http://localhost:3001/api/geofence/events?event_type=ENTER&limit=10" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

### Get Heatmap Data

```bash
curl "http://localhost:3001/api/heatmap/data?source=zone_events" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

### Get Statistics

```bash
curl http://localhost:3001/api/geofence/stats \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

---

## Step 4: Using in JavaScript/TypeScript

### Fetch API

```javascript
const API_KEY = 'tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const API_BASE_URL = 'http://localhost:3001/api';

// Get zones
async function getZones() {
  const response = await fetch(`${API_BASE_URL}/geofence/zones`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  
  const data = await response.json();
  return data;
}

// Get heatmap data
async function getHeatmapData() {
  const response = await fetch(`${API_BASE_URL}/heatmap/data?source=zone_events`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  
  const data = await response.json();
  return data;
}
```

### Axios

```javascript
import axios from 'axios';

const API_KEY = 'tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'X-API-Key': API_KEY
  }
});

// Get zones
const zones = await apiClient.get('/geofence/zones');

// Get events
const events = await apiClient.get('/geofence/events', {
  params: { event_type: 'ENTER', limit: 10 }
});
```

---

## Step 5: Manage API Keys

### List All API Keys

```bash
GET /api/api-keys
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "keyPrefix": "a1b2c3d4",
      "name": "My App",
      "permissions": ["geofence", "heatmap"],
      "isActive": true,
      "rateLimitPerHour": 1000,
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "totalRequests": 150,
      "expiresAt": null,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

### Revoke an API Key

```bash
DELETE /api/api-keys/:id
```

```bash
curl -X DELETE http://localhost:3001/api/api-keys/uuid-here
```

---

## Error Responses

### Missing API Key

```json
{
  "success": false,
  "error": "API key required",
  "message": "Please provide an API key in X-API-Key header or Authorization header"
}
```

### Invalid API Key

```json
{
  "success": false,
  "error": "Invalid API key",
  "message": "The provided API key is invalid or expired"
}
```

### Permission Denied

```json
{
  "success": false,
  "error": "Permission denied",
  "message": "Your API key does not have permission to access geofence endpoints"
}
```

---

## API Key Format

- **Format:** `tss_key_<32 hex characters>`
- **Example:** `tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Prefix:** First 8 characters after `tss_key_` (e.g., `a1b2c3d4`)

---

## Security Best Practices

1. ✅ **Store API keys securely** - Never commit keys to version control
2. ✅ **Use environment variables** - Store keys in `.env` files
3. ✅ **Rotate keys regularly** - Generate new keys and revoke old ones
4. ✅ **Set expiration dates** - Use `expiresAt` when generating keys
5. ✅ **Monitor usage** - Check `totalRequests` and `lastUsedAt`
6. ✅ **Limit permissions** - Only grant necessary permissions
7. ✅ **Set rate limits** - Configure `rateLimitPerHour` appropriately

---

## Complete Example

```bash
# 1. Generate API key
curl -X POST http://localhost:3001/api/api-keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "Production App", "permissions": ["geofence", "heatmap"]}'

# Response: Save the "key" value
# API_KEY="tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

# 2. Use API key to get zones
curl http://localhost:3001/api/geofence/zones \
  -H "X-API-Key: tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

# 3. Use API key to get heatmap data
curl http://localhost:3001/api/heatmap/data \
  -H "X-API-Key: tss_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

## Quick Reference

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/api-keys/generate` | POST | No | Generate new API key |
| `/api/api-keys` | GET | No | List all API keys |
| `/api/api-keys/:id` | DELETE | No | Revoke API key |
| `/api/geofence/zones` | GET | ✅ Yes | Get zones |
| `/api/geofence/zones/:id` | GET | ✅ Yes | Get single zone |
| `/api/geofence/events` | GET | ✅ Yes | Get events |
| `/api/geofence/stats` | GET | ✅ Yes | Get statistics |
| `/api/heatmap/data` | GET | ✅ Yes | Get heatmap data |
| `/api/heatmap/stats` | GET | ✅ Yes | Get heatmap stats |

---

**Your APIs are now secure and ready for external users!** 🔐

