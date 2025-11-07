import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createAnnouncementSchema, updateAnnouncementSchema } from '../validations/index.js';
import * as announcementController from '../controllers/announcement.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/announcements
 * @desc    Get all announcements
 * @access  Public
 */
router.get('/', announcementController.getAllAnnouncements);

/**
 * @route   POST /api/v1/announcements
 * @desc    Create announcement
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createAnnouncementSchema),
  announcementController.createAnnouncement
);

/**
 * @route   GET /api/v1/announcements/:id
 * @desc    Get announcement by ID
 * @access  Public
 */
router.get('/:id', announcementController.getAnnouncement);

/**
 * @route   PUT /api/v1/announcements/:id
 * @desc    Update announcement
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(updateAnnouncementSchema),
  announcementController.updateAnnouncement
);

/**
 * @route   DELETE /api/v1/announcements/:id
 * @desc    Delete announcement
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  announcementController.deleteAnnouncement
);

export default router;
