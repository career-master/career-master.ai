const bcrypt = require('bcrypt');
const env = require('../config/env');

/**
 * Crypto Utilities
 * Handles password hashing and comparison using bcrypt
 */
class CryptoUtil {
  /**
   * Hash a password using bcrypt
   * @param {string} plainPassword - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  static async hashPassword(plainPassword) {
    try {
      if (!plainPassword || typeof plainPassword !== 'string') {
        throw new Error('Password must be a non-empty string');
      }

      const saltRounds = env.BCRYPT_ROUNDS;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`);
    }
  }

  /**
   * Compare plain password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} - True if passwords match, false otherwise
   */
  static async comparePassword(plainPassword, hashedPassword) {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Error comparing passwords: ${error.message}`);
    }
  }

  /**
   * Generate a random OTP (6 digits)
   * @returns {string} - 6-digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a random secure token
   * @param {number} length - Length of the token (default: 32)
   * @returns {string} - Random secure token
   */
  static generateSecureToken(length = 32) {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = CryptoUtil;
