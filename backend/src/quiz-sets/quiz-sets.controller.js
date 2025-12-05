const QuizSetService = require('./quiz-sets.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Quiz Set Controller
 * HTTP handlers for quiz set endpoints
 */
class QuizSetController {
  /**
   * POST /quiz-sets
   * Create quiz set
   */
  static createQuizSet = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const quizSet = await QuizSetService.createQuizSet(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Quiz Set created successfully',
      data: quizSet
    });
  });

  /**
   * GET /quiz-sets/topic/:topicId
   * Get quiz sets by topic ID
   */
  static getQuizSetsByTopicId = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    const quizSets = await QuizSetService.getQuizSetsByTopicId(req.params.topicId, filter);

    res.status(200).json({
      success: true,
      data: quizSets
    });
  });

  /**
   * GET /quiz-sets/:id
   * Get quiz set by ID
   */
  static getQuizSetById = asyncHandler(async (req, res) => {
    const includeQuiz = req.query.includeQuiz === 'true';
    const quizSet = await QuizSetService.getQuizSetById(req.params.id, includeQuiz);

    res.status(200).json({
      success: true,
      data: quizSet
    });
  });

  /**
   * PUT /quiz-sets/:id
   * Update quiz set
   */
  static updateQuizSet = asyncHandler(async (req, res) => {
    const quizSet = await QuizSetService.updateQuizSet(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Quiz Set updated successfully',
      data: quizSet
    });
  });

  /**
   * DELETE /quiz-sets/:id
   * Delete quiz set
   */
  static deleteQuizSet = asyncHandler(async (req, res) => {
    await QuizSetService.deleteQuizSet(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Quiz Set deleted successfully'
    });
  });
}

module.exports = QuizSetController;

