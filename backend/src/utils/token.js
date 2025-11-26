const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Token Utilities
 * Handles JWT token generation and verification
 */
class TokenUtil {
  /**
   * Generate JWT Access Token
   * @param {Object} payload - Token payload (userId, email, roles)
   * @returns {string} - JWT access token
   */
  static generateAccessToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || []
      };

      const token = jwt.sign(
        tokenPayload,
        env.JWT_ACCESS_SECRET,
        {
          expiresIn: env.JWT_ACCESS_EXPIRY, // 15 minutes
          issuer: 'career-master-api',
          audience: 'career-master-client'
        }
      );

      return token;
    } catch (error) {
      throw new Error(`Error generating access token: ${error.message}`);
    }
  }

  /**
   * Generate JWT Refresh Token
   * @param {Object} payload - Token payload (userId, email)
   * @returns {string} - JWT refresh token
   */
  static generateRefreshToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        type: 'refresh'
      };

      const token = jwt.sign(
        tokenPayload,
        env.JWT_REFRESH_SECRET,
        {
          expiresIn: env.JWT_REFRESH_EXPIRY, // 7 days
          issuer: 'career-master-api',
          audience: 'career-master-client'
        }
      );

      return token;
    } catch (error) {
      throw new Error(`Error generating refresh token: ${error.message}`);
    }
  }

  /**
   * Verify JWT Access Token
   * @param {string} token - JWT access token
   * @returns {Object} - Decoded token payload
   * @throws {Error} - If token is invalid or expired
   */
  static verifyAccessToken(token) {
    try {
      if (!token) {
        throw new Error('Access token is required');
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: 'career-master-api',
        audience: 'career-master-client'
      });

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      } else {
        throw new Error(`Error verifying access token: ${error.message}`);
      }
    }
  }

  /**
   * Verify JWT Refresh Token
   * @param {string} token - JWT refresh token
   * @returns {Object} - Decoded token payload
   * @throws {Error} - If token is invalid or expired
   */
  static verifyRefreshToken(token) {
    try {
      if (!token) {
        throw new Error('Refresh token is required');
      }

      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        issuer: 'career-master-api',
        audience: 'career-master-client'
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error(`Error verifying refresh token: ${error.message}`);
      }
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header (format: "Bearer <token>")
   * @returns {string|null} - Extracted token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload (unverified)
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error(`Error decoding token: ${error.message}`);
    }
  }
}

module.exports = TokenUtil;
