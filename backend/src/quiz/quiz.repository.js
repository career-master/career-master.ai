const Quiz = require('./quiz.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Quiz Repository
 * Pure database operations for quizzes
 */
class QuizRepository {
  /**
   * Create new quiz
   * @param {Object} quizData
   * @returns {Promise<Object>}
   */
  static async createQuiz(quizData) {
    try {
      console.log('Creating quiz with data:', JSON.stringify(quizData, null, 2));
      const quiz = new Quiz(quizData);
      const savedQuiz = await quiz.save();
      console.log('Quiz created successfully:', savedQuiz._id);
      return savedQuiz;
    } catch (error) {
      console.error('Error in QuizRepository.createQuiz:', error);
      console.error('Quiz data that failed:', JSON.stringify(quizData, null, 2));
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Quiz validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error creating quiz: ${error.message}`);
    }
  }

  /**
   * Update quiz
   * @param {string} quizId
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateQuiz(quizId, updates) {
    try {
      // Separate fields to unset from fields to update
      const unsetFields = {};
      const updateFields = { ...updates };

      // If dates are explicitly set to null, unset them
      if (updates.availableFrom === null) {
        unsetFields.availableFrom = '';
        delete updateFields.availableFrom;
      }
      if (updates.availableTo === null) {
        unsetFields.availableTo = '';
        delete updateFields.availableTo;
      }

      // Build update object
      const updateObj = { ...updateFields };
      if (Object.keys(unsetFields).length > 0) {
        updateObj.$unset = unsetFields;
      }

      const quiz = await Quiz.findByIdAndUpdate(quizId, updateObj, {
        new: true,
        runValidators: true
      });
      return quiz;
    } catch (error) {
      throw new ErrorHandler(500, `Error updating quiz: ${error.message}`);
    }
  }

  /**
   * Get quiz by ID
   * @param {string} quizId
   * @returns {Promise<Object|null>}
   */
  static async getQuizById(quizId) {
    try {
      return await Quiz.findById(quizId);
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz: ${error.message}`);
    }
  }

  /**
   * Get all quizzes (optionally only active)
   * @param {boolean} activeOnly
   * @returns {Promise<Array>}
   */
  static async getAllQuizzes(activeOnly = false) {
    try {
      const filter = activeOnly ? { isActive: true } : {};
      return await Quiz.find(filter).sort({ createdAt: -1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quizzes: ${error.message}`);
    }
  }

  /**
   * Get quizzes with pagination
   * @param {Object} options
   * @param {boolean} options.activeOnly
   * @param {number} options.page
   * @param {number} options.limit
   */
  static async getQuizzesPaginated({ activeOnly = false, page = 1, limit = 10 }) {
    try {
      // Check MongoDB connection
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        throw new ErrorHandler(503, 'Database connection not available. Please check MongoDB connection.');
      }

      const filter = activeOnly ? { isActive: true } : {};
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Quiz.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Quiz.countDocuments(filter)
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));

      return {
        items,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      // If it's already an ErrorHandler, re-throw it
      if (error instanceof ErrorHandler) {
        throw error;
      }
      // Check for MongoDB connection errors
      if (error.message && (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo'))) {
        throw new ErrorHandler(503, 'Database connection failed. Please check MongoDB connection string and network access.');
      }
      throw new ErrorHandler(500, `Error fetching quizzes: ${error.message}`);
    }
  }

  /**
   * Delete quiz
   * @param {string} quizId
   * @returns {Promise<void>}
   */
  static async deleteQuiz(quizId) {
    try {
      await Quiz.findByIdAndDelete(quizId);
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting quiz: ${error.message}`);
    }
  }
}

module.exports = QuizRepository;


