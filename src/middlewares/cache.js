import cacheService from '../services/cache.service.js';
import logger from '../utils/logger.js';

/**
 * Middleware to cache GET requests
 * @param {number} ttl - Time to live in seconds (optional, uses cache service default if not provided)
 * @param {Function} keyGenerator - Custom function to generate cache key (optional)
 */
export const cacheGetRequest = (ttl, keyGenerator) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (keyGenerator && typeof keyGenerator === 'function') {
      cacheKey = keyGenerator(req);
    } else {
      // Default key generation based on URL and query parameters
      const url = req.originalUrl || req.url;
      const queryParams = new URLSearchParams(req.query).toString();
      cacheKey = `api:${url}${queryParams ? `?${queryParams}` : ''}`;
    }

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug('Cache hit', { cacheKey });
        // Return cached data
        return res.status(cachedData.statusCode || 200).json(cachedData.body);
      }
      
      logger.debug('Cache miss', { cacheKey });
      
      // If not in cache, continue with request but intercept the response
      const originalSend = res.send;
      
      res.send = async function(body) {
        try {
          // Parse the body if it's a string
          let parsedBody;
          if (typeof body === 'string') {
            try {
              parsedBody = JSON.parse(body);
            } catch (e) {
              parsedBody = body;
            }
          } else {
            parsedBody = body;
          }
          
          // Store in cache before sending response
          const cacheData = {
            statusCode: res.statusCode,
            body: parsedBody,
            timestamp: new Date().toISOString(),
          };
          
          const cacheTTL = ttl || cacheService.getTTL('DEFAULT');
          const cacheResult = await cacheService.set(cacheKey, cacheData, cacheTTL);
          
          if (cacheResult) {
            logger.debug('Response cached', { cacheKey, ttl: cacheTTL });
          } else {
            logger.warn('Failed to cache response', { cacheKey });
          }
        } catch (cacheError) {
          logger.error('Error caching response', { cacheKey, error: cacheError.message });
        }
        
        // Continue with original send
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error', { cacheKey, error: error.message });
      // Continue with request if cache fails
      next();
    }
  };
};

/**
 * Middleware to cache specific API endpoints
 * @param {string} cacheType - Type of cache (e.g., 'PROJECTS_LIST', 'PROJECT_DETAILS')
 * @param {number} ttl - Time to live in seconds (optional)
 */
export const cacheApiEndpoint = (cacheType, ttl) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on type
    let cacheKey;
    const params = [];
    
    switch (cacheType) {
      case 'PROJECTS_LIST':
        // Use query parameters for projects list
        params.push(new URLSearchParams(req.query).toString());
        break;
      case 'PROJECT_DETAILS':
        // Use project ID for project details
        params.push(req.params.id || req.query.id);
        break;
      case 'PROJECT_VOTES':
        // Use project ID for vote counts
        params.push(req.params.projectId || req.query.projectId);
        break;
      case 'USER_VOTE_STATUS':
        // Use project ID and user ID for vote status
        params.push(req.params.projectId || req.query.projectId);
        params.push(req.user?.id || req.params.userId || req.query.userId);
        break;
      case 'GITHUB_USER':
        // Use user ID for GitHub user data
        params.push(req.user?.id || req.params.userId || req.query.userId);
        break;
      default:
        // Use URL and query for default cache key
        const url = req.originalUrl || req.url;
        const queryParams = new URLSearchParams(req.query).toString();
        cacheKey = `api:${url}${queryParams ? `?${queryParams}` : ''}`;
    }
    
    if (!cacheKey) {
      cacheKey = cacheService.generateKey(cacheType, ...params);
    }

    try {
      // Skip if required parameters are missing
      if (params.includes(undefined) || params.includes(null)) {
        logger.debug('Skipping cache due to missing parameters', { cacheType, params });
        return next();
      }

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug('Cache hit', { cacheKey, cacheType });
        // Return cached data
        return res.status(cachedData.statusCode || 200).json(cachedData.body);
      }
      
      logger.debug('Cache miss', { cacheKey, cacheType });
      
      // If not in cache, continue with request but intercept the response
      const originalSend = res.send;
      
      res.send = async function(body) {
        try {
          // Parse the body if it's a string
          let parsedBody;
          if (typeof body === 'string') {
            try {
              parsedBody = JSON.parse(body);
            } catch (e) {
              parsedBody = body;
            }
          } else {
            parsedBody = body;
          }
          
          // Store in cache before sending response
          const cacheData = {
            statusCode: res.statusCode,
            body: parsedBody,
            timestamp: new Date().toISOString(),
          };
          
          const cacheTTL = ttl || cacheService.getTTL(cacheType);
          const cacheResult = await cacheService.set(cacheKey, cacheData, cacheTTL);
          
          if (cacheResult) {
            logger.debug('Response cached', { cacheKey, cacheType, ttl: cacheTTL });
          } else {
            logger.warn('Failed to cache response', { cacheKey, cacheType });
          }
        } catch (cacheError) {
          logger.error('Error caching response', { cacheKey, cacheType, error: cacheError.message });
        }
        
        // Continue with original send
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error('Cache API endpoint middleware error', { cacheKey, error: error.message });
      // Continue with request if cache fails
      next();
    }
  };
};

