const env = require('../config/env');

/**
 * Global Error Handler Middleware
 * Centralized error handling for consistent error responses
 */
class ErrorHandler extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = Object.values(err.errors).map(error => error.message).join(', ');
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'ZodError') {
    // Zod validation error
    statusCode = 400;
    message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else if (err.message && (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo') || err.message.includes('MongoNetworkError'))) {
    // MongoDB connection errors
    statusCode = 503;
    message = 'Database connection failed. Please check MongoDB connection string and network access.';
  } else if (err.message && err.message.includes('Database connection')) {
    // Database connection errors from repository
    statusCode = err.statusCode || 503;
    message = err.message;
  }

  // Log error details
  console.error('❌ Error:', {
    statusCode,
    message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  ErrorHandler,
  asyncHandler,
  errorHandler,
  notFoundHandler
};
