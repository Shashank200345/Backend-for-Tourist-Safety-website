# Blockchain Setup Guide - Testing & Prototype

This guide will help you set up and test the blockchain features locally.

## 🎯 What's Been Set Up

✅ Smart contracts directory structure  
✅ Hardhat configuration  
✅ TouristIdentity.sol contract  
✅ Deployment scripts  
✅ Test files  
✅ Documentation  

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd smart-contracts
npm install
```

### Step 2: Compile Contracts

```bash
npm run compile
```

You should see:
```
Compiled 1 Solidity file successfully
```

### Step 3: Run Tests

```bash
npm run test
```

All tests should pass ✅

### Step 4: Start Local Blockchain

**Open Terminal 1:**
```bash
cd smart-contracts
npm run node
```

This starts a local Hardhat node with 20 test accounts, each with 10,000 ETH.

**Keep this terminal running!**

### Step 5: Deploy Contract

**Open Terminal 2:**
```bash
cd smart-contracts
npm run deploy:local
```

You'll see output like:
```
🚀 Deploying TouristIdentity contract...

⏳ Deploying...

✅ Contract deployed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Owner Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Network: localhost
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 6: Update Backend Configuration

Copy the contract address and update your backend `.env` file:

```env
# Blockchain Configuration
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Note:** Use the first private key from Terminal 1 (Hardhat node output).

### Step 7: Test Backend Integration

```bash
cd .. # Back to backend directory
npm run test:blockchain
```

You should see:
- ✅ Contract address verified
- ✅ RPC URL connected
- ✅ Blockchain record creation successful
- ✅ Transaction hash returned

### Step 8: Test Full Flow

1. **Start backend:**
   ```bash
   npm run dev
   ```

2. **Complete registration** via your frontend or API

3. **Check blockchain records:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM blockchain_records 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

4. **Verify transaction:**
   - Check Terminal 1 (Hardhat node) for transaction logs
   - You should see the transaction details

## 📋 Testing Checklist

- [ ] Contracts compile successfully
- [ ] All tests pass
- [ ] Contract deploys to local node
- [ ] Contract address saved to backend `.env`
- [ ] Backend connects to contract
- [ ] Registration creates blockchain records
- [ ] Transaction hashes stored in database

## 🔍 What Each File Does

### `contracts/TouristIdentity.sol`
- Main smart contract
- Stores tourist records on blockchain
- Provides verification functions

### `scripts/deploy.js`
- Deployment script
- Deploys contract to specified network
- Outputs contract address

### `test/TouristIdentity.test.js`
- Comprehensive test suite
- Tests all contract functions
- Validates security features

### `hardhat.config.js`
- Hardhat configuration
- Network settings
- Compiler settings

## 🧪 Testing Scenarios

### Test 1: Create Record
```javascript
// In Hardhat console or test
await touristIdentity.createRecord("TID-DEL-12345", "0xabc123");
```

### Test 2: Verify Record
```javascript
const isValid = await touristIdentity.verifyRecord("TID-DEL-12345");
console.log("Is valid:", isValid); // Should be true
```

### Test 3: Get Record
```javascript
const record = await touristIdentity.getRecord("TID-DEL-12345");
console.log("Record:", record);
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@nomicfoundation/hardhat-toolbox'"
**Solution:** Run `npm install` in `smart-contracts` directory

### Issue: "Contract not deployed"
**Solution:** 
1. Make sure Hardhat node is running (Terminal 1)
2. Check contract address in backend `.env`
3. Verify RPC URL is `http://127.0.0.1:8545`

### Issue: "Insufficient funds"
**Solution:** 
- For localhost: Hardhat node provides test accounts with ETH
- For testnet: Get tokens from faucet

### Issue: "Network mismatch"
**Solution:** Ensure `BLOCKCHAIN_NETWORK=localhost` in backend `.env`

### Issue: "Contract not initialized"
**Solution:** 
1. Check `CONTRACT_ADDRESS` in backend `.env`
2. Check `PRIVATE_KEY` is set
3. Check `BLOCKCHAIN_RPC_URL` is correct
4. Restart backend server

## 📊 Expected Behavior

### When Registration Completes:

1. **Backend creates blockchain record:**
   - Calls `createRecord(touristId, documentHash)`
   - Transaction sent to blockchain
   - Transaction hash returned

2. **Database updated:**
   - Record stored in `blockchain_records` table
   - Transaction hash saved
   - Block number saved

3. **Verification works:**
   - Can verify record on blockchain
   - Can retrieve record details
   - Can check if record is valid

## 🎯 Next Steps

After local testing works:

1. **Test on Testnet:**
   - Deploy to Polygon Mumbai
   - Test with real testnet tokens
   - Verify contract on Polygonscan

2. **Monitor Transactions:**
   - Check transaction status
   - Monitor gas usage
   - Track contract events

3. **Optimize:**
   - Review gas costs
   - Optimize contract if needed
   - Add more features

## 📚 Additional Resources

- **Hardhat Docs:** https://hardhat.org/docs
- **Solidity Docs:** https://docs.soliditylang.org/
- **ethers.js Docs:** https://docs.ethers.org/

## ✅ Success Criteria

Your blockchain setup is working when:
1. ✅ Contracts compile
2. ✅ Tests pass
3. ✅ Contract deploys
4. ✅ Backend connects
5. ✅ Records created on blockchain
6. ✅ Transactions visible in Hardhat node

---

**Ready to test! Start with Step 1 and work through each step.**



