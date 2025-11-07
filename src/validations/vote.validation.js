/**
 * Vote Validation Schemas
 */

import { z } from 'zod';

export const voteParamsSchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
});
