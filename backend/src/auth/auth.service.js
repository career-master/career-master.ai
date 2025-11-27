const AuthRepository = require('./auth.repository');
const CryptoUtil = require('../utils/crypto');
const TokenUtil = require('../utils/token');
const EmailUtil = require('../utils/email');
const env = require('../config/env');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Auth Service
 * Business logic for authentication module
 * No database queries here - uses repository layer
 */
class AuthService {
  /**
   * Send signup OTP to user email
   * @param {string} email - User email
   * @param {string} ip - Request IP address
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} - Success response
   */
  static async sendSignupOTP(email, ip, userAgent) {
    try {
      // Check if user already exists
      const existingUser = await AuthRepository.findUserByEmail(email);
      if (existingUser) {
        throw new ErrorHandler(409, 'User with this email already exists');
      }

      // Generate OTP
      const otp = CryptoUtil.generateOTP();

      // Calculate OTP expiry (10 minutes)
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + env.OTP_EXPIRY_MINUTES);

      // Save OTP log
      await AuthRepository.saveOtpLog({
        email,
        otp,
        purpose: 'signup',
        ip,
        userAgent,
        expiresAt: otpExpiry
      });

      // Send OTP email
      await EmailUtil.sendOTPEmail(email, otp, 'signup');

      return {
        success: true,
        message: 'OTP sent to email successfully',
        expiresIn: env.OTP_EXPIRY_MINUTES * 60 // seconds
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error sending signup OTP: ${error.message}`);
    }
  }

  /**
   * Verify signup OTP and create user
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} name - User name
   * @param {string} password - User password
   * @param {string} phone - User phone number (optional)
   * @param {string} ip - Request IP address
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} - Success response with user data
   */
  static async verifySignupOTP(email, otp, name, password, phone, ip, userAgent) {
    try {
      // Find valid OTP log
      const otpLog = await AuthRepository.findValidOtpLog(email, 'signup');

      if (!otpLog) {
        throw new ErrorHandler(400, 'Invalid or expired OTP');
      }

      // Verify OTP
      if (otpLog.otp !== otp) {
        throw new ErrorHandler(400, 'Invalid OTP');
      }

      // Check if user already exists (race condition protection)
      const existingUser = await AuthRepository.findUserByEmail(email);
      if (existingUser) {
        throw new ErrorHandler(409, 'User already exists');
      }

      // Hash password
      const passwordHash = await CryptoUtil.hashPassword(password);

      // Calculate OTP expiry
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + env.OTP_EXPIRY_MINUTES);

      // Create user with email verified
      const user = await AuthRepository.createUser({
        name,
        email,
        passwordHash,
        phone,
        roles: ['student'], // Default role
        otp,
        otpExpiry
      });

      // Mark email as verified
      await AuthRepository.updateEmailVerification(user._id, true);

      // Mark OTP log as verified
      await AuthRepository.markOtpLogAsVerified(otpLog._id);

      // Send welcome email (non-blocking)
      EmailUtil.sendWelcomeEmail(email, name).catch(err =>
        console.error('Error sending welcome email:', err)
      );

      // Remove sensitive data
      const userResponse = user.toJSON();

      return {
        success: true,
        message: 'Account created successfully',
        user: userResponse
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error verifying signup OTP: ${error.message}`);
    }
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} ip - Request IP address
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} - Success response with tokens and user data
   */
  static async login(email, password, ip, userAgent) {
    try {
      // Find user with password hash
      const user = await AuthRepository.findUserByEmailWithPassword(email);

      if (!user) {
        throw new ErrorHandler(401, 'Invalid email or password');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new ErrorHandler(403, 'Account is banned or inactive');
      }

      // Check if email is verified
      if (!user.verification.emailVerified) {
        throw new ErrorHandler(403, 'Email not verified. Please verify your email first.');
      }

      // Verify password
      const isPasswordValid = await CryptoUtil.comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new ErrorHandler(401, 'Invalid email or password');
      }

      // Generate tokens
      const accessToken = TokenUtil.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        roles: user.roles
      });

      const refreshToken = TokenUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email
      });

      // Calculate refresh token expiry (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Save session
      await AuthRepository.createSession({
        userId: user._id,
        refreshToken,
        userAgent,
        ip,
        expiresAt
      });

      // Remove sensitive data
      const userResponse = user.toJSON();

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 // 15 minutes in seconds
          }
        }
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error during login: ${error.message}`);
    }
  }

  /**
   * Regenerate access and refresh tokens using refresh token
   * @param {string} refreshToken - Refresh token
   * @param {string} ip - Request IP address
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} - Success response with new tokens
   */
  static async regenerateTokens(refreshToken, ip, userAgent) {
    try {
      // Verify refresh token
      let decoded;
      try {
        decoded = TokenUtil.verifyRefreshToken(refreshToken);
      } catch (error) {
        throw new ErrorHandler(401, 'Invalid or expired refresh token');
      }

      // Check if session exists and is valid
      const session = await AuthRepository.findSessionByRefreshToken(refreshToken);

      if (!session) {
        throw new ErrorHandler(401, 'Session not found or expired');
      }

      // Find user
      const user = await AuthRepository.findUserById(decoded.userId);

      if (!user || user.status !== 'active') {
        throw new ErrorHandler(401, 'User not found or inactive');
      }

      // Generate new tokens
      const newAccessToken = TokenUtil.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        roles: user.roles
      });

      const newRefreshToken = TokenUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email
      });

      // Delete old session
      await AuthRepository.deleteSessionByRefreshToken(refreshToken);

      // Calculate new refresh token expiry (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create new session
      await AuthRepository.createSession({
        userId: user._id,
        refreshToken: newRefreshToken,
        userAgent,
        ip,
        expiresAt
      });

      return {
        success: true,
        message: 'Tokens regenerated successfully',
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 15 * 60 // 15 minutes in seconds
          }
        }
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error regenerating tokens: ${error.message}`);
    }
  }

  /**
   * Send forgot password OTP
   * @param {string} email - User email
   * @param {string} ip - Request IP address
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} - Success response
   */
  static async forgotPassword(email, ip, userAgent) {
    try {
      // Check if user exists
      const user = await AuthRepository.findUserByEmail(email);

      if (!user) {
        // Don't reveal that user doesn't exist (security best practice)
        return {
          success: true,
          message: 'If the email exists, an OTP has been sent'
        };
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new ErrorHandler(403, 'Account is banned or inactive');
      }

      // Generate OTP
      const otp = CryptoUtil.generateOTP();

      // Calculate OTP expiry (10 minutes)
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + env.OTP_EXPIRY_MINUTES);

      // Save OTP log
      await AuthRepository.saveOtpLog({
        email,
        otp,
        purpose: 'forgot_password',
        ip,
        userAgent,
        expiresAt: otpExpiry
      });

      // Send OTP email
      await EmailUtil.sendOTPEmail(email, otp, 'forgot_password');

      return {
        success: true,
        message: 'If the email exists, an OTP has been sent',
        expiresIn: env.OTP_EXPIRY_MINUTES * 60 // seconds
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error sending forgot password OTP: ${error.message}`);
    }
  }

  /**
   * Reset password after verifying OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} newPassword - New password
   * @param {string} ip - Request IP address
   * @returns {Promise<Object>} - Success response
   */
  static async resetPassword(email, otp, newPassword, ip) {
    try {
      // Find valid OTP log
      const otpLog = await AuthRepository.findValidOtpLog(email, 'forgot_password');

      if (!otpLog) {
        throw new ErrorHandler(400, 'Invalid or expired OTP');
      }

      // Verify OTP
      if (otpLog.otp !== otp) {
        throw new ErrorHandler(400, 'Invalid OTP');
      }

      // Find user
      const user = await AuthRepository.findUserByEmail(email);

      if (!user) {
        throw new ErrorHandler(404, 'User not found');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new ErrorHandler(403, 'Account is banned or inactive');
      }

      // Hash new password
      const passwordHash = await CryptoUtil.hashPassword(newPassword);

      // Update user password
      await AuthRepository.updateUserPassword(user._id, passwordHash);

      // Mark OTP log as verified
      await AuthRepository.markOtpLogAsVerified(otpLog._id);

      // Send password change notification (non-blocking)
      EmailUtil.sendPasswordChangeNotification(email, user.name).catch(err =>
        console.error('Error sending password change notification:', err)
      );

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error resetting password: ${error.message}`);
    }
  }

  /**
   * Change password for authenticated user
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Success response
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user with password hash
      const user = await AuthRepository.findUserByIdWithPassword(userId);

      if (!user) {
        throw new ErrorHandler(404, 'User not found');
      }

      // Verify current password
      const isPasswordValid = await CryptoUtil.comparePassword(
        currentPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new ErrorHandler(400, 'Current password is incorrect');
      }

      // Check if new password is different
      const isSamePassword = await CryptoUtil.comparePassword(
        newPassword,
        user.passwordHash
      );

      if (isSamePassword) {
        throw new ErrorHandler(400, 'New password must be different from current password');
      }

      // Hash new password
      const passwordHash = await CryptoUtil.hashPassword(newPassword);

      // Update user password
      await AuthRepository.updateUserPassword(user._id, passwordHash);

      // Send password change notification (non-blocking)
      EmailUtil.sendPasswordChangeNotification(user.email, user.name).catch(err =>
        console.error('Error sending password change notification:', err)
      );

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error changing password: ${error.message}`);
    }
  }

  /**
   * Logout user (single device)
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - Success response
   */
  static async logout(refreshToken) {
    try {
      // Delete session
      const deleted = await AuthRepository.deleteSessionByRefreshToken(refreshToken);

      if (!deleted) {
        throw new ErrorHandler(404, 'Session not found');
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error during logout: ${error.message}`);
    }
  }

  /**
   * Logout user from all devices
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Success response
   */
  static async logoutAllDevices(userId) {
    try {
      // Delete all sessions for user
      const deletedCount = await AuthRepository.deleteSessionsByUserId(userId);

      return {
        success: true,
        message: 'Logged out from all devices successfully',
        devicesLoggedOut: deletedCount
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error during logout all: ${error.message}`);
    }
  }
}

module.exports = AuthService;
