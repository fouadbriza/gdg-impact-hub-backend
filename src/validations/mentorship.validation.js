/**
 * Mentorship Validation Schemas
 * Includes validation for mentorship requests, sessions, feedback, and evaluations
 */

import { z } from 'zod';

// ============================================
// MENTORSHIP REQUEST SCHEMAS
// ============================================

export const createMentorshipRequestSchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

export const declineRequestSchema = z.object({
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional().nullable(),
});

// ============================================
// MENTORSHIP SESSION SCHEMAS
// ============================================

export const createSessionSchema = z.object({
  mentorshipRequestId: z.string().uuid('Mentorship request ID must be a valid UUID'),
  projectId: z.string().uuid('Project ID must be a valid UUID'),
  scheduledAt: z
    .string()
    .datetime('Scheduled date must be a valid ISO datetime')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Scheduled date must be in the future',
    }),
  durationMinutes: z
    .number()
    .int('Duration must be an integer')
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  mode: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID'], {
    errorMap: () => ({ message: 'Mode must be ONLINE, IN_PERSON, or HYBRID' }),
  }),
  location: z.string().max(500, 'Location cannot exceed 500 characters').optional().nullable(),
  notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional().nullable(),
});

export const updateSessionSchema = z
  .object({
    scheduledAt: z
      .string()
      .datetime('Scheduled date must be a valid ISO datetime')
      .refine((date) => new Date(date) > new Date(), {
        message: 'Scheduled date must be in the future',
      })
      .optional(),
    durationMinutes: z
      .number()
      .int('Duration must be an integer')
      .min(15, 'Duration must be at least 15 minutes')
      .max(480, 'Duration cannot exceed 8 hours')
      .optional(),
    mode: z
      .enum(['ONLINE', 'IN_PERSON', 'HYBRID'], {
        errorMap: () => ({ message: 'Mode must be ONLINE, IN_PERSON, or HYBRID' }),
      })
      .optional(),
    location: z.string().max(500, 'Location cannot exceed 500 characters').optional().nullable(),
    notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional().nullable(),
    recordingUrl: z.string().url('Recording URL must be a valid URL').optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const feedbackSchema = z.object({
  notes: z
    .string()
    .min(10, 'Notes must be at least 10 characters')
    .max(5000, 'Notes cannot exceed 5000 characters'),
  recordingUrl: z.string().url('Recording URL must be a valid URL').optional().nullable(),
});

// ============================================
// PROJECT EVALUATION SCHEMAS
// ============================================

export const evaluationSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  content: z
    .string()
    .min(50, 'Evaluation must be at least 50 characters')
    .max(10000, 'Evaluation cannot exceed 10000 characters'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
});

// ============================================
// MENTOR PROFILE SCHEMAS
// ============================================

export const mentorProfileSchema = z.object({
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(2000, 'Bio cannot exceed 2000 characters'),
  skills: z
    .array(z.string().max(50, 'Each skill cannot exceed 50 characters'))
    .min(1, 'At least one skill is required')
    .max(20, 'Cannot exceed 20 skills'),
  availability: z
    .boolean({
      errorMap: () => ({ message: 'Availability must be a boolean' }),
    })
    .optional(),
  hourlyCapacity: z
    .number()
    .int('Hourly capacity must be an integer')
    .min(1, 'Hourly capacity must be at least 1')
    .max(40, 'Hourly capacity cannot exceed 40')
    .optional(),
});
