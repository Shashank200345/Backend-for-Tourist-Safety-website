# Backend Implementation Checklist

This checklist helps you verify that the backend is properly set up according to the implementation plan.

## Phase 1: Environment Setup ✅

- [ ] Node.js 18+ installed
- [ ] Redis installed and running (`redis-cli ping` should return PONG)
- [ ] Supabase account created
- [ ] Supabase project created
- [ ] `.env` file created in `backend/` directory
- [ ] All environment variables filled in `.env`

## Phase 2: Backend Foundation ✅

- [ ] Dependencies installed (`npm install` in `backend/`)
- [ ] Supabase database migration run (SQL Editor or CLI)
- [ ] Tables verified: `users`, `sessions`, `blockchain_records`
- [ ] Redis connection tested
- [ ] Backend server starts without errors (`npm run dev`)

## Phase 3: Smart Contract Setup

- [ ] Hardhat installed in `smart-contracts/` directory
- [ ] `hardhat.config.js` configured
- [ ] Local Hardhat node started (`npx hardhat node`)
- [ ] Contract deployed locally (`npx hardhat run scripts/deploy.js --network localhost`)
- [ ] `CONTRACT_ADDRESS` updated in `backend/.env`
- [ ] `PRIVATE_KEY` set in `backend/.env` (from Hardhat node)

## Phase 4: Backend Services Verification

### Config Files ✅
- [ ] `backend/src/config/database.ts` - Supabase client configured
- [ ] `backend/src/config/redis.ts` - Redis client configured
- [ ] `backend/src/config/blockchain.ts` - Contract ABI includes all functions

### Services ✅
- [ ] `backend/src/services/blockchainService.ts` - All methods implemented
- [ ] `backend/src/services/digilockerService.ts` - OAuth + simulation working
- [ ] `backend/src/services/sessionService.ts` - JWT + Redis working
- [ ] `backend/src/services/idGeneratorService.ts` - ID generation working

### Controllers ✅
- [ ] `backend/src/controllers/authController.ts` - All endpoints implemented
  - [ ] `initiateDigiLockerAuth` - OAuth initiation
  - [ ] `handleDigiLockerCallback` - OAuth callback
  - [ ] `simulateDigiLockerVerification` - Development simulation
  - [ ] `completeRegistration` - Full registration flow
  - [ ] `logout` - Session invalidation

### Routes ✅
- [ ] `backend/src/routes/auth.routes.ts` - All routes defined

### Middleware ✅
- [ ] `backend/src/middleware/auth.middleware.ts` - JWT verification

### Jobs ✅
- [ ] `backend/src/jobs/sessionExpirationJob.ts` - Background cleanup

## Phase 5: Testing

- [ ] Blockchain service test script created (`backend/scripts/test-blockchain.ts`)
- [ ] Test script runs successfully (`npm run test:blockchain`)
- [ ] Health check endpoint works (`GET /health`)
- [ ] DigiLocker simulation works (`POST /api/auth/digilocker/simulate`)
- [ ] Registration flow works end-to-end
- [ ] Blockchain record created on registration
- [ ] JWT token generated and stored
- [ ] Session stored in Redis

## Phase 6: Integration Testing

- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] API endpoints return expected responses
- [ ] Error handling works correctly
- [ ] Session expiration job runs (check logs)

## Common Issues & Solutions

### Issue: "SUPABASE_URL environment variable is required"
**Solution**: Make sure `.env` file exists and `SUPABASE_URL` is set

### Issue: "Redis Client Error"
**Solution**: 
- Check Redis is running: `redis-cli ping`
- Verify `REDIS_URL` in `.env` is correct
- For Windows: Make sure Redis is installed and service is running

### Issue: "Blockchain contract not initialized"
**Solution**:
- Deploy contract first: `npx hardhat run scripts/deploy.js --network localhost`
- Update `CONTRACT_ADDRESS` in `.env`
- Make sure `PRIVATE_KEY` is set

### Issue: "Failed to create blockchain record"
**Solution**:
- Verify contract is deployed
- Check account has balance (local Hardhat node auto-funds)
- Verify RPC URL is accessible
- Check contract ABI matches deployed contract

### Issue: Frontend can't connect
**Solution**:
- Verify backend is running on port 3001
- Check `FRONTEND_URL` in `.env` matches frontend URL
- Check CORS configuration in `backend/src/app.ts`
- Verify `VITE_API_BASE_URL` in frontend `.env`

## Next Steps

After completing this checklist:

1. ✅ Backend is fully functional
2. ✅ Ready to connect frontend
3. ✅ Ready for mobile app integration
4. ✅ Ready for production deployment (after testnet deployment)

## Quick Test Commands

```bash
# Test backend health
curl http://localhost:3001/health

# Test DigiLocker simulation
curl -X POST http://localhost:3001/api/auth/digilocker/simulate \
  -H "Content-Type: application/json" \
  -d '{"documentType":"aadhaar","documentNumber":"123456789012"}'

# Test blockchain service
npm run test:blockchain
```

