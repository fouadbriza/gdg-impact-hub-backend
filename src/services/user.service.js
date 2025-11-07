import { deleteFromCloudinary } from '../middlewares/upload.js';
import prisma from '../config/prisma.js';
import { updateUserSchema } from '../validations/index.js';
import { AppError } from '../middlewares/error.js';
import logger from '../utils/logger.js';

export const getAllUsersService = async () => {
  logger.info('Fetching all users');
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, bio: true, createdAt: true },
  });
  logger.info(`Successfully fetched ${users.length} users`);
  return users;
};

export const getUserService = async (reqId) => {
  logger.info('Fetching user by ID', { userId: reqId });

  const user = await prisma.user.findUnique({
    where: { id: reqId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      githubHandle: true,
      linkedinUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    logger.warn('User not found', { userId: reqId });
    throw new AppError('User not found', 404);
  }

  logger.info('Successfully fetched user', { userId: reqId, userName: user.name });
  return user;
};

export const updateUserService = async (reqId, reqBody) => {
  logger.info('Updating user', { userId: reqId, fields: Object.keys(reqBody) });

  const validationResult = updateUserSchema.safeParse(reqBody);

  if (!validationResult.success) {
    logger.warn('User update validation failed', {
      userId: reqId,
      errors: validationResult.error.errors,
    });
    throw new AppError('Validation failed', 400, validationResult.error.errors);
  }

  const validatedData = validationResult.data;

  const updatedUser = await prisma.user.update({
    where: { id: reqId },
    data: validatedData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      githubHandle: true,
      linkedinUrl: true,
      updatedAt: true,
    },
  });

  logger.info('Successfully updated user', { userId: reqId, userName: updatedUser.name });
  return updatedUser;
};

export const updateAvatarService = async (reqId, avatarUrl) => {
  logger.info('Updating user avatar', { userId: reqId, avatarUrl });

  const user = await prisma.user.findUnique({
    where: { id: reqId },
    select: { avatarUrl: true },
  });

  if (!user) {
    logger.warn('User not found for avatar update', { userId: reqId });
    throw new AppError('User not found', 404);
  }

  // delete the older profile picture if it exists in cloudinary
  if (user.avatarUrl) {
    try {
      logger.info('Deleting old avatar from Cloudinary', { oldAvatar: user.avatarUrl });
      await deleteFromCloudinary(user.avatarUrl);
      logger.info('Successfully deleted old avatar');
    } catch (error) {
      logger.error('Failed to delete old avatar from Cloudinary', {
        error: error.message,
        avatarUrl: user.avatarUrl,
      });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: reqId },
    data: { avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      githubHandle: true,
      linkedinUrl: true,
      updatedAt: true,
    },
  });

  logger.info('Successfully updated user avatar', { userId: reqId });
  return updatedUser;
};

export const deleteUserService = async (reqId) => {
  logger.info('Deleting user', { userId: reqId });

  await prisma.user.delete({ where: { id: reqId } });

  logger.info('Successfully deleted user', { userId: reqId });
  return { message: 'User deleted successfully' };
};
