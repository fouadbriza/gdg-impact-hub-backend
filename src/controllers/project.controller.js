import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as projectService from '../services/projectService.js';

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects
 * @access  Public
 */
export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getAllProjectsService();
  sendSuccess(res, projects, 'Projects retrieved successfully', projects.length);
});

/**
 * @route   POST /api/v1/projects
 * @desc    Create new project
 * @access  Private
 */
export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProjectService(req.body, req.user.id);
  sendSuccess(res, project, 'Project created successfully', undefined, 201);
});

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project by ID
 * @access  Public
 */
export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectService(req.params.id);
  sendSuccess(res, project, 'Project retrieved successfully');
});

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private (Owner only)
 */
export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProjectService(req.params.id, req.body, req.user.id);
  sendSuccess(res, project, 'Project updated successfully');
});

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private (Owner only)
 */
export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProjectService(req.params.id, req.user.id);
  sendSuccess(res, null, 'Project deleted successfully');
});

/**
 * @route   GET /api/v1/projects/search
 * @desc    Search projects
 * @access  Public
 */
export const searchProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.searchProjectsService(req.query);
  sendSuccess(res, projects, 'Projects found', projects.length);
});

/**
 * @route   POST /api/v1/projects/:id/members
 * @desc    Add team member to project
 * @access  Private (Owner only)
 */
export const addTeamMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const member = await projectService.addTeamMemberService(req.params.id, userId, role);
  sendSuccess(res, member, 'Team member added successfully', undefined, 201);
});

/**
 * @route   DELETE /api/v1/projects/:id/members/:memberId
 * @desc    Remove team member from project
 * @access  Private (Owner only)
 */
export const removeTeamMember = asyncHandler(async (req, res) => {
  await projectService.removeTeamMemberService(req.params.memberId);
  sendSuccess(res, null, 'Team member removed successfully');
});
