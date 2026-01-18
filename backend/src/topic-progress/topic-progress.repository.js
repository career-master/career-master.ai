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
  static async markCheatSheetRead(studentId, topicId, subjectId) {
    try {
      // First check if document exists
      let progress = await TopicProgress.findOne({ studentId, topicId });
      
      if (progress) {
        // Update existing document
        progress.cheatSheetRead = true;
        progress.cheatSheetReadAt = new Date();
        if (subjectId && !progress.subjectId) {
          progress.subjectId = subjectId;
        }
        const saved = await progress.save();
        // Refresh from database to ensure we have the latest data
        return await TopicProgress.findById(saved._id);
      } else {
        // Create new document with all required fields
        if (!subjectId) {
          throw new ErrorHandler(400, 'Subject ID is required when creating new topic progress');
        }
        progress = new TopicProgress({
          studentId,
          topicId,
          subjectId,
          isUnlocked: false,
          cheatSheetRead: true,
          cheatSheetReadAt: new Date(),
          completedQuizzes: [],
          totalQuizzesCompleted: 0,
          isCompleted: false
        });
        const saved = await progress.save();
        // Refresh from database to ensure we have the latest data
        return await TopicProgress.findById(saved._id);
      }
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
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
  static async addCompletedQuiz(studentId, topicId, quizCompletion, subjectId) {
    try {
      // First check if document exists
      let progress = await TopicProgress.findOne({ studentId, topicId });
      
      if (progress) {
        // Update existing document - ensure completedQuizzes is an array
        if (!Array.isArray(progress.completedQuizzes)) {
          progress.completedQuizzes = [];
        }
        // Check if this exact quiz+attempt combo is already recorded
        const existingIndex = progress.completedQuizzes.findIndex(
          q => q.quizId.toString() === quizCompletion.quizId.toString() && 
               q.attemptId.toString() === quizCompletion.attemptId.toString()
        );
        if (existingIndex === -1) {
          // Not already recorded, add it
          progress.completedQuizzes.push(quizCompletion);
          progress.totalQuizzesCompleted = (progress.totalQuizzesCompleted || 0) + 1;
        }
        if (subjectId && !progress.subjectId) {
          progress.subjectId = subjectId;
        }
        const saved = await progress.save();
        // Refresh from database to ensure we have the latest data
        return await TopicProgress.findById(saved._id);
      } else {
        // Create new document with all required fields
        if (!subjectId) {
          throw new ErrorHandler(400, 'Subject ID is required when creating new topic progress');
        }
        progress = new TopicProgress({
          studentId,
          topicId,
          subjectId,
          isUnlocked: false,
          cheatSheetRead: false,
          completedQuizzes: [quizCompletion],
          totalQuizzesCompleted: 1,
          isCompleted: false
        });
        const saved = await progress.save();
        // Refresh from database to ensure we have the latest data
        return await TopicProgress.findById(saved._id);
      }
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
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

