const QuizAttempt = require('../quiz/quiz_attempts.model');
const Quiz = require('../quiz/quiz.model');
const User = require('../user/users.model');
const mongoose = require('mongoose');
const { ErrorHandler } = require('../middleware/errorHandler');

class QuizReportRepository {
  /**
   * Get detailed quiz attempt report with correct answers
   * @param {string} attemptId
   * @param {string} userId - To verify ownership
   * @returns {Promise<Object>}
   */
  static async getQuizAttemptReport(attemptId, userId) {
    try {
      const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        userId: userId
      })
        .populate('quizId')
        .lean();

      if (!attempt) {
        throw new ErrorHandler(404, 'Quiz attempt not found or access denied');
      }

      const quiz = attempt.quizId;
      if (!quiz) {
        throw new ErrorHandler(404, 'Quiz not found');
      }

      // Get user details
      const user = await User.findById(userId).select('name email').lean();

      // Flatten questions from sections or use flat questions
      let allQuestions = [];
      if (quiz.useSections && quiz.sections && Array.isArray(quiz.sections)) {
        allQuestions = quiz.sections.flatMap((section) => section.questions || []);
      } else if (quiz.questions && Array.isArray(quiz.questions)) {
        allQuestions = quiz.questions;
      }

      // Build detailed question-by-question report
      const questionsReport = allQuestions.map((question, index) => {
        // Handle both Map and Object formats for answers
        let userAnswer;
        if (attempt.answers instanceof Map || attempt.answers.get) {
          userAnswer = attempt.answers.get ? attempt.answers.get(String(index)) : attempt.answers.get(index);
        } else {
          userAnswer = attempt.answers[String(index)] !== undefined 
            ? attempt.answers[String(index)] 
            : attempt.answers[index];
        }
        
        const questionType = question.questionType || 'multiple_choice_single';
        const isAnswered = userAnswer !== undefined && userAnswer !== null;
        
        // Determine if answer is correct based on question type
        let isCorrect = false;
        let correctAnswer = '';
        let userAnswerDisplay = 'Not Attempted';
        let userAnswerIndex = null;

        switch (questionType) {
          case 'multiple_choice_single':
          case 'true_false':
            isCorrect = userAnswer === question.correctOptionIndex;
            userAnswerIndex = userAnswer;
            correctAnswer = question.options?.[question.correctOptionIndex] || '';
            userAnswerDisplay = isAnswered && question.options?.[userAnswer] 
              ? question.options[userAnswer] 
              : 'Not Attempted';
            break;

          case 'multiple_choice_multiple':
            if (Array.isArray(userAnswer) && Array.isArray(question.correctOptionIndices)) {
              const userSet = new Set(userAnswer.sort());
              const correctSet = new Set(question.correctOptionIndices.sort());
              isCorrect = userSet.size === correctSet.size && 
                         [...userSet].every(val => correctSet.has(val));
            }
            correctAnswer = question.correctOptionIndices?.map(idx => 
              question.options?.[idx] || `Option ${idx + 1}`
            ).join(', ') || '';
            userAnswerDisplay = isAnswered && Array.isArray(userAnswer)
              ? userAnswer.map(idx => question.options?.[idx] || `Option ${idx + 1}`).join(', ')
              : 'Not Attempted';
            break;

          case 'fill_in_blank':
            if (typeof userAnswer === 'string' && Array.isArray(question.correctAnswers)) {
              const normalizedUserAnswer = userAnswer.trim().toLowerCase();
              isCorrect = question.correctAnswers.some(correct => 
                correct.trim().toLowerCase() === normalizedUserAnswer
              );
            }
            correctAnswer = question.correctAnswers?.join(', ') || '';
            userAnswerDisplay = isAnswered ? String(userAnswer) : 'Not Attempted';
            break;

          case 'match':
            if (Array.isArray(userAnswer) && Array.isArray(question.matchPairs)) {
              isCorrect = question.matchPairs.every((pair, idx) => {
                const userMatch = userAnswer[idx];
                return userMatch && userMatch.trim().toLowerCase() === pair.right.trim().toLowerCase();
              });
            }
            correctAnswer = question.matchPairs?.map(pair => `${pair.left} → ${pair.right}`).join(', ') || '';
            userAnswerDisplay = isAnswered && Array.isArray(userAnswer)
              ? question.matchPairs?.map((pair, idx) => `${pair.left} → ${userAnswer[idx] || '?'}`).join(', ') || ''
              : 'Not Attempted';
            break;

          case 'reorder':
            if (Array.isArray(userAnswer) && Array.isArray(question.correctOrder)) {
              isCorrect = userAnswer.length === question.correctOrder.length &&
                         userAnswer.every((item, idx) => 
                           item.trim().toLowerCase() === question.correctOrder[idx].trim().toLowerCase()
                         );
            }
            correctAnswer = question.correctOrder?.join(' → ') || '';
            userAnswerDisplay = isAnswered && Array.isArray(userAnswer)
              ? userAnswer.join(' → ')
              : 'Not Attempted';
            break;

          default:
            // Fallback to single choice logic
            isCorrect = userAnswer === question.correctOptionIndex;
            userAnswerIndex = userAnswer;
            correctAnswer = question.options?.[question.correctOptionIndex] || '';
            userAnswerDisplay = isAnswered && question.options?.[userAnswer] 
              ? question.options[userAnswer] 
              : 'Not Attempted';
        }
        
        let marksObtained = 0;
        if (isCorrect) {
          marksObtained = question.marks || 1;
        } else if (isAnswered && question.negativeMarks) {
          marksObtained = -(question.negativeMarks || 0);
        }

        return {
          questionNumber: index + 1,
          questionType: questionType,
          questionText: question.questionText,
          options: question.options || [],
          correctOptionIndex: question.correctOptionIndex,
          correctOptionIndices: question.correctOptionIndices,
          correctAnswers: question.correctAnswers,
          matchPairs: question.matchPairs,
          correctOrder: question.correctOrder,
          correctAnswer: correctAnswer,
          userAnswerIndex: userAnswerIndex,
          userAnswer: userAnswerDisplay,
          userAnswerRaw: userAnswer,
          isCorrect,
          isAnswered,
          marksObtained,
          marks: question.marks || 1,
          negativeMarks: question.negativeMarks || 0
        };
      });

