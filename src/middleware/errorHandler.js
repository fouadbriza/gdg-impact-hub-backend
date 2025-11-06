class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, _req, res, _next) => {
  // Default error response
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error 💥', err);
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const message = err.errors.map(e => e.message).join('. ');
    error = new AppError(`Invalid input data: ${message}`, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(message, 401);
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = new AppError(message, 404);
  }

  // Handle Prisma validation errors
  if (err instanceof Error && err.name.includes('PrismaClient')) {
    const message = 'Database error occurred';
    error = new AppError(message, 400);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 Not Found handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
};

export default errorHandler;
