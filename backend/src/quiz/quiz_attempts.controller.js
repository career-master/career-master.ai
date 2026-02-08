const QuizAttemptService = require('./quiz_attempts.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Quiz Attempt Controller
 * HTTP handlers for quiz attempt endpoints
 */
class QuizAttemptController {
  /**
   * POST /quizzes/:id/attempt
   * Submit quiz attempt
   */
  static submitAttempt = asyncHandler(async (req, res) => {
    const quizId = req.params.id;
    const { email, answers, timeSpentInSeconds } = req.body;
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const attempt = await QuizAttemptService.submitAttempt(
      quizId,
      userId,
      email,
      answers,
      timeSpentInSeconds || 0
    );

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attempt
      }
    });
  });

  /**
   * GET /quizzes/user/email/:email
   * Get available quizzes for a user
   */
  static getAvailableQuizzes = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const level = req.query.level && ['basic', 'hard'].includes(String(req.query.level))
      ? String(req.query.level)
      : undefined;
    const quizzes = await QuizAttemptService.getAvailableQuizzesForUser(email, level);

    res.status(200).json({
      success: true,
      presentQuizzes: quizzes
    });
  });

  /**
   * GET /quizzes/:id/attempts
   * Get user attempts for a quiz
   */
  static getUserQuizAttempts = asyncHandler(async (req, res) => {
    const quizId = req.params.id;
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const attempts = await QuizAttemptService.getUserQuizAttempts(userId, quizId);

    res.status(200).json({
      success: true,
      data: attempts
    });
  });
}

module.exports = QuizAttemptController;

