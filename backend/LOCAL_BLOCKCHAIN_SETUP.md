# Local Hardhat Node Setup - Quick Guide

## ✅ What's Happening

1. **Hardhat Node Started** - Running in background
2. **Next Step** - Deploy contract to local node
3. **Then** - Update backend .env

## 🚀 Quick Steps

### Step 1: Hardhat Node (Already Started ✅)
The local blockchain is running on `http://127.0.0.1:8545`

You should see in the terminal:
- 20 test accounts
- Each with 10,000 ETH
- Private keys listed

### Step 2: Deploy Contract

In a **NEW terminal**, run:
```bash
cd smart-contracts
npm run deploy:local
```

This will output:
- Contract Address (copy this!)
- Owner Address
- Network: localhost

### Step 3: Update Backend .env

Add/update these lines in your backend `.env`:

```env
# Blockchain Configuration (Local)
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x... # From Step 2 output
PRIVATE_KEY=0x... # First private key from Hardhat node output
```

### Step 4: Test

```bash
cd .. # Back to backend
npm run test:blockchain
```

## 📋 What You'll See

### Hardhat Node Output:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17d79DD8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

### Deployment Output:
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

## ✅ Success Checklist

- [ ] Hardhat node running
- [ ] Contract deployed
- [ ] Contract address copied
- [ ] Backend .env updated
- [ ] Backend test passing

## 🎯 Next Steps After Setup

1. Test registration flow
2. Check blockchain records in database
3. Verify transactions in Hardhat node terminal

---

**Ready to deploy! Run the deploy command in a new terminal.**



