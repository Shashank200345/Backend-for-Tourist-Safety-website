# QR Code Setup Guide - Quick Start

## 🚀 Quick Setup (3 Steps)

### Step 1: Database Migration (2 minutes)

Run in Supabase SQL Editor:
```sql
-- Copy and paste contents of: supabase/migrations/004_add_qr_codes.sql
```

Or manually run:
```sql
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

CREATE INDEX IF NOT EXISTS idx_qr_codes_tourist_id ON qr_codes(tourist_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_token ON qr_codes(qr_token);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_used ON qr_codes(is_used);
```

### Step 2: Restart Backend (1 minute)

```bash
npm run dev
```

### Step 3: Test (1 minute)

1. Complete registration
2. QR code will appear automatically
3. Open `qr-scanner.html` to test scanning

## ✅ That's It!

QR codes are now working. Each QR code:
- ✅ Is unique to the blockchain ID
- ✅ Can only be used once
- ✅ Expires after 24 hours
- ✅ Automatically invalidates after scan

## 📱 How to Use

### For Tourists (Registration)

1. Complete registration form
2. QR code appears on success screen
3. Save/print QR code
4. Use it to login (one-time only)

### For Verification (Scanner)

1. Open `qr-scanner.html`
2. Click "Start Scanner"
3. Point camera at QR code
4. Automatic login on scan

## 🔍 Verify It Works

### Check Database

```sql
SELECT * FROM qr_codes 
ORDER BY created_at DESC 
LIMIT 5;
```

Should show:
- `is_used = false` for new QR codes
- `expires_at` set to 24 hours from creation
- Unique `qr_token` for each

### Test Flow

1. Register → Get QR code
2. Scan QR code → Login succeeds
3. Try scanning again → Should fail (already used)

## 🎯 Key Features

- **One-Time Use:** ✅ Enforced
- **Expiration:** ✅ 24 hours
- **Unique:** ✅ Each blockchain ID gets unique QR
- **Secure:** ✅ Random tokens, database validation

## 📚 Full Documentation

See `QR_CODE_FEATURE.md` for complete details.



