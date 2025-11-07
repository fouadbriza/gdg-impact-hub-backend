import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as voteService from '../services/votes.service.js';

/**
 * @route   GET /api/v1/votes/projects/:projectId
 * @desc    Get vote count for project
 * @access  Public
 */
export const getVoteCount = asyncHandler(async (req, res) => {
  const count = await voteService.getVoteCountService(req.params.projectId);
  sendSuccess(res, { projectId: req.params.projectId, voteCount: count }, 'Vote count retrieved');
});

/**
 * @route   POST /api/v1/votes/projects/:projectId
 * @desc    Add vote to project
 * @access  Private
 */
export const addVote = asyncHandler(async (req, res) => {
  const vote = await voteService.addVoteService(req.params.projectId, req.user.id);
  sendSuccess(res, vote, 'Vote added successfully', undefined, 201);
});

/**
 * @route   DELETE /api/v1/votes/projects/:projectId
 * @desc    Remove vote from project
 * @access  Private
 */
export const removeVote = asyncHandler(async (req, res) => {
  await voteService.removeVoteService(req.params.projectId, req.user.id);
  sendSuccess(res, null, 'Vote removed successfully');
});

/**
 * @route   GET /api/v1/votes/projects/:projectId/status
 * @desc    Check if user has voted
 * @access  Private
 */
export const checkVoteStatus = asyncHandler(async (req, res) => {
  const hasVoted = await voteService.hasUserVotedService(req.params.projectId, req.user.id);
  sendSuccess(res, { hasVoted }, 'Vote status retrieved');
});
