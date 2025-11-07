import {
  archiveProjectService,
  setProjectStatusService,
  setUserRoleService,
  approveMentorService,
} from '../services/admin.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// User Management

// PUT /users/:id/role
export const setUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await setUserRoleService(id, role);

  res.status(200).json({ message: 'User status updated', user });
});

// POST /users/:id/approve-mentor
export const approveMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await approveMentorService(id);
  return res.status(200).json({ message: 'User promoted to MENTOR and profile ensured', user });
});

// Project Management

// PUT /projects/:id/status
export const setProjectStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const project = await setProjectStatusService(id, status);

  res.status(200).json({ message: 'Status updated', project });
});

// POST /projects/:id/archive
export const archiveProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await archiveProjectService(id);
  return res.status(200).json({ message: 'Project archived', project });
});
