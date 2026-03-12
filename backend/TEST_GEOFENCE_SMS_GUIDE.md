# 🧪 Testing Guide: Geofence SMS Alerts

Complete guide to test the automatic SMS alerts when users enter geofenced zones.

## ✅ Prerequisites Checklist

Before testing, ensure:

- [ ] **Backend server is running** (`npm run dev` in backend folder)
- [ ] **Twilio credentials configured** in `backend/.env`:
  ```
  TWILIO_ACCOUNT_SID=your_twilio_account_sid
  TWILIO_AUTH_TOKEN=your_twilio_auth_token
  TWILIO_PHONE_NUMBER=your_twilio_phone_number
  ```
- [ ] **User is logged in** (frontend authentication)
- [ ] **User has phone number** in `users.contact_number` field
- [ ] **At least one geofence zone exists** (preferably RESTRICTED or EMERGENCY)
- [ ] **Supabase Realtime enabled** for `zone_events` table

---

## 📋 Step-by-Step Testing Process

### Step 1: Verify Backend Setup

**Check backend console** when starting the server:

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ SMS Service: Twilio client initialized
🚀 Server running on port 3001
✅ Geofence SMS Watcher: Subscribed to zone_events table
```

**If you see errors:**
- Missing Twilio credentials → Check `.env` file
- Watcher not started → Check Supabase Realtime is enabled

---

### Step 2: Verify User Phone Number

**Method A: Check Database Directly**

Run in Supabase SQL Editor:
```sql
SELECT id, email, contact_number 
FROM users 
WHERE email = 'your-email@example.com';
```

**Method B: Check via Frontend**

1. Go to **Settings** section in your app
2. Verify phone number is displayed
3. If missing, add it:
   - Enter phone number (e.g., `9876543210` or `+919876543210`)
   - Click "Save All"

**Method C: Quick Database Update**

If you need to add/update phone number directly:
```sql
UPDATE users 
SET contact_number = 9876543210 
WHERE email = 'your-email@example.com';
```

---

### Step 3: Verify Zone Exists

**Check zones in database:**
```sql
SELECT id, name, zone_type, status 
FROM zones 
WHERE status = 'ACTIVE' 
AND zone_type IN ('RESTRICTED', 'EMERGENCY');
```

**Or via Frontend:**
1. Go to **Geofences** section
2. Verify at least one RED zone exists (RESTRICTED or EMERGENCY)
3. Note the zone name and location

**Important:** SMS alerts are **only sent for RESTRICTED or EMERGENCY zones** (RED zones).

---

### Step 4: Test SMS Service Status

**Via Frontend:**
1. Go to **SMS Service** section
2. Check **Service Status**:
   - ✅ SMS Service: **Ready** (green)
   - ✅ Event Watcher: **Active** (green)

**Via API:**
```bash
curl http://localhost:3001/api/sms/status
```

**Expected response:**
```json
{
  "smsServiceReady": true,
  "watcher": {
    "isWatching": true,
    "channelStatus": "joined"
  }
}
```

---

### Step 5: Test with Simple Phone Number Test (Optional)

Before testing geofence alerts, verify Twilio works:

**Via Frontend:**
1. Go to **SMS Service** section
2. Scroll to **Quick SMS Test** (or **Test SMS Alert**)
3. Enter your phone number (e.g., `9876543210`)
4. Click **Send Test SMS**
5. ✅ Check your phone for test message

**Via API:**
```bash
curl -X POST http://localhost:3001/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'
```

**Expected:** SMS received within 30 seconds

---

### Step 6: Test Geofence Entry SMS Alert

**Method A: Real Location Testing** (Recommended)

1. **Open Geofences section** in frontend
2. **Allow location permissions** when prompted
3. **Find a RESTRICTED or EMERGENCY zone** on the map
4. **Note the zone location** (coordinates)
5. **Move to that location** (or use browser DevTools to simulate location)
6. **Enter the zone** - you should see:
   - On-screen notification: "⚠️ You entered [Zone Name]. SMS alert has been sent to your phone."
   - Backend console log: `🔴 RED ZONE DETECTED: [Zone Name] - Sending SMS alert...`
7. **Check your phone** - SMS should arrive within 1-2 seconds

**Method B: Browser DevTools Location Simulation**

1. Open **Geofences** section
2. Open **Browser DevTools** (F12)
3. Go to **Console** tab
4. Type this to simulate location inside a zone:
   ```javascript
   // Example: Set location to coordinates inside your zone
   navigator.geolocation.getCurrentPosition = function(success) {
     success({
       coords: {
         latitude: 25.5784,  // Replace with your zone's latitude
         longitude: 91.8933  // Replace with your zone's longitude
       }
     });
   };
   ```
5. Refresh the page or trigger location update
6. Check backend console and your phone

**Method C: Manual Zone Entry via Database**

1. Get your user ID:
   ```sql
   SELECT id FROM users WHERE email = 'your-email@example.com';
   ```

2. Get a RESTRICTED zone ID:
   ```sql
   SELECT id, name FROM zones 
   WHERE zone_type = 'RESTRICTED' 
   AND status = 'ACTIVE' 
   LIMIT 1;
   ```

3. Manually insert zone entry event:
   ```sql
   INSERT INTO zone_events (
     zone_id, 
     user_id, 
     event_type, 
     latitude, 
     longitude
   ) VALUES (
     'zone-uuid-here',  -- From step 2
     'user-uuid-here',  -- From step 1
     'ENTER',
     25.5784,           -- Zone coordinates
     91.8933
   );
   ```

4. **Watch backend console** - Should immediately trigger SMS
5. **Check your phone** - SMS should arrive

---

### Step 7: Verify SMS Delivery

**Check Backend Console:**
```
📥 Geofence SMS Watcher: Processing ENTER event for user {userId} in zone {zoneId}
🔴 RED ZONE DETECTED: [Zone Name] (RESTRICTED) - Sending SMS alert...
✅ SMS Alert Sent: Zone "[Zone Name]" entered by user {userId}. Twilio SID: SMxxxxx
```

**Check Your Phone:**
- SMS should arrive within 1-2 seconds
- Message format:
  ```
  🚨 HIGH RISK ALERT: You have entered a RESTRICTED zone: "[Zone Name]".
  
  ⚠️ Please exercise extreme caution. Avoid this area if possible.
  
  Stay alert and follow all safety guidelines.
  Tourist Safety System - Safe Yatra
  ```

**Check Twilio Console:**
1. Go to: https://console.twilio.com/
2. Navigate to: **Monitor → Logs → Messaging**
3. Find your SMS delivery status
4. Should show: **Status: Delivered**

**Check SMS Service Section:**
1. Go to **SMS Service** section in frontend
2. Scroll to **Recent Zone Entry Events & SMS Alerts**
3. Should show your zone entry event
4. RED zones should show "SMS Sent" badge

---

## 🐛 Troubleshooting

### Issue: SMS Service shows "Not Configured"

**Solution:**
1. Check `backend/.env` has Twilio credentials
2. Restart backend server after adding credentials
3. Verify credentials are correct (no extra spaces)

### Issue: Event Watcher shows "Inactive"

**Solution:**
1. Check Supabase Realtime is enabled:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE zone_events;
   ```
