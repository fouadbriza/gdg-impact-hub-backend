/**
 * Central Export Point for All Validation Schemas
 *
 * Import validation schemas from this file throughout the application.
 * This provides a single source of truth and makes refactoring easier.
 *
 * @example
 * import { createProjectSchema, updateUserSchema } from '../validations/index.js';
 */

// User validations
export { updateUserSchema } from './user.validation.js';

// Project validations
export {
  createProjectSchema,
  updateProjectSchema,
  addTeamMemberSchema,
  projectSearchSchema,
} from './project.validation.js';

// Announcement validations
export { createAnnouncementSchema, updateAnnouncementSchema } from './announcement.validation.js';

// Vote validations
export { voteParamsSchema } from './vote.validation.js';

// Highlight validations
export { featureProjectSchema } from './highlight.validation.js';

// Mentorship validations
export {
  createMentorshipRequestSchema,
  declineRequestSchema,
  createSessionSchema,
  updateSessionSchema,
  feedbackSchema,
  evaluationSchema,
  mentorProfileSchema,
} from './mentorship.validation.js';

// Auth validations
export { registerSchema, loginSchema } from './auth.validation.js';

// Common validations
export { paginationSchema, uuidParamSchema } from './common.validation.js';
