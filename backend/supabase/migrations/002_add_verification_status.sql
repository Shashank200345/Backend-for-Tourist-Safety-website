-- Add verification status and transaction ID to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending', -- 'pending' | 'verified' | 'failed'
ADD COLUMN IF NOT EXISTS verification_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_method TEXT; -- 'digilocker' | 'offline-kyc' | 'qr' | 'uidai-api'

-- Create indexes for verification status
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_verification_transaction_id ON users(verification_transaction_id);
CREATE INDEX IF NOT EXISTS idx_users_verification_method ON users(verification_method);