2. Restart backend server
3. Check backend console for errors

### Issue: "Phone number not found"

**Solution:**
1. Check `users.contact_number` is not NULL:
   ```sql
   SELECT id, email, contact_number FROM users WHERE id = 'your-user-id';
   ```
2. Update phone number:
   ```sql
   UPDATE users SET contact_number = 9876543210 WHERE id = 'your-user-id';
   ```
3. Verify phone number is numeric (not text with special chars)

### Issue: SMS not received but backend shows success

**Possible causes:**
1. **Twilio trial account** - Phone number not verified
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
   - Add and verify your phone number

2. **Phone number format incorrect**
   - Should be: `9876543210` (10 digits for India)
   - System auto-formats to: `+919876543210`

3. **SMS in spam/junk folder**
   - Check spam folder on your phone

4. **Delivery delay**
   - Sometimes takes 30-60 seconds
   - Check Twilio Console for delivery status

### Issue: SMS sent for non-RED zones

**Expected behavior:** SMS only sent for RESTRICTED/EMERGENCY zones

**Solution:**
- Verify zone type in database:
  ```sql
  SELECT id, name, zone_type FROM zones WHERE id = 'zone-id';
  ```
- Only RESTRICTED and EMERGENCY zones trigger SMS

### Issue: "Cooldown active" error

**Explanation:** System prevents spam - same user can't get SMS for same zone within 30 minutes

**Solution:**
- Wait 30 minutes, or
- Test with a different zone
- This is intentional to prevent spam

---

## 📊 Testing Checklist

Use this checklist to verify everything works:

```
Backend Setup:
[ ] Backend server running
[ ] Twilio credentials in .env
[ ] Backend console shows: "SMS Service: Twilio client initialized"
[ ] Backend console shows: "Geofence SMS Watcher: Subscribed"

User Setup:
[ ] User logged in
[ ] User has phone number in users.contact_number
[ ] Phone number is verified in Twilio (for trial accounts)

Zone Setup:
[ ] At least one RESTRICTED or EMERGENCY zone exists
[ ] Zone status is ACTIVE
[ ] Zone coordinates are correct

Testing:
[ ] SMS Service status shows "Ready"
[ ] Event Watcher shows "Active"
[ ] Test SMS (quick test) works
[ ] Zone entry detected (on-screen notification)
[ ] Backend console shows SMS trigger logs
[ ] SMS received on phone
[ ] SMS content is correct

Verification:
[ ] Twilio Console shows SMS as "Delivered"
[ ] SMS Service section shows activity log entry
[ ] RED zone entries marked as "SMS Sent"
```

---

## 🎯 Quick Test Script

Run this in your browser console while on Geofences page:

```javascript
// Get your current user ID
(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User ID:', user?.id);
  
  // Get zones
  const { data: zones } = await supabase
    .from('zones')
    .select('id, name, zone_type')
    .eq('status', 'ACTIVE')
    .in('zone_type', ['RESTRICTED', 'EMERGENCY']);
  
  console.log('RED Zones:', zones);
  
  // Check user phone
  const { data: userData } = await supabase
    .from('users')
    .select('contact_number')
    .eq('id', user?.id)
    .single();
  
  console.log('Phone Number:', userData?.contact_number);
})();
```

---

## ✅ Success Indicators

You know it's working when:

1. ✅ Backend console shows SMS trigger logs
2. ✅ On-screen notification appears
3. ✅ SMS received on phone within 1-2 seconds
4. ✅ SMS Service section shows activity log
5. ✅ Twilio Console shows "Delivered" status

---

## 🚀 Next Steps After Testing

Once testing is successful:

1. **Monitor SMS Service section** for real-time activity
2. **Check Twilio usage** to monitor SMS costs
3. **Review logs** for any issues
4. **Test with multiple users** and zones
5. **Verify cooldown mechanism** (try entering same zone twice quickly)

---

## 📝 Notes

- **SMS only for RED zones:** RESTRICTED and EMERGENCY zones only
- **30-minute cooldown:** Prevents spam for same user-zone combination
- **Trial accounts:** Must verify phone numbers in Twilio Console
- **Phone format:** System auto-formats to E.164 (+91 for India)

Happy Testing! 🎉

