import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addTeamMemberSchema,
} from '../validations/index.js';
import * as projectController from '../controllers/project.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/projects/search
 * @desc    Search projects (must be before /:id route)
 * @access  Public
 */
router.get('/search', projectController.searchProjects);

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get('/', projectController.getAllProjects);

/**
 * @route   POST /api/v1/projects
 * @desc    Create project
 * @access  Private
 */
router.post('/', authenticate, validate(createProjectSchema), projectController.createProject);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project by ID
 * @access  Public
 */
router.get('/:id', projectController.getProject);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private (Owner only)
 */
router.put('/:id', authenticate, validate(updateProjectSchema), projectController.updateProject);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, projectController.deleteProject);

/**
 * @route   POST /api/v1/projects/:id/members
 * @desc    Add team member
 * @access  Private (Owner only)
 */
router.post(
  '/:id/members',
  authenticate,
  validate(addTeamMemberSchema),
  projectController.addTeamMember
);

/**
 * @route   DELETE /api/v1/projects/:id/members/:memberId
 * @desc    Remove team member
 * @access  Private (Owner only)
 */
router.delete('/:id/members/:memberId', authenticate, projectController.removeTeamMember);

export default router;
