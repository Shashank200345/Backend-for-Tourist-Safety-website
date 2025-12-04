# Tourist Safety Backend API

Backend server for blockchain-based tourist authentication with DigiLocker integration.

## Features

- 🔐 DigiLocker OAuth 2.0 integration
- ⛓️ Blockchain record storage (Ethereum/Polygon)
- 📦 IPFS document storage
- 🔑 JWT-based session management
- ⏰ Automatic session expiration based on itinerary
- 🗄️ PostgreSQL database with Supabase
- ⚡ Redis caching for sessions

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Blockchain Configuration (for local development)
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your-private-key-from-hardhat-node
CONTRACT_ADDRESS=0x... # Will be set after contract deployment

# IPFS Configuration (Optional - can use mock for development)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your-project-id
IPFS_PROJECT_SECRET=your-project-secret

# Airport Code
AIRPORT_CODE=DEL

# DigiLocker Configuration (Optional - use simulate for development)
DIGILOCKER_CLIENT_ID=your-client-id
DIGILOCKER_CLIENT_SECRET=your-client-secret
DIGILOCKER_REDIRECT_URI=http://localhost:5173/auth/callback

# QR Code Verification URL
# For local network (phone on same WiFi):
# QR_VERIFICATION_URL=http://192.168.1.100:3001/api/airport/verify-qr
# For production, use your deployed backend URL:
# QR_VERIFICATION_URL=https://your-backend.com/api/airport/verify-qr
QR_VERIFICATION_URL=http://localhost:3001/api/airport/verify-qr

# Google Gemini API Configuration (for E-FIR generation)
GOOGLE_API_KEY=your-google-gemini-api-key
# Optional: Specify model (default: gemini-1.5-flash)
# GEMINI_MODEL=gemini-1.5-flash
```

**Required variables:**
- `SUPABASE_URL` - Supabase project URL (get from Supabase dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (NOT anon key, from Settings → API)
- `REDIS_URL` - Redis connection string (default: `redis://localhost:6379`)
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
- `AIRPORT_CODE` - Airport code (e.g., "DEL" for Delhi)
- `GOOGLE_API_KEY` - Google Gemini API key for E-FIR generation (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

**Optional variables (for blockchain features):**
- `BLOCKCHAIN_RPC_URL` - Blockchain RPC endpoint (local Hardhat or testnet)
- `PRIVATE_KEY` - Private key for blockchain transactions
- `CONTRACT_ADDRESS` - Deployed smart contract address
- `IPFS_PROJECT_ID` and `IPFS_PROJECT_SECRET` - For IPFS storage (Infura or Pinata)

### 3. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration SQL in your Supabase SQL Editor:

```bash
# Copy and paste the contents of backend/supabase/migrations/001_initial_schema.sql
# into the Supabase SQL Editor and execute it
```

Alternatively, you can use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Deploy Smart Contract (For Blockchain Features)

1. **Install Hardhat** (if not already installed):
```bash
cd ../smart-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Select: Create a JavaScript project
```

2. **Start local Hardhat node** (in one terminal):
```bash
npx hardhat node
# Keep this running - it provides test accounts with ETH
```

3. **Deploy contract** (in another terminal):
```bash
npx hardhat run scripts/deploy.js --network localhost
# Copy the contract address and update CONTRACT_ADDRESS in backend/.env
```

4. **Update backend/.env** with the contract address:
```env
CONTRACT_ADDRESS=0x... # Paste the deployed address here
PRIVATE_KEY=0x... # Use one of the private keys from Hardhat node output
```

### 5. Test Blockchain Service

Run the test script to verify blockchain integration:

```bash
npm run test:blockchain
# Or directly:
npx tsx scripts/test-blockchain.ts
```

This will test:
- Document hash generation
- Tourist ID generation
- Blockchain record creation (if contract is deployed)
- Record verification
- IPFS storage (if configured)

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 7. Test API Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Simulate DigiLocker verification
curl -X POST http://localhost:3001/api/auth/digilocker/simulate \
  -H "Content-Type: application/json" \
  -d '{"documentType":"aadhaar","documentNumber":"123456789012"}'
```

## API Endpoints

### Authentication

- `POST /api/auth/digilocker/initiate` - Initiate DigiLocker OAuth flow
- `POST /api/auth/digilocker/callback` - Handle OAuth callback
- `POST /api/auth/digilocker/simulate` - Simulate verification (dev only)
- `POST /api/auth/register` - Complete registration
- `POST /api/auth/logout` - Logout (requires authentication)

## Architecture

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic (DigiLocker, Blockchain, Session)
- **Middleware**: Authentication, validation
- **Jobs**: Background tasks (session expiration)
- **Config**: Database, Redis, Blockchain configuration

## Smart Contract

Deploy the smart contract before using blockchain features. See `smart-contracts/` directory.

## Notes

- For development, you can use the simulate endpoint instead of real DigiLocker API
- Make sure Redis is running (Supabase handles the database)
- Blockchain transactions require testnet tokens for testing
- Use the Supabase service role key for backend operations (not the anon key)


#
