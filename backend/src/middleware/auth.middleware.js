const TokenUtil = require('../utils/token');
const User = require('../user/users.model');
const { ErrorHandler } = require('./errorHandler');

/**
 * Authentication Middleware
 * Validates JWT access token and attaches user to request
 */

/**
 * Verify JWT access token and authenticate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = TokenUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new ErrorHandler(401, 'Access token is required');
    }

    // Verify token
    let decoded;
    try {
      decoded = TokenUtil.verifyAccessToken(token);
    } catch (error) {
      throw new ErrorHandler(401, error.message);
    }

    // Fetch user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      throw new ErrorHandler(401, 'User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new ErrorHandler(403, 'Account is banned or inactive');
    }

    // Check if email is verified
    if (!user.verification.emailVerified) {
      throw new ErrorHandler(403, 'Email not verified. Please verify your email first.');
    }

    // Attach user to request object
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      roles: user.roles,
      status: user.status
    };

    // Attach original decoded token for additional info if needed
    req.token = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't throw error if token is missing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      return next(); // Continue without user
    }

    // Try to verify and attach user
    try {
      const decoded = TokenUtil.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (user && user.status === 'active' && user.verification.emailVerified) {
        req.user = {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
          status: user.status
        };
        req.token = decoded;
      }
    } catch (error) {
      // Ignore errors and continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
