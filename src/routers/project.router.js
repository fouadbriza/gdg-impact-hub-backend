import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { cacheApiEndpoint, invalidateProjectCache } from '../middlewares/cache.js';
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
router.get('/search', cacheApiEndpoint('PROJECTS_LIST'), projectController.searchProjects);

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get('/', cacheApiEndpoint('PROJECTS_LIST'), projectController.getAllProjects);

/**
 * @route   POST /api/v1/projects
 * @desc    Create project
 * @access  Private
 */
router.post('/', authenticate, validate(createProjectSchema), invalidateProjectCache(), projectController.createProject);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project by ID
 * @access  Public
 */
router.get('/:id', cacheApiEndpoint('PROJECT_DETAILS'), projectController.getProject);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private (Owner only)
 */
router.put('/:id', authenticate, validate(updateProjectSchema), invalidateProjectCache(), projectController.updateProject);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, invalidateProjectCache(), projectController.deleteProject);

/**
 * @route   POST /api/v1/projects/:id/members
 * @desc    Add team member
 * @access  Private (Owner only)
 */
router.post(
  '/:id/members',
  authenticate,
  validate(addTeamMemberSchema),
  invalidateProjectCache(),
  projectController.addTeamMember
);

/**
 * @route   DELETE /api/v1/projects/:id/members/:memberId
 * @desc    Remove team member
 * @access  Private (Owner only)
 */
router.delete('/:id/members/:memberId', authenticate, invalidateProjectCache(), projectController.removeTeamMember);

export default router;
