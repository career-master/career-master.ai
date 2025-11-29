const QuizAttempt = require('./quiz_attempts.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Quiz Attempt Repository
 * Pure database operations for quiz attempts
 */
class QuizAttemptRepository {
  /**
   * Create new quiz attempt
   * @param {Object} attemptData
   * @returns {Promise<Object>}
   */
  static async createAttempt(attemptData) {
    try {
      const attempt = new QuizAttempt(attemptData);
      return await attempt.save();
    } catch (error) {
      throw new ErrorHandler(500, `Error creating quiz attempt: ${error.message}`);
    }
  }

  /**
   * Get user attempts for a quiz
   * @param {string} userId
   * @param {string} quizId
   * @returns {Promise<Array>}
   */
  static async getUserQuizAttempts(userId, quizId) {
    try {
      return await QuizAttempt.find({ userId, quizId })
        .sort({ submittedAt: -1 })
        .lean();
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz attempts: ${error.message}`);
    }
  }

  /**
   * Get user attempts by email for a quiz
   * @param {string} userEmail
   * @param {string} quizId
   * @returns {Promise<Array>}
   */
  static async getUserQuizAttemptsByEmail(userEmail, quizId) {
    try {
      return await QuizAttempt.find({ userEmail, quizId })
        .sort({ submittedAt: -1 })
        .lean();
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz attempts: ${error.message}`);
    }
  }

  /**
   * Get attempt by ID
   * @param {string} attemptId
   * @returns {Promise<Object|null>}
   */
  static async getAttemptById(attemptId) {
    try {
      return await QuizAttempt.findById(attemptId)
        .populate('quizId', 'title description')
        .populate('userId', 'name email')
        .lean();
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz attempt: ${error.message}`);
    }
  }

  /**
   * Get all attempts for a user
   * @param {string} userId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  static async getUserAttempts(userId, { page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        QuizAttempt.find({ userId })
          .populate('quizId', 'title description')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        QuizAttempt.countDocuments({ userId })
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching user attempts: ${error.message}`);
    }
  }
}

module.exports = QuizAttemptRepository;

