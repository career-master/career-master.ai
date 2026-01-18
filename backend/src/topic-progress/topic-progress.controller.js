const TopicProgressService = require('./topic-progress.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Topic Progress Controller
 * HTTP handlers for topic progress endpoints
 */
class TopicProgressController {
  /**
   * POST /topic-progress/cheat-viewed
   * Mark cheatsheet as viewed
   */
  static markCheatSheetRead = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Student ID is required. Please ensure you are authenticated.'
      });
    }
    const { topicId } = req.body;

    const progress = await TopicProgressService.markCheatSheetRead(userId, topicId);

    res.status(200).json({
      success: true,
      message: 'CheatSheet marked as read',
      data: progress
    });
  });

  /**
   * POST /topic-progress/quiz-completed
   * Record quiz completion (called after quiz submission)
   */
  static recordQuizCompletion = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Student ID is required. Please ensure you are authenticated.'
      });
    }
    const { quizId, attemptId } = req.body;

    const progress = await TopicProgressService.recordQuizCompletion(userId, quizId, attemptId);

    res.status(200).json({
      success: true,
      message: 'Quiz completion recorded',
      data: progress
    });
  });

  /**
   * GET /topic-progress/topic/:topicId
   * Get topic progress for current user
   */
  static getTopicProgress = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Student ID is required. Please ensure you are authenticated.'
      });
    }
    const progress = await TopicProgressService.getTopicProgress(userId, req.params.topicId);

    res.status(200).json({
      success: true,
      data: progress
    });
  });

  /**
   * GET /topic-progress/subject/:subjectId
   * Get subject progress for current user
   */
  static getSubjectProgress = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Student ID is required. Please ensure you are authenticated.'
      });
    }
    const progress = await TopicProgressService.getSubjectProgress(userId, req.params.subjectId);

    res.status(200).json({
      success: true,
      data: progress
    });
  });

  /**
   * GET /topic-progress
   * Get all progress for current user
   */
  static getStudentProgress = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Student ID is required. Please ensure you are authenticated.'
      });
    }
    const progress = await TopicProgressService.getStudentProgress(userId);

    res.status(200).json({
      success: true,
      data: progress
    });
  });
}

module.exports = TopicProgressController;

