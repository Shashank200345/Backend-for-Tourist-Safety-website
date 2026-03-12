# 📱 Twilio SMS Test Guide

This guide helps you test if Twilio SMS integration is working correctly.

## 🚀 Quick Test Methods

### Method 1: Using the Test HTML Page (Recommended)

1. **Open the test page:**
   - Open `backend/twilio-test.html` in your browser
   - Or serve it: `python -m http.server 8080` and visit `http://localhost:8080/twilio-test.html`

2. **Enter your phone number:**
   - Format: `+919876543210` or `9876543210` (auto-formats to +91)
   - For Twilio trial accounts, the number must be verified in Twilio Console

3. **Click "Send Test SMS"**
   - Wait for the response
   - Check your phone for the test message

### Method 2: Using cURL (Command Line)

```bash
# Test SMS endpoint
curl -X POST http://localhost:3001/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Test SMS sent successfully!",
  "sid": "SM1234567890abcdef",
  "info": "Test SMS sent successfully! Check your phone for the message."
}
```

### Method 3: Using Postman/Insomnia

**POST** `http://localhost:3001/api/sms/test`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phoneNumber": "+919876543210"
}
```

### Method 4: Check Service Status

**GET** `http://localhost:3001/api/sms/status`

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

## ✅ Prerequisites

### 1. Backend Environment Variables

Make sure your `backend/.env` file has:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 2. Backend Server Running

```bash
cd backend
npm run dev
```

You should see:
```
✅ SMS Service: Twilio client initialized
🚀 Server running on port 3001
✅ Geofence SMS Watcher: Subscribed to zone_events table
```

### 3. Twilio Account Setup

- **Trial Account:** Phone numbers must be verified in Twilio Console
  - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
  - Click "Add a new number" and verify your phone number
  
- **Paid Account:** Can send to any verified number

## 🔍 Troubleshooting

### Error: "SMS service not configured"

**Solution:**
- Check that `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are set in `backend/.env`
- Restart the backend server after adding environment variables
- Check backend console for initialization messages

### Error: "Invalid phone number" (Error Code 21211)

**Solution:**
- Use E.164 format: `+919876543210` (country code + number)
- For India: `+91` followed by 10 digits
- Remove spaces, dashes, and parentheses

### Error: "Phone number not verified" (Error Code 21608)

**Solution:**
- This happens with Twilio trial accounts
- Go to Twilio Console → Phone Numbers → Verified Caller IDs
- Add and verify your phone number
- Wait for verification SMS/call

### Error: "Invalid 'from' phone number" (Error Code 21214)

**Solution:**
- Check `TWILIO_PHONE_NUMBER` in `.env`
- Must be a valid Twilio phone number (format: `+1234567890`)
- Find your Twilio number in Twilio Console → Phone Numbers

### Error: "Cannot connect to backend"

**Solution:**
- Make sure backend server is running: `cd backend && npm run dev`
- Check that backend is on port 3001 (or update the URL)
- Check browser console for CORS errors
- Verify firewall/antivirus isn't blocking connections

### SMS Not Received

**Check:**
1. Check Twilio Console → Logs → Monitor → Messaging
2. Look for delivery status (queued, sent, delivered, failed)
3. Check phone number format
4. For trial accounts, ensure number is verified
5. Check spam/junk folder on phone

## 📊 Test Flow

```
1. Open test page → Check status (should show "Ready ✅")
2. Enter phone number → Click "Send Test SMS"
3. Backend receives request → Validates phone number
4. Backend sends SMS via Twilio → Returns success/error
5. Check phone for test message → Verify delivery
```

## ✅ Success Indicators

- ✅ Backend console shows: `✅ SMS Service: Twilio client initialized`
- ✅ Status check returns: `smsServiceReady: true`
- ✅ Test SMS endpoint returns: `success: true` with `sid`
- ✅ Test message received on phone within 30 seconds
- ✅ Twilio Console shows message as "delivered"

## 🎯 Next Steps

Once the test SMS works:

1. **Test geofence SMS alerts:**
   - Create a RESTRICTED or EMERGENCY zone in Geofences section
   - Enter that zone to trigger automatic SMS alert
   - Check that SMS is sent automatically

2. **Verify user profile setup:**
   - User must have `phone_number` in `user_profiles` table
   - User must have `notification_preferences.sms` enabled (default: true)

3. **Monitor SMS activity:**
   - Check SMS Service section in frontend
   - View activity logs and delivery status

## 📝 Test Message Format

You should receive a message like:

```
✅ Twilio SMS Test - Safe Yatra

This is a test SMS to verify Twilio integration is working correctly.

If you received this message, your SMS service is properly configured!

Sent at: 08/01/2025, 3:45:30 PM
Tourist Safety System
```

## 🔗 Useful Links

- Twilio Console: https://console.twilio.com/
- Twilio API Docs: https://www.twilio.com/docs/sms
- Twilio Phone Numbers: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming

