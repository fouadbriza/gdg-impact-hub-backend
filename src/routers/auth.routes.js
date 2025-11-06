// src/routers/auth.routes.js
import express from 'express';
import { validateRequest } from '../middleware/validation.js';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  validateRequest({
    body: {
      name: 'string|required',
      email: 'email|required',
      password: 'string|min:6|required',
      role: 'string|in:MEMBER,MENTOR,ADMIN|optional'
    }
  }),
  authController.register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login',
  validateRequest({
    body: {
      email: 'email|required',
      password: 'string|required'
    }
  }),
  authController.login
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, authController.getMe);

export default router;
