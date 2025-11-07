import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import logger from '../utils/logger.js';

/**
 * Get all projects
 * @returns {Promise<Array>} List of projects
 */
export const getAllProjectsService = async () => {
  logger.info('Fetching all projects');

  const projects = await prisma.project.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  logger.info(`Successfully fetched ${projects.length} projects`);
  return projects;
};

/**
 * Create a new project
 * @param {Object} data - Project data
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<Object>} Created project
 */
export const createProjectService = async (data, ownerId) => {
  logger.info('Creating new project', { ownerId, title: data.title });

  const { title, shortDesc, description, category, impactArea } = data;

  if (!title || !description || !category || !impactArea || !shortDesc) {
    logger.warn('Project creation failed - missing required fields', {
      ownerId,
      providedFields: Object.keys(data),
    });
    throw new AppError('Title, shortDesc, description, category, and impactArea are required', 400);
  }

  const project = await prisma.project.create({
    data: {
      title,
      shortDesc,
      description,
      category,
      impactArea,
      ownerId,
      status: 'IDEA',
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  logger.info('Successfully created project', {
    projectId: project.id,
    title: project.title,
    ownerId,
  });
  return project;
};

/**
 * Get project by ID
 * @param {string} id - Project ID
 * @returns {Promise<Object>} Project
 */
// Get a project by ID
export const getProjectService = async (projectId) => {
  logger.info('Fetching project by ID', { projectId });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      teamMembers: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      projectVotes: true,
    },
  });

  if (!project) {
    logger.warn('Project not found', { projectId });
    throw new AppError('Project not found', 404);
  }

  logger.info('Project fetched successfully', {
    projectId: project.id,
    title: project.title,
    teamMemberCount: project.teamMembers.length,
    voteCount: project.projectVotes.length,
  });

  return project;
};

/**
 * Update project by ID
 * @param {string} id - Project ID
 * @param {Object} data - Update data
 * @param {string} userId - User making the update
 * @returns {Promise<Object>} Updated project
 */
export const updateProjectService = async (id, data, userId) => {
  logger.info('Updating project', { projectId: id, userId, fieldsToUpdate: Object.keys(data) });

  // Check if project exists and user is owner
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    logger.warn('Project not found for update', { projectId: id, userId });
    throw new AppError('Project not found', 404);
  }

  if (project.ownerId !== userId) {
    logger.warn('Unauthorized project update attempt', {
      projectId: id,
      ownerId: project.ownerId,
      attemptedBy: userId,
    });
    throw new AppError('Not authorized to update this project', 403);
  }

  const { title, shortDesc, description, category, impactArea, status } = data;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (impactArea !== undefined) updateData.impactArea = impactArea;
  if (status !== undefined) updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    logger.warn('No valid fields provided for project update', { projectId: id, userId });
    throw new AppError('No valid fields provided for update', 400);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  logger.info('Project updated successfully', {
    projectId: updatedProject.id,
    title: updatedProject.title,
    updatedFields: Object.keys(updateData),
    userId,
  });

  return updatedProject;
};

/**
 * Delete project by ID
 * @param {string} id - Project ID
 * @param {string} userId - User requesting deletion
 * @returns {Promise<Object>} Deleted project
 */
export const deleteProjectService = async (id, userId) => {
  logger.info('Deleting project', { projectId: id, userId });

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    logger.warn('Project not found for deletion', { projectId: id, userId });
    throw new AppError('Project not found', 404);
  }

  if (project.ownerId !== userId) {
    logger.warn('Unauthorized project deletion attempt', {
      projectId: id,
      ownerId: project.ownerId,
      attemptedBy: userId,
    });
    throw new AppError('Not authorized to delete this project', 403);
  }

  const deletedProject = await prisma.project.delete({
    where: { id },
  });

  logger.info('Project deleted successfully', {
    projectId: deletedProject.id,
    title: deletedProject.title,
    userId,
  });

  return deletedProject;
};

/**
 * Search projects with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Filtered projects
 */
export const searchProjectsService = async (filters) => {
  logger.info('Searching projects with filters', { filters });

  const { title, category, impactArea, status } = filters;

  const where = {};

  if (title) {
    where.title = { contains: title, mode: 'insensitive' };
  }
  if (category) {
    where.category = category;
  }
  if (impactArea) {
    where.impactArea = impactArea;
  }
  if (status) {
    where.status = status;
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  logger.info('Projects search completed', {
    filterCount: Object.keys(where).length,
    resultCount: projects.length,
  });

  return projects;
};

/**
 * Add team member to project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to add
 * @param {string} role - Member role
 * @returns {Promise<Object>} Team member record
 */
export const addTeamMemberService = async (projectId, userId, role) => {
  logger.info('Adding team member to project', { projectId, userId, role });

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    logger.warn('Project not found when adding team member', { projectId, userId });
    throw new AppError('Project not found', 404);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    logger.warn('User not found when adding to team', { projectId, userId });
    throw new AppError('User not found', 404);
  }

  // Check if already a member
  const existingMember = await prisma.teamMember.findFirst({
    where: {
      projectId,
      userId,
    },
  });

  if (existingMember) {
    logger.warn('User already a team member', { projectId, userId });
    throw new AppError('User is already a team member', 400);
  }

  const teamMember = await prisma.teamMember.create({
    data: {
      projectId,
      userId,
      role: role || 'Member',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  logger.info('Team member added successfully', {
    projectId,
    userId,
    userName: teamMember.user.name,
    role: teamMember.role,
  });

  return teamMember;
};

/**
 * Remove team member from project
 * @param {string} teamMemberId - Team member ID
 * @returns {Promise<Object>} Removed member
 */
export const removeTeamMemberService = async (teamMemberId) => {
  logger.info('Removing team member from project', { teamMemberId });

  const member = await prisma.teamMember.findUnique({
    where: { id: teamMemberId },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (!member) {
    logger.warn('Team member not found for removal', { teamMemberId });
    throw new AppError('Team member not found', 404);
  }

  const deletedMember = await prisma.teamMember.delete({
    where: { id: teamMemberId },
  });

  logger.info('Team member removed successfully', {
    teamMemberId,
    userName: member.user.name,
    projectId: deletedMember.projectId,
  });

  return deletedMember;
};
