const QuizAttempt = require('../quiz/quiz_attempts.model');
const Quiz = require('../quiz/quiz.model');
const User = require('../user/users.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class UserDashboardRepository {
  /**
   * Get user dashboard statistics
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async getUserDashboardStats(userId) {
    try {
      // Get user's quiz attempts
      const allAttempts = await QuizAttempt.find({ userId })
        .populate('quizId', 'title description')
        .sort({ submittedAt: -1, createdAt: -1 })
        .lean();

      // Calculate statistics
      const totalAttempts = allAttempts.length;
      const totalQuizzesAttempted = new Set(allAttempts.map(a => a.quizId?._id?.toString())).size;
      
      // Calculate average score
      let totalMarksObtained = 0;
      let totalMarksPossible = 0;
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalUnattempted = 0;
      let passCount = 0;

      allAttempts.forEach(attempt => {
        totalMarksObtained += attempt.marksObtained || 0;
        totalMarksPossible += attempt.totalMarks || 0;
        totalCorrect += attempt.correctAnswers || 0;
        totalIncorrect += attempt.incorrectAnswers || 0;
        totalUnattempted += attempt.unattemptedAnswers || 0;
        if (attempt.result === 'pass') {
          passCount++;
        }
      });

      const averageScore = totalAttempts > 0 
        ? (totalMarksObtained / totalMarksPossible) * 100 
        : 0;
      const averagePercentage = totalAttempts > 0
        ? allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts
        : 0;
      const passRate = totalAttempts > 0 
        ? (passCount / totalAttempts) * 100 
        : 0;

      // Get performance over last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentAttempts = allAttempts.filter(a => 
        new Date(a.submittedAt) >= sevenDaysAgo
      );

      // Calculate daily performance for last 7 days
      const dailyPerformance = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayAttempts = allAttempts.filter(a => {
          const attemptDate = new Date(a.submittedAt);
          return attemptDate >= date && attemptDate < nextDate;
        });

        const dayAvg = dayAttempts.length > 0
          ? dayAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / dayAttempts.length
          : 0;

        dailyPerformance.push({
          date: date.toISOString().split('T')[0],
          score: Math.round(dayAvg * 100) / 100,
          attempts: dayAttempts.length
        });
      }

      // Get recent attempts (last 5)
      const recentAttemptsList = allAttempts.slice(0, 5).map(attempt => ({
        _id: attempt._id,
        quizTitle: attempt.quizId?.title || 'Unknown Quiz',
        marksObtained: attempt.marksObtained,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        result: attempt.result,
        submittedAt: attempt.submittedAt,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers
      }));

      // Get available quizzes count
      const user = await User.findById(userId).lean();
      const userBatches = user?.batches || [];
      const now = new Date();
      
      const availableQuizzes = await Quiz.countDocuments({
        isActive: true,
        $or: [
          { availableToEveryone: true },
          { batches: { $in: userBatches } }
        ],
        $and: [
          { $or: [{ availableFrom: { $exists: false } }, { availableFrom: { $lte: now } }] },
          { $or: [{ availableTo: { $exists: false } }, { availableTo: { $gte: now } }] }
        ]
      });

      // Calculate accuracy (correct / total answered)
      const totalAnswered = totalCorrect + totalIncorrect;
      const accuracy = totalAnswered > 0 
        ? (totalCorrect / totalAnswered) * 100 
        : 0;

      // Calculate speed (average time per question)
      let totalTimeSpent = 0;
      let totalQuestionsAnswered = 0;
      allAttempts.forEach(attempt => {
        if (attempt.timeSpentInSeconds && attempt.quizId) {
          totalTimeSpent += attempt.timeSpentInSeconds || 0;
          // Count total questions from the quiz, not just answered ones
          const quizQuestions = attempt.quizId?.questions?.length || 0;
          if (quizQuestions > 0) {
            totalQuestionsAnswered += quizQuestions;
          }
        }
      });
      const avgTimePerQuestion = totalQuestionsAnswered > 0
        ? totalTimeSpent / totalQuestionsAnswered
        : 0;
      const questionsPerHour = avgTimePerQuestion > 0
        ? 3600 / avgTimePerQuestion
        : 0;

      // Calculate best and worst scores
      const scores = allAttempts.map(a => a.percentage || 0).filter(s => s > 0);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const worstScore = scores.length > 0 ? Math.min(...scores) : 0;
      
      // Calculate improvement trend (compare last 3 attempts with previous 3)
      let improvementTrend = 0;
      if (allAttempts.length >= 6) {
        const recent3 = allAttempts.slice(0, 3);
        const previous3 = allAttempts.slice(3, 6);
        const recentAvg = recent3.reduce((sum, a) => sum + (a.percentage || 0), 0) / 3;
        const previousAvg = previous3.reduce((sum, a) => sum + (a.percentage || 0), 0) / 3;
        improvementTrend = recentAvg - previousAvg;
      }

      return {
        overview: {
          totalAttempts,
          totalQuizzesAttempted,
          availableQuizzes,
          averageScore: Math.round(averageScore * 100) / 100,
          averagePercentage: Math.round(averagePercentage * 100) / 100,
          passRate: Math.round(passRate * 100) / 100,
          accuracy: Math.round(accuracy * 100) / 100,
          questionsPerHour: Math.round(questionsPerHour * 100) / 100,
          bestScore: Math.round(bestScore * 100) / 100,
          worstScore: Math.round(worstScore * 100) / 100,
          improvementTrend: Math.round(improvementTrend * 100) / 100
        },
        performance: {
          totalCorrect,
          totalIncorrect,
          totalUnattempted,
          totalMarksObtained,
          totalMarksPossible
        },
        charts: {
          dailyPerformance,
          recentAttempts: recentAttempts.length
        },
        recentAttempts: recentAttemptsList
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching user dashboard stats: ${error.message}`);
    }
  }
}

module.exports = UserDashboardRepository;

