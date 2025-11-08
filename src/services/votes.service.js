import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import logger from '../utils/logger.js';
import cacheService from './cache.service.js';

/**
 * Get vote count for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<number>} Vote count
 */
export const getVoteCountService = async (projectId) => {
  logger.info('Getting vote count for project', { projectId });

  // Generate cache key for vote count
  const cacheKey = cacheService.generateKey('PROJECT_VOTES', projectId);

  try {
    // Try to get from cache first
    const cachedCount = await cacheService.get(cacheKey);
    if (cachedCount !== null) {
      logger.debug('Vote count retrieved from cache', { projectId, count: cachedCount });
      return cachedCount;
    }
  } catch (cacheError) {
    logger.warn('Cache get failed for vote count, proceeding with DB query', { 
      projectId, 
      error: cacheError.message 
    });
  }

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    logger.warn('Project not found when getting vote count', { projectId });
    throw new AppError('Project not found', 404);
  }

  const count = await prisma.vote.count({
    where: { projectId },
  });

  // Cache the result
  try {
    await cacheService.set(
      cacheKey,
      count,
      cacheService.getTTL('PROJECT_VOTES')
    );
    logger.debug('Vote count cached', { projectId, count, cacheKey });
  } catch (cacheError) {
    logger.warn('Failed to cache vote count', { projectId, error: cacheError.message });
  }

  logger.info('Vote count retrieved', { projectId, count });

  return count;
};

/**
 * Add vote to project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Vote record
 */
export const addVoteService = async (projectId, userId) => {
  logger.info('Adding vote to project', { projectId, userId });

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    logger.warn('Project not found when adding vote', { projectId, userId });
    throw new AppError('Project not found', 404);
  }

  // Check if already voted
  const existingVote = await prisma.vote.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existingVote) {
    logger.warn('User already voted for project', { projectId, userId });
    throw new AppError('You have already voted for this project', 400);
  }

  const vote = await prisma.vote.create({
    data: {
      projectId,
      userId,
    },
  });

  // Invalidate cache for vote count and user vote status
  try {
    const voteCountCacheKey = cacheService.generateKey('PROJECT_VOTES', projectId);
    await cacheService.delete(voteCountCacheKey);
    
    const userVoteStatusCacheKey = cacheService.generateKey('USER_VOTE_STATUS', projectId, userId);
    await cacheService.delete(userVoteStatusCacheKey);
    
    logger.debug('Cache invalidated after adding vote', { 
      projectId, 
      userId, 
      voteCountCacheKey, 
      userVoteStatusCacheKey 
    });
  } catch (cacheError) {
    logger.warn('Failed to invalidate cache after adding vote', { 
      projectId, 
      userId, 
      error: cacheError.message 
    });
  }

  logger.info('Vote added successfully', { projectId, userId, voteId: vote.id });

  return vote;
};

/**
 * Remove vote from project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deleted vote
 */
export const removeVoteService = async (projectId, userId) => {
  logger.info('Removing vote from project', { projectId, userId });

  // Check if vote exists
  const vote = await prisma.vote.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!vote) {
    logger.warn('Vote not found for removal', { projectId, userId });
    throw new AppError('Vote not found', 404);
  }

  const deletedVote = await prisma.vote.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  // Invalidate cache for vote count and user vote status
  try {
    const voteCountCacheKey = cacheService.generateKey('PROJECT_VOTES', projectId);
    await cacheService.delete(voteCountCacheKey);
    
    const userVoteStatusCacheKey = cacheService.generateKey('USER_VOTE_STATUS', projectId, userId);
    await cacheService.delete(userVoteStatusCacheKey);
    
    logger.debug('Cache invalidated after removing vote', { 
      projectId, 
      userId, 
      voteCountCacheKey, 
      userVoteStatusCacheKey 
    });
  } catch (cacheError) {
    logger.warn('Failed to invalidate cache after removing vote', { 
      projectId, 
      userId, 
      error: cacheError.message 
    });
  }

  logger.info('Vote removed successfully', { projectId, userId });

  return deletedVote;
};

/**
 * Check if user has voted for project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if voted
 */
export const hasUserVotedService = async (projectId, userId) => {
  logger.debug('Checking if user voted for project', { projectId, userId });

  // Generate cache key for user vote status
  const cacheKey = cacheService.generateKey('USER_VOTE_STATUS', projectId, userId);

  try {
    // Try to get from cache first
    const cachedHasVoted = await cacheService.get(cacheKey);
    if (cachedHasVoted !== null) {
      logger.debug('User vote status retrieved from cache', { projectId, userId, hasVoted: cachedHasVoted });
      return cachedHasVoted;
    }
  } catch (cacheError) {
    logger.warn('Cache get failed for user vote status, proceeding with DB query', { 
      projectId, 
      userId,
      error: cacheError.message 
    });
  }

  const vote = await prisma.vote.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  const hasVoted = !!vote;

  // Cache the result
  try {
    await cacheService.set(
      cacheKey,
      hasVoted,
      cacheService.getTTL('USER_VOTE_STATUS')
    );
    logger.debug('User vote status cached', { projectId, userId, hasVoted, cacheKey });
  } catch (cacheError) {
    logger.warn('Failed to cache user vote status', { 
      projectId, 
      userId, 
      hasVoted, 
      error: cacheError.message 
    });
  }

  logger.debug('User vote status', { projectId, userId, hasVoted });

  return hasVoted;
};
