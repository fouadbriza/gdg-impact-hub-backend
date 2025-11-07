import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import logger from '../utils/logger.js';

/**
 * Get all highlighted/featured projects
 * @returns {Promise<Array>} Featured projects
 */
export const getAllHighlightsService = async () => {
  logger.info('Fetching all highlighted projects');

  const highlights = await prisma.project.findMany({
    where: { featured: true },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      highlights: {
        orderBy: { featuredAt: 'desc' },
        take: 1,
        include: {
          featuredByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  logger.info('Highlighted projects fetched successfully', { count: highlights.length });

  return highlights;
};

/**
 * Feature/highlight a project
 * @param {string} projectId - Project ID
 * @param {Object} data - Highlight data
 * @param {string} featuredBy - User ID who is featuring
 * @returns {Promise<Object>} Highlight record
 */
export const featureProjectService = async (projectId, data, featuredBy) => {
  logger.info('Featuring project', { projectId, featuredBy, reason: data.reason });

  const { reason, expiresAt } = data;

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    logger.warn('Project not found for featuring', { projectId });
    throw new AppError('Project not found', 404);
  }

  if (!reason) {
    logger.warn('Reason required for featuring project', { projectId });
    throw new AppError('Reason is required for featuring a project', 400);
  }

  // Use transaction to update project and create highlight
  const result = await prisma.$transaction(async (tx) => {
    // Mark project as featured
    await tx.project.update({
      where: { id: projectId },
      data: { featured: true },
    });

    // Create highlight record
    return await tx.highlight.create({
      data: {
        projectId,
        reason,
        featuredBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  });

  logger.info('Project featured successfully', {
    projectId,
    highlightId: result.id,
    featuredBy,
    expiresAt,
  });

  return result;
};

/**
 * Unfeature/remove highlight from project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Result
 */
export const unfeatureProjectService = async (projectId) => {
  logger.info('Unfeaturing project', { projectId });

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    logger.warn('Project not found for unfeaturing', { projectId });
    throw new AppError('Project not found', 404);
  }

  if (!project.featured) {
    logger.warn('Project not currently featured', { projectId });
    throw new AppError('Project is not currently featured', 400);
  }

  // Use transaction to update project and expire highlights
  await prisma.$transaction(async (tx) => {
    // Unmark project as featured
    await tx.project.update({
      where: { id: projectId },
      data: { featured: false },
    });

    // Expire all highlights for this project
    await tx.highlight.updateMany({
      where: {
        projectId,
        expiresAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });
  });

  logger.info('Project unfeatured successfully', { projectId });

  return { message: 'Project unfeatured successfully' };
};
