// src/middleware/errorHandler.js

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error) => {
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return new AppError(`${field} already exists`, 409);
  }

  if (error.code === 'P2025') {
    return new AppError('Record not found', 404);
  }

  if (error.code === 'P2003') {
    return new AppError('Related record not found', 400);
  }

  if (error.code === 'P2014') {
    return new AppError('Invalid ID provided', 400);
  }

  return new AppError('Database error occurred', 500);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode
  });

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    error = handlePrismaError(err);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = new AppError('Validation failed', 400, errors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      ...(error.errors && { errors: error.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

export { errorHandler, notFound };
export default { errorHandler, notFound };