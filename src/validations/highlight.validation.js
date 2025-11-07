/**
 * Highlight Validation Schemas
 */

import { z } from 'zod';

export const featureProjectSchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID').optional(), // Optional because it comes from params
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
  expiresAt: z
    .string()
    .datetime('Expiration date must be a valid ISO datetime')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Expiration date must be in the future',
    })
    .optional(),
});
