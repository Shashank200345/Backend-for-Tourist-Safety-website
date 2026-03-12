# SMS Service Update: Using `users` Table

## ✅ Changes Applied

The SMS service has been updated to use the `users` table with `contact_number` field instead of `user_profiles.phone_number`.

## What Was Changed

### File: `backend/src/services/smsService.ts`

**Updated Function:** `getUserPreferences()`

### Key Features

1. **Primary Source: `users` table**
   - Queries `users.contact_number` (numeric) instead of `user_profiles.phone_number`
   - Converts numeric `contact_number` to string for phone formatting

2. **Smart ID Mapping**
   - **Strategy 1:** Direct match - tries `users.id = userId` (if `users.id` equals `auth.users.id`)
   - **Strategy 2:** Email match - if ID doesn't match, fetches auth user email and matches with `users.email`
   - **Strategy 3:** Fallback - tries `user_profiles` table for backward compatibility

3. **Phone Number Handling**
   - Converts numeric `contact_number` to string: `String(contact_number)`
   - Handles null/undefined values gracefully
   - Formats to E.164 format (e.g., +919876543210) automatically

4. **Notification Preferences**
   - Tries to fetch from `user_profiles.notification_preferences` (if exists)
   - Defaults to `{ sms: true }` if not found (SMS enabled by default)

## Data Flow

```
zone_events.user_id (auth.users.id)
    ↓
getUserPreferences(userId)
    ↓
Query users table:
  1. Try: users.id = userId
  2. If not found: Get auth.users.email → Match users.email
  3. Fallback: user_profiles (backward compatibility)
    ↓
Extract: users.contact_number (numeric)
    ↓
Convert to string: String(contact_number)
    ↓
Format to E.164: formatPhoneNumber() → +919876543210
    ↓
Send SMS via Twilio ✅
```

## Database Schema Assumptions

### `users` Table
```sql
- id (uuid) - Primary key
- contact_number (numeric) - Phone number (e.g., 9876543210)
- email (text) - User email (for matching with auth.users)
```

### Relationship Options

**Option A: Direct ID Match** (Recommended)
- `users.id` = `auth.users.id`
- Works directly, no mapping needed

**Option B: Email Match**
- `users.email` = `auth.users.email`
- IDs may differ, but emails match
- System automatically handles this

## Testing

### Test Cases

1. **User with contact_number in users table**
   ```sql
   INSERT INTO users (id, email, contact_number) 
   VALUES ('user-uuid', 'test@example.com', 9876543210);
   ```
   ✅ Should find and send SMS

2. **User without contact_number**
   ```sql
   UPDATE users SET contact_number = NULL WHERE id = 'user-uuid';
   ```
   ✅ Should skip SMS with message: "Phone number not found"

3. **User not in users table**
   - User exists in auth but not in users table
   ✅ Should try email match, then fallback to user_profiles

### Backend Console Logs

When SMS is triggered, you'll see:
```
📱 Found phone number for user {userId}: 9876543210 (from users.contact_number)
✅ SMS Alert Sent: Zone "{zoneName}" entered by user {userId}. Twilio SID: {sid}
```

If phone not found:
```
⚠️ User {userId} found in users table but contact_number is null/empty
⚠️ SMS Skipped: No phone number found for user {userId}
```

## Requirements

1. **Users table must have:**
   - `id` column (uuid)
   - `contact_number` column (numeric or text)
   - `email` column (for email-based matching if needed)

2. **zone_events.user_id must:**
   - Reference `auth.users.id` (from frontend getCurrentUser())
   - Or reference `users.id` directly (if your system uses users.id in events)

3. **Phone Number Format:**
   - Can be stored as: `9876543210` (10 digits)
   - System automatically formats to: `+919876543210`
   - For other countries, include country code in storage or add logic

## Migration Notes

### If You Have Existing `user_profiles` Table

The system will:
1. First try `users` table (primary)
2. Fallback to `user_profiles` table (backward compatibility)

### To Migrate Data

If you want to move phone numbers from `user_profiles` to `users`:

```sql
UPDATE users u
SET contact_number = up.phone_number::numeric
FROM user_profiles up
WHERE u.id = up.id 
  AND up.phone_number IS NOT NULL
  AND u.contact_number IS NULL;
```

## Troubleshooting

### Issue: "User preferences not found"

**Possible causes:**
1. User not in `users` table
2. `users.id` doesn't match `auth.users.id` and email doesn't match either
3. Database connection issue

**Solution:**
- Check if user exists in `users` table
- Verify `users.email` matches auth user email
- Check backend console for detailed error logs

### Issue: "Phone number not found"

**Possible causes:**
1. `contact_number` is NULL in `users` table
2. `contact_number` is 0 or empty

**Solution:**
- Update users table: `UPDATE users SET contact_number = 9876543210 WHERE id = 'user-id';`
- Ensure contact_number is a valid numeric value

### Issue: "Invalid phone number format"

**Possible causes:**
1. `contact_number` has invalid characters
2. Number is too short/long after formatting

**Solution:**
- Ensure `contact_number` is numeric: `9876543210` (10 digits for India)
- System will auto-add `+91` country code
- For international numbers, store with country code already included

## Next Steps

1. ✅ Verify users have `contact_number` populated
2. ✅ Test SMS alerts by entering a geofence zone
3. ✅ Check backend logs for any errors
4. ✅ Verify SMS delivery in Twilio Console

## Summary

✅ SMS service now uses `users.contact_number`  
✅ Handles numeric to string conversion  
✅ Smart ID/email mapping  
✅ Backward compatible with `user_profiles`  
✅ Enhanced logging for debugging  

The SMS alert system is now fully integrated with your `users` table structure!

