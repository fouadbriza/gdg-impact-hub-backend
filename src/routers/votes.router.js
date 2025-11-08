import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { cacheApiEndpoint, invalidateUserVoteCache } from '../middlewares/cache.js';
import * as voteController from '../controllers/votes.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/votes/projects/:projectId
 * @desc    Get vote count for project
 * @access  Public
 */
router.get('/projects/:projectId', cacheApiEndpoint('PROJECT_VOTES'), voteController.getVoteCount);

/**
 * @route   POST /api/v1/votes/projects/:projectId
 * @desc    Add vote to project
 * @access  Private
 */
router.post('/projects/:projectId', authenticate, invalidateUserVoteCache(), voteController.addVote);

/**
 * @route   DELETE /api/v1/votes/projects/:projectId
 * @desc    Remove vote from project
 * @access  Private
 */
router.delete('/projects/:projectId', authenticate, invalidateUserVoteCache(), voteController.removeVote);

/**
 * @route   GET /api/v1/votes/projects/:projectId/status
 * @desc    Check if current user has voted
 * @access  Private
 */
router.get('/projects/:projectId/status', authenticate, cacheApiEndpoint('USER_VOTE_STATUS'), voteController.checkVoteStatus);

export default router;
