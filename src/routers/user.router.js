import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  uploadAvatar,
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateUserSchema } from '../validations/index.js';
import { upload } from '../middlewares/upload.js';

const userRouter = express.Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Public
 */
userRouter.get('/', getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
userRouter.get('/:id', getUser);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private (Own profile only)
 */
userRouter.put('/:id', authenticate, validate(updateUserSchema), updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Own profile only)
 */
userRouter.delete('/:id', authenticate, deleteUser);

/**
 * @route   PUT /api/v1/users/:id/avatar
 * @desc    Upload/update user avatar
 * @access  Private (Own profile only)
 */
userRouter.put('/:id/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default userRouter;
