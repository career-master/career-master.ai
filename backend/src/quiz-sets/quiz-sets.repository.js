const QuizSet = require('./quiz-sets.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Quiz Set Repository
 * Pure database operations for quiz sets
 */
class QuizSetRepository {
  /**
   * Create new quiz set
   * @param {Object} quizSetData
   * @returns {Promise<Object>}
   */
  static async createQuizSet(quizSetData) {
    try {
      const quizSet = new QuizSet(quizSetData);
      const savedQuizSet = await quizSet.save();
      return savedQuizSet;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Quiz Set validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error creating quiz set: ${error.message}`);
    }
  }

  /**
   * Update quiz set
   * @param {string} quizSetId
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateQuizSet(quizSetId, updates) {
    try {
      const quizSet = await QuizSet.findByIdAndUpdate(quizSetId, updates, {
        new: true,
        runValidators: true
      });
      return quizSet;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Quiz Set validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error updating quiz set: ${error.message}`);
    }
  }

  /**
   * Get quiz set by ID
   * @param {string} quizSetId
   * @param {boolean} populateQuiz
   * @returns {Promise<Object|null>}
   */
  static async getQuizSetById(quizSetId, populateQuiz = false) {
    try {
      const query = QuizSet.findById(quizSetId);
      if (populateQuiz) {
        query.populate('quizId');
      }
      return await query;
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz set: ${error.message}`);
    }
  }

  /**
   * Get quiz sets by topic ID
   * @param {string} topicId
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  static async getQuizSetsByTopicId(topicId, filter = {}) {
    try {
      return await QuizSet.find({ topicId, ...filter })
        .populate('quizId')
        .sort({ order: 1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz sets: ${error.message}`);
    }
  }

  /**
   * Get quiz sets by quiz ID (for admin edit form: which topic is this quiz linked to)
   * @param {string} quizId
   * @returns {Promise<Array>}
   */
  static async getQuizSetsByQuizId(quizId) {
    try {
      return await QuizSet.find({ quizId })
        .populate('topicId')
        .sort({ order: 1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz sets: ${error.message}`);
    }
  }

  /**
   * Delete quiz set
   * @param {string} quizSetId
   * @returns {Promise<void>}
   */
  static async deleteQuizSet(quizSetId) {
    try {
      await QuizSet.findByIdAndDelete(quizSetId);
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting quiz set: ${error.message}`);
    }
  }
}

module.exports = QuizSetRepository;

