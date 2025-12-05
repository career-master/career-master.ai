const TopicProgress = require('./topic-progress.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Topic Progress Repository
 * Pure database operations for topic progress
 */
class TopicProgressRepository {
  /**
   * Create or update topic progress
   * @param {Object} progressData
   * @returns {Promise<Object>}
   */
  static async upsertTopicProgress(progressData) {
    try {
      const { studentId, topicId } = progressData;
      const progress = await TopicProgress.findOneAndUpdate(
        { studentId, topicId },
        progressData,
        { new: true, upsert: true, runValidators: true }
      );
      return progress;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Topic Progress validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error upserting topic progress: ${error.message}`);
    }
  }

  /**
   * Get topic progress by student and topic
   * @param {string} studentId
   * @param {string} topicId
   * @returns {Promise<Object|null>}
   */
  static async getTopicProgress(studentId, topicId) {
    try {
      return await TopicProgress.findOne({ studentId, topicId });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching topic progress: ${error.message}`);
    }
  }

  /**
   * Get all topic progress for a student in a subject
   * @param {string} studentId
   * @param {string} subjectId
   * @returns {Promise<Array>}
   */
  static async getSubjectProgress(studentId, subjectId) {
    try {
      return await TopicProgress.find({ studentId, subjectId })
        .populate('topicId', 'title description order')
        .sort({ 'topicId.order': 1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching subject progress: ${error.message}`);
    }
  }

  /**
   * Get all progress for a student
   * @param {string} studentId
   * @returns {Promise<Array>}
   */
  static async getStudentProgress(studentId) {
    try {
      return await TopicProgress.find({ studentId })
        .populate('topicId', 'title description order')
        .populate('subjectId', 'title description')
        .sort({ 'subjectId.order': 1, 'topicId.order': 1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching student progress: ${error.message}`);
    }
  }

  /**
   * Mark cheatsheet as read
   * @param {string} studentId
   * @param {string} topicId
   * @returns {Promise<Object|null>}
   */
  static async markCheatSheetRead(studentId, topicId) {
    try {
      return await TopicProgress.findOneAndUpdate(
        { studentId, topicId },
        {
          $set: {
            cheatSheetRead: true,
            cheatSheetReadAt: new Date()
          }
        },
        { new: true, upsert: true }
      );
    } catch (error) {
      throw new ErrorHandler(500, `Error marking cheatsheet as read: ${error.message}`);
    }
  }

  /**
   * Add completed quiz to topic progress
   * @param {string} studentId
   * @param {string} topicId
   * @param {Object} quizCompletion
   * @returns {Promise<Object|null>}
   */
  static async addCompletedQuiz(studentId, topicId, quizCompletion) {
    try {
      return await TopicProgress.findOneAndUpdate(
        { studentId, topicId },
        {
          $push: { completedQuizzes: quizCompletion },
          $inc: { totalQuizzesCompleted: 1 }
        },
        { new: true, upsert: true }
      );
    } catch (error) {
      throw new ErrorHandler(500, `Error adding completed quiz: ${error.message}`);
    }
  }

  /**
   * Unlock topic
   * @param {string} studentId
   * @param {string} topicId
   * @param {string} subjectId
   * @returns {Promise<Object|null>}
   */
  static async unlockTopic(studentId, topicId, subjectId) {
    try {
      return await TopicProgress.findOneAndUpdate(
        { studentId, topicId },
        {
          $set: {
            isUnlocked: true,
            unlockedAt: new Date(),
            subjectId
          }
        },
        { new: true, upsert: true }
      );
    } catch (error) {
      throw new ErrorHandler(500, `Error unlocking topic: ${error.message}`);
    }
  }

  /**
   * Mark topic as completed
   * @param {string} studentId
   * @param {string} topicId
   * @returns {Promise<Object|null>}
   */
  static async completeTopic(studentId, topicId) {
    try {
      return await TopicProgress.findOneAndUpdate(
        { studentId, topicId },
        {
          $set: {
            isCompleted: true,
            completedAt: new Date()
          }
        },
        { new: true }
      );
    } catch (error) {
      throw new ErrorHandler(500, `Error completing topic: ${error.message}`);
    }
  }
}

module.exports = TopicProgressRepository;

