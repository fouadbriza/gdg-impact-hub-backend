// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AppError } from './error.js';
import logger from '../utils/logger.js';

/**
 * Authenticate user with JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed - No token provided', {
        path: req.path,
        method: req.method,
      });
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug('Token verified successfully', { userId: decoded.userId });

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      logger.warn('Authentication failed - User not found in database', {
        userId: decoded.userId,
      });
      throw new AppError('User not found', 401);
    }

    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      path: req.path,
      method: req.method,
    });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Authentication failed - Invalid token', { error: error.message });
      next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      logger.warn('Authentication failed - Token expired');
      next(new AppError('Token expired', 401));
    } else {
      logger.error('Authentication error', { error: error.message });
      next(error);
    }
  }
};

/**
 * Authorize user based on roles
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authorization failed - No user attached to request', {
        path: req.path,
        method: req.method,
      });
      return next(new AppError('Unauthorized', 401));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn('Authorization failed - Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method,
      });
      return next(new AppError('Forbidden', 403));
    }

    logger.info('Authorization successful', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
      method: req.method,
    });

    next();
  };
};

export { authenticate, authorize };
export default { authenticate, authorize };
