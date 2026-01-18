const QuizAttemptRepository = require('./quiz_attempts.repository');
const QuizRepository = require('./quiz.repository');
const User = require('../user/users.model');
const TopicProgressService = require('../topic-progress/topic-progress.service');
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

      // Flatten questions from sections or use flat questions
      let allQuestions = [];
      if (quiz.useSections && quiz.sections && Array.isArray(quiz.sections)) {
        allQuestions = quiz.sections.flatMap((section) => section.questions || []);
      } else if (quiz.questions && Array.isArray(quiz.questions)) {
        allQuestions = quiz.questions;
      }

      if (allQuestions.length === 0) {
        throw new ErrorHandler(400, 'Quiz has no questions');
      }

      // Calculate results
      let marksObtained = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let unattemptedAnswers = 0;
      let totalMarks = 0;

      allQuestions.forEach((question, questionIndex) => {
        const marks = question.marks || 1;
        const negativeMarks = question.negativeMarks || 0;
        totalMarks += marks;

        const userAnswer = answers[questionIndex];
        
        if (userAnswer === null || userAnswer === undefined) {
          unattemptedAnswers++;
          return;
        }

        // Grade based on question type
        let isCorrect = false;
        const questionType = question.questionType || 'multiple_choice_single';

        // Normalize correct answers for robustness
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
          case 'true_false':
            isCorrect =
              typeof userAnswer === 'number' &&
              typeof correctSingle === 'number' &&
              userAnswer === correctSingle;
            break;

          case 'multiple_choice_multiple':
            // Normalize user answer to array
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
              // Fallback when only a single correct option exists
              isCorrect = userArray[0] === correctSingle;
            }
            break;

          case 'fill_in_blank':
            if (typeof userAnswer === 'string' && Array.isArray(question.correctAnswers)) {
              const normalizedUserAnswer = userAnswer.trim().toLowerCase();
              isCorrect = question.correctAnswers.some(correct => 
                correct.trim().toLowerCase() === normalizedUserAnswer
              );
            }
            break;

          case 'match':
            if (Array.isArray(userAnswer) && Array.isArray(question.matchPairs)) {
              // Check if all match pairs are correct
              isCorrect = question.matchPairs.every((pair, index) => {
                const userMatch = userAnswer[index];
                return userMatch && userMatch.trim().toLowerCase() === pair.right.trim().toLowerCase();
              });
            }
            break;

          case 'reorder':
            if (Array.isArray(userAnswer) && Array.isArray(question.correctOrder)) {
              // Check if order matches exactly
              isCorrect = userAnswer.length === question.correctOrder.length &&
                         userAnswer.every((item, index) => 
                           item.trim().toLowerCase() === question.correctOrder[index].trim().toLowerCase()
                         );
            }
            break;

          case 'hotspot':
            // For hotspot questions, userAnswer should be an array of { x, y } coordinates
            // User must click on ALL hotspots to get it correct
            if (Array.isArray(userAnswer) && userAnswer.length > 0 &&
                Array.isArray(question.hotspotRegions) && question.hotspotRegions.length > 0) {
              
              // Check if user clicked on all required hotspots
              if (userAnswer.length !== question.hotspotRegions.length) {
                isCorrect = false;
              } else {
                // Check if each hotspot region has at least one click within it
                const allRegionsClicked = question.hotspotRegions.every(region => {
                  const regionLeft = region.x;
                  const regionRight = region.x + region.width;
                  const regionTop = region.y;
                  const regionBottom = region.y + region.height;
                  
                  // Check if at least one click point is within this region
                  return userAnswer.some(click => {
                    if (click && typeof click === 'object' && 
                        typeof click.x === 'number' && typeof click.y === 'number') {
                      return click.x >= regionLeft && click.x <= regionRight &&
                             click.y >= regionTop && click.y <= regionBottom;
                    }
                    return false;
                  });
                });
                
                isCorrect = allRegionsClicked;
              }
            }
            break;

          default:
            // Fallback to single choice logic
            isCorrect = userAnswer === question.correctOptionIndex;
        }

        if (isCorrect) {
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

      // Convert answers object to Map format (Mongoose Map requires string keys)
      // Keep answers as-is, Mongoose will handle the Map conversion
      const answersForStorage = {};
      Object.keys(answers).forEach((key) => {
        const answerValue = answers[key];
        // Store the answer value as-is (can be number, string, or array)
        if (answerValue !== null && answerValue !== undefined) {
          answersForStorage[key] = answerValue;
        }
      });

      // Create attempt
      const attempt = await QuizAttemptRepository.createAttempt({
        quizId,
        userId,
        userEmail,
        answers: answersForStorage, // Mongoose will convert this to a Map
        timeSpentInSeconds,
        marksObtained,
        totalMarks,
        correctAnswers,
        incorrectAnswers,
        unattemptedAnswers,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        result
      });

      // Record quiz completion for topic progress (if quiz is part of a topic)
      try {
        const progressResult = await TopicProgressService.recordQuizCompletion(userId, quizId, attempt._id.toString());
        if (progressResult) {
          console.log('Quiz completion recorded successfully for topic progress:', {
            quizId,
            attemptId: attempt._id.toString(),
            topicId: progressResult.topicId?.toString(),
            completedQuizzesCount: progressResult.completedQuizzes?.length || 0
          });
        } else {
          console.log('Quiz not linked to any topic via QuizSet, skipping topic progress recording:', quizId);
        }
      } catch (progressError) {
        // Log but don't fail the quiz submission if topic progress tracking fails
        console.error('Error recording topic progress:', {
          error: progressError.message,
          stack: progressError.stack,
          quizId,
          attemptId: attempt._id.toString(),
          userId
        });
      }

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
      const userSelectedCourses = user.profile?.selectedCourses || [];

      // Get all active quizzes
      const allQuizzes = await QuizRepository.getAllQuizzes(true);

      // Get all quiz IDs that are part of quiz sets (these should only show in subject/topic pages)
      const QuizSet = require('../quiz-sets/quiz-sets.model');
      const quizSets = await QuizSet.find({ isActive: true }).select('quizId').lean();
      const quizIdsInSets = new Set(quizSets.map(qs => qs.quizId.toString()));

      // Filter quizzes available to user
      // Exclude quizzes that are part of quiz sets (they should only appear in subject/topic pages)
      const availableQuizzes = allQuizzes.filter((quiz) => {
        // Exclude quizzes that are in quiz sets
        if (quizIdsInSets.has(quiz._id.toString())) {
          return false;
        }
        // Check if quiz is active
        if (!quiz.isActive) return false;

        // Check date range
        if (quiz.availableFrom && now < quiz.availableFrom) return false;
        if (quiz.availableTo && now > quiz.availableTo) return false;

        // Filter by course categories if user has selected courses
        if (userSelectedCourses && userSelectedCourses.length > 0) {
          const quizCourseCategories = quiz.courseCategories || [];
          // Show quiz if it has no course categories (available to all) OR matches user's selected courses
          if (quizCourseCategories.length > 0) {
            const hasMatchingCourse = quizCourseCategories.some(cat => userSelectedCourses.includes(cat));
            if (!hasMatchingCourse) {
              return false; // Quiz doesn't match user's selected courses
            }
          }
        }

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

          // Calculate total marks and question count - handle both sectioned and flat quizzes
          let totalMarks = 0;
          let questionCount = 0;
          
          if (quiz.useSections && quiz.sections && Array.isArray(quiz.sections)) {
            // Sectioned quiz - calculate from sections
            quiz.sections.forEach((section) => {
              if (section.questions && Array.isArray(section.questions)) {
                section.questions.forEach((q) => {
                  totalMarks += q.marks || 1;
                  questionCount++;
                });
              }
            });
          } else if (quiz.questions && Array.isArray(quiz.questions)) {
            // Flat quiz - calculate from questions array
            quiz.questions.forEach((q) => {
              totalMarks += q.marks || 1;
              questionCount++;
            });
          }

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
            questionCount,
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

