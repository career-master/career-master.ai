const QuizService = require('./quiz.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Quiz Controller
 * HTTP handlers for quiz endpoints
 */
class QuizController {
  /**
   * POST /quizzes
   * Create quiz with questions (JSON payload)
   */
  static createQuiz = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const quiz = await QuizService.createQuiz(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  });

  /**
   * POST /quizzes/upload-excel
   * Create quiz with questions from Excel file
   */
  static uploadQuizExcel = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const file = req.file;
    const defaultMarks = req.body.defaultMarks != null && req.body.defaultMarks !== ''
      ? Number(req.body.defaultMarks)
      : undefined;
    const metadata = {
      title: req.body.title,
      description: req.body.description,
      durationMinutes: req.body.durationMinutes,
      availableFrom: req.body.availableFrom,
      availableTo: req.body.availableTo,
      batches: req.body.batches,
      availableToEveryone: req.body.availableToEveryone === 'true' || req.body.availableToEveryone === true,
      maxAttempts: req.body.maxAttempts ? Number(req.body.maxAttempts) : 999,
      defaultMarks: Number.isFinite(defaultMarks) ? defaultMarks : undefined
    };

    const quiz = await QuizService.createQuizFromExcel(file?.buffer, metadata, userId);

    res.status(201).json({
      success: true,
      message: 'Quiz created from Excel successfully',
      data: quiz
    });
  });

  /**
   * GET /quizzes
   * List all quizzes
   */
  static getQuizzes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await QuizService.getQuizzes({ page, limit });
    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * GET /quizzes/:id
   * Get quiz by ID
   */
  static getQuizById = asyncHandler(async (req, res) => {
    const quiz = await QuizService.getQuizById(req.params.id);
    res.status(200).json({
      success: true,
      data: quiz
    });
  });

  /**
   * PUT /quizzes/:id
   * Update quiz
   */
  static updateQuiz = asyncHandler(async (req, res) => {
    const quiz = await QuizService.updateQuiz(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  });

  /**
   * DELETE /quizzes/:id
   * Delete quiz
   */
  static deleteQuiz = asyncHandler(async (req, res) => {
    await QuizService.deleteQuiz(req.params.id);
    res.status(204).send();
  });
}

module.exports = QuizController;


