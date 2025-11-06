// src/services/mentorship.service.js
import prisma from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

class MentorshipService {
  // ============================================
  // MENTORSHIP REQUESTS
  // ============================================

  async getMentorRequests(mentorId, status) {
    // First, get the mentor profile
    const mentorProfile = await prisma.mentorshipProfile.findUnique({
      where: { userId: mentorId }
    });

    if (!mentorProfile) {
      throw new AppError('Mentor profile not found', 404);
    }

    const whereClause = {
      mentorProfileId: mentorProfile.id
    };

    if (status) {
      whereClause.status = status;
    }

    const requests = await prisma.mentorshipRequest.findMany({
      where: whereClause,
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        mentorProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return requests;
  }

  async acceptRequest(requestId, mentorId) {
    const mentorProfile = await prisma.mentorshipProfile.findUnique({
      where: { userId: mentorId }
    });

    if (!mentorProfile) {
      throw new AppError('Mentor profile not found', 404);
    }

    const request = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: {
        project: true,
        requester: true
      }
    });

    if (!request) {
      throw new AppError('Mentorship request not found', 404);
    }

    if (request.mentorProfileId !== mentorProfile.id) {
      throw new AppError('Unauthorized to accept this request', 403);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Request has already been processed', 400);
    }

    const updatedRequest = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        updatedAt: new Date()
      },
      include: {
        project: true,
        requester: true,
        mentorProfile: {
          include: {
            user: true
          }
        }
      }
    });

    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: request.requestedBy,
        type: 'MENTOR_JOINED',
        message: `Your mentorship request for project "${request.project.title}" has been accepted!`,
        link: `/projects/${request.projectId}`
      }
    });

    return updatedRequest;
  }

  async declineRequest(requestId, mentorId, reason) {
    const mentorProfile = await prisma.mentorshipProfile.findUnique({
      where: { userId: mentorId }
    });

    if (!mentorProfile) {
      throw new AppError('Mentor profile not found', 404);
    }

    const request = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: {
        project: true
      }
    });

    if (!request) {
      throw new AppError('Mentorship request not found', 404);
    }

    if (request.mentorProfileId !== mentorProfile.id) {
      throw new AppError('Unauthorized to decline this request', 403);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Request has already been processed', 400);
    }

    const updatedRequest = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        updatedAt: new Date()
      },
      include: {
        project: true,
        requester: true,
        mentorProfile: {
          include: {
            user: true
          }
        }
      }
    });

    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: request.requestedBy,
        type: 'MENTOR_REQUEST',
        message: `Your mentorship request for project "${request.project.title}" was declined${reason ? ': ' + reason : ''}`,
        link: `/projects/${request.projectId}`
      }
    });

    return updatedRequest;
  }

  async getAssignedProjects(mentorId) {
    const mentorProfile = await prisma.mentorshipProfile.findUnique({
      where: { userId: mentorId }
    });

    if (!mentorProfile) {
      throw new AppError('Mentor profile not found', 404);
    }

    const acceptedRequests = await prisma.mentorshipRequest.findMany({
      where: {
        mentorProfileId: mentorProfile.id,
        status: 'ACCEPTED'
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            },
            teamMembers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                  }
                }
              }
            },
            _count: {
              select: {
                votes: true,
                updates: true
              }
            }
          }
        },
        sessions: {
          orderBy: {
            scheduledAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return acceptedRequests.map(req => ({
      ...req.project,
      mentorshipRequest: {
        id: req.id,
        status: req.status,
        message: req.message,
        createdAt: req.createdAt
      },
      recentSessions: req.sessions
    }));
  }

  // ============================================
  // MENTORSHIP SESSIONS
  // ============================================

  async createSession(sessionData) {
    const {
      mentorshipRequestId,
      projectId,
      mentorId,
      scheduledAt,
      durationMinutes,
      mode,
      location,
      notes
    } = sessionData;

    // Validate mentorship request
    const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
      where: { id: mentorshipRequestId },
      include: {
        mentorProfile: true
      }
    });

    if (!mentorshipRequest) {
      throw new AppError('Mentorship request not found', 404);
    }

    if (mentorshipRequest.mentorProfile.userId !== mentorId) {
      throw new AppError('Unauthorized to create session for this mentorship', 403);
    }

    if (mentorshipRequest.status !== 'ACCEPTED') {
      throw new AppError('Mentorship request must be accepted first', 400);
    }

    // Create session
    const session = await prisma.mentorshipSession.create({
      data: {
        mentorshipRequestId,
        projectId,
        mentorId,
        scheduledAt: new Date(scheduledAt),
        durationMinutes,
        mode,
        location,
        notes
      },
      include: {
        mentorshipRequest: {
          include: {
            project: true,
            requester: true
          }
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: {
          include: {
            owner: true
          }
        }
      }
    });

    // Notify project owner
    await prisma.notification.create({
      data: {
        userId: session.project.ownerId,
        type: 'GENERAL',
        message: `A new mentorship session has been scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
        link: `/projects/${projectId}/mentorship`
      }
    });

    return session;
  }

  async getSessions(filters) {
    const { userId, projectId, mentorshipRequestId, upcoming } = filters;

    const whereClause = {};

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (mentorshipRequestId) {
      whereClause.mentorshipRequestId = mentorshipRequestId;
    }

    if (userId) {
      whereClause.OR = [
        { mentorId: userId },
        {
          project: {
            ownerId: userId
          }
        }
      ];
    }

    if (upcoming) {
      whereClause.scheduledAt = {
        gte: new Date()
      };
    }

    const sessions = await prisma.mentorshipSession.findMany({
      where: whereClause,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        mentorshipRequest: true
      },
      orderBy: {
        scheduledAt: upcoming ? 'asc' : 'desc'
      }
    });

    return sessions;
  }

  async getSessionById(sessionId, userId) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        mentorshipRequest: {
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Check if user has access
    const hasAccess = 
      session.mentorId === userId || 
      session.project.ownerId === userId ||
      session.mentorshipRequest.requestedBy === userId;

    if (!hasAccess) {
      throw new AppError('Unauthorized to view this session', 403);
    }

    return session;
  }

  async updateSession(sessionId, mentorId, updateData) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.mentorId !== mentorId) {
      throw new AppError('Only the mentor can update this session', 403);
    }

    const updatedSession = await prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: {
        ...updateData,
        scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : undefined,
        updatedAt: new Date()
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: true,
        mentorshipRequest: true
      }
    });

    return updatedSession;
  }

  async joinSession(sessionId, userId) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        project: true,
        mentorshipRequest: true
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Check if user is authorized to join
    const canJoin = 
      session.mentorId === userId ||
      session.project.ownerId === userId ||
      session.mentorshipRequest.requestedBy === userId;

    if (!canJoin) {
      throw new AppError('Unauthorized to join this session', 403);
    }

    // Check if session is in the future or happening now
    const now = new Date();
    const sessionEnd = new Date(session.scheduledAt.getTime() + session.durationMinutes * 60000);

    if (now > sessionEnd) {
      throw new AppError('This session has already ended', 400);
    }

    return session;
  }

  async deleteSession(sessionId, mentorId) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.mentorId !== mentorId) {
      throw new AppError('Only the mentor can delete this session', 403);
    }

    await prisma.mentorshipSession.delete({
      where: { id: sessionId }
    });

    return true;
  }

  // ============================================
  // FEEDBACK & EVALUATION
  // ============================================

  async submitSessionFeedback(sessionId, mentorId, feedbackData) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        project: true
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.mentorId !== mentorId) {
      throw new AppError('Only the session mentor can submit feedback', 403);
    }

    const { notes, recordingUrl } = feedbackData;

    const updatedSession = await prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: {
        notes,
        recordingUrl,
        updatedAt: new Date()
      },
      include: {
        mentor: true,
        project: true
      }
    });

    // Notify project owner
    await prisma.notification.create({
      data: {
        userId: session.project.ownerId,
        type: 'GENERAL',
        message: `Feedback has been added to your mentorship session`,
        link: `/projects/${session.projectId}/mentorship/sessions/${sessionId}`
      }
    });

    return updatedSession;
  }

  async submitProjectEvaluation(projectId, mentorId, evaluationData) {
    // Verify mentor has an active mentorship for this project
    const mentorProfile = await prisma.mentorshipProfile.findUnique({
      where: { userId: mentorId }
    });

    if (!mentorProfile) {
      throw new AppError('Mentor profile not found', 404);
    }

    const mentorshipRequest = await prisma.mentorshipRequest.findFirst({
      where: {
        projectId,
        mentorProfileId: mentorProfile.id,
        status: 'ACCEPTED'
      }
    });

    if (!mentorshipRequest) {
      throw new AppError('No active mentorship found for this project', 403);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const { title, content, rating } = evaluationData;

    // Create project update as evaluation
    const evaluation = await prisma.projectUpdate.create({
      data: {
        projectId,
        authorId: mentorId,
        title: title || 'Mentor Evaluation',
        content: content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true
          }
        },
        project: true
      }
    });

    // Update mentor rating if provided
    if (rating !== undefined) {
      const currentRating = mentorProfile.rating;
      const sessions = await prisma.mentorshipSession.count({
        where: { mentorId }
      });
      
      const newRating = ((currentRating * sessions) + rating) / (sessions + 1);

      await prisma.mentorshipProfile.update({
        where: { id: mentorProfile.id },
        data: {
          rating: newRating
        }
      });
    }

    // Notify project owner
    await prisma.notification.create({
      data: {
        userId: project.ownerId,
        type: 'PROJECT_UPDATE',
        message: `Your mentor has submitted an evaluation for "${project.title}"`,
        link: `/projects/${projectId}/updates`
      }
    });

    return evaluation;
  }

  async getProjectEvaluations(projectId) {
    const evaluations = await prisma.projectUpdate.findMany({
      where: {
        projectId,
        author: {
          role: 'MENTOR'
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return evaluations;
  }

  async getSessionFeedback(sessionId) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    return {
      sessionId: session.id,
      notes: session.notes,
      recordingUrl: session.recordingUrl,
      mentor: session.mentor,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      updatedAt: session.updatedAt
    };
  }

  // ============================================
  // MENTOR PROFILE
  // ============================================

  async updateMentorProfile(userId, profileData) {
    const { bio, skills, availability, hourlyCapacity } = profileData;

    const profile = await prisma.mentorshipProfile.upsert({
      where: { userId },
      update: {
        bio,
        skills,
        availability,
        hourlyCapacity,
        updatedAt: new Date()
      },
      create: {
        userId,
        bio,
        skills,
        availability: availability !== undefined ? availability : true,
        hourlyCapacity: hourlyCapacity || 5
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true
          }
        }
      }
    });

    return profile;
  }

  async getMentorProfile(userId) {
    const profile = await prisma.mentorshipProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            githubHandle: true,
            linkedinUrl: true
          }
        },
        _count: {
          select: {
            mentorshipRequests: {
              where: {
                status: 'ACCEPTED'
              }
            }
          }
        }
      }
    });

    if (!profile) {
      throw new AppError('Mentor profile not found', 404);
    }

    // Get total sessions count
    const sessionsCount = await prisma.mentorshipSession.count({
      where: { mentorId: userId }
    });

    return {
      ...profile,
      totalSessions: sessionsCount,
      activeMentorships: profile._count.mentorshipRequests
    };
  }
}

export default new MentorshipService();