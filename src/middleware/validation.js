// Validation middleware using Joi
// src/middleware/validation.js
import Joi from 'joi';
import { AppError } from './errorHandler.js';

/**
 * Convert validation rules to Joi schema
 */
const convertToJoiSchema = (rules) => {
  if (!rules) {
    throw new Error('Validation rules are required');
  }

  let joiSchema = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    if (typeof rule === 'string') {
      const rules = rule.split('|');
      let fieldSchema = Joi.string();
      
      for (const r of rules) {
        const [ruleName, ...params] = r.split(':');
        switch (ruleName) {
          case 'required':
            fieldSchema = fieldSchema.required();
            break;
          case 'email':
            fieldSchema = fieldSchema.email();
            break;
          case 'min':
            fieldSchema = fieldSchema.min(parseInt(params[0], 10));
            break;
          case 'in':
            fieldSchema = fieldSchema.valid(...params[0].split(','));
            break;
          case 'optional':
            fieldSchema = fieldSchema.optional();
            break;
          default:
            break;
        }
      }
      
      joiSchema[field] = fieldSchema;
    }
  }
  
  return Joi.object(joiSchema);
};

/**
 * Middleware to validate request body against schema
 * @param {Object} schema - Validation schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // If schema is already a Joi schema, use it directly
      if (Joi.isSchema(schema)) {
        const { error, value } = schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/['"]/g, '')
          }));
          return next(new AppError('Validation failed', 400, errors));
        }

        req.body = value;
        return next();
      }
      
      // If schema has a 'body' property, it's a request schema
      if (schema.body) {
        const joiSchema = convertToJoiSchema(schema.body);
        const { error, value } = joiSchema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/['"]/g, '')
          }));
          return next(new AppError('Validation failed', 400, errors));
        }

        req.body = value;
        return next();
      }
      
      // If it's a direct object schema
      const joiSchema = Joi.object(schema);
      const { error, value } = joiSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/['"]/g, '')
        }));
        return next(new AppError('Validation failed', 400, errors));
      }

      req.body = value;
      next();
    } catch (error) {
      next(new AppError(`Validation error: ${error.message}`, 400));
    }
  };
};

/**
 * Middleware to validate query parameters
 * @param {Object} schema - Joi validation schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new AppError('Query validation failed', 400, errors));
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware to validate URL parameters
 * @param {Object} schema - Joi validation schema
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new AppError('Parameter validation failed', 400, errors));
    }

    req.params = value;
    next();
  };
};

export { validateRequest, validateQuery, validateParams };
export default { validateRequest, validateQuery, validateParams };