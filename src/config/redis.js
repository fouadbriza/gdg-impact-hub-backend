import { createClient } from 'redis';
import env from './env.js';
import logger from '../utils/logger.js';

let redisClient;

const initializeRedis = async () => {
  try {
    redisClient = createClient({
      url: env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, 3200ms, 6400ms, 12800ms, 25600ms (5.12s)
          if (retries < 10) {
            return Math.min(100 * Math.pow(2, retries), 25600);
          }
          // Stop retrying after 10 attempts
          logger.error('Redis connection failed after 10 attempts');
          return new Error('Retry attempts exceeded');
        },
      },
    });

    // Add event listeners for Redis connection
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', { error: err.message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client connected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis Client reconnecting');
    });

    await redisClient.connect();
    logger.info('✅ Redis connected successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', { error: error.message });
    // Don't exit the process, but log the error
    // The application should still work without Redis (with degraded performance)
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client not initialized, returning null');
    return null;
  }
  return redisClient;
};

const isRedisConnected = () => {
  return redisClient && redisClient.isReady;
};

export default {
  initializeRedis,
  getRedisClient,
  isRedisConnected,
};