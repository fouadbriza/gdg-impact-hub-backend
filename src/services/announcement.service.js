import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import logger from '../utils/logger.js';

/**
 * Get all announcements
 * @returns {Promise<Array>} List of announcements
 */
export const getAllAnnouncementsService = async () => {
  logger.info('Fetching all announcements');

  const announcements = await prisma.announcement.findMany({
    orderBy: { creationDate: 'desc' },
  });

  logger.info('Announcements fetched successfully', { count: announcements.length });

  return announcements;
};

/**
 * Create a new announcement
 * @param {Object} data - Announcement data
 * @returns {Promise<Object>} Created announcement
 */
export const createAnnouncementService = async (data) => {
  logger.info('Creating new announcement', { title: data.title });

  const { title, content } = data;

  if (!title || !content) {
    logger.warn('Announcement creation failed - Missing required fields', {
      hasTitle: !!title,
      hasContent: !!content,
    });
    throw new AppError('Title and content are required', 400);
  }

  const announcement = await prisma.announcement.create({
    data: { title, content },
  });

  logger.info('Announcement created successfully', {
    announcementId: announcement.id,
    title: announcement.title,
  });

  return announcement;
};

/**
 * Get announcement by ID
 * @param {string} id - Announcement ID
 * @returns {Promise<Object>} Announcement
 */
export const getAnnouncementService = async (id) => {
  logger.info('Fetching announcement by ID', { announcementId: id });

  const announcement = await prisma.announcement.findUnique({
    where: { id: parseInt(id) },
  });

  if (!announcement) {
    logger.warn('Announcement not found', { announcementId: id });
    throw new AppError('Announcement not found', 404);
  }

  logger.info('Announcement fetched successfully', {
    announcementId: announcement.id,
    title: announcement.title,
  });

  return announcement;
};

/**
 * Update announcement by ID
 * @param {string} id - Announcement ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated announcement
 */
export const updateAnnouncementService = async (id, data) => {
  logger.info('Updating announcement', { announcementId: id, fieldsToUpdate: Object.keys(data) });

  const { title, content } = data;

  // Check if announcement exists
  const exists = await prisma.announcement.findUnique({
    where: { id: parseInt(id) },
  });

  if (!exists) {
    logger.warn('Announcement not found for update', { announcementId: id });
    throw new AppError('Announcement not found', 404);
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;

  if (Object.keys(updateData).length === 0) {
    logger.warn('No valid fields provided for announcement update', { announcementId: id });
    throw new AppError('No valid fields provided for update', 400);
  }

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  logger.info('Announcement updated successfully', {
    announcementId: updatedAnnouncement.id,
    title: updatedAnnouncement.title,
    updatedFields: Object.keys(updateData),
  });

  return updatedAnnouncement;
};

/**
 * Delete announcement by ID
 * @param {string} id - Announcement ID
 * @returns {Promise<Object>} Deleted announcement
 */
export const deleteAnnouncementService = async (id) => {
  logger.info('Deleting announcement', { announcementId: id });

  // Check if announcement exists
  const exists = await prisma.announcement.findUnique({
    where: { id: parseInt(id) },
  });

  if (!exists) {
    logger.warn('Announcement not found for deletion', { announcementId: id });
    throw new AppError('Announcement not found', 404);
  }

  const deletedAnnouncement = await prisma.announcement.delete({
    where: { id: parseInt(id) },
  });

  logger.info('Announcement deleted successfully', {
    announcementId: deletedAnnouncement.id,
    title: deletedAnnouncement.title,
  });

  return deletedAnnouncement;
};
