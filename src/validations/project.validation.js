/**
 * Project Validation Schemas
 */

import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  shortDesc: z
    .string()
    .min(10, 'Short description must be at least 10 characters')
    .max(500, 'Short description cannot exceed 500 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  impactArea: z.string().min(2, 'Impact area must be at least 2 characters'),
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  shortDesc: z
    .string()
    .min(10, 'Short description must be at least 10 characters')
    .max(500, 'Short description cannot exceed 500 characters')
    .optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').optional(),
  category: z.string().min(2, 'Category must be at least 2 characters').optional(),
  impactArea: z.string().min(2, 'Impact area must be at least 2 characters').optional(),
  status: z
    .enum(['IDEA', 'PROTOTYPE', 'LIVE', 'ARCHIVED'], {
      errorMap: () => ({ message: 'Status must be one of: IDEA, PROTOTYPE, LIVE, ARCHIVED' }),
    })
    .optional(),
});

export const addTeamMemberSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
  role: z.string().optional(),
});

export const projectSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').optional(),
  category: z.string().optional(),
  impactArea: z.string().optional(),
  status: z.enum(['IDEA', 'PROTOTYPE', 'LIVE', 'ARCHIVED']).optional(),
});
