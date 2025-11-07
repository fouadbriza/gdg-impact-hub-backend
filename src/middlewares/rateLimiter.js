import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * General API rate limiter
 * Allows 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});

/**
 * Strict rate limiter for auth endpoints
 * Allows 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    },
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: {
        message:
          'Too many authentication attempts from this IP, please try again after 15 minutes.',
      },
    });
  },
});

/**
 * Upload rate limiter
 * Allows 10 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: {
      message: 'Too many uploads from this IP, please try again later.',
    },
  },
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many uploads from this IP, please try again later.',
      },
    });
  },
});

export default { apiLimiter, authLimiter, uploadLimiter };
