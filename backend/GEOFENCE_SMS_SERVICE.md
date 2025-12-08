# Geofence-Based SMS Alert Service

## Overview

This service automatically sends SMS alerts to users when they enter geofenced zones. It's a separate, standalone service that integrates seamlessly with the existing geofencing system without modifying any other features.

## Architecture & Flow

### Component Communication Flow

```
┌─────────────────┐
│  Frontend App   │
│  (Geofences.tsx)│
└────────┬────────┘
         │
         │ User enters zone
         │ Logs ENTER event
         ▼
┌─────────────────────────┐
│  Supabase Database      │
│  zone_events table      │
│  ┌───────────────────┐  │
│  │ INSERT event_type │  │
│  │ = 'ENTER'         │  │
│  └─────────┬─────────┘  │
└────────────┼────────────┘
             │
             │ Supabase Realtime
             │ (postgres_changes)
             ▼
┌─────────────────────────────┐
│  Geofence SMS Watcher       │
│  (geofenceSMSWatcher.ts)    │
│  ┌───────────────────────┐  │
│  │ Listens for INSERT    │  │
│  │ Filters: ENTER only   │  │
│  └───────────┬───────────┘  │
└──────────────┼──────────────┘
               │
               │ Triggers SMS
               ▼
┌─────────────────────────────┐
│  SMS Service                 │
│  (smsService.ts)             │
│  ┌───────────────────────┐  │
│  │ 1. Check cooldown     │  │
│  │ 2. Get user prefs     │  │
│  │ 3. Format phone       │  │
│  │ 4. Generate message   │  │
│  │ 5. Send via Twilio    │  │
│  └───────────┬───────────┘  │
└──────────────┼──────────────┘
               │
               │ Twilio API
               ▼
┌─────────────────────────────┐
│  User's Phone               │
│  SMS Received               │
└─────────────────────────────┘
```

### Detailed Flow Explanation

1. **Location Detection (Frontend)**
   - User's location is tracked via `navigator.geolocation.watchPosition()`
   - Frontend checks if user entered any zone using Turf.js
   - When ENTER detected, logs event to `zone_events` table

2. **Database Event Logging**
   - Frontend inserts record into `zone_events` table with:
     - `zone_id`: The zone that was entered
     - `user_id`: The user who entered
     - `event_type`: 'ENTER' or 'EXIT'
     - `latitude`, `longitude`: User's location
     - `created_at`: Timestamp

3. **Real-time Event Detection (Backend)**
   - `geofenceSMSWatcher.ts` subscribes to Supabase Realtime
   - Listens for `INSERT` events on `zone_events` table
   - Filters to only process `event_type = 'ENTER'`
   - Ignores EXIT events completely

4. **SMS Alert Processing**
   - Watcher receives event → calls `sendGeofenceSMSAlert()`
   - SMS Service performs checks:
     - ✅ Cooldown check (30 min default)
     - ✅ User notification preferences (SMS enabled?)
     - ✅ Phone number exists and is valid
     - ✅ Zone information available

5. **SMS Delivery**
   - Formats phone number to E.164 format
   - Generates contextual message based on zone type/risk
   - Sends via Twilio API
   - Updates cooldown cache
   - Logs success/failure

## Key Features

### 1. **ENTER Events Only**
   - Only sends SMS for ENTER events
   - EXIT events are completely ignored
   - Prevents SMS spam

### 2. **Cooldown Mechanism**
   - Prevents multiple SMS for same user-zone combination
   - Default: 30 minutes
   - Configurable via `SMS_COOLDOWN_MS`
   - Automatic cache cleanup

### 3. **User Preferences**
   - Respects user's SMS notification preferences
   - Checks `user_profiles.notification_preferences.sms`
   - Defaults to `true` if not specified

### 4. **Scalable Design**
   - Uses Supabase Realtime (serverless)
   - No polling required
   - Event-driven architecture
   - Automatic reconnection on failure

### 5. **Error Handling**
   - Graceful degradation if Twilio not configured
   - Comprehensive logging
   - Skips invalid phone numbers
   - Retries handled by Supabase Realtime

## File Structure

```
backend/src/
├── services/
│   ├── smsService.ts              # Core SMS sending logic
│   └── geofenceSMSWatcher.ts      # Database event listener
├── controllers/
│   └── sms.controller.ts          # REST API endpoints
├── routes/
│   └── sms.routes.ts              # Route definitions
└── app.ts                         # Service integration
```

## Installation & Setup

### 1. Install Dependencies

Already installed:
```bash
npm install twilio
npm install @types/twilio --save-dev
```

### 2. Configure Environment Variables

Add to `backend/.env`:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number (E.164 format)

# Supabase (already configured)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Get Twilio Credentials

1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token from Dashboard
3. Get a phone number (Trial accounts have limitations)
4. For production, upgrade account and verify phone numbers

