// src/utils/validationSchemas.js
import Joi from 'joi';

// Configuration de Joi pour les messages d'erreur personnalisés
Joi.objectId = () => Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');


/**
 * Schema for creating a mentorship session
 */
const createSessionSchema = Joi.object({
  mentorshipRequestId: Joi.string().uuid().required()
    .messages({
      'string.uuid': 'Mentorship request ID must be a valid UUID',
      'any.required': 'Mentorship request ID is required'
    }),
  
  projectId: Joi.string().uuid().required()
    .messages({
      'string.uuid': 'Project ID must be a valid UUID',
      'any.required': 'Project ID is required'
    }),
  
  scheduledAt: Joi.date().iso().greater('now').required()
    .messages({
      'date.base': 'Scheduled date must be a valid date',
      'date.greater': 'Scheduled date must be in the future',
      'any.required': 'Scheduled date is required'
    }),
  
  durationMinutes: Joi.number().integer().min(15).max(480).required()
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration cannot exceed 8 hours',
      'any.required': 'Duration is required'
    }),
  
  mode: Joi.string().valid('ONLINE', 'IN_PERSON', 'HYBRID').required()
    .messages({
      'any.only': 'Mode must be ONLINE, IN_PERSON, or HYBRID',
      'any.required': 'Session mode is required'
    }),
  
  location: Joi.string().max(500).optional().allow(null, '')
    .messages({
      'string.max': 'Location cannot exceed 500 characters'
    }),
  
  notes: Joi.string().max(5000).optional().allow(null, '')
    .messages({
      'string.max': 'Notes cannot exceed 5000 characters'
    })
});

/**
 * Schema for updating a mentorship session
 */
const updateSessionSchema = Joi.object({
  scheduledAt: Joi.date().iso().greater('now').optional()
    .messages({
      'date.base': 'Scheduled date must be a valid date',
      'date.greater': 'Scheduled date must be in the future'
    }),
  
  durationMinutes: Joi.number().integer().min(15).max(480).optional()
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration cannot exceed 8 hours'
    }),
  
  mode: Joi.string().valid('ONLINE', 'IN_PERSON', 'HYBRID').optional()
    .messages({
      'any.only': 'Mode must be ONLINE, IN_PERSON, or HYBRID'
    }),
  
  location: Joi.string().max(500).optional().allow(null, ''),
  
  notes: Joi.string().max(5000).optional().allow(null, ''),
  
  recordingUrl: Joi.string().uri().optional().allow(null, '')
    .messages({
      'string.uri': 'Recording URL must be a valid URL'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Schema for session feedback
 */
const feedbackSchema = Joi.object({
  notes: Joi.string().min(10).max(5000).required()
    .messages({
      'string.base': 'Notes must be a string',
      'string.min': 'Notes must be at least 10 characters',
      'string.max': 'Notes cannot exceed 5000 characters',
      'any.required': 'Session notes are required'
    }),
  
  recordingUrl: Joi.string().uri().optional().allow(null, '')
    .messages({
      'string.uri': 'Recording URL must be a valid URL'
    })
});

/**
 * Schema for project evaluation
 */
const evaluationSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional()
    .messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  content: Joi.string().min(50).max(10000).required()
    .messages({
      'string.base': 'Evaluation content must be a string',
      'string.min': 'Evaluation must be at least 50 characters',
      'string.max': 'Evaluation cannot exceed 10000 characters',
      'any.required': 'Evaluation content is required'
    }),
  
  rating: Joi.number().min(1).max(5).optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5'
    })
});

/**
 * Schema for mentor profile
 */
const mentorProfileSchema = Joi.object({
  bio: Joi.string().min(50).max(2000).required()
    .messages({
      'string.base': 'Bio must be a string',
      'string.min': 'Bio must be at least 50 characters',
      'string.max': 'Bio cannot exceed 2000 characters',
      'any.required': 'Bio is required'
    }),
  
  skills: Joi.array().items(Joi.string().max(50)).min(1).max(20).required()
    .messages({
      'array.base': 'Skills must be an array',
      'array.min': 'At least one skill is required',
      'array.max': 'Cannot exceed 20 skills',
      'any.required': 'Skills are required'
    }),
  
  availability: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Availability must be a boolean'
    }),
  
  hourlyCapacity: Joi.number().integer().min(1).max(40).optional()
    .messages({
      'number.base': 'Hourly capacity must be a number',
      'number.min': 'Hourly capacity must be at least 1',
      'number.max': 'Hourly capacity cannot exceed 40'
    })
});

/**
 * Schema for declining a mentorship request
 */
const declineRequestSchema = Joi.object({
  reason: Joi.string().max(500).optional().allow(null, '')
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    })
});

export {
  createSessionSchema,
  updateSessionSchema,
  feedbackSchema,
  evaluationSchema,
  mentorProfileSchema,
  declineRequestSchema
};

export default {
  createSessionSchema,
  updateSessionSchema,
  feedbackSchema,
  evaluationSchema,
  mentorProfileSchema,
  declineRequestSchema
};