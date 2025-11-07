import express from "express";
import * as oauthController from "../controllers/oauth.controller.js";
const router = express.Router();

/**
 * @route   GET /api/v1/auth/google
 * @desc    Redirects user to Google OAuth login page
 * @access  Public
 */
router.get("/google", oauthController.googleLogin);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Handles Google OAuth callback and logs in or registers user
 * @access  Public
 */
router.get("/google/callback", oauthController.googleCallback);

/**
 * @route   GET /api/v1/auth/github
 * @desc    Redirects user to GitHub OAuth login page
 * @access  Public
 */
router.get("/github", oauthController.githubLogin);

/**
 * @route   GET /api/v1/auth/github/callback
 * @desc    Handles GitHub OAuth callback and logs in or registers user
 * @access  Public
 */
router.get("/github/callback", oauthController.githubCallback);

export default router;
