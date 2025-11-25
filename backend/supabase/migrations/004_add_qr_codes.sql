-- Create QR codes table for one-time use QR codes
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id TEXT NOT NULL,
  blockchain_id TEXT NOT NULL,
  qr_token TEXT UNIQUE NOT NULL, -- Unique token for QR code
  qr_code_data TEXT NOT NULL, -- The actual QR code data/URL
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- QR code expiration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_tourist_qr FOREIGN KEY (tourist_id) REFERENCES users(tourist_id) ON DELETE CASCADE
);

-- Create indexes for QR codes table
CREATE INDEX IF NOT EXISTS idx_qr_codes_tourist_id ON qr_codes(tourist_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_blockchain_id ON qr_codes(blockchain_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_token ON qr_codes(qr_token);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_used ON qr_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires_at ON qr_codes(expires_at);

-- Create index for active (unused) QR codes
-- Note: Cannot use NOW() in index predicate, so we index is_used only
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(qr_token, expires_at) 
WHERE is_used = FALSE;

