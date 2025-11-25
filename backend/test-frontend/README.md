# Frontend Test Application - Simple Registration Form

This is a simple HTML/JavaScript frontend to test the tourist registration and onboarding flow.

## 🚀 Quick Start

### 1. Start the Backend Server

Make sure your backend is running:

```bash
cd ..
npm run dev
```

The backend should be running on `http://localhost:3001`

### 2. Open the Frontend

Simply open `index.html` in your web browser:

**Option A: Direct File**
- Double-click `index.html` to open in your default browser

**Option B: Local Server (Recommended)**
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000

# Then open: http://localhost:8000
```

**Option C: VS Code Live Server**
- Install "Live Server" extension in VS Code
- Right-click on `index.html` → "Open with Live Server"

## 📋 Testing Flow

### Step 1: Fill Registration Form

1. Enter your details:
   - **Full Name** (required)
   - **Email Address** (required)
   - **Aadhaar Number** (12 digits, required)
   - **Date of Birth** (required)
   - **Gender** (required)
   - **Address** (required)
   - **Country** (default: India)
   - **State** (optional)
   - **Itinerary Start Date** (required)
   - **Itinerary End Date** (required)

2. Click "Complete Registration"
3. You'll receive:
   - Tourist ID
   - Blockchain ID (IMPORTANT - save this!)
   - JWT Token

### Step 2: Test Login

1. Copy your Blockchain ID from Step 1
2. Paste it in the login form
3. Click "Login"
4. You should see your user details and a new JWT token

## ✅ What Gets Tested

1. ✅ Form submission to `/api/airport/onboard`
2. ✅ User data stored in Supabase
3. ✅ Blockchain ID generation
4. ✅ Login with Blockchain ID to `/api/airport/login`
5. ✅ JWT token generation and storage

## 🔍 Troubleshooting

### API Not Available
- Make sure backend is running on port 3001
- Check console for CORS errors
- Verify `API_BASE_URL` in `app.js` matches your backend URL

### Registration Fails
- Check all required fields are filled
- Verify Aadhaar number is exactly 12 digits
- Ensure email format is valid
- Check backend logs for errors

### Login Fails
- Check Blockchain ID format (must be `0x` + 40 hex characters)
- Ensure you completed registration first
- Check if itinerary end date has passed

### CORS Errors
- Make sure backend CORS is configured to allow your frontend origin
- Check `FRONTEND_URL` in backend `.env` file
- Use a local server instead of opening file directly

## 📝 Manual Steps Required

1. **Database Migration:**
   - Run `supabase/migrations/002_add_verification_status.sql` in Supabase SQL Editor
   - This adds verification tracking columns

2. **Backend Configuration:**
   - Ensure `.env` file has correct Supabase credentials
   - Make sure Redis is running (if using session caching)
   - Backend should be running on port 3001

## 🎯 Expected Results

After completing the flow, you should have:
- ✅ User created in database with:
  - Tourist ID
  - Blockchain ID
  - All personal details
- ✅ Session created with JWT token
- ✅ Ability to login with Blockchain ID
- ✅ All API endpoints working
- ✅ Frontend displaying all data correctly

## 📚 Files

- `index.html` - Main HTML structure
- `app.js` - JavaScript logic and API calls
- `styles.css` - Styling
- `README.md` - This file

## 🔐 Security Notes

- This is a **test frontend** - not for production use
- Tokens are stored in localStorage (not secure for production)
- No input sanitization (for testing only)
- CORS should be properly configured in production

## 🚨 Important

- **Save your Blockchain ID** - you'll need it to login
- The Blockchain ID is your login credential
- If you lose it, you'll need to complete registration again

## 📊 API Endpoints Used

### Registration
```
POST /api/airport/onboard
Content-Type: application/json
Body: {
  name, email, aadhaarNumber, dob, gender,
  address, country, state,
  itineraryStartDate, itineraryEndDate
}
```

### Login
```
POST /api/airport/login
Content-Type: application/json
Body: { blockchainId: "0x..." }
```
