# Complete Testing Guide - Aadhaar Onboarding Flow

## 📋 Pre-Testing Checklist

### ✅ Backend Setup

1. **Database Migration**
   - [ ] Run `supabase/migrations/002_add_verification_status.sql` in Supabase SQL Editor
   - [ ] Verify new columns are added to `users` table

2. **Backend Server**
   - [ ] Start backend: `npm run dev`
   - [ ] Verify server is running on `http://localhost:3001`
   - [ ] Test health endpoint: `curl http://localhost:3001/health`

3. **Environment Variables**
   - [ ] `SUPABASE_URL` is set
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
   - [ ] `JWT_SECRET` is set
   - [ ] `REDIS_URL` is set (if using Redis)

4. **CORS Configuration**
   - [ ] Check `FRONTEND_URL` in `.env` matches your frontend origin
   - [ ] Or update `src/app.ts` to allow your frontend origin

### ✅ Frontend Setup

1. **Open Frontend**
   - [ ] Open `test-frontend/index.html` in browser
   - [ ] Or use a local server (recommended)

2. **API Connection**
   - [ ] Check API status indicator shows "✅ API Connected"
   - [ ] If not, verify backend is running

## 🧪 Step-by-Step Testing

### Test 1: Upload Aadhaar e-KYC XML

**Option A: Use Real Aadhaar e-KYC XML**
1. Visit: https://resident.uidai.gov.in/ (Main portal)
   - Login with Aadhaar number
   - Navigate to "Offline e-KYC" or "Paperless Offline e-KYC" section
   - OR directly try: https://resident.uidai.gov.in/offlineaadhaar
2. Login with your Aadhaar number
3. Download "Aadhaar Paperless Offline e-KYC" XML file
4. Upload in frontend

**Option B: Use Sample XML (For Testing)**
1. Use `test-frontend/test-aadhaar-sample.xml`
2. Upload in frontend

**Expected Result:**
- ✅ File uploads successfully
- ✅ Shows "Aadhaar verified successfully"
- ✅ Displays extracted data (name, DOB, gender, address, reference ID)
- ✅ "Continue to Step 2" button appears

**API Call:**
```
POST http://localhost:3001/api/airport/aadhaar/verify
Content-Type: multipart/form-data
Body: { kycFile: <XML File> }
```

### Test 2: Complete Onboarding

1. Fill in the form:
   - Email: `test@example.com`
   - Country: `India`
   - State: `Delhi` (or extract from address)
   - Itinerary Start Date: Today's date
   - Itinerary End Date: 30 days from now

2. Click "Complete Onboarding"

**Expected Result:**
- ✅ Shows "Onboarding completed successfully"
- ✅ Displays Tourist ID
- ✅ Displays Blockchain ID (IMPORTANT - save this!)
- ✅ Displays Transaction Hash
- ✅ JWT Token is generated
- ✅ User data is saved in database

**API Call:**
```
POST http://localhost:3001/api/airport/onboard
Content-Type: application/json
Body: {
  email, country, state,
  itineraryStartDate, itineraryEndDate,
  kycData: { name, dob, gender, address, referenceId }
}
```

**Database Check:**
- Go to Supabase Dashboard → Table Editor → `users`
- Verify new user is created with:
  - `tourist_id`
  - `blockchain_id`
  - `verification_status` = 'verified' (if updated)
  - `verification_method` = 'offline-kyc' (if updated)

### Test 3: Login with Blockchain ID

1. Copy Blockchain ID from Step 2
2. Click "Test Login" button
3. Paste Blockchain ID in login form
4. Click "Login"

**Expected Result:**
- ✅ Shows "Login successful"
- ✅ Displays user details
- ✅ New JWT token is generated
- ✅ Token is stored in localStorage

**API Call:**
```
POST http://localhost:3001/api/airport/login
Content-Type: application/json
Body: { blockchainId: "0x..." }
```

**Verify Token:**
- Check browser console: `localStorage.getItem('token')`
- Token should be a JWT string

## 🔍 Verification Steps

### 1. Database Verification

**Check Users Table:**
```sql
SELECT 
  tourist_id,
  blockchain_id,
  name,
  email,
  verification_status,
  verification_method,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

**Check Sessions Table:**
```sql
SELECT 
  tourist_id,
  blockchain_id,
  is_active,
  expires_at,
  created_at
FROM sessions
ORDER BY created_at DESC
LIMIT 5;
```

**Check Blockchain Records (if contract is deployed):**
```sql
SELECT 
  tourist_id,
  transaction_hash,
  block_number,
  created_at
FROM blockchain_records
ORDER BY created_at DESC
LIMIT 5;
```

### 2. API Verification

**Test Health Endpoint:**
```bash
curl http://localhost:3001/health
```

**Test Upload Endpoint (using curl):**
```bash
curl -X POST http://localhost:3001/api/airport/aadhaar/verify \
  -F "kycFile=@test-frontend/test-aadhaar-sample.xml"
```

**Test Login Endpoint:**
```bash
curl -X POST http://localhost:3001/api/airport/login \
  -H "Content-Type: application/json" \
  -d '{"blockchainId":"0xYOUR_BLOCKCHAIN_ID_HERE"}'
