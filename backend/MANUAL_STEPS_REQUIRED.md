# Manual Steps Required Before Testing

## 🔧 Setup Steps

### 1. Database Migration (REQUIRED)

**Action:** Apply the database migration to add verification tracking columns.

**Steps:**
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New query**
5. Open file: `supabase/migrations/002_add_verification_status.sql`
6. Copy the entire contents
7. Paste into SQL Editor
8. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
9. Verify success message: "Success. No rows returned"

**What it does:**
- Adds `verification_status` column
- Adds `verification_transaction_id` column
- Adds `verified_at` column
- Adds `verification_method` column
- Creates indexes for performance

**Verification:**
- Go to **Table Editor** → `users` table
- Check if new columns are visible

---

### 2. Get Aadhaar e-KYC XML File (OPTIONAL - For Real Testing)

**Action:** Download a real Aadhaar Offline e-KYC XML file for testing.

**Steps:**
1. Visit: https://resident.uidai.gov.in/ (Main portal)
   - Login with Aadhaar number
   - Navigate to "Offline e-KYC" or "Paperless Offline e-KYC" section
   - OR directly try: https://resident.uidai.gov.in/offlineaadhaar
2. Click **"Login"** button
3. Enter your **Aadhaar number** (12 digits)
4. Enter **OTP** sent to your registered mobile number
5. After login, navigate to **"Download"** section
6. Click **"Aadhaar Paperless Offline e-KYC"**
7. Download the XML file
8. Save it somewhere accessible

**Alternative (For Testing):**
- Use the sample XML file: `test-frontend/test-aadhaar-sample.xml`
- This is a mock file for testing purposes only

**Note:** The sample XML will work for testing the flow, but won't have real Aadhaar data.

---

### 3. Start Backend Server (REQUIRED)

**Action:** Start the backend server.

**Steps:**
```bash
# In the project root directory
npm run dev
```

**Verify:**
- Server should start on `http://localhost:3001`
- You should see: `🚀 Server running on port 3001`
- Test: Open `http://localhost:3001/health` in browser
- Should return: `{"status":"ok","timestamp":"..."}`

**If port 3001 is in use:**
- Change `PORT` in `.env` file
- Or stop the process using port 3001

---

### 4. Open Frontend (REQUIRED)

**Action:** Open the test frontend in a browser.

**Option A: Direct File (May have CORS issues)**
- Double-click `test-frontend/index.html`
- Open in your default browser

**Option B: Local Server (RECOMMENDED)**
```bash
# Navigate to test-frontend directory
cd test-frontend

# Using Python
python -m http.server 8000

# Or using Node.js (if http-server is installed)
npx http-server -p 8000

# Then open: http://localhost:8000
```

**Option C: VS Code Live Server**
- Install "Live Server" extension in VS Code
- Right-click on `test-frontend/index.html`
- Select "Open with Live Server"

**Verify:**
- Frontend should load
- API status should show "✅ API Connected" (if backend is running)

---

### 5. Environment Variables Check (REQUIRED)

**Action:** Verify all required environment variables are set.

**Check `.env` file has:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379  # Optional if not using Redis
PORT=3001
FRONTEND_URL=http://localhost:8000  # Or your frontend URL
```

**How to get Supabase credentials:**
1. Go to Supabase Dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** → `SUPABASE_URL`
5. Copy **service_role key** (NOT anon key) → `SUPABASE_SERVICE_ROLE_KEY`

**Generate JWT Secret:**
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 6. Redis Setup (OPTIONAL - Only if using Redis)

**Action:** Start Redis server for session caching.

**Steps:**
```bash
# Install Redis (if not installed)
# Windows: Download from https://redis.io/download
# Mac: brew install redis
# Linux: sudo apt-get install redis-server

# Start Redis
redis-server
```

**If not using Redis:**
- The system will work without Redis
- Sessions will only be stored in database (slower but functional)

---

## ✅ Quick Checklist

Before starting testing, verify:

- [ ] Database migration applied (`002_add_verification_status.sql`)
- [ ] Backend server running on port 3001
- [ ] Frontend opened in browser (preferably via local server)
- [ ] Environment variables configured
- [ ] Aadhaar XML file ready (or use sample)
- [ ] API status shows "Connected" in frontend

## 🚨 Common Issues

### Issue: CORS Error
**Solution:** Use a local server (Option B) instead of opening file directly

### Issue: API Not Available
**Solution:** 
- Check backend is running: `npm run dev`
- Verify port 3001 is not blocked
- Check backend logs for errors

### Issue: Database Error
**Solution:**
- Verify Supabase credentials in `.env`
- Check database migration is applied
- Verify Supabase project is active

### Issue: File Upload Fails
**Solution:**
- Ensure file is XML format
- Check file size (max 5MB)
- Verify backend is running

## 📝 Testing Order

1. **First:** Apply database migration
2. **Second:** Start backend server
3. **Third:** Open frontend
4. **Fourth:** Test the flow

## 🎯 What You'll Test

1. ✅ Upload Aadhaar e-KYC XML file
2. ✅ Verify Aadhaar data extraction
3. ✅ Complete onboarding form
4. ✅ Generate Blockchain ID
5. ✅ Login with Blockchain ID
6. ✅ Verify database records
7. ✅ Test JWT token generation

## 📚 Additional Resources

- **Testing Guide:** `TESTING_GUIDE.md` - Complete testing instructions
- **Frontend README:** `test-frontend/README.md` - Frontend-specific guide
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md` - Overview of implementation

---

**Ready to test?** Follow the checklist above, then proceed to `TESTING_GUIDE.md` for step-by-step testing instructions.

