const QuizSetRepository = require('./quiz-sets.repository');
const Quiz = require('../quiz/quiz.model');
const User = require('../user/users.model');
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

    // Normalize helper
    const norm = (v) => (v || '').toString().trim().toLowerCase();

    // Prevent / auto-adjust duplicates for:
    // 1) Same Topic + Quiz Number + Level  → hard error
    // 2) Same Topic + Quiz Title + Level   → auto-increment Quiz N in title
    const hasQuizNumber =
      quizNumber !== undefined && quizNumber !== null && quizNumber !== '';
    if (topicId && quiz.level) {
      const existingAll = await QuizSetRepository.getQuizSetsByTopicId(topicId, {});

      // (1) Topic + Quiz Number + Level
      if (hasQuizNumber) {
        const duplicateByNumber = existingAll.find(
          (qs) =>
            qs.quizNumber === Number(quizNumber) &&
            qs.quizId &&
            qs.quizId.level === quiz.level
        );
        if (duplicateByNumber) {
          throw new ErrorHandler(
            400,
            `A quiz with this topic, quiz number and level (${quiz.level}) already exists.`
          );
        }
      }

      // (2) Topic + Quiz Title + Level
      // If a quiz with the same title+level already exists for this topic,
      // automatically bump the trailing "Quiz N" number in the title:
      //   "C - Fundamentals - Quiz 1" → "C - Fundamentals - Quiz 2", etc.
      const QUIZ_SUFFIX_REGEX = /^(.*?\bQuiz)\s*(\d+)\s*$/i;
      const baseMatch = QUIZ_SUFFIX_REGEX.exec(quiz.title || '');
      if (baseMatch) {
        const [, basePart] = baseMatch;
        const quizTitleNorm = norm(quiz.title);

        const duplicatesSameTitle = existingAll.filter(
          (qs) =>
            qs.quizId &&
            norm(qs.quizId.title) === quizTitleNorm &&
            qs.quizId.level === quiz.level
        );

        if (duplicatesSameTitle.length > 0) {
          // Find max existing "Quiz N" number for this base + level
          let maxN = 1;
          existingAll.forEach((qs) => {
            if (!qs.quizId || qs.quizId.level !== quiz.level) return;
            const m = QUIZ_SUFFIX_REGEX.exec(qs.quizId.title || '');
            if (!m) return;
            const n = Number(m[2]);
            if (Number.isFinite(n) && n > maxN) maxN = n;
          });

          const nextN = maxN + 1;
          const newTitle = `${basePart} ${nextN}`;
          quiz.title = newTitle;
          await quiz.save();
        }
      }
    }

    const quizSetData = {
      topicId,
      quizId,
      setName: setName || 'Quiz Set',
      order: order !== undefined ? order : 0,
      quizNumber: hasQuizNumber ? Number(quizNumber) : undefined,
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
  static async getQuizSetsByTopicId(topicId, filter = {}, userId = null) {
    const quizSets = await QuizSetRepository.getQuizSetsByTopicId(topicId, filter);
    if (!userId) return quizSets;

    const user = await User.findById(userId).select('batches').lean();
    const userBatches = Array.isArray(user?.batches) ? user.batches : [];
    const now = new Date();

    return (quizSets || []).filter((qs) => {
      const quiz = qs?.quizId;
      if (!quiz) return false;
      if (!quiz.isActive) return false;
      if (quiz.availableFrom && now < new Date(quiz.availableFrom)) return false;
      if (quiz.availableTo && now > new Date(quiz.availableTo)) return false;

      if (quiz.availableToEveryone) return true;
      if (Array.isArray(quiz.batches) && quiz.batches.length > 0) {
        return quiz.batches.some((b) => userBatches.includes(b));
      }
      return false;
    });
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

