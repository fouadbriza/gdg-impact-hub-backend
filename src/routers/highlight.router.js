import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { featureProjectSchema } from '../validations/index.js';
import * as highlightController from '../controllers/highlight.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/highlights
 * @desc    Get all highlighted/featured projects
 * @access  Public
 */
router.get('/', highlightController.getAllHighlights);

/**
 * @route   POST /api/v1/highlights/projects/:projectId
 * @desc    Feature a project
 * @access  Private/Admin
 */
router.post(
  '/projects/:projectId',
  authenticate,
  authorize(['ADMIN']),
  validate(featureProjectSchema),
  highlightController.featureProject
);

/**
 * @route   DELETE /api/v1/highlights/projects/:projectId
 * @desc    Unfeature a project
 * @access  Private/Admin
 */
router.delete(
  '/projects/:projectId',
  authenticate,
  authorize(['ADMIN']),
  highlightController.unfeatureProject
);

export default router;
