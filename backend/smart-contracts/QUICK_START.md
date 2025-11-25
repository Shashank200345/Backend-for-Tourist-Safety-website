# 🚀 Quick Start Guide - Blockchain Testing

## Step-by-Step Testing (5 Minutes)

### 1. Install Dependencies (Already Done ✅)
```bash
cd smart-contracts
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```
✅ Should see: "Compiled 1 Solidity file successfully"

### 3. Run Tests
```bash
npm run test
```
✅ Should see: "20 passing"

### 4. Start Local Blockchain

**Open a NEW terminal window:**

```bash
cd smart-contracts
npm run node
```

**Keep this terminal running!** You'll see:
- 20 test accounts
- Each with 10,000 ETH
- Private keys listed

### 5. Deploy Contract

**In your original terminal (or another new one):**

```bash
cd smart-contracts
npm run deploy:local
```

**Copy the Contract Address from the output!**

### 6. Update Backend .env

Open your backend `.env` file and add/update:

```env
# Blockchain Configuration
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Note:** 
- Use the Contract Address from Step 5
- Use the first Private Key from the Hardhat node output (Step 4)

### 7. Test Backend Integration

```bash
cd .. # Back to backend directory
npm run test:blockchain
```

✅ Should see:
- Contract address verified
- RPC URL connected
- Blockchain record creation successful

### 8. Test Full Flow

1. **Start backend:**
   ```bash
   npm run dev
   ```

2. **Complete registration** via your frontend

3. **Check blockchain:**
   - Look at the Hardhat node terminal
   - You should see transaction logs

4. **Check database:**
   ```sql
   SELECT * FROM blockchain_records 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

## ✅ Success Checklist

- [ ] Contracts compile
- [ ] All tests pass (20/20)
- [ ] Hardhat node running
- [ ] Contract deployed
- [ ] Backend .env updated
- [ ] Backend connects to contract
- [ ] Registration creates blockchain records

## 🐛 Troubleshooting

**Issue:** "Contract not initialized"
- Check Contract Address in backend .env
- Check Private Key is set
- Restart backend server

**Issue:** "Cannot connect to RPC"
- Make sure Hardhat node is running
- Check RPC URL is `http://127.0.0.1:8545`

**Issue:** "Insufficient funds"
- Hardhat node provides test accounts with ETH automatically
- No need to get tokens for localhost

## 🎯 What's Next?

After local testing works:
1. Test on Polygon Mumbai testnet
2. Monitor gas usage
3. Optimize if needed

---

**You're all set! Start with Step 1 and work through each step.**



