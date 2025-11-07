import asyncHandler from '../utils/asyncHandler.js';
import {
  deleteUserService,
  getAllUsersService,
  getUserService,
  updateAvatarService,
  updateUserService,
} from '../services/user.service.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService();
  res.status(200).json({ success: true, count: users.length, data: users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserService(req.params.id);
  res.status(200).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserService(req.params.id, req.body);
  res.status(200).json({ success: true, data: updatedUser });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await deleteUserService(req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }

  const updatedUser = await updateAvatarService(req.params.id, req.file.path);
  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully',
    data: updatedUser,
  });
});
