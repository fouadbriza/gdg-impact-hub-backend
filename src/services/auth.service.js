// src/services/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User and token
 */
export const registerUserService = async (userData) => {
  const { name, email, password, role = 'MEMBER' } = userData;

  logger.info('Registering new user', { email, role });

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    logger.warn('Registration failed - User already exists', { email });
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });

  logger.info('User registered successfully', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} User and token
 */
export const loginUserService = async (credentials) => {
  const { email, password } = credentials;

  logger.info('User login attempt', { email });

  // Find user with password hash
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user || !user.passwordHash) {
    logger.warn('Login failed - Invalid credentials', { email });
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    logger.warn('Login failed - Password mismatch', { email, userId: user.id });
    throw new AppError('Invalid credentials', 401);
  }

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });

  // Remove password hash from user object
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...userWithoutPassword } = user;

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user: userWithoutPassword, token };
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
export const getCurrentUserService = async (userId) => {
  logger.info('Fetching current user profile', { userId });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    logger.warn('User not found', { userId });
    throw new AppError('User not found', 404);
  }

  logger.info('User profile fetched successfully', {
    userId: user.id,
    email: user.email,
  });

  return user;
};
