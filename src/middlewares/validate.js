import { AppError } from '../middlewares/error.js';

/**
 * Validate request data against a Zod schema
 * @param {Object} schema - Zod schema object
 * @param {String} source - Where to validate: 'body', 'query', 'params'
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new AppError('Validation failed', 400, errors);
      }

      // Replace with validated data
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate request body
 * @param {Object} schema - Zod schema
 */
export const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate query parameters
 * @param {Object} schema - Zod schema
 */
export const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate URL parameters
 * @param {Object} schema - Zod schema
 */
export const validateParams = (schema) => validate(schema, 'params');

export default { validate, validateBody, validateQuery, validateParams };
