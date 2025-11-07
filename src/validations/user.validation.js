/**
 * User Validation Schemas
 */

import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').optional(),
  linkedinUrl: z.string().url('LinkedIn URL must be a valid URL').optional(),
  githubHandle: z
    .string()
    .regex(
      /^([A-Za-z0-9_-]+)$/,
      'GitHub handle must contain only letters, numbers, hyphens, and underscores'
    )
    .optional(),
});
