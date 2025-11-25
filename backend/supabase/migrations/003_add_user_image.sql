-- Add image_url column to users table for storing tourist photo
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for image_url (optional, for faster queries if needed)
CREATE INDEX IF NOT EXISTS idx_users_image_url ON users(image_url) WHERE image_url IS NOT NULL;



