import dotenv from 'dotenv';
import supabase from '../src/config/database';
import redisClient from '../src/config/redis';

// Load environment variables
dotenv.config();

async function verifyData() {
  console.log('🔍 Verifying Data in Supabase and Redis\n');
  console.log('='.repeat(60));

  try {
    // 1. Check Supabase - Get latest user
    console.log('\n📋 Step 1: Checking Supabase (Users Table)');
    console.log('-'.repeat(60));
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} user(s) in database`);
      if (users && users.length > 0) {
        const latestUser = users[0];
        console.log('\n📝 Latest User:');
        console.log('   ID:', latestUser.id);
        console.log('   Tourist ID:', latestUser.tourist_id);
        console.log('   Email:', latestUser.email);
        console.log('   Name:', latestUser.name);
        console.log('   Blockchain ID:', latestUser.blockchain_id || 'Not set');
        console.log('   Document Type:', latestUser.document_type);
        console.log('   Country:', latestUser.country);
        console.log('   Created At:', latestUser.created_at);
      }
    }

    // 2. Check Supabase - Get latest session
    console.log('\n📋 Step 2: Checking Supabase (Sessions Table)');
    console.log('-'.repeat(60));
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError.message);
    } else {
      console.log(`✅ Found ${sessions?.length || 0} session(s) in database`);
      if (sessions && sessions.length > 0) {
        const latestSession = sessions[0];
        console.log('\n📝 Latest Session:');
        console.log('   ID:', latestSession.id);
        console.log('   Tourist ID:', latestSession.tourist_id);
        console.log('   Token:', latestSession.token.substring(0, 20) + '...');
        console.log('   Is Active:', latestSession.is_active);
        console.log('   Expires At:', latestSession.expires_at);
        console.log('   Created At:', latestSession.created_at);
      }
    }

    // 3. Check Supabase - Get blockchain records
    console.log('\n📋 Step 3: Checking Supabase (Blockchain Records Table)');
    console.log('-'.repeat(60));
    const { data: records, error: recordsError } = await supabase
      .from('blockchain_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recordsError) {
      console.error('❌ Error fetching blockchain records:', recordsError.message);
    } else {
      console.log(`✅ Found ${records?.length || 0} blockchain record(s) in database`);
      if (records && records.length > 0) {
        const latestRecord = records[0];
        console.log('\n📝 Latest Blockchain Record:');
        console.log('   Tourist ID:', latestRecord.tourist_id);
        console.log('   Transaction Hash:', latestRecord.transaction_hash);
        console.log('   IPFS Hash:', latestRecord.ipfs_hash || 'Not set');
        console.log('   Document Hash:', latestRecord.document_hash.substring(0, 20) + '...');
        console.log('   Created At:', latestRecord.created_at);
      }
    }

    // 4. Check Redis - Get session keys
    console.log('\n📋 Step 4: Checking Redis (Session Cache)');
    console.log('-'.repeat(60));
    let redisKeysCount = 0;
    try {
      const keys = await redisClient.keys('session:*');
      redisKeysCount = keys.length;
      console.log(`✅ Found ${keys.length} session(s) in Redis cache`);
      
      if (keys.length > 0) {
        console.log('\n📝 Redis Session Keys:');
        for (let i = 0; i < Math.min(keys.length, 3); i++) {
          const key = keys[i];
          const value = await redisClient.get(key);
          if (value) {
            const sessionData = JSON.parse(value);
            console.log(`\n   Key: ${key}`);
            console.log('   Tourist ID:', sessionData.touristId);
            console.log('   Blockchain ID:', sessionData.blockchainId || 'Not set');
            console.log('   Expires At:', sessionData.expiresAt);
            
            // Get TTL
            const ttl = await redisClient.ttl(key);
            console.log('   TTL (seconds remaining):', ttl > 0 ? ttl : 'Expired');
          }
        }
      } else {
        console.log('⚠️  No active sessions in Redis cache');
        console.log('   (Sessions may have expired or were cleared)');
      }
    } catch (redisError: any) {
      console.error('❌ Error checking Redis:', redisError.message);
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Supabase Users:', users?.length || 0);
    console.log('✅ Supabase Sessions:', sessions?.length || 0);
    console.log('✅ Supabase Blockchain Records:', records?.length || 0);
    console.log('✅ Redis Cached Sessions:', redisKeysCount);
    console.log('\n🎉 Data verification completed!');

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Don't close Redis connection - it's a singleton
  }
}

// Run verification
verifyData()
  .then(() => {
    console.log('\n✅ Verification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });

