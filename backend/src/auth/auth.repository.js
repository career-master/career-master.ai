const User = require('../user/users.model');
const Session = require('../sessions/sessions.model');
const OtpLog = require('../otp/otp_logs.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Auth Repository
 * Database operations for authentication module
 * Pure database queries - no business logic
 */
class AuthRepository {
  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Include password hash in result
   * @returns {Promise<Object|null>} - User document or null
   */
  static async findUserByEmail(email, includePassword = false) {
    try {
      const selectFields = includePassword ? '' : '-passwordHash';
      const user = await User.findOne({ email: email.toLowerCase() }).select(selectFields);
      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find user by email with password hash (for login)
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User document with password hash or null
   */
  static async findUserByEmailWithPassword(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+passwordHash')
        .select('+verification.otp')
        .select('+verification.otpExpiry');
      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding user with password: ${error.message}`);
    }
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - User document or null
   */
  static async findUserById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding user by ID: ${error.message}`);
    }
  }

  /**
   * Find user by ID with password hash (for password verification)
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - User document with password hash or null
   */
  static async findUserByIdWithPassword(userId) {
    try {
      const user = await User.findById(userId)
        .select('+passwordHash');
      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding user by ID with password: ${error.message}`);
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user document
   */
  static async createUser(userData) {
    try {
      const user = new User({
        name: userData.name,
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        phone: userData.phone,
        googleId: userData.googleId,
        profilePicture: userData.profilePicture,
        roles: userData.roles || ['student'],
        verification: {
          emailVerified: userData.emailVerified || false,
          otp: userData.otp,
          otpExpiry: userData.otpExpiry
        },
        status: 'active'
      });

      const savedUser = await user.save();
      return savedUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ErrorHandler(409, 'Email already exists');
      }
      throw new ErrorHandler(500, `Error creating user: ${error.message}`);
    }
  }

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated user document or null
   */
  static async updateUser(userId, updateData) {
    try {
      // Handle nested profile object - need to use dot notation for nested fields
      const updateQuery = {};
      
      // Handle top-level fields
      if (updateData.name !== undefined) updateQuery.name = updateData.name;
      if (updateData.phone !== undefined) updateQuery.phone = updateData.phone;
      if (updateData.profilePicture !== undefined) updateQuery.profilePicture = updateData.profilePicture;
      
      // Handle nested profile object - use dot notation for proper MongoDB update
      if (updateData.profile) {
        Object.keys(updateData.profile).forEach(key => {
          const value = updateData.profile[key];
          // Check if value is defined (including empty arrays and empty objects)
          if (value !== undefined) {
            // Handle nested objects like presentAddress, permanentAddress
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
              // Only process if object has at least one defined property
              const hasDefinedProperties = Object.values(value).some(v => v !== undefined);
              if (hasDefinedProperties) {
                Object.keys(value).forEach(nestedKey => {
                  if (value[nestedKey] !== undefined) {
                    updateQuery[`profile.${key}.${nestedKey}`] = value[nestedKey];
                  }
                });
              }
            } else {
              // Handle arrays (including empty arrays) and primitives - save them directly
              updateQuery[`profile.${key}`] = value;
            }
          }
        });
      }
      
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateQuery },
        { new: true, runValidators: true }
      );

      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error updating user: ${error.message}`);
    }
  }

  /**
   * Update user email verification status
   * @param {string} userId - User ID
   * @param {boolean} verified - Verification status
   * @returns {Promise<Object|null>} - Updated user document or null
   */
  static async updateEmailVerification(userId, verified = true) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'verification.emailVerified': verified,
            'verification.otp': null,
            'verification.otpExpiry': null
          }
        },
        { new: true }
      );

      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error updating email verification: ${error.message}`);
    }
  }

  /**
   * Update user OTP
   * @param {string} userId - User ID
   * @param {string} otp - OTP code
   * @param {Date} otpExpiry - OTP expiry date
   * @returns {Promise<Object|null>} - Updated user document or null
   */
  static async updateUserOTP(userId, otp, otpExpiry) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'verification.otp': otp,
            'verification.otpExpiry': otpExpiry
          }
        },
        { new: true }
      ).select('+verification.otp')
       .select('+verification.otpExpiry');

      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error updating user OTP: ${error.message}`);
    }
  }

  /**
   * Save OTP log entry
   * @param {Object} otpData - OTP log data
   * @returns {Promise<Object>} - Created OTP log document
   */
  static async saveOtpLog(otpData) {
    try {
      const otpLog = new OtpLog({
        email: otpData.email.toLowerCase(),
        otp: otpData.otp,
        purpose: otpData.purpose,
        ip: otpData.ip,
        userAgent: otpData.userAgent,
        expiresAt: otpData.expiresAt
      });

      const savedLog = await otpLog.save();
      return savedLog;
    } catch (error) {
      throw new ErrorHandler(500, `Error saving OTP log: ${error.message}`);
    }
  }

  /**
   * Find valid OTP log by email and purpose
   * @param {string} email - User email
   * @param {string} purpose - OTP purpose
   * @returns {Promise<Object|null>} - OTP log document or null
   */
  static async findValidOtpLog(email, purpose) {
    try {
      const otpLog = await OtpLog.findOne({
        email: email.toLowerCase(),
        purpose,
        verified: false,
        expiresAt: { $gt: new Date() }
      })
        .select('+otp')
        .sort({ createdAt: -1 })
        .limit(1);

      return otpLog;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding OTP log: ${error.message}`);
    }
  }

  /**
   * Mark OTP log as verified
   * @param {string} otpLogId - OTP log ID
   * @returns {Promise<Object|null>} - Updated OTP log document or null
   */
  static async markOtpLogAsVerified(otpLogId) {
    try {
      const otpLog = await OtpLog.findByIdAndUpdate(
        otpLogId,
        {
          $set: {
            verified: true,
            verifiedAt: new Date()
          }
        },
        { new: true }
      );

      return otpLog;
    } catch (error) {
      throw new ErrorHandler(500, `Error marking OTP as verified: ${error.message}`);
    }
  }

  /**
   * Create new session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} - Created session document
   */
  static async createSession(sessionData) {
    try {
      // Check if session with this refresh token already exists
      const existingSession = await Session.findOne({ refreshToken: sessionData.refreshToken });
      if (existingSession) {
        // If it's for the same user, return existing session
        if (existingSession.userId.toString() === sessionData.userId.toString()) {
          return existingSession;
        }
        // Otherwise, it's a conflict
        throw new ErrorHandler(409, 'Session already exists');
      }

      const session = new Session({
        userId: sessionData.userId,
        refreshToken: sessionData.refreshToken,
        userAgent: sessionData.userAgent,
        ip: sessionData.ip,
        expiresAt: sessionData.expiresAt
      });

      const savedSession = await session.save();
      return savedSession;
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      if (error.code === 11000) {
        // Duplicate key error - session already exists, try to find and return it
        const existingSession = await Session.findOne({ refreshToken: sessionData.refreshToken });
        if (existingSession && existingSession.userId.toString() === sessionData.userId.toString()) {
          return existingSession;
        }
        throw new ErrorHandler(409, 'Session already exists');
      }
      throw new ErrorHandler(500, `Error creating session: ${error.message}`);
    }
  }

  /**
   * Find session by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object|null>} - Session document or null
   */
  static async findSessionByRefreshToken(refreshToken) {
    try {
      const session = await Session.findOne({
        refreshToken,
        expiresAt: { $gt: new Date() }
      });

      return session;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding session: ${error.message}`);
    }
  }

  /**
   * Delete session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  static async deleteSession(sessionId) {
    try {
      const result = await Session.findByIdAndDelete(sessionId);
      return !!result;
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting session: ${error.message}`);
    }
  }

  /**
   * Delete session by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  static async deleteSessionByRefreshToken(refreshToken) {
    try {
      const result = await Session.findOneAndDelete({ refreshToken });
      return !!result;
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting session by token: ${error.message}`);
    }
  }

  /**
   * Delete all sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Number of deleted sessions
   */
  static async deleteSessionsByUserId(userId) {
    try {
      const result = await Session.deleteMany({ userId });
      return result.deletedCount;
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting user sessions: ${error.message}`);
    }
  }

  /**
   * Find all active sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of session documents
   */
  static async findSessionsByUserId(userId) {
    try {
      const sessions = await Session.find({
        userId,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      return sessions;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding user sessions: ${error.message}`);
    }
  }

  /**
   * Update user password hash
   * @param {string} userId - User ID
   * @param {string} passwordHash - New password hash
   * @returns {Promise<Object|null>} - Updated user document or null
   */
  static async updateUserPassword(userId, passwordHash) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { passwordHash } },
        { new: true }
      );

      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error updating password: ${error.message}`);
    }
  }
}

module.exports = AuthRepository;
