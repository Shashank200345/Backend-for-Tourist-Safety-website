# 🚀 Quick Start - Testing the Onboarding Flow

## ⚡ Fast Setup (5 Minutes)

### Step 1: Apply Database Migration (2 minutes)
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/002_add_verification_status.sql`
3. Paste and run
4. ✅ Done!

### Step 2: Start Backend (1 minute)
```bash
npm run dev
```
✅ Backend running on http://localhost:3001

### Step 3: Open Frontend (1 minute)
```bash
cd test-frontend
python -m http.server 8000
```
✅ Open http://localhost:8000 in browser

### Step 4: Test! (1 minute)
1. Upload `test-aadhaar-sample.xml` (included in test-frontend folder)
2. Fill onboarding form
3. Get Blockchain ID
4. Test login

## 📁 Files Created

### Frontend Files
- `test-frontend/index.html` - Main HTML page
- `test-frontend/app.js` - JavaScript logic
- `test-frontend/styles.css` - Styling
- `test-frontend/test-aadhaar-sample.xml` - Sample XML for testing
- `test-frontend/README.md` - Frontend documentation

### Documentation
- `TESTING_GUIDE.md` - Complete testing instructions
- `MANUAL_STEPS_REQUIRED.md` - Setup checklist
- `QUICK_START_TESTING.md` - This file

## 🎯 What to Test

1. **Upload XML** → Verify Aadhaar data extraction
2. **Complete Form** → Generate Blockchain ID
3. **Login** → Test with Blockchain ID

## 🔍 Verify It Works

After testing, check:
- ✅ User created in Supabase `users` table
- ✅ Blockchain ID is unique
- ✅ JWT token generated
- ✅ Can login with Blockchain ID

## 📚 Full Documentation

- **Complete Testing Guide:** `TESTING_GUIDE.md`
- **Manual Steps:** `MANUAL_STEPS_REQUIRED.md`
- **Frontend Guide:** `test-frontend/README.md`

## 🆘 Need Help?

1. Check `MANUAL_STEPS_REQUIRED.md` for setup issues
2. Check `TESTING_GUIDE.md` for testing issues
3. Verify backend is running: `http://localhost:3001/health`
4. Check browser console for errors

---

**Ready?** Start with Step 1 above! 🎉