/**
 * Middleware to invalidate cache on write operations (POST, PUT, DELETE)
 * @param {string} cacheType - Type of cache to invalidate
 * @param {Function} keyGenerator - Function to generate keys for invalidation
 */
export const invalidateCache = (cacheType, keyGenerator) => {
  return async (req, res, next) => {
    // Continue with the request first
    const originalSend = res.send;
    
    res.send = async function(body) {
      try {
        // Execute original send
        const result = originalSend.call(this, body);
        
        // Generate key for invalidation after response is sent
        let keysToInvalidate = [];
        
        if (keyGenerator && typeof keyGenerator === 'function') {
          const key = keyGenerator(req);
          if (Array.isArray(key)) {
            keysToInvalidate = key;
          } else if (key) {
            keysToInvalidate = [key];
          }
        } else {
          // Default invalidation logic based on cache type
          switch (cacheType) {
            case 'PROJECTS_LIST':
              // Invalidate all project list caches
              keysToInvalidate.push('projects:list:*');
              break;
            case 'PROJECT_DETAILS':
              // Invalidate specific project details cache
              const projectId = req.params.id || req.body.projectId;
              if (projectId) {
                keysToInvalidate.push(cacheService.generateKey('PROJECT_DETAILS', projectId));
                // Also invalidate projects list
                keysToInvalidate.push('projects:list:*');
              }
              break;
            case 'PROJECT_VOTES':
              // Invalidate vote count for the project
              const voteProjectId = req.params.projectId || req.params.id || req.body.projectId;
              if (voteProjectId) {
                keysToInvalidate.push(cacheService.generateKey('PROJECT_VOTES', voteProjectId));
              }
              break;
            case 'USER_VOTE_STATUS':
              // Invalidate user vote status for the project
              const userId = req.user?.id;
              const voteStatusProjectId = req.params.projectId || req.params.id || req.body.projectId;
              if (userId && voteStatusProjectId) {
                keysToInvalidate.push(cacheService.generateKey('USER_VOTE_STATUS', voteStatusProjectId, userId));
              }
              break;
            case 'GITHUB_USER':
              const githubUserId = req.user?.id || req.params.userId || req.body.userId;
              if (githubUserId) {
                keysToInvalidate.push(cacheService.generateKey('GITHUB_USER', githubUserId));
              }
              break;
            default:
              logger.warn('Unknown cache type for invalidation', { cacheType });
          }
        }
        
        // Invalidate the cache keys
        for (const key of keysToInvalidate) {
          if (key.includes('*')) {
            // Pattern-based deletion
            const deletedCount = await cacheService.deletePattern(key);
            logger.debug('Cache invalidated by pattern', { pattern: key, deleted: deletedCount });
          } else {
            // Single key deletion
            const deleted = await cacheService.delete(key);
            logger.debug('Cache invalidated', { key, deleted });
          }
        }
      } catch (invalidateError) {
        logger.error('Error invalidating cache', { cacheType, error: invalidateError.message });
      }
      
      return result;
    };
    
    next();
  };
};

/**
 * Middleware to invalidate project-related caches
 * Use this after project creation, update, or deletion
 */
export const invalidateProjectCache = () => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = async function(body) {
      try {
        // Execute original send
        const result = originalSend.call(this, body);
        
        // Invalidate project-related caches
        const projectId = req.params.id || req.body.projectId;
        if (projectId) {
          const invalidatedCount = await cacheService.invalidateProjectCache(projectId);
          logger.debug('Project caches invalidated', { projectId, count: invalidatedCount });
        }
      } catch (error) {
        logger.error('Error invalidating project cache', { error: error.message });
      }
      
      return result;
    };
    
    next();
  };
};

/**
 * Middleware to invalidate user vote status cache
 * Use this after vote creation or deletion
 */
export const invalidateUserVoteCache = () => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = async function(body) {
      try {
        // Execute original send
        const result = originalSend.call(this, body);
        
        // Invalidate user vote status cache
        const projectId = req.params.projectId || req.params.id;
        const userId = req.user?.id;
        
        if (projectId && userId) {
          const invalidated = await cacheService.invalidateUserVoteStatus(projectId, userId);
          logger.debug('User vote cache invalidated', { projectId, userId, invalidated });
        }
      } catch (error) {
        logger.error('Error invalidating user vote cache', { error: error.message });
      }
      
      return result;
    };
    
    next();
  };
};