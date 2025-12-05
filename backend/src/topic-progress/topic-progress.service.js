const TopicProgressRepository = require('./topic-progress.repository');
const Topic = require('../topics/topics.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');
const QuizAttempt = require('../quiz/quiz_attempts.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Topic Progress Service
 * Business logic for topic progress and gating
 */
class TopicProgressService {
  /**
   * Mark cheatsheet as read
   * @param {string} studentId
   * @param {string} topicId
   */
  static async markCheatSheetRead(studentId, topicId) {
    // Get topic to get subjectId
    const topic = await Topic.findById(topicId);
    if (!topic) {
      throw new ErrorHandler(404, 'Topic not found');
    }

    const progress = await TopicProgressRepository.markCheatSheetRead(studentId, topicId);
    
    // Update subjectId if not set
    if (!progress.subjectId) {
      progress.subjectId = topic.subjectId;
      await progress.save();
    }

    // Check if topic should be completed after cheatsheet is read
    await this.checkTopicCompletion(studentId, topicId);

    return progress;
  }

  /**
   * Record quiz completion and check for topic completion
   * @param {string} studentId
   * @param {string} quizId
   * @param {string} attemptId
   */
  static async recordQuizCompletion(studentId, quizId, attemptId) {
    // Find which topic this quiz belongs to
    const quizSet = await QuizSet.findOne({ quizId });
    if (!quizSet) {
      // Quiz not part of any topic, skip
      return null;
    }

    const topicId = quizSet.topicId;
    const topic = await Topic.findById(topicId);
    if (!topic) {
      throw new ErrorHandler(404, 'Topic not found');
    }

    // Get quiz attempt to get score
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      throw new ErrorHandler(404, 'Quiz attempt not found');
    }

    // Check if this quiz was already recorded
    const existingProgress = await TopicProgressRepository.getTopicProgress(studentId, topicId);
    if (existingProgress) {
      const alreadyRecorded = existingProgress.completedQuizzes.some(
        q => q.quizId.toString() === quizId && q.attemptId.toString() === attemptId
      );
      if (alreadyRecorded) {
        // Already recorded, just check completion
        await this.checkTopicCompletion(studentId, topicId);
        return existingProgress;
      }
    }

    // Add completed quiz
    const quizCompletion = {
      quizId,
      attemptId,
      completedAt: new Date(),
      score: attempt.score || 0,
      percentage: attempt.percentage || 0
    };

    const progress = await TopicProgressRepository.addCompletedQuiz(studentId, topicId, quizCompletion);
    
    // Update subjectId if not set
    if (!progress.subjectId) {
      progress.subjectId = topic.subjectId;
      await progress.save();
    }

    // Check if topic should be completed
    await this.checkTopicCompletion(studentId, topicId);

    // Check if next topics should be unlocked
    await this.checkAndUnlockNextTopics(studentId, topic.subjectId, topicId);

    return progress;
  }

  /**
   * Check if topic completion requirements are met and mark as completed
   * @param {string} studentId
   * @param {string} topicId
   */
  static async checkTopicCompletion(studentId, topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return;
    }

    const progress = await TopicProgressRepository.getTopicProgress(studentId, topicId);
    if (!progress || progress.isCompleted) {
      return;
    }

    // Check requirements: cheatsheet read + required quizzes passed
    const cheatsheetRead = progress.cheatSheetRead || false;
    const requiredQuizzes = topic.requiredQuizzesToUnlock || 2;

    // Count passed quizzes (percentage >= passing threshold, typically 60%)
    const passedQuizzes = progress.completedQuizzes.filter(q => q.percentage >= 60).length;

    if (cheatsheetRead && passedQuizzes >= requiredQuizzes) {
      await TopicProgressRepository.completeTopic(studentId, topicId);
    }
  }

  /**
   * Check prerequisites and unlock topics
   * @param {string} studentId
   * @param {string} subjectId
   * @param {string} completedTopicId
   */
  static async checkAndUnlockNextTopics(studentId, subjectId, completedTopicId) {
    // Get all topics in the subject
    const topics = await Topic.find({ subjectId, isActive: true }).sort({ order: 1 });

    for (const topic of topics) {
      // Skip if already unlocked
      const progress = await TopicProgressRepository.getTopicProgress(studentId, topic._id);
      if (progress && progress.isUnlocked) {
        continue;
      }

      // Check prerequisites
      if (topic.prerequisites && topic.prerequisites.length > 0) {
        // Check if all prerequisites are completed
        const allPrerequisitesCompleted = await Promise.all(
          topic.prerequisites.map(async (prereqTopicId) => {
            const prereqProgress = await TopicProgressRepository.getTopicProgress(studentId, prereqTopicId);
            return prereqProgress && prereqProgress.isCompleted;
          })
        );

        if (allPrerequisitesCompleted.every(Boolean)) {
          // All prerequisites completed, unlock this topic
          await TopicProgressRepository.unlockTopic(studentId, topic._id, subjectId);
        }
      } else if (topic.order === 0 || topic.order === 1) {
        // First topic (order 0 or 1) - unlock if not already unlocked
        if (!progress) {
          await TopicProgressRepository.unlockTopic(studentId, topic._id, subjectId);
        }
      }
    }
  }

  /**
   * Get topic progress for a student
   * @param {string} studentId
   * @param {string} topicId
   */
  static async getTopicProgress(studentId, topicId) {
    let progress = await TopicProgressRepository.getTopicProgress(studentId, topicId);
    
    // If no progress exists, check if topic should be unlocked
    if (!progress) {
      const topic = await Topic.findById(topicId);
      if (!topic) {
        throw new ErrorHandler(404, 'Topic not found');
      }

      // Check if it's the first topic or prerequisites are met
      const shouldUnlock = await this.shouldUnlockTopic(studentId, topic);
      if (shouldUnlock) {
        progress = await TopicProgressRepository.unlockTopic(studentId, topicId, topic.subjectId);
      } else {
        // Return a default progress object
        return {
          studentId,
          topicId,
          subjectId: topic.subjectId,
          isUnlocked: false,
          cheatSheetRead: false,
          completedQuizzes: [],
          totalQuizzesCompleted: 0,
          isCompleted: false
        };
      }
    }

    return progress;
  }

  /**
   * Check if a topic should be unlocked
   * @param {string} studentId
   * @param {Object} topic
   */
  static async shouldUnlockTopic(studentId, topic) {
    // First topic (order 0 or 1) is always unlockable
    if (topic.order === 0 || topic.order === 1) {
      return true;
    }

    // Check prerequisites
    if (topic.prerequisites && topic.prerequisites.length > 0) {
      const allPrerequisitesCompleted = await Promise.all(
        topic.prerequisites.map(async (prereqTopicId) => {
          const prereqProgress = await TopicProgressRepository.getTopicProgress(studentId, prereqTopicId);
          return prereqProgress && prereqProgress.isCompleted;
        })
      );
      return allPrerequisitesCompleted.every(Boolean);
    }

    return false;
  }

  /**
   * Get subject progress for a student
   * @param {string} studentId
   * @param {string} subjectId
   */
  static async getSubjectProgress(studentId, subjectId) {
    const progressList = await TopicProgressRepository.getSubjectProgress(studentId, subjectId);
    
    // Calculate overall progress
    const topics = await Topic.find({ subjectId, isActive: true });
    const totalTopics = topics.length;
    const completedTopics = progressList.filter(p => p.isCompleted).length;
    const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    return {
      subjectId,
      totalTopics,
      completedTopics,
      progressPercentage,
      topics: progressList
    };
  }

  /**
   * Get all progress for a student
   * @param {string} studentId
   */
  static async getStudentProgress(studentId) {
    return await TopicProgressRepository.getStudentProgress(studentId);
  }
}

module.exports = TopicProgressService;

