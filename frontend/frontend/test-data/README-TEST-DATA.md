# Test GeoJSON Files for MAPOG Import

These are sample GeoJSON files you can use to test the MAPOG import functionality.

## Files Available

### 1. `example-circle-zone.geojson`
**Type:** Circle Zone (Point with radius)
**Location:** Kaziranga National Park (Assam)
- Complete example with all properties
- Zone type: SAFE
- Radius: 3000 meters

### 2. `example-polygon-zone.geojson`
**Type:** Polygon Zone
**Location:** Protected Area near Kaziranga
- Polygon geometry example
- Zone type: RESTRICTED
- No radius (polygon zone)

### 3. `example-multiple-zones.geojson`
**Type:** FeatureCollection (Multiple zones)
**Contains:**
- Tawang Monastery (Circle, MONITORED)
- Nathula Pass (Circle, RESTRICTED)
- Shillong Peak (Circle, SAFE)
- Loktak Lake (Polygon, MONITORED)

**Best for:** Testing bulk import of multiple zones at once

### 4. `example-minimal-circle.geojson`
**Type:** Minimal Circle Zone
**Location:** Aizawl City Viewpoint
- Minimal required properties only
- Just name and radius
- Zone type will default to MONITORED

## How to Use

1. **Open your app** and navigate to Geofences page
2. **Click "Import from MAPOG"** button
3. **Upload one of these files** using "Select File" button
4. **Preview** should show the zone(s) found
5. **Click "Import Zones"** to save to Supabase

## Expected Results

### Circle Zones (Point with radius)
- Will create a circular geofence
- Center at the point coordinates
- Radius from properties.radius

### Polygon Zones
- Will create a polygon geofence
- Boundaries defined by polygon coordinates
- No radius needed

### Multiple Zones (FeatureCollection)
- All zones in the collection will be imported
- Each feature becomes a separate zone
- Preview shows count of features

## Test Coordinates (Northeast India)

Use these coordinates to test location detection after importing:

- **Kaziranga:** `26.5775, 93.1711`
- **Tawang:** `27.586, 91.866`
- **Nathula Pass:** `27.3867, 88.828`
- **Shillong Peak:** `25.547, 91.878`
- **Aizawl:** `23.7271, 92.7176`
- **Loktak Lake:** `24.513, 93.835` (center of polygon)

## Notes

- Circle zones **require** `radius` property in meters
- Polygon zones don't need radius
- Zone types: SAFE, MONITORED, RESTRICTED, EMERGENCY
- Risk levels: LOW, MEDIUM, HIGH, CRITICAL
- All properties are optional except `name` and `radius` (for circles)

