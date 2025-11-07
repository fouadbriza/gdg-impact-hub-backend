import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as highlightService from '../services/highlight.service.js';

/**
 * @route   GET /api/v1/highlights
 * @desc    Get all highlighted/featured projects
 * @access  Public
 */
export const getAllHighlights = asyncHandler(async (req, res) => {
  const highlights = await highlightService.getAllHighlightsService();
  sendSuccess(res, highlights, 'Highlights retrieved successfully', highlights.length);
});

/**
 * @route   POST /api/v1/highlights/projects/:projectId
 * @desc    Feature a project
 * @access  Private/Admin
 */
export const featureProject = asyncHandler(async (req, res) => {
  const highlight = await highlightService.featureProjectService(
    req.params.projectId,
    req.body,
    req.user.id
  );
  sendSuccess(res, highlight, 'Project featured successfully', undefined, 201);
});

/**
 * @route   DELETE /api/v1/highlights/projects/:projectId
 * @desc    Unfeature a project
 * @access  Private/Admin
 */
export const unfeatureProject = asyncHandler(async (req, res) => {
  const result = await highlightService.unfeatureProjectService(req.params.projectId);
  sendSuccess(res, result, 'Project unfeatured successfully');
});