      return {
        attemptId: attempt._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        quizDescription: quiz.description,
        user: {
          name: user?.name || 'Unknown',
          email: user?.email || attempt.userEmail
        },
        attemptDetails: {
          submittedAt: attempt.submittedAt,
          timeSpentInSeconds: attempt.timeSpentInSeconds,
          timeSpentFormatted: this.formatTime(attempt.timeSpentInSeconds),
          marksObtained: attempt.marksObtained,
          totalMarks: attempt.totalMarks,
          percentage: attempt.percentage,
          result: attempt.result,
          correctAnswers: attempt.correctAnswers,
          incorrectAnswers: attempt.incorrectAnswers,
          unattemptedAnswers: attempt.unattemptedAnswers
        },
        questions: questionsReport,
        summary: {
          totalQuestions: allQuestions.length,
          attempted: attempt.correctAnswers + attempt.incorrectAnswers,
          correct: attempt.correctAnswers,
          incorrect: attempt.incorrectAnswers,
          unattempted: attempt.unattemptedAnswers,
          accuracy: attempt.correctAnswers + attempt.incorrectAnswers > 0
            ? ((attempt.correctAnswers / (attempt.correctAnswers + attempt.incorrectAnswers)) * 100).toFixed(2)
            : 0
        }
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error fetching quiz report: ${error.message}`);
    }
  }

  /**
   * Get all quiz attempts for a user with basic info
   * @param {string} userId
   * @param {string} quizId - Optional filter by quiz
   * @returns {Promise<Array>}
   */
  static async getUserQuizAttempts(userId, quizId = null) {
    try {
      // Convert userId to ObjectId if it's a string
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;

      const matchCriteria = { userId: userIdObj };
      if (quizId) {
        const quizIdObj = mongoose.Types.ObjectId.isValid(quizId) 
          ? new mongoose.Types.ObjectId(quizId) 
          : quizId;
        matchCriteria.quizId = quizIdObj;
      }

      console.log('Fetching quiz attempts with criteria:', matchCriteria);

      const attempts = await QuizAttempt.find(matchCriteria)
        .populate('quizId', 'title description')
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean();

      console.log(`Found ${attempts.length} quiz attempts for user ${userId}`);

      const mappedAttempts = attempts.map(attempt => {
        const attemptData = {
          attemptId: attempt._id?.toString(),
          quizId: attempt.quizId?._id?.toString() || attempt.quizId?.toString(),
          quizTitle: attempt.quizId?.title || 'Unknown Quiz',
          submittedAt: attempt.submittedAt || attempt.createdAt,
          marksObtained: attempt.marksObtained || 0,
          totalMarks: attempt.totalMarks || 0,
          percentage: attempt.percentage || 0,
          result: attempt.result || 'fail',
          timeSpentInSeconds: attempt.timeSpentInSeconds || 0
        };
        return attemptData;
      });

      return mappedAttempts;
    } catch (error) {
      console.error('Error in getUserQuizAttempts:', error);
      throw new ErrorHandler(500, `Error fetching user quiz attempts: ${error.message}`);
    }
  }

  /**
   * Format time in seconds to readable format
   * @param {number} seconds
   * @returns {string}
   */
  static formatTime(seconds) {
    if (!seconds) return '0m 0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  }
}

module.exports = QuizReportRepository;

