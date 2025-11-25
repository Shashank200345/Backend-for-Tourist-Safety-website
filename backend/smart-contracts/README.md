# Tourist Identity Smart Contracts

Smart contracts for storing and managing tourist identity records on blockchain.

## 🚀 Quick Start (Local Testing)

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Run Tests

```bash
npm run test
```

### 4. Deploy to Local Hardhat Node

**Terminal 1 - Start Hardhat Node:**
```bash
npm run node
```

**Terminal 2 - Deploy Contract:**
```bash
npm run deploy:local
```

The deployment script will output:
- Contract Address
- Owner Address
- Network

**Copy the contract address and update your backend `.env`:**
```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_NETWORK=localhost
```

## 📋 Available Scripts

- `npm run compile` - Compile smart contracts
- `npm run test` - Run tests
- `npm run node` - Start local Hardhat node
- `npm run deploy:local` - Deploy to local Hardhat node
- `npm run deploy:mumbai` - Deploy to Polygon Mumbai testnet
- `npm run deploy:sepolia` - Deploy to Sepolia testnet

## 🧪 Testing

Run all tests:
```bash
npm run test
```

Tests cover:
- ✅ Contract deployment
- ✅ Record creation
- ✅ Record verification
- ✅ Record invalidation
- ✅ Batch operations
- ✅ Ownership management

## 🌐 Deploy to Testnet

### Polygon Mumbai (Recommended)

1. **Get RPC URL:**
   - Sign up at https://www.alchemy.com/
   - Create app → Select "Polygon" → "Mumbai"
   - Copy HTTPS URL

2. **Get Testnet Tokens:**
   - Go to https://faucet.polygon.technology/
   - Enter your wallet address
   - Request MATIC tokens

3. **Create `.env` file:**
   ```env
   PRIVATE_KEY=0x...your_wallet_private_key
   POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
   ```

4. **Deploy:**
   ```bash
   npm run deploy:mumbai
   ```

### Sepolia (Ethereum Testnet)

1. **Get RPC URL:**
   - Sign up at https://www.infura.io/
   - Create project → Select "Sepolia"
   - Copy HTTPS endpoint

2. **Get Testnet Tokens:**
   - Go to https://sepoliafaucet.com/
   - Enter your wallet address

3. **Create `.env` file:**
   ```env
   PRIVATE_KEY=0x...your_wallet_private_key
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

4. **Deploy:**
   ```bash
   npm run deploy:sepolia
   ```

## 📝 Contract Functions

### Public Functions

- `createRecord(string memory touristId, string memory docHash)` - Create a new tourist record
- `verifyRecord(string memory touristId)` - Verify if a record is valid (view)
- `getRecord(string memory touristId)` - Get complete record details (view)

### Owner-Only Functions

- `invalidateRecord(string memory touristId)` - Invalidate a record
- `batchInvalidate(string[] memory touristIds)` - Invalidate multiple records
- `transferOwnership(address newOwner)` - Transfer contract ownership

## 🔍 Contract Events

- `RecordCreated` - Emitted when a new record is created
- `RecordVerified` - Emitted when a record is verified
- `RecordInvalidated` - Emitted when a record is invalidated

## 📊 Contract Structure

```
TouristIdentity.sol
├── Struct: TouristRecord
│   ├── touristId (string)
│   ├── documentHash (string)
│   ├── timestamp (uint256)
│   ├── issuer (address)
│   └── isValid (bool)
├── Mapping: records[touristId] → TouristRecord
└── Owner: address (deployer)
```

## 🔐 Security

- ✅ Access control for invalidation (owner only)
- ✅ Input validation (non-empty strings)
- ✅ Prevents duplicate records
- ✅ Ownership transfer with zero-address check

## 📚 Documentation

For more details, see:
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [ethers.js Documentation](https://docs.ethers.org/)

## 🐛 Troubleshooting

### Issue: "Contract not deployed"
- Make sure Hardhat node is running
- Check contract address in backend `.env`

### Issue: "Insufficient funds"
- For testnet: Get tokens from faucet
- For localhost: Hardhat node provides test accounts with ETH

### Issue: "Network mismatch"
- Ensure RPC URL matches the network you deployed to

## ✅ Next Steps

After deployment:
1. Copy contract address to backend `.env`
2. Update `CONTRACT_ADDRESS` in backend
3. Restart backend server
4. Test blockchain integration with `npm run test:blockchain` in backend