```

### 3. Frontend Verification

- ✅ All steps complete without errors
- ✅ Data displays correctly
- ✅ Blockchain ID is copyable
- ✅ Token is stored in localStorage
- ✅ Can login with saved Blockchain ID

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access to fetch at 'http://localhost:3001' from origin 'file://' has been blocked by CORS policy`

**Solution:**
- Use a local server instead of opening file directly
- Or update backend CORS to allow file:// origin (not recommended)
- Best: Use `python -m http.server 8000` or VS Code Live Server

### Issue 2: API Not Available

**Error:** `API Not Available - Make sure backend is running on port 3001`

**Solution:**
- Check if backend is running: `npm run dev`
- Verify port 3001 is not in use
- Check backend logs for errors

### Issue 3: File Upload Fails

**Error:** `Failed to verify Aadhaar`

**Solution:**
- Ensure file is valid XML format
- Check file size (max 5MB)
- Verify XML structure matches Aadhaar e-KYC format
- Check backend logs for detailed error

### Issue 4: Onboarding Fails

**Error:** `Onboarding failed`

**Solution:**
- Check database connection (Supabase credentials)
- Verify all required fields are filled
- Check backend logs for specific error
- Ensure itinerary end date is after start date

### Issue 5: Login Fails

**Error:** `User not found` or `Invalid blockchain ID format`

**Solution:**
- Verify Blockchain ID format: `0x` + 40 hex characters
- Ensure you completed onboarding first
- Check if user exists in database
- Verify Blockchain ID is correct (no extra spaces)

### Issue 6: Database Migration Not Applied

**Error:** Column doesn't exist errors

**Solution:**
- Run migration SQL in Supabase SQL Editor
- Verify columns exist: `verification_status`, `verification_method`, etc.
- Check migration file: `supabase/migrations/002_add_verification_status.sql`

## 📝 Manual Steps Required

### 1. Get Aadhaar e-KYC XML (For Real Testing)

**Steps:**
1. Visit: https://resident.uidai.gov.in/ (Main portal)
   - Login with Aadhaar number
   - Navigate to "Offline e-KYC" or "Paperless Offline e-KYC" section
   - OR directly try: https://resident.uidai.gov.in/offlineaadhaar
2. Click "Login"
3. Enter Aadhaar number
4. Enter OTP sent to registered mobile
5. Navigate to "Download" section
6. Click "Aadhaar Paperless Offline e-KYC"
7. Download XML file
8. Use this file in frontend

**Note:** For testing, you can use the sample XML file provided.

### 2. Apply Database Migration

**Steps:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy contents of `supabase/migrations/002_add_verification_status.sql`
5. Paste and run
6. Verify success message

### 3. Configure Backend CORS (If Needed)

**If frontend is on different origin:**

1. Open `src/app.ts`
2. Update CORS configuration:
```typescript
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:5173', 'file://'],
  credentials: true,
}));
```

### 4. Start Required Services

**Backend:**
```bash
npm run dev
```

**Redis (if using):**
```bash
redis-server
```

**Frontend Server (optional but recommended):**
```bash
cd test-frontend
python -m http.server 8000
```

## ✅ Success Criteria

After completing all tests, you should have:

1. ✅ Aadhaar XML uploaded and verified
2. ✅ User created in database with:
   - Tourist ID
   - Blockchain ID
   - Verification status
3. ✅ Session created with JWT token
4. ✅ Ability to login with Blockchain ID
5. ✅ All API endpoints working
6. ✅ Frontend displaying all data correctly

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

✅ Backend Setup
  [ ] Database migration applied
  [ ] Backend running on port 3001
  [ ] Environment variables configured

✅ Step 1: Upload Aadhaar e-KYC
  [ ] File uploads successfully
  [ ] Data extracted correctly
  [ ] Verification shows success

✅ Step 2: Complete Onboarding
  [ ] Form submits successfully
  [ ] Blockchain ID generated
  [ ] User created in database
  [ ] Token generated

✅ Step 3: Login
  [ ] Login with Blockchain ID works
  [ ] Token received
  [ ] User data displayed

✅ Database Verification
  [ ] User record exists
  [ ] Session record exists
  [ ] Blockchain ID is unique

✅ API Verification
  [ ] All endpoints respond correctly
  [ ] Error handling works
  [ ] CORS configured properly

Issues Found:
_______________________________________
_______________________________________
_______________________________________

Notes:
_______________________________________
_______________________________________
```

## 🎯 Next Steps After Testing

1. **Fix any issues found**
2. **Update documentation** with any changes
3. **Test edge cases** (expired dates, invalid inputs, etc.)
4. **Performance testing** (multiple users, large files)
5. **Security review** (token storage, input validation)

## 🔐 Security Notes

- This is a **test frontend** - not for production
- Tokens stored in localStorage (not secure)
- No input sanitization (testing only)
- CORS should be restricted in production
- File uploads should be validated server-side (already done)

## 📚 Additional Resources

- Frontend Guide: `FRONTEND_IMPLEMENTATION_GUIDE.md`
- Quick Start: `FRONTEND_QUICK_START.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
- Frontend README: `test-frontend/README.md`

