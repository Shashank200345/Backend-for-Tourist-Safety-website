# Geofence & Heatmap API Documentation

## Base URL
```
http://localhost:3001/api
```

---

## Geofence APIs

### 1. Get All Zones
**GET** `/api/geofence/zones`

Get all geofence zones with optional filters.

**Query Parameters:**
- `zone_type` (optional): Filter by zone type (`SAFE`, `MONITORED`, `RESTRICTED`, `EMERGENCY`)
- `status` (optional): Filter by status (`ACTIVE`, `INACTIVE`, `STANDBY`)
- `region` (optional): Filter by region (e.g., `Northeast India`)
- `state` (optional): Filter by state
- `district` (optional): Filter by district

**Example Request:**
```bash
GET /api/geofence/zones?zone_type=RESTRICTED&status=ACTIVE
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "High Risk Area",
      "zone_type": "RESTRICTED",
      "risk_level": "HIGH",
      "geometry": {...},
      "status": "ACTIVE",
      ...
    }
  ],
  "count": 5
}
```

---

### 2. Get Zone by ID
**GET** `/api/geofence/zones/:id`

Get details of a specific zone.

**Example Request:**
```bash
GET /api/geofence/zones/123e4567-e89b-12d3-a456-426614174000
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "High Risk Area",
    "zone_type": "RESTRICTED",
    ...
  }
}
```

---

### 3. Get Zone Events
**GET** `/api/geofence/events`

Get zone entry/exit events with pagination.

**Query Parameters:**
- `zone_id` (optional): Filter by zone ID
- `user_id` (optional): Filter by user ID
- `event_type` (optional): Filter by event type (`ENTER`, `EXIT`)
- `start_date` (optional): Start date (ISO format: `2024-01-01T00:00:00Z`)
- `end_date` (optional): End date (ISO format: `2024-01-31T23:59:59Z`)
- `limit` (optional): Number of results (default: `100`)
- `offset` (optional): Pagination offset (default: `0`)

**Example Request:**
```bash
GET /api/geofence/events?zone_id=xxx&event_type=ENTER&limit=50&offset=0
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "zone_id": "uuid",
      "user_id": "uuid",
      "event_type": "ENTER",
      "latitude": 26.5775,
      "longitude": 93.1711,
      "created_at": "2024-01-15T10:30:00Z",
      ...
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 4. Get Geofence Statistics
**GET** `/api/geofence/stats`

Get aggregated statistics about zones and events.

**Example Request:**
```bash
GET /api/geofence/stats
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "zones": {
      "total": 25,
      "byType": {
        "SAFE": 10,
        "MONITORED": 8,
        "RESTRICTED": 5,
        "EMERGENCY": 2
      },
      "byStatus": {
        "ACTIVE": 20,
        "INACTIVE": 3,
        "STANDBY": 2
      }
    },
    "events": {
      "total": 1250,
      "byType": {
        "ENTER": 625,
        "EXIT": 625
      },
      "recent24Hours": 45
    },
    "visitors": {
      "active": 12,
      "totalVisits": 1250,
      "totalAlerts": 89
    }
  }
}
```

---

## Heatmap APIs

### 1. Get Heatmap Data
**GET** `/api/heatmap/data`

Get heatmap data points for visualization.

**Query Parameters:**
- `start_date` (optional): Start date (ISO format)
- `end_date` (optional): End date (ISO format)
- `source` (optional): Data source (`zone_events` or `user_locations`, default: `zone_events`)
- `intensity_threshold` (optional): Minimum intensity to include (default: `1`)
- `limit` (optional): Maximum number of raw points to process (default: `10000`)

**Example Request:**
```bash
GET /api/heatmap/data?start_date=2024-01-01&end_date=2024-01-31&source=zone_events
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    [26.5775, 93.1711, 15],
    [27.5860, 91.8660, 8],
    [25.5470, 91.8780, 12],
    ...
  ],
  "count": 150,
  "source": "zone_events",
  "meta": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "intensity_threshold": 1
  }
}
```

**Note:** Data format is `[latitude, longitude, intensity]` array suitable for heatmap libraries.

---

### 2. Get Heatmap Statistics
**GET** `/api/heatmap/stats`

Get statistics about heatmap data.

**Query Parameters:**
- `start_date` (optional): Start date (ISO format)
- `end_date` (optional): End date (ISO format)
- `source` (optional): Data source (`zone_events` or `user_locations`, default: `zone_events`)

**Example Request:**
```bash
GET /api/heatmap/stats?start_date=2024-01-01&end_date=2024-01-31
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "totalPoints": 1250,
    "uniqueLocations": 89,
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "bounds": {
      "north": 28.5,
      "south": 24.0,
      "east": 95.0,
      "west": 88.0
    },
    "source": "zone_events"
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Testing the APIs

### Using cURL:

```bash
# Get all zones
curl http://localhost:3001/api/geofence/zones

# Get RESTRICTED zones
curl http://localhost:3001/api/geofence/zones?zone_type=RESTRICTED

# Get zone events
curl http://localhost:3001/api/geofence/events?limit=10

# Get heatmap data
curl http://localhost:3001/api/heatmap/data?source=zone_events

# Get statistics
curl http://localhost:3001/api/geofence/stats
```

### Using JavaScript/Fetch:

```javascript
// Get zones
const response = await fetch('http://localhost:3001/api/geofence/zones');
const data = await response.json();

// Get heatmap data
const heatmapResponse = await fetch(
  'http://localhost:3001/api/heatmap/data?start_date=2024-01-01&source=zone_events'
);
const heatmapData = await heatmapResponse.json();
```

---

## Notes

1. **Data Source**: All APIs read from your existing Supabase database tables (`zones`, `zone_events`, `user_locations`)

2. **Pagination**: Zone events endpoint supports pagination using `limit` and `offset` parameters

3. **Date Format**: Use ISO 8601 format for dates: `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DD`

4. **Heatmap Data**: Returns array of `[lat, lng, intensity]` tuples compatible with most heatmap libraries (Leaflet.heat, Google Maps Heatmap, etc.)

5. **Performance**: Heatmap data endpoint aggregates locations to reduce data size. Coordinates are rounded to 4 decimal places (~11 meters precision) for aggregation.

---

## Quick Start

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the APIs:**
   ```bash
   # Health check
   curl http://localhost:3001/health

   # Get zones
   curl http://localhost:3001/api/geofence/zones

   # Get heatmap data
   curl http://localhost:3001/api/heatmap/data
   ```

---

**All APIs are now ready to use!** 🚀

