import dotenv from 'dotenv';
import { BlockchainService } from '../src/services/blockchainService';
import { IdGeneratorService } from '../src/services/idGeneratorService';

// Load environment variables
dotenv.config();

async function testBlockchain() {
  console.log('🧪 Testing Blockchain Service...\n');

  try {
    const service = new BlockchainService();

    // Test 1: Document Hash Generation
    console.log('1. Testing document hash generation...');
    const documentData = {
      documentNumber: '123456789012',
      documentType: 'aadhaar',
    };
    
    const hash = IdGeneratorService.generateDocumentHash(documentData);
    console.log('✅ Document hash generated:', hash);
    console.log('   Hash length:', hash.length, 'characters\n');

    // Test 2: Tourist ID Generation
    console.log('2. Testing tourist ID generation...');
    const touristId = IdGeneratorService.generateTouristId(documentData.documentNumber);
    console.log('✅ Tourist ID generated:', touristId);
    console.log('   Format: TID-{AIRPORT}-{TIMESTAMP}-{HASH}\n');

    // Test 3: Check blockchain configuration
    console.log('3. Checking blockchain configuration...');
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    
    if (!contractAddress || contractAddress === '0x...') {
      console.log('⚠️  CONTRACT_ADDRESS not set. Skipping blockchain tests.');
      console.log('   To test blockchain:');
      console.log('   1. Deploy contract: npx hardhat run scripts/deploy.js --network localhost');
      console.log('   2. Update CONTRACT_ADDRESS in .env\n');
      return;
    }

    if (!rpcUrl) {
      console.log('⚠️  BLOCKCHAIN_RPC_URL not set. Skipping blockchain tests.\n');
      return;
    }

    console.log('✅ Contract address:', contractAddress);
    console.log('✅ RPC URL:', rpcUrl);
    console.log('   Network:', process.env.BLOCKCHAIN_NETWORK || 'localhost\n');

    // Test 4: Create blockchain record (if contract is deployed)
    console.log('4. Testing blockchain record creation...');
    try {
      const result = await service.createTouristRecord(touristId, hash);
      console.log('✅ Blockchain record created successfully!');
      console.log('   Transaction hash:', result.transactionHash);
      console.log('   Block number:', result.blockNumber.toString());
      console.log('   Tourist ID:', touristId);
      console.log('   Document hash:', hash, '\n');
    } catch (error: any) {
      console.log('❌ Failed to create blockchain record:', error.message);
      console.log('   Make sure:');
      console.log('   - Contract is deployed');
      console.log('   - CONTRACT_ADDRESS is correct');
      console.log('   - Account has enough balance (for testnet)');
      console.log('   - RPC URL is accessible\n');
    }

    // Test 5: Verify record (if created successfully)
    console.log('5. Testing record verification...');
    try {
      const isValid = await service.verifyRecord(touristId);
      console.log('✅ Record verification:', isValid ? 'Valid' : 'Invalid');
      console.log('   Tourist ID:', touristId, '\n');
    } catch (error: any) {
      console.log('❌ Failed to verify record:', error.message, '\n');
    }

    // Test 6: Get record details
    console.log('6. Testing get record details...');
    try {
      const record = await service.getRecord(touristId);
      if (record) {
        console.log('✅ Record retrieved successfully!');
        console.log('   Document hash:', record.documentHash);
        console.log('   Timestamp:', record.timestamp.toString());
        console.log('   Is valid:', record.isValid, '\n');
      } else {
        console.log('⚠️  Record not found\n');
      }
    } catch (error: any) {
      console.log('❌ Failed to get record:', error.message, '\n');
    }

    // Test 7: IPFS storage (if configured)
    console.log('7. Testing IPFS document storage...');
    const ipfsProjectId = process.env.IPFS_PROJECT_ID;
    if (!ipfsProjectId || ipfsProjectId === 'your-project-id') {
      console.log('⚠️  IPFS not configured. Skipping IPFS test.');
      console.log('   To test IPFS:');
      console.log('   1. Get IPFS credentials from Infura or Pinata');
      console.log('   2. Update IPFS_PROJECT_ID and IPFS_PROJECT_SECRET in .env\n');
    } else {
      try {
        const ipfsHash = await service.storeDocumentOnIPFS(documentData);
        console.log('✅ Document stored on IPFS!');
        console.log('   IPFS hash:', ipfsHash, '\n');
      } catch (error: any) {
        console.log('❌ Failed to store on IPFS:', error.message);
        console.log('   Check IPFS credentials and network connectivity\n');
      }
    }

    console.log('✨ Blockchain service tests completed!\n');
    console.log('📝 Summary:');
    console.log('   - Document hash generation: ✅');
    console.log('   - Tourist ID generation: ✅');
    if (contractAddress && contractAddress !== '0x...') {
      console.log('   - Blockchain configuration: ✅');
    } else {
      console.log('   - Blockchain configuration: ⚠️  (Not configured)');
    }

  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testBlockchain()
  .then(() => {
    console.log('✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });

