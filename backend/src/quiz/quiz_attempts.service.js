const QuizAttemptRepository = require('./quiz_attempts.repository');
const QuizRepository = require('./quiz.repository');
const User = require('../user/users.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Quiz Attempt Service
 * Business logic for quiz attempts
 */
class QuizAttemptService {
  /**
   * Submit quiz attempt
   * @param {string} quizId
   * @param {string} userId
   * @param {string} userEmail
   * @param {Object} answers - Map of question index to option index
   * @param {number} timeSpentInSeconds
   * @returns {Promise<Object>}
   */
  static async submitAttempt(quizId, userId, userEmail, answers, timeSpentInSeconds) {
    try {
      // Get quiz
      const quiz = await QuizRepository.getQuizById(quizId);
      if (!quiz) {
        throw new ErrorHandler(404, 'Quiz not found');
      }

      if (!quiz.isActive) {
        throw new ErrorHandler(400, 'Quiz is not active');
      }

      // Check if quiz is available (date range)
      const now = new Date();
      if (quiz.availableFrom && now < quiz.availableFrom) {
        throw new ErrorHandler(400, 'Quiz is not available yet');
      }
      if (quiz.availableTo && now > quiz.availableTo) {
        throw new ErrorHandler(400, 'Quiz availability has expired');
      }

      // Check max attempts limit
      const maxAttempts = quiz.maxAttempts || 999;
      if (maxAttempts !== 999) {
        const existingAttempts = await QuizAttemptRepository.getUserQuizAttemptsByEmail(
          userEmail,
          quizId
        );
        if (existingAttempts.length >= maxAttempts) {
          throw new ErrorHandler(400, `You have reached the maximum number of attempts (${maxAttempts}) for this quiz`);
        }
      }

      // Calculate results
      let marksObtained = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let unattemptedAnswers = 0;
      let totalMarks = 0;

      quiz.questions.forEach((question, questionIndex) => {
        const marks = question.marks || 1;
        const negativeMarks = question.negativeMarks || 0;
        totalMarks += marks;

        const userAnswer = answers[questionIndex];
        
        if (userAnswer === null || userAnswer === undefined) {
          unattemptedAnswers++;
          return;
        }

        if (userAnswer === question.correctOptionIndex) {
          marksObtained += marks;
          correctAnswers++;
        } else {
          marksObtained -= negativeMarks;
          incorrectAnswers++;
        }
      });

      // Ensure marks don't go negative
      marksObtained = Math.max(0, marksObtained);

      // Calculate percentage
      const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;

      // Determine pass/fail (50% passing criteria)
      const result = percentage >= 50 ? 'pass' : 'fail';

      // Convert answers object to Map format
      const answersMap = new Map();
      Object.keys(answers).forEach((key) => {
        answersMap.set(parseInt(key), answers[key]);
      });

      // Create attempt
      const attempt = await QuizAttemptRepository.createAttempt({
        quizId,
        userId,
        userEmail,
        answers: Object.fromEntries(answersMap),
        timeSpentInSeconds,
        marksObtained,
        totalMarks,
        correctAnswers,
        incorrectAnswers,
        unattemptedAnswers,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        result
      });

      return attempt;
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error submitting quiz attempt: ${error.message}`);
    }
  }

  /**
   * Get available quizzes for a user
   * @param {string} userEmail
   * @returns {Promise<Array>}
   */
  static async getAvailableQuizzesForUser(userEmail) {
    try {
      // Get user
      const user = await User.findOne({ email: userEmail }).lean();
      if (!user) {
        throw new ErrorHandler(404, 'User not found');
      }

      const now = new Date();
      const userBatches = user.batches || [];

      // Get all active quizzes
      const allQuizzes = await QuizRepository.getAllQuizzes(true);

      // Filter quizzes available to user
      const availableQuizzes = allQuizzes.filter((quiz) => {
        // Check if quiz is active
        if (!quiz.isActive) return false;

        // Check date range
        if (quiz.availableFrom && now < quiz.availableFrom) return false;
        if (quiz.availableTo && now > quiz.availableTo) return false;

        // Check if available to everyone
        if (quiz.availableToEveryone) return true;

        // Check if user's batches match quiz batches
        if (quiz.batches && quiz.batches.length > 0) {
          return quiz.batches.some((batch) => userBatches.includes(batch));
        }

        return false;
      });

      // Get user attempts for each quiz
      const quizzesWithAttempts = await Promise.all(
        availableQuizzes.map(async (quiz) => {
          const attempts = await QuizAttemptRepository.getUserQuizAttemptsByEmail(
            userEmail,
            quiz._id.toString()
          );

          // Calculate total marks
          const totalMarks = quiz.questions.reduce(
            (sum, q) => sum + (q.marks || 1),
            0
          );

          const maxAttempts = quiz.maxAttempts || 999; // Default to unlimited (999)
          const attemptsMade = attempts.length;
          const attemptsLeft = maxAttempts === 999 ? 999 : Math.max(0, maxAttempts - attemptsMade);
          const canAttempt = maxAttempts === 999 || attemptsMade < maxAttempts;
          const isCompleted = maxAttempts !== 999 && attemptsMade >= maxAttempts;

          return {
            _id: quiz._id,
            name: quiz.title,
            description: quiz.description,
            durationMinutes: quiz.durationMinutes,
            totalMarks,
            questionCount: quiz.questions.length,
            attemptsMade,
            maxAttempts,
            attemptsLeft,
            canAttempt,
            isCompleted,
            lastAttempt: attempts.length > 0 ? attempts[0] : null
          };
        })
      );

      return quizzesWithAttempts;
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error fetching available quizzes: ${error.message}`);
    }
  }

  /**
   * Get user attempts for a quiz
   * @param {string} userId
   * @param {string} quizId
   * @returns {Promise<Array>}
   */
  static async getUserQuizAttempts(userId, quizId) {
    return QuizAttemptRepository.getUserQuizAttempts(userId, quizId);
  }

  /**
   * Get attempt by ID
   * @param {string} attemptId
   * @returns {Promise<Object>}
   */
  static async getAttemptById(attemptId) {
    const attempt = await QuizAttemptRepository.getAttemptById(attemptId);
    if (!attempt) {
      throw new ErrorHandler(404, 'Quiz attempt not found');
    }
    return attempt;
  }
}

module.exports = QuizAttemptService;