### 4. Database Setup

The service uses existing `zone_events` and `user_profiles` tables. Ensure:

- `zone_events` table exists with columns:
  - `id`, `zone_id`, `user_id`, `event_type`, `latitude`, `longitude`, `created_at`
  
- `user_profiles` table exists with columns:
  - `id`, `phone_number`, `notification_preferences` (JSONB)

- **Supabase Realtime must be enabled** for `zone_events` table:
  1. Go to Supabase Dashboard → Database → Replication
  2. Enable replication for `zone_events` table
  3. Or use SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE zone_events;`

### 5. Start Backend Server

```bash
npm run dev
```

The SMS watcher will automatically start when the server starts.

## API Endpoints

### Trigger SMS Manually

```bash
POST /api/sms/trigger
Content-Type: application/json

{
  "userId": "user-uuid",
  "zoneId": "zone-uuid",
  "zoneName": "High Risk Area",  // Optional
  "zoneType": "RESTRICTED"        // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully"
}
```

### Get SMS Service Status

```bash
GET /api/sms/status
```

**Response:**
```json
{
  "smsServiceReady": true,
  "watcher": {
    "isWatching": true,
    "channelStatus": "joined"
  }
}
```

## Configuration

### Cooldown Period

Default: 30 minutes (1800000 ms)

To change, modify `SMS_COOLDOWN_MS` in `smsService.ts`:

```typescript
const SMS_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
```

### Phone Number Format

The service automatically formats phone numbers:
- Adds country code (+91 for India) if missing
- Converts to E.164 format required by Twilio
- Validates length (10-15 digits)

### SMS Message Templates

Messages vary by zone type:

- **RESTRICTED**: `⚠️ HIGH RISK: You have entered zone "..."`
- **EMERGENCY**: `🚨 EMERGENCY: You have entered zone "..."`
- **MONITORED**: `📍 MONITORED: You have entered zone "..."`
- **SAFE**: `📍 SAFE: You have entered zone "..."`

## Monitoring & Logs

### Success Logs
```
✅ SMS Alert Sent: Zone "High Risk Area" entered by user {userId}. Twilio SID: SM...
✅ Geofence SMS Watcher: SMS sent successfully for event {eventId}
```

### Skipped Logs
```
⏭️ SMS Skipped: Cooldown active for user {userId} (zone: {zoneId}). Last sent X minutes ago.
⚠️ SMS Skipped: SMS notifications disabled for user {userId}
⚠️ SMS Skipped: No phone number found for user {userId}
```

### Error Logs
```
❌ Twilio SMS Error: {error details}
❌ Geofence SMS Watcher: Error processing event {eventId}: {error}
```

## Security Considerations

1. **Environment Variables**: Never commit Twilio credentials
2. **Rate Limiting**: Cooldown prevents SMS spam
3. **User Consent**: Only sends to users with SMS enabled
4. **Phone Validation**: Validates phone numbers before sending
5. **Service Role Key**: Uses service role key for database access (server-side only)

## Troubleshooting

### SMS Not Sending

1. **Check Configuration**
   ```bash
   GET /api/sms/status
   ```
   Verify `smsServiceReady: true`

2. **Check User Preferences**
   - Ensure user has `phone_number` in `user_profiles`
   - Verify `notification_preferences.sms` is not `false`

3. **Check Cooldown**
   - Wait 30 minutes or clear cooldown cache (restart server)

4. **Check Twilio**
   - Verify account balance
   - Check phone number is verified (for trial accounts)
   - Review Twilio logs in dashboard

### Watcher Not Running

1. **Check Supabase Realtime**
   - Enable Realtime for `zone_events` table in Supabase Dashboard
   - Check database connection
   - Verify service role key has proper permissions

2. **Check Logs**
   - Look for subscription errors
   - Verify service role key has proper permissions

3. **Restart Server**
   - Restart backend server to reinitialize watcher

## Performance

- **Event Processing**: Near real-time (< 1 second)
- **Cooldown Cache**: In-memory (cleaned hourly)
- **Database Queries**: Minimal (only on ENTER events)
- **Twilio Rate Limits**: Standard Twilio limits apply

## Best Practices

1. **Phone Number Collection**: Collect and validate phone numbers during registration
2. **User Preferences**: Provide UI for users to enable/disable SMS
3. **Message Testing**: Test messages before production deployment
4. **Monitoring**: Set up alerts for Twilio errors
5. **Cost Management**: Monitor Twilio usage and costs

## Future Enhancements

- [ ] Support for multiple languages
- [ ] Custom message templates per zone
- [ ] Batch SMS for multiple users
- [ ] Delivery status tracking
- [ ] SMS analytics dashboard

---

**Note**: This service is completely separate from existing features and does not modify any other functionality. It can be enabled/disabled independently.
