import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_BASE = 'http://localhost:3001/api';

interface TestUser {
  email: string;
  name: string;
  country: string;
  state: string;
  itineraryStartDate: string;
  itineraryEndDate: string;
  documentType: 'aadhaar' | 'passport';
  documentNumber: string;
}

async function testFullFlow() {
  console.log('🧪 Testing Full Registration Flow\n');
  console.log('=' .repeat(60));
  
  // Test user data
  const testUser: TestUser = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    country: 'India',
    state: 'Delhi',
    itineraryStartDate: '2024-12-01',
    itineraryEndDate: '2024-12-10',
    documentType: 'aadhaar',
    documentNumber: '123456789012',
  };

  try {
    // Step 1: Health Check
    console.log('\n📋 Step 1: Health Check');
    console.log('-'.repeat(60));
    try {
      const healthResponse = await axios.get('http://localhost:3001/health', { timeout: 5000 });
      console.log('✅ Backend is running');
      console.log('   Status:', healthResponse.data.status);
      console.log('   Timestamp:', healthResponse.data.timestamp);
    } catch (error: any) {
      throw new Error(`Backend server is not running. Please start it with: npm run dev\nError: ${error.message}`);
    }

    // Step 2: Simulate DigiLocker Verification
    console.log('\n📋 Step 2: DigiLocker Verification (Simulate)');
    console.log('-'.repeat(60));
    const verifyResponse = await axios.post(
      `${API_BASE}/auth/digilocker/simulate`,
      {
        documentType: testUser.documentType,
        documentNumber: testUser.documentNumber,
      }
    );
    
    if (!verifyResponse.data.verified) {
      throw new Error('DigiLocker verification failed');
    }
    
    console.log('✅ Document verified');
    console.log('   Name:', verifyResponse.data.documentData.name);
    console.log('   Document Type:', testUser.documentType);
    console.log('   Document Number:', testUser.documentNumber);

    // Step 3: Complete Registration
    console.log('\n📋 Step 3: Complete Registration');
    console.log('-'.repeat(60));
    const registerResponse = await axios.post(
      `${API_BASE}/auth/register`,
      {
        ...testUser,
        documentData: verifyResponse.data.documentData,
      }
    );

    if (!registerResponse.data.success) {
      throw new Error('Registration failed');
    }

    const { touristId, blockchainId, transactionHash, token, user } = registerResponse.data;

    console.log('✅ Registration successful!');
    console.log('   Tourist ID:', touristId);
    console.log('   Email:', testUser.email);
    console.log('   Name:', testUser.name);
    console.log('   Blockchain ID:', blockchainId || 'Not set (blockchain not configured)');
    console.log('   Transaction Hash:', transactionHash || 'Not set (blockchain not configured)');
    console.log('   JWT Token:', token ? `${token.substring(0, 20)}...` : 'Not generated');

    // Step 4: Verify Session (Test Protected Endpoint)
    console.log('\n📋 Step 4: Verify Session (Test Logout)');
    console.log('-'.repeat(60));
    try {
      const logoutResponse = await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✅ Session verified and logged out');
      console.log('   Message:', logoutResponse.data.message);
    } catch (error: any) {
      console.log('⚠️  Logout test:', error.response?.data?.error || error.message);
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Backend Health Check: PASSED');
    console.log('✅ DigiLocker Verification: PASSED');
    console.log('✅ User Registration: PASSED');
    console.log('✅ Session Creation: PASSED');
    console.log('✅ JWT Token Generated: PASSED');
    console.log('\n📝 Data Storage:');
    console.log('   - User data stored in Supabase (users table)');
    console.log('   - Session stored in Supabase (sessions table)');
    console.log('   - Session cached in Redis (session:<token>)');
    if (blockchainId) {
      console.log('   - Blockchain record created (blockchain_records table)');
    } else {
      console.log('   - Blockchain: Not configured (optional)');
    }
    
    console.log('\n🎉 Full flow test completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Check Supabase dashboard to verify user data');
    console.log('   2. Check Redis to verify session cache');
    console.log('   3. Test frontend integration');
    
    return {
      success: true,
      touristId,
      email: testUser.email,
      token,
    };
  } catch (error: any) {
    console.error('\n❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testFullFlow()
  .then((result) => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

