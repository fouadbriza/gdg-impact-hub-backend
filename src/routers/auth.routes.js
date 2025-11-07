// src/routers/auth.routes.js
import express from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/index.js';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   GET /api/v1/auth/logout
 * @desc    Logs out the authenticated user
 * @access  Private
 */
router.get('/logout', authenticate, authController.logout);

export default router;
