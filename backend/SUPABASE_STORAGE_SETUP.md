# Supabase Storage Setup for Tourist Photos

## 📋 Prerequisites

Before using the image upload feature, you need to set up a Supabase Storage bucket.

## 🚀 Setup Steps

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name:** `tourist-photos`
   - **Public bucket:** ✅ Check this (so images can be accessed via URL)
   - **File size limit:** 5MB (or your preferred limit)
   - **Allowed MIME types:** `image/*` (or specific types like `image/jpeg,image/png,image/webp`)

6. Click **"Create bucket"**

### 2. Set Bucket Policies (Optional but Recommended)

For security, you can set up policies:

1. Go to **Storage** → **Policies** → Select `tourist-photos` bucket
2. Click **"New Policy"**
3. Create an **INSERT** policy:
   - Policy name: `Allow authenticated uploads`
   - Allowed operation: `INSERT`
   - Policy definition:
   ```sql
   (bucket_id = 'tourist-photos'::text)
   ```
   - For authenticated users only, or use service role key (which we're using)

**Note:** Since we're using the service role key in the backend, the upload will work without additional policies. However, for production, you should set up proper RLS (Row Level Security) policies.

### 3. Verify Setup

After creating the bucket, verify:
- ✅ Bucket name is exactly: `tourist-photos`
- ✅ Bucket is marked as **Public**
- ✅ File size limit is set (5MB recommended)

## 🔧 Backend Configuration

The backend is already configured to use Supabase Storage. Make sure your `.env` file has:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key has full access to Storage, so uploads will work automatically.

## 📁 File Structure

Images will be stored in:
```
tourist-photos/
  ├── TID-DEL-ABC123-DEF456-1234567890.jpg
  ├── TID-DEL-XYZ789-GHI012-1234567891.jpg
  └── ...
```

File naming format: `{tourist_id}-{timestamp}.{extension}`

## 🔍 Testing

1. Start your backend: `npm run dev`
2. Open the frontend form
3. Capture or upload a photo
4. Submit the form
5. Check Supabase Storage → `tourist-photos` bucket
6. Verify the image is uploaded and accessible

## 🐛 Troubleshooting

### Issue: "Failed to upload image"

**Solution:**
- Verify bucket name is exactly `tourist-photos`
- Check bucket is set to Public
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check file size is under limit

### Issue: "Bucket not found"

**Solution:**
- Create the bucket with exact name: `tourist-photos`
- Check bucket exists in Storage dashboard

### Issue: "Permission denied"

**Solution:**
- Verify service role key has access
- Check bucket policies allow INSERT
- Ensure bucket is public (for public URLs)

## 📝 Database Migration

Don't forget to run the database migration:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Or use the migration file: `supabase/migrations/003_add_user_image.sql`

## ✅ Checklist

- [ ] Storage bucket `tourist-photos` created
- [ ] Bucket is set to Public
- [ ] File size limit configured (5MB)
- [ ] Database migration applied (image_url column)
- [ ] Backend .env has correct Supabase credentials
- [ ] Test image upload works

## 🔐 Security Notes

1. **Public Bucket:** Images are publicly accessible via URL. For sensitive data, consider:
   - Using signed URLs instead
   - Setting up proper RLS policies
   - Using private bucket with authentication

2. **File Validation:** Backend validates:
   - File type (images only)
   - File size (5MB max)

3. **Service Role Key:** Keep this secure and never expose it in frontend code.

## 🎯 Next Steps

After setup:
1. Test image capture in frontend
2. Verify images upload to Supabase Storage
3. Check image URLs are stored in database
4. Verify images display correctly after registration



