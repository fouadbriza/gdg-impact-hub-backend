// src/controllers/mentorship.controller.js
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import mentorshipService from '../services/mentorship.service.js';

class MentorshipController {
  // ============================================
  // MENTORSHIP REQUESTS MANAGEMENT
  // ============================================

  /**
   * Create a new mentorship request
   * POST /api/mentorship/requests
   */
  async createMentorshipRequest(req, res, next) {
    try {
      const { projectId, message } = req.body;
      const userId = req.user.id;

      // Find any available mentor with a mentorship profile
      const mentor = await prisma.user.findFirst({
        where: {
          role: 'MENTOR',
          mentorshipProfile: { isNot: null },
        },
        include: {
          mentorshipProfile: true,
        },
      });

      if (!mentor) {
        throw new AppError('No available mentors found for this project', 404);
      }

      const request = await prisma.mentorshipRequest.create({
        data: {
          project: { connect: { id: projectId } },
          requester: { connect: { id: userId } },
          mentorProfile: { connect: { id: mentor.mentorshipProfile.id } },
          message,
          status: 'PENDING',
        },
        include: {
          project: true,
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mentorProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Mentorship request created successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all mentorship requests for a mentor
   * GET /api/mentorship/requests
   */
  async getMentorRequests(req, res, next) {
    try {
      const mentorId = req.user.id;
      const { status } = req.query;

      const requests = await mentorshipService.getMentorRequests(mentorId, status);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept a mentorship request
   * PUT /api/mentorship/requests/:requestId/accept
   */
  async acceptRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const mentorId = req.user.id;

      const request = await mentorshipService.acceptRequest(requestId, mentorId);

      res.status(200).json({
        success: true,
        message: 'Mentorship request accepted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Decline a mentorship request
   * PUT /api/mentorship/requests/:requestId/decline
   */
  async declineRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const mentorId = req.user.id;
      const { reason } = req.body;

      const request = await mentorshipService.declineRequest(requestId, mentorId, reason);

      res.status(200).json({
        success: true,
        message: 'Mentorship request declined',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get assigned projects for a mentor
   * GET /api/mentorship/assigned-projects
   */
  async getAssignedProjects(req, res, next) {
    try {
      const mentorId = req.user.id;

      const projects = await mentorshipService.getAssignedProjects(mentorId);

      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // MENTORSHIP SESSIONS MANAGEMENT
  // ============================================

  /**
   * Create a new mentorship session
   * POST /api/mentorship/sessions
   */
  async createSession(req, res, next) {
    try {
      const mentorId = req.user.id;
      const sessionData = req.body;

      const session = await mentorshipService.createSession({
        ...sessionData,
        mentorId,
      });

      res.status(201).json({
        success: true,
        message: 'Mentorship session created successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all sessions for a mentor or project
   * GET /api/mentorship/sessions
   */
  async getSessions(req, res, next) {
    try {
      const { projectId, mentorshipRequestId, upcoming } = req.query;
      const userId = req.user.id;

      const sessions = await mentorshipService.getSessions({
        userId,
        projectId,
        mentorshipRequestId,
        upcoming: upcoming === 'true',
      });

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific session by ID
   * GET /api/mentorship/sessions/:sessionId
   */
  async getSessionById(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await mentorshipService.getSessionById(sessionId, userId);

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a mentorship session
   * PUT /api/mentorship/sessions/:sessionId
   */
  async updateSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const mentorId = req.user.id;
      const updateData = req.body;

      const session = await mentorshipService.updateSession(sessionId, mentorId, updateData);

      res.status(200).json({
        success: true,
        message: 'Session updated successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join a mentorship session
   * POST /api/mentorship/sessions/:sessionId/join
   */
  async joinSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await mentorshipService.joinSession(sessionId, userId);

      res.status(200).json({
        success: true,
        message: 'Successfully joined the session',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a mentorship session
   * DELETE /api/mentorship/sessions/:sessionId
   */
  async deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const mentorId = req.user.id;

      await mentorshipService.deleteSession(sessionId, mentorId);

      res.status(200).json({
        success: true,
        message: 'Session deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // FEEDBACK & EVALUATION
  // ============================================

  /**
   * Submit feedback for a mentorship session
   * POST /api/mentorship/sessions/:sessionId/feedback
   */
  async submitSessionFeedback(req, res, next) {
    try {
      const { sessionId } = req.params;
      const mentorId = req.user.id;
      const feedbackData = req.body;

      const feedback = await mentorshipService.submitSessionFeedback(
        sessionId,
        mentorId,
        feedbackData
      );

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit project evaluation
   * POST /api/mentorship/projects/:projectId/evaluation
   */
  async submitProjectEvaluation(req, res, next) {
    try {
      const { projectId } = req.params;
      const mentorId = req.user.id;
      const evaluationData = req.body;

      const evaluation = await mentorshipService.submitProjectEvaluation(
        projectId,
        mentorId,
        evaluationData
      );

      res.status(201).json({
        success: true,
        message: 'Project evaluation submitted successfully',
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all evaluations for a project
   * GET /api/mentorship/projects/:projectId/evaluations
   */
  async getProjectEvaluations(req, res, next) {
    try {
      const { projectId } = req.params;

      const evaluations = await mentorshipService.getProjectEvaluations(projectId);

      res.status(200).json({
        success: true,
        data: evaluations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedback for a specific session
   * GET /api/mentorship/sessions/:sessionId/feedback
   */
  async getSessionFeedback(req, res, next) {
    try {
      const { sessionId } = req.params;

      const feedback = await mentorshipService.getSessionFeedback(sessionId);

      res.status(200).json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update mentor profile
   * PUT /api/mentorship/profile
   */
  async updateMentorProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profileData = req.body;

      const profile = await mentorshipService.updateMentorProfile(userId, profileData);

      res.status(200).json({
        success: true,
        message: 'Mentor profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get mentor profile
   * GET /api/mentorship/profile
   */
  async getMentorProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const profile = await mentorshipService.getMentorProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MentorshipController();
