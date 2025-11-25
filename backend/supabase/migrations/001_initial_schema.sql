-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id TEXT UNIQUE NOT NULL,
  blockchain_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'aadhaar' | 'passport'
  document_number TEXT NOT NULL,
  document_hash TEXT,
  country TEXT,
  state TEXT,
  itinerary_start_date TIMESTAMP WITH TIME ZONE,
  itinerary_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  blockchain_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  itinerary_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_tourist FOREIGN KEY (tourist_id) REFERENCES users(tourist_id) ON DELETE CASCADE
);

-- Create blockchain_records table
CREATE TABLE IF NOT EXISTS blockchain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id TEXT NOT NULL,
  transaction_hash TEXT UNIQUE NOT NULL,
  block_number BIGINT,
  ipfs_hash TEXT,
  document_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_tourist_blockchain FOREIGN KEY (tourist_id) REFERENCES users(tourist_id) ON DELETE CASCADE
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_tourist_id ON users(tourist_id);
CREATE INDEX IF NOT EXISTS idx_users_blockchain_id ON users(blockchain_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_tourist_id ON sessions(tourist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Create indexes for blockchain_records table
CREATE INDEX IF NOT EXISTS idx_blockchain_records_tourist_id ON blockchain_records(tourist_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_records_transaction_hash ON blockchain_records(transaction_hash);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

