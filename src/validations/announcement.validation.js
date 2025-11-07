/**
 * Announcement Validation Schemas
 */

import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

export const updateAnnouncementSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').optional(),
});
