// src/routers/mentorship.routes.js
import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createSessionSchema,
  updateSessionSchema,
  feedbackSchema,
  evaluationSchema,
  mentorProfileSchema,
  createMentorshipRequestSchema,
  declineRequestSchema,
} from '../validations/index.js';
import mentorshipController from '../controllers/mentorship.controller.js';

const router = express.Router();

// ============================================
// MENTORSHIP REQUEST ROUTES
// ============================================

/**
 * @route   POST /api/mentorship/requests
 * @desc    Create a new mentorship request
 * @access  Private
 * @body    projectId, message
 */
router.post(
  '/requests',
  authenticate,
  validate(createMentorshipRequestSchema),
  mentorshipController.createMentorshipRequest
);

/**
 * @route   GET /api/mentorship/requests
 * @desc    Get all mentorship requests for logged-in mentor
 * @access  Private (Mentor only)
 * @query   status - Filter by status (PENDING, ACCEPTED, REJECTED, COMPLETED)
 */
router.get(
  '/requests',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  mentorshipController.getMentorRequests
);

/**
 * @route   PUT /api/mentorship/requests/:requestId/accept
 * @route   PATCH /api/mentorship/requests/:requestId/accept
 * @desc    Accept a mentorship request
 * @access  Private (Mentor only)
 */
router.put(
  '/requests/:requestId/accept',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  mentorshipController.acceptRequest
);

// Alias for PATCH method
router.patch(
  '/requests/:requestId/accept',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  mentorshipController.acceptRequest
);

/**
 * @route   PUT /api/mentorship/requests/:requestId/decline
 * @desc    Decline a mentorship request
 * @access  Private (Mentor only)
 * @body    reason - Optional reason for declining
 */
router.put(
  '/requests/:requestId/decline',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  validate(declineRequestSchema),
  mentorshipController.declineRequest
);

/**
 * @route   GET /api/mentorship/assigned-projects
 * @desc    Get all projects assigned to mentor
 * @access  Private (Mentor only)
 */
router.get(
  '/assigned-projects',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  mentorshipController.getAssignedProjects
);

// ============================================
// MENTORSHIP SESSION ROUTES
// ============================================

/**
 * @route   POST /api/mentorship/sessions
 * @desc    Create a new mentorship session
 * @access  Private (Mentor only)
 * @body    mentorshipRequestId, projectId, scheduledAt, durationMinutes, mode, location, notes
 */
router.post(
  '/sessions',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  validate(createSessionSchema),
  mentorshipController.createSession
);

/**
 * @route   GET /api/mentorship/sessions
 * @desc    Get all sessions (filtered)
 * @access  Private
 * @query   projectId, mentorshipRequestId, upcoming
 */
router.get('/sessions', authenticate, mentorshipController.getSessions);

/**
 * @route   GET /api/mentorship/sessions/:sessionId
 * @desc    Get a specific session by ID
 * @access  Private
 */
router.get('/sessions/:sessionId', authenticate, mentorshipController.getSessionById);

/**
 * @route   PUT /api/mentorship/sessions/:sessionId
 * @desc    Update a mentorship session
 * @access  Private (Mentor only)
 */
router.put(
  '/sessions/:sessionId',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  validate(updateSessionSchema),
  mentorshipController.updateSession
);

/**
 * @route   POST /api/mentorship/sessions/:sessionId/join
 * @desc    Join a mentorship session
 * @access  Private
 */
router.post('/sessions/:sessionId/join', authenticate, mentorshipController.joinSession);

/**
 * @route   DELETE /api/mentorship/sessions/:sessionId
 * @desc    Delete a mentorship session
 * @access  Private (Mentor only)
 */
router.delete(
  '/sessions/:sessionId',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  mentorshipController.deleteSession
);

// ============================================
// FEEDBACK & EVALUATION ROUTES
// ============================================

/**
 * @route   POST /api/mentorship/sessions/:sessionId/feedback
 * @desc    Submit feedback for a session
 * @access  Private (Mentor only)
 * @body    notes, recordingUrl
 */
router.post(
  '/sessions/:sessionId/feedback',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  validate(feedbackSchema),
  mentorshipController.submitSessionFeedback
);

/**
 * @route   GET /api/mentorship/sessions/:sessionId/feedback
 * @desc    Get feedback for a session
 * @access  Private
 */
router.get('/sessions/:sessionId/feedback', authenticate, mentorshipController.getSessionFeedback);

/**
 * @route   POST /api/mentorship/projects/:projectId/evaluation
 * @desc    Submit project evaluation
 * @access  Private (Mentor only)
 * @body    title, content, rating
 */
router.post(
  '/projects/:projectId/evaluation',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  validate(evaluationSchema),
  mentorshipController.submitProjectEvaluation
);

/**
 * @route   GET /api/mentorship/projects/:projectId/evaluations
 * @desc    Get all evaluations for a project
 * @access  Private
 */
router.get(
  '/projects/:projectId/evaluations',
  authenticate,
  mentorshipController.getProjectEvaluations
);

// ============================================
// MENTOR PROFILE ROUTES
// ============================================

// ============================================
// MENTOR PROFILE ROUTES
// ============================================

/**
 * @route   GET /api/mentorship/profile
 * @desc    Get mentor profile for logged-in user
 * @access  Private (Mentor only)
 */
router.get(
  '/profile',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  mentorshipController.getMentorProfile
);

/**
 * @route   PUT /api/mentorship/profile
 * @desc    Create or update mentor profile
 * @access  Private (Mentor only)
 * @body    bio, skills[], availability, hourlyCapacity
 */
router.put(
  '/profile',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  validate(mentorProfileSchema),
  mentorshipController.updateMentorProfile
);

export default router;
