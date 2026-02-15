const QuizSetRepository = require('./quiz-sets.repository');
const Quiz = require('../quiz/quiz.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Quiz Set Service
 * Business logic for quiz set management
 */
class QuizSetService {
  /**
   * Create quiz set
   * @param {Object} payload
   * @param {string} userId
   */
  static async createQuizSet(payload, userId) {
    if (!userId) {
      throw new ErrorHandler(401, 'User ID is required to create a quiz set');
    }

    const { topicId, quizId, setName, order, quizNumber } = payload;

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ErrorHandler(404, 'Quiz not found');
    }

    const quizSetData = {
      topicId,
      quizId,
      setName: setName || 'Quiz Set',
      order: order !== undefined ? order : 0,
      quizNumber: quizNumber !== undefined && quizNumber !== null && quizNumber !== '' ? Number(quizNumber) : undefined,
      assignedBy: userId,
      isActive: payload.isActive !== undefined ? payload.isActive : true
    };

    return await QuizSetRepository.createQuizSet(quizSetData);
  }

  /**
   * Update quiz set
   * @param {string} quizSetId
   * @param {Object} payload
   */
  static async updateQuizSet(quizSetId, payload) {
    const updates = { ...payload };
    
    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    // If quizId is being updated, verify it exists
    if (updates.quizId) {
      const quiz = await Quiz.findById(updates.quizId);
      if (!quiz) {
        throw new ErrorHandler(404, 'Quiz not found');
      }
    }

    const quizSet = await QuizSetRepository.updateQuizSet(quizSetId, updates);
    if (!quizSet) {
      throw new ErrorHandler(404, 'Quiz Set not found');
    }
    return quizSet;
  }

  /**
   * Get quiz set by ID
   * @param {string} quizSetId
   * @param {boolean} includeQuiz
   */
  static async getQuizSetById(quizSetId, includeQuiz = false) {
    const quizSet = await QuizSetRepository.getQuizSetById(quizSetId, includeQuiz);
    if (!quizSet) {
      throw new ErrorHandler(404, 'Quiz Set not found');
    }
    return quizSet;
  }

  /**
   * Get quiz sets by topic ID
   * @param {string} topicId
   * @param {Object} filter
   */
  static async getQuizSetsByTopicId(topicId, filter = {}) {
    return await QuizSetRepository.getQuizSetsByTopicId(topicId, filter);
  }

  /**
   * Get quiz sets by quiz ID (for admin: which topic(s) this quiz is linked to)
   * @param {string} quizId
   */
  static async getQuizSetsByQuizId(quizId) {
    return await QuizSetRepository.getQuizSetsByQuizId(quizId);
  }

  /**
   * Delete quiz set
   * @param {string} quizSetId
   */
  static async deleteQuizSet(quizSetId) {
    const quizSet = await QuizSetRepository.getQuizSetById(quizSetId);
    if (!quizSet) {
      throw new ErrorHandler(404, 'Quiz Set not found');
    }
    await QuizSetRepository.deleteQuizSet(quizSetId);
  }
}

module.exports = QuizSetService;

