# QR Code Feature - One-Time Use Login

## ✅ What Was Implemented

### Backend

1. **Database Migration**
   - Created `qr_codes` table
   - Stores QR tokens, usage status, expiration
   - File: `supabase/migrations/004_add_qr_codes.sql`

2. **QR Code Service**
   - Generate unique QR codes for blockchain IDs
   - One-time use verification
   - Expiration handling (24 hours)
   - File: `src/services/qrCodeService.ts`

3. **API Endpoints**
   - `GET /api/airport/verify-qr?token=...` - Verify and use QR code (one-time)
   - `POST /api/airport/generate-qr` - Generate new QR code
   - Updated `/api/airport/onboard` - Now returns QR code

### Frontend

1. **QR Code Display**
   - Shows QR code after registration
   - Displays expiration time
   - Copy QR URL button
   - Generate new QR code button

2. **QR Scanner Page**
   - Camera-based QR code scanner
   - Automatic verification on scan
   - One-time use enforcement
   - File: `test-frontend/qr-scanner.html`

## 🔄 How It Works

### Registration Flow

1. User completes registration
2. Backend generates:
   - Blockchain ID
   - Unique QR token
   - QR code image (base64)
3. QR code stored in database with:
   - `is_used = false`
   - `expires_at = 24 hours from now`
4. QR code displayed to user

### Login Flow (QR Scan)

1. User opens QR scanner page
2. Scanner activates camera
3. QR code is scanned
4. Token extracted from QR URL
5. Backend verifies:
   - Token exists
   - Not already used
   - Not expired
6. If valid:
   - Mark as used (`is_used = true`)
   - Create session
   - Return JWT token
7. User is logged in

## 📋 Setup Required

### 1. Database Migration

Run in Supabase SQL Editor:
```sql
-- File: supabase/migrations/004_add_qr_codes.sql
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id TEXT NOT NULL,
  blockchain_id TEXT NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  qr_code_data TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_tourist_qr FOREIGN KEY (tourist_id) REFERENCES users(tourist_id) ON DELETE CASCADE
);
```

### 2. Environment Variable (Optional)

Add to `.env`:
```env
QR_VERIFICATION_URL=http://localhost:3001/api/airport/verify-qr
```

## 🎯 Features

### One-Time Use
- ✅ Each QR code can only be scanned once
- ✅ After use, `is_used` is set to `true`
- ✅ Used QR codes cannot be reused

### Expiration
- ✅ QR codes expire after 24 hours
- ✅ Expired QR codes cannot be used
- ✅ Users can generate new QR codes

### Security
- ✅ Unique token for each QR code
- ✅ Token stored securely in database
- ✅ Automatic invalidation after use

## 📱 Frontend Pages

### 1. Registration Page (`index.html`)
- Shows QR code after registration
- Displays expiration time
- Options to copy URL or generate new QR

### 2. QR Scanner Page (`qr-scanner.html`)
- Camera-based scanner
- Automatic verification
- Shows login result

## 🔍 API Endpoints

### Generate QR Code (After Registration)
```
POST /api/airport/onboard
Response includes:
{
  "qrCode": {
    "qrCodeImage": "data:image/png;base64,...",
    "qrCodeUrl": "http://localhost:3001/api/airport/verify-qr?token=...",
    "expiresAt": "2024-01-02T12:00:00.000Z"
  }
}
```

### Verify QR Code (One-Time Use)
```
GET /api/airport/verify-qr?token=abc123...
Response:
{
  "success": true,
  "token": "jwt_token",
  "user": {...}
}
```

### Generate New QR Code
```
POST /api/airport/generate-qr
Body: { "blockchainId": "0x..." }
Response:
{
  "success": true,
  "qrCode": {
    "qrCodeImage": "data:image/png;base64,...",
    "qrCodeUrl": "...",
    "expiresAt": "..."
  }
}
```

## 🧪 Testing

### Test QR Code Generation

1. Complete registration
2. Check response includes `qrCode` object
3. Verify QR code image displays
4. Check expiration time

### Test QR Code Scanning

1. Open `qr-scanner.html`
2. Click "Start Scanner"
3. Grant camera permission
4. Scan the QR code from registration
5. Verify login succeeds
6. Try scanning same QR again - should fail (already used)

### Test QR Code Expiration

1. Wait 24+ hours (or manually update `expires_at` in database)
2. Try to scan expired QR code
3. Should get "QR code has expired" error

## 🐛 Troubleshooting

### QR Code Not Generated

**Check:**
- Backend console for errors
- Database migration applied
- QR code service initialized

### Scanner Not Working

**Check:**
- Camera permissions granted
- Using HTTPS or localhost
- Browser supports camera API
- html5-qrcode library loaded

### QR Code Already Used Error

**Expected:** After first scan, QR code is marked as used
**Solution:** Generate new QR code

### QR Code Expired

**Solution:** Generate new QR code using "Generate New QR Code" button

## 📊 Database Schema

### QR Codes Table

```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY,
  tourist_id TEXT NOT NULL,
  blockchain_id TEXT NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  qr_code_data TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## ✅ Checklist

- [ ] Database migration applied
- [ ] QR code generated after registration
- [ ] QR code displays correctly
- [ ] Scanner page works
- [ ] QR code can be scanned
- [ ] One-time use enforced
- [ ] Expiration works
- [ ] Generate new QR code works

## 🔐 Security Notes

1. **One-Time Use:** Enforced at database level
2. **Expiration:** 24-hour default, configurable
3. **Token Security:** Random 32-byte hex tokens
4. **HTTPS Required:** For production (camera access)

## 🎯 Usage Flow

```
Registration → QR Code Generated → Display QR Code
                                      ↓
                              User Scans QR Code
                                      ↓
                              Verify Token (One-Time)
                                      ↓
                              Mark as Used → Login Success
```

## 📚 Files Created/Modified

### Backend
- `supabase/migrations/004_add_qr_codes.sql`
- `src/services/qrCodeService.ts`
- `src/controllers/airportOnboardingController.ts` (updated)
- `src/routes/airportOnboarding.routes.ts` (updated)

### Frontend
- `test-frontend/qr-scanner.html`
- `test-frontend/qr-scanner.js`
- `test-frontend/index.html` (updated)
- `test-frontend/app.js` (updated)
- `test-frontend/styles.css` (updated)

### Dependencies
- `qrcode` - QR code generation
- `@types/qrcode` - TypeScript types
- `html5-qrcode` - QR code scanning (CDN)



