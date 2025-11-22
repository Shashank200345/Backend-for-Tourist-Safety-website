import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL to extract components for better error handling
const urlParts = new URL(redisUrl);
const isSSL = redisUrl.startsWith('rediss://') || urlParts.protocol === 'rediss:';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    // Handle SSL connections for Redis Cloud (only if URL uses rediss://)
    tls: isSSL,
    rejectUnauthorized: false, // Set to true in production with proper certificates
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis Client Connected'));
redisClient.on('ready', () => console.log('✅ Redis Client Ready'));

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    console.error('Redis URL format: redis://default:<password>@<host>:<port>');
    console.error('For SSL: rediss://default:<password>@<host>:<port>');
  }
})();

export default redisClient;


