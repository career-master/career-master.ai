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

        // Normalize correct answers for robust comparison
        const correctSingle =
          typeof question.correctOptionIndex === 'number'
            ? question.correctOptionIndex
            : Array.isArray(question.correctOptionIndices) && question.correctOptionIndices.length === 1
              ? question.correctOptionIndices[0]
              : undefined;
        const correctMultiple = Array.isArray(question.correctOptionIndices)
          ? question.correctOptionIndices
          : typeof correctSingle === 'number'
            ? [correctSingle]
            : [];

        switch (questionType) {
          case 'multiple_choice_single':
          case 'true_false': {
            isCorrect =
              typeof userAnswer === 'number' &&
              typeof correctSingle === 'number' &&
              userAnswer === correctSingle;
            userAnswerIndex = userAnswer;
            correctAnswer = typeof correctSingle === 'number'
              ? (question.options?.[correctSingle] || '')
              : '';
            userAnswerDisplay = isAnswered && typeof userAnswer === 'number' && question.options?.[userAnswer]
              ? question.options[userAnswer]
              : 'Not Attempted';
            break;
          }

          case 'multiple_choice_multiple': {
            const userArray = Array.isArray(userAnswer)
              ? userAnswer
              : typeof userAnswer === 'number'
                ? [userAnswer]
                : [];
            const correctArray = correctMultiple;

            if (userArray.length > 0 && correctArray.length > 0) {
              const userSet = new Set(userArray.sort());
              const correctSet = new Set(correctArray.sort());
              isCorrect =
                userSet.size === correctSet.size &&
                [...userSet].every((val) => correctSet.has(val));
            } else if (
              userArray.length === 1 &&
              typeof correctSingle === 'number'
            ) {
              isCorrect = userArray[0] === correctSingle;
            }

            correctAnswer = correctArray
              .map((idx) => question.options?.[idx] || `Option ${idx + 1}`)
              .join(', ') || '';
            userAnswerDisplay = isAnswered && userArray.length > 0
              ? userArray.map((idx) => question.options?.[idx] || `Option ${idx + 1}`).join(', ')
              : 'Not Attempted';
            break;
          }

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

          case 'hotspot':
            // For hotspot questions, userAnswer should be an array of { x, y } coordinates
            // User must click on ALL hotspots to get it correct
            if (Array.isArray(userAnswer) && Array.isArray(question.hotspotRegions) && question.hotspotRegions.length > 0) {
              // First check count matches
              if (userAnswer.length === question.hotspotRegions.length) {
                const isClickInHotspot = (click, hotspot) => {
                  if (!click || !hotspot || typeof click.x !== 'number' || typeof click.y !== 'number') {
                    return false;
                  }
                  const regionLeft = hotspot.x;
                  const regionRight = hotspot.x + hotspot.width;
                  const regionTop = hotspot.y;
                  const regionBottom = hotspot.y + hotspot.height;
                  return click.x >= regionLeft && click.x <= regionRight &&
                         click.y >= regionTop && click.y <= regionBottom;
                };

                const allRegionsClicked = question.hotspotRegions.every((region) => {
                  return userAnswer.some((click) => isClickInHotspot(click, region));
                });

                isCorrect = allRegionsClicked;
              } else {
                isCorrect = false;
              }
            }

            correctAnswer = `All ${question.hotspotRegions?.length || 0} hotspot regions`;
            userAnswerDisplay = Array.isArray(userAnswer) && userAnswer.length > 0
              ? `Clicked ${userAnswer.length} hotspot${userAnswer.length !== 1 ? 's' : ''}`
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
          // Image / hotspot info for frontend visualization
          imageUrl: question.imageUrl,
          hotspotRegions: question.hotspotRegions,
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
   * @param {Object} filters - Additional filters (subjectId, topicId, dateFrom, dateTo, minScore, maxScore, difficulty)
   * @returns {Promise<Array>}
   */
  static async getUserQuizAttempts(userId, quizId = null, filters = {}) {
    try {
      // Convert userId to ObjectId if it's a string
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;

      const matchCriteria = { userId: userIdObj };
      
      // Handle quizId - ensure it's a valid ObjectId string, not an object
      if (quizId && typeof quizId === 'string' && quizId.trim() !== '') {
        if (mongoose.Types.ObjectId.isValid(quizId)) {
          matchCriteria.quizId = new mongoose.Types.ObjectId(quizId);
        }
      } else if (quizId && typeof quizId === 'object' && !Array.isArray(quizId)) {
        // If quizId is an object (like {}), ignore it
        console.warn('Invalid quizId provided (object), ignoring filter');
      }

      // Apply additional filters
      if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
        if (filters.subjectId && mongoose.Types.ObjectId.isValid(filters.subjectId)) {
          matchCriteria.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
        }
        if (filters.topicId && mongoose.Types.ObjectId.isValid(filters.topicId)) {
          matchCriteria.topicId = new mongoose.Types.ObjectId(filters.topicId);
        }
        if (filters.dateFrom || filters.dateTo) {
          matchCriteria.submittedAt = {};
          if (filters.dateFrom) {
            matchCriteria.submittedAt.$gte = new Date(filters.dateFrom);
          }
          if (filters.dateTo) {
            matchCriteria.submittedAt.$lte = new Date(filters.dateTo);
          }
        }
        if (filters.minScore !== undefined || filters.maxScore !== undefined) {
          matchCriteria.percentage = {};
          if (filters.minScore !== undefined) {
            matchCriteria.percentage.$gte = parseFloat(filters.minScore);
          }
          if (filters.maxScore !== undefined) {
            matchCriteria.percentage.$lte = parseFloat(filters.maxScore);
          }
        }
        if (filters.difficulty) {
          // Note: difficulty is stored in questions, so this would need aggregation
          // For now, we'll skip this filter or implement it via aggregation
        }
      }

      console.log('Fetching quiz attempts with criteria:', JSON.stringify(matchCriteria, null, 2));

      const attempts = await QuizAttempt.find(matchCriteria)
        .populate('quizId', 'title description')
        .populate('subjectId', 'name')
        .populate('topicId', 'title')
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean();

      console.log(`Found ${attempts.length} quiz attempts for user ${userId}`);

      // Apply score filters if needed (after fetching, since percentage is calculated)
      let filteredAttempts = attempts;
      if (filters && typeof filters === 'object') {
        if (filters.minScore !== undefined || filters.maxScore !== undefined) {
          // Already applied in query, but double-check
          filteredAttempts = attempts.filter(attempt => {
            const percentage = attempt.percentage || 0;
            if (filters.minScore !== undefined && percentage < filters.minScore) return false;
            if (filters.maxScore !== undefined && percentage > filters.maxScore) return false;
            return true;
          });
        }
      }

      const mappedAttempts = filteredAttempts.map(attempt => {
        const attemptData = {
          attemptId: attempt._id?.toString(),
          quizId: attempt.quizId?._id?.toString() || attempt.quizId?.toString(),
          quizTitle: attempt.quizId?.title || 'Unknown Quiz',
          subjectId: attempt.subjectId?._id?.toString() || attempt.subjectId?.toString() || null,
          subjectName: attempt.subjectId?.name || null,
          topicId: attempt.topicId?._id?.toString() || attempt.topicId?.toString() || null,
          topicTitle: attempt.topicId?.title || null,
          submittedAt: attempt.submittedAt || attempt.createdAt,
          marksObtained: attempt.marksObtained || 0,
          totalMarks: attempt.totalMarks || 0,
          percentage: attempt.percentage || 0,
          result: attempt.result || 'fail',
          timeSpentInSeconds: attempt.timeSpentInSeconds || 0,
          difficultyBreakdown: attempt.difficultyBreakdown || null
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

