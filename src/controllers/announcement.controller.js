import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as announcementService from '../services/announcementsService.js';

/**
 * @route   GET /api/v1/announcements
 * @desc    Get all announcements
 * @access  Public
 */
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAllAnnouncementsService();
  sendSuccess(res, announcements, 'Announcements retrieved successfully', announcements.length);
});

/**
 * @route   POST /api/v1/announcements
 * @desc    Create new announcement
 * @access  Private/Admin
 */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncementService(req.body);
  sendSuccess(res, announcement, 'Announcement created successfully', undefined, 201);
});

/**
 * @route   GET /api/v1/announcements/:id
 * @desc    Get announcement by ID
 * @access  Public
 */
export const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.getAnnouncementService(req.params.id);
  sendSuccess(res, announcement, 'Announcement retrieved successfully');
});

/**
 * @route   PUT /api/v1/announcements/:id
 * @desc    Update announcement
 * @access  Private/Admin
 */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncementService(req.params.id, req.body);
  sendSuccess(res, announcement, 'Announcement updated successfully');
});

/**
 * @route   DELETE /api/v1/announcements/:id
 * @desc    Delete announcement
 * @access  Private/Admin
 */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncementService(req.params.id);
  sendSuccess(res, null, 'Announcement deleted successfully');
});
