import redis from '../config/redis.js';
import logger from '../utils/logger.js';

class CacheService {
  // Default TTL values for different types of data
  static TTL = {
    DEFAULT: 3600,        // 1 hour
    SHORT: 300,           // 5 minutes
    LONG: 86400,          // 24 hours
    GITHUB_USER: 1800,    // 30 minutes
    PROJECT_VOTES: 300,   // 5 minutes
    USER_VOTE_STATUS: 300, // 5 minutes
    PROJECTS_LIST: 900,   // 15 minutes
    PROJECT_DETAILS: 900, // 15 minutes
  };

  // Cache key patterns
  static KEYS = {
    GITHUB_USER: (id) => `github:user:${id}`,
    PROJECT_VOTES: (projectId) => `project:votes:${projectId}`,
    USER_VOTE_STATUS: (projectId, userId) => `user:vote:${projectId}:${userId}`,
    PROJECTS_LIST: (query = '') => `projects:list:${query}`,
    PROJECT_DETAILS: (id) => `project:details:${id}`,
  };

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null if not found
   */
  async get(key) {
    try {
      const client = redis.getRedisClient();
      if (!client) {
        logger.warn('Redis not available, skipping cache get operation', { key });
        return null;
      }

      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null; // Return null instead of throwing to maintain application flow
    }
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} True if successful
   */
  async set(key, value, ttl = CacheService.TTL.DEFAULT) {
    try {
      const client = redis.getRedisClient();
      if (!client) {
        logger.warn('Redis not available, skipping cache set operation', { key });
        return false;
      }

      await client.set(key, JSON.stringify(value), { EX: ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} True if successful
   */
  async delete(key) {
    try {
      const client = redis.getRedisClient();
      if (!client) {
        logger.warn('Redis not available, skipping cache delete operation', { key });
        return false;
      }

      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key to check
   * @returns {Promise<boolean>} True if key exists
   */
  async exists(key) {
    try {
      const client = redis.getRedisClient();
      if (!client) {
        logger.warn('Redis not available, skipping cache exists check', { key });
        return false;
      }

      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {Promise<number>} Number of deleted keys
   */
  async deletePattern(pattern) {
    try {
      const client = redis.getRedisClient();
      if (!client) {
        logger.warn('Redis not available, skipping cache delete pattern operation', { pattern });
        return 0;
      }

      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        const result = await client.del(keys);
        logger.info('Cache keys deleted by pattern', { pattern, count: keys.length, deleted: result });
        return result;
      }
      return 0;
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Get multiple values by keys
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<any[]>} Array of cached values
   */
  async mget(keys) {
    try {
      const client = redis.getRedisClient();
      if (!client) {
        logger.warn('Redis not available, skipping cache multi-get operation', { keys });
        return Array(keys.length).fill(null);
      }

      const values = await client.mGet(keys);
      return values.map((val) => (val ? JSON.parse(val) : null));
    } catch (error) {
      logger.error('Cache multi-get error', { keys, error: error.message });
      return Array(keys.length).fill(null);
    }
  }

  /**
   * Generate cache key based on the type and parameters
   * @param {string} type - Type of cache
   * @param {...any} params - Parameters to build the key
   * @returns {string} Generated cache key
   */
  generateKey(type, ...params) {
    switch (type) {
      case 'GITHUB_USER':
        return CacheService.KEYS.GITHUB_USER(params[0]);
      case 'PROJECT_VOTES':
        return CacheService.KEYS.PROJECT_VOTES(params[0]);
      case 'USER_VOTE_STATUS':
        return CacheService.KEYS.USER_VOTE_STATUS(params[0], params[1]);
      case 'PROJECTS_LIST':
        return CacheService.KEYS.PROJECTS_LIST(params[0] || '');
      case 'PROJECT_DETAILS':
        return CacheService.KEYS.PROJECT_DETAILS(params[0]);
      default:
        return `${type}:${params.join(':')}`;
    }
  }

  /**
   * Get appropriate TTL for a specific cache type
   * @param {string} type - Type of cache
   * @returns {number} TTL in seconds
   */
  getTTL(type) {
    return CacheService.TTL[type] || CacheService.TTL.DEFAULT;
  }

  /**
   * Invalidate all project-related cache
   * @param {string} projectId - Project ID to invalidate cache for
   * @returns {Promise<number>} Number of invalidated keys
   */
  async invalidateProjectCache(projectId) {
    let invalidatedCount = 0;
    
    // Delete project votes cache
    const projectVotesKey = CacheService.KEYS.PROJECT_VOTES(projectId);
    if (await this.delete(projectVotesKey)) invalidatedCount++;
    
    // Delete project details cache
    const projectDetailsKey = CacheService.KEYS.PROJECT_DETAILS(projectId);
    if (await this.delete(projectDetailsKey)) invalidatedCount++;
    
    // Delete projects list cache (as it might contain this project)
    invalidatedCount += await this.deletePattern('projects:list:*');
    
    return invalidatedCount;
  }

  /**
   * Invalidate user vote status cache
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if invalidated
   */
  async invalidateUserVoteStatus(projectId, userId) {
    const key = CacheService.KEYS.USER_VOTE_STATUS(projectId, userId);
    return await this.delete(key);
  }
}

export default new CacheService();