import express from "express";
import * as passwordController from "../controllers/password.controller.js";
const router = express.Router();

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email to user
 * @access  Public
 */
router.post('/forgot-password', passwordController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password using token from email
 * @access  Public
 */
router.post('/reset-password', passwordController.resetPassword);

export default router;
