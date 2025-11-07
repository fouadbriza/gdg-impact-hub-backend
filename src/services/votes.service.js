import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import logger from '../utils/logger.js';

/**
 * Get vote count for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<number>} Vote count
 */
export const getVoteCountService = async (projectId) => {
  logger.info('Getting vote count for project', { projectId });

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

  const vote = await prisma.vote.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  const hasVoted = !!vote;
  logger.debug('User vote status', { projectId, userId, hasVoted });

  return hasVoted;
};
