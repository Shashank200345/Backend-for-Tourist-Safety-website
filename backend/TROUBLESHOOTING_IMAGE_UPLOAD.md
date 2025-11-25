# Troubleshooting Image Upload to Supabase Storage

## 🔍 Common Issues and Solutions

### Issue 1: Image URL is NULL in Database

**Symptoms:**
- Registration succeeds but `image_url` column is NULL
- No error message shown

**Possible Causes:**
1. **Supabase Storage bucket doesn't exist**
   - Solution: Create bucket named `tourist-photos` in Supabase Dashboard

2. **Bucket name mismatch**
   - Solution: Bucket must be exactly `tourist-photos` (case-sensitive)

3. **Bucket not public**
   - Solution: Set bucket to "Public" in Supabase Storage settings

4. **Service role key issue**
   - Solution: Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env` is correct

5. **Error being silently caught**
   - Solution: Check backend console logs for error messages

### Issue 2: "Bucket not found" Error

**Solution:**
1. Go to Supabase Dashboard → Storage
2. Create new bucket:
   - Name: `tourist-photos`
   - Public: ✅ Yes
   - File size limit: 5MB
3. Click "Create bucket"

### Issue 3: "Permission denied" Error

**Solution:**
1. Verify you're using **Service Role Key** (not anon key)
2. Check bucket policies allow INSERT
3. Ensure bucket is public

### Issue 4: Image Upload Fails Silently

**Check:**
1. Backend console logs for error messages
2. Network tab in browser for API response
3. Supabase Storage bucket exists
4. File size is under 5MB

## 🔧 Step-by-Step Fix

### Step 1: Verify Supabase Storage Bucket

1. Open Supabase Dashboard
2. Go to **Storage** → **Buckets**
3. Check if `tourist-photos` bucket exists
4. If not, create it:
   - Name: `tourist-photos`
   - Public: ✅ Yes
   - File size: 5MB

### Step 2: Check Backend Logs

When you submit the form, check backend console for:
- "Uploading image to Supabase Storage..."
- "Image uploaded successfully"
- Any error messages

### Step 3: Verify Environment Variables

Check `.env` file has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Use **Service Role Key**, not anon key!

### Step 4: Test Image Upload

1. Start backend: `npm run dev`
2. Open frontend form
3. Capture/upload photo
4. Submit form
5. Check:
   - Backend console for errors
   - Supabase Storage → `tourist-photos` bucket for uploaded file
   - Database `users` table for `image_url` value

## 🐛 Debug Steps

### 1. Check Backend Console

Look for these log messages:
```
Uploading image to Supabase Storage...
Bucket: tourist-photos
File path: TID-DEL-ABC123-1234567890.jpg
File size: 123456 bytes
File type: image/jpeg
Image uploaded successfully: TID-DEL-ABC123-1234567890.jpg
Public URL: https://...
```

### 2. Check Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Click on `tourist-photos` bucket
3. Check if files are uploaded
4. If empty, upload is failing

### 3. Check Database

1. Go to Supabase Dashboard → Table Editor
2. Open `users` table
3. Check `image_url` column
4. Should contain URL like: `https://xxx.supabase.co/storage/v1/object/public/tourist-photos/...`

### 4. Test with curl

```bash
curl -X POST http://localhost:3001/api/airport/onboard \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "aadhaarNumber=123456789012" \
  -F "dob=1990-01-01" \
  -F "gender=Male" \
  -F "address=Test Address" \
  -F "country=India" \
  -F "itineraryStartDate=2024-01-01" \
  -F "itineraryEndDate=2024-12-31" \
  -F "photo=@/path/to/image.jpg"
```

## ✅ Verification Checklist

- [ ] Supabase Storage bucket `tourist-photos` exists
- [ ] Bucket is set to Public
- [ ] Service Role Key is correct in `.env`
- [ ] Backend is running and receiving requests
- [ ] Image file is being sent from frontend
- [ ] Backend console shows upload attempt
- [ ] No errors in backend console
- [ ] Image appears in Supabase Storage bucket
- [ ] `image_url` is populated in database

## 🔍 Quick Test

1. **Check bucket exists:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM storage.buckets WHERE name = 'tourist-photos';
   ```

2. **Check recent uploads:**
   - Go to Storage → `tourist-photos` bucket
   - Should see uploaded files

3. **Check database:**
   ```sql
   SELECT tourist_id, name, image_url 
   FROM users 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

## 📞 Still Not Working?

If image upload still fails:

1. **Check backend logs** - Look for specific error messages
2. **Verify bucket name** - Must be exactly `tourist-photos`
3. **Test with Postman** - Send multipart/form-data request
4. **Check file size** - Must be under 5MB
5. **Verify file type** - Must be an image (jpeg, png, etc.)

## 🎯 Expected Behavior

When working correctly:
1. User captures/uploads photo
2. Form submits with image
3. Backend receives image
4. Image uploads to Supabase Storage
5. Public URL generated
6. URL stored in database `image_url` column
7. Response includes `imageUrl` field



