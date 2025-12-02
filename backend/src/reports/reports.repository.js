const QuizAttempt = require('../quiz/quiz_attempts.model');
const User = require('../user/users.model');
const Quiz = require('../quiz/quiz.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class ReportsRepository {
  /**
   * Get top performers/leaderboard
   * @param {Object} options - { limit, quizId, batchId, sortBy }
   * @returns {Promise<Array>}
   */
  static async getTopPerformers(options = {}) {
    try {
      const {
        limit = 10,
        quizId = null,
        batchId = null,
        sortBy = 'averageScore' // 'averageScore', 'totalMarks', 'totalAttempts'
      } = options;

      // Build match criteria
      const matchCriteria = {};
      if (quizId) {
        matchCriteria.quizId = quizId;
      }

      // If batchId is provided, filter users by batch
      let userIds = null;
      if (batchId) {
        const users = await User.find({ batches: batchId }).select('_id').lean();
        userIds = users.map(u => u._id);
        matchCriteria.userId = { $in: userIds };
      }

      // Aggregate to get user statistics
      const pipeline = [
        { $match: matchCriteria },
        {
          $group: {
            _id: '$userId',
            totalAttempts: { $sum: 1 },
            totalMarksObtained: { $sum: '$marksObtained' },
            totalMarksPossible: { $sum: '$totalMarks' },
            averagePercentage: { $avg: '$percentage' },
            averageScore: { $avg: '$percentage' },
            bestScore: { $max: '$percentage' },
            passCount: {
              $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] }
            },
            totalCorrect: { $sum: '$correctAnswers' },
            totalIncorrect: { $sum: '$incorrectAnswers' },
            lastAttemptDate: { $max: '$submittedAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: '$_id',
            name: { $ifNull: ['$user.name', 'Unknown'] },
            email: { $ifNull: ['$user.email', ''] },
            totalAttempts: 1,
            totalMarksObtained: 1,
            totalMarksPossible: 1,
            averagePercentage: { $round: ['$averagePercentage', 2] },
            averageScore: { $round: ['$averageScore', 2] },
            bestScore: { $round: ['$bestScore', 2] },
            passRate: {
              $round: [
                { $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100] },
                2
              ]
            },
            totalCorrect: 1,
            totalIncorrect: 1,
            accuracy: {
              $round: [
                {
                  $cond: [
                    { $gt: [{ $add: ['$totalCorrect', '$totalIncorrect'] }, 0] },
                    {
                      $multiply: [
                        {
                          $divide: [
                            '$totalCorrect',
                            { $add: ['$totalCorrect', '$totalIncorrect'] }
                          ]
                        },
                        100
                      ]
                    },
                    0
                  ]
                },
                2
              ]
            },
            lastAttemptDate: 1
          }
        }
      ];

      // Sort based on sortBy parameter
      let sortField = 'averageScore';
      if (sortBy === 'totalMarks') {
        sortField = 'totalMarksObtained';
      } else if (sortBy === 'totalAttempts') {
        sortField = 'totalAttempts';
      } else if (sortBy === 'bestScore') {
        sortField = 'bestScore';
      }

      pipeline.push({ $sort: { [sortField]: -1 } });
      pipeline.push({ $limit: limit });

      const topPerformers = await QuizAttempt.aggregate(pipeline);

      // Add rank to each performer
      const performersWithRank = topPerformers.map((performer, index) => ({
        ...performer,
        rank: index + 1
      }));

      return performersWithRank;
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching top performers: ${error.message}`);
    }
  }

  /**
   * Get user's rank and comparison data
   * @param {string} userId
   * @param {Object} options - { quizId, batchId }
   * @returns {Promise<Object>}
   */
  static async getUserRankAndComparison(userId, options = {}) {
    try {
      const { quizId = null, batchId = null } = options;

      // Get all top performers
      const topPerformers = await this.getTopPerformers({
        limit: 1000, // Get all for ranking
        quizId,
        batchId,
        sortBy: 'averageScore'
      });

      // Find user's position
      const userIndex = topPerformers.findIndex(
        p => p.userId.toString() === userId.toString()
      );

      if (userIndex === -1) {
        // User not found in top performers
        return {
          userRank: null,
          totalUsers: topPerformers.length,
          userData: null,
          aboveUsers: [],
          belowUsers: topPerformers.slice(0, 5)
        };
      }

      const userData = topPerformers[userIndex];
      const userRank = userIndex + 1;

      // Get users above and below
      const aboveUsers = topPerformers.slice(
        Math.max(0, userIndex - 3),
        userIndex
      );
      const belowUsers = topPerformers.slice(
        userIndex + 1,
        Math.min(topPerformers.length, userIndex + 4)
      );

      return {
        userRank,
        totalUsers: topPerformers.length,
        userData: {
          ...userData,
          rank: userRank
        },
        aboveUsers,
        belowUsers
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching user rank: ${error.message}`);
    }
  }

  /**
   * Get quiz-wise leaderboard
   * @param {string} quizId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  static async getQuizLeaderboard(quizId, limit = 10) {
    try {
      const attempts = await QuizAttempt.find({ quizId })
        .populate('userId', 'name email')
        .sort({ percentage: -1, submittedAt: -1 })
        .limit(limit)
        .lean();

      const leaderboard = attempts.map((attempt, index) => ({
        rank: index + 1,
        userId: attempt.userId._id,
        name: attempt.userId.name || attempt.userId.email.split('@')[0],
        email: attempt.userId.email,
        marksObtained: attempt.marksObtained,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        result: attempt.result,
        submittedAt: attempt.submittedAt,
        timeSpentInSeconds: attempt.timeSpentInSeconds
      }));

      return leaderboard;
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching quiz leaderboard: ${error.message}`);
    }
  }

  /**
   * Get batch-wise statistics for reports
   * @param {string} batchId
   * @returns {Promise<Object>}
   */
  static async getBatchStatistics(batchId) {
    try {
      const users = await User.find({ batches: batchId }).select('_id').lean();
      const userIds = users.map(u => u._id);

      const stats = await QuizAttempt.aggregate([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            totalUsers: { $addToSet: '$userId' },
            averageScore: { $avg: '$percentage' },
            passCount: {
              $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] }
            },
            totalMarksObtained: { $sum: '$marksObtained' },
            totalMarksPossible: { $sum: '$totalMarks' }
          }
        },
        {
          $project: {
            totalAttempts: 1,
            totalUsers: { $size: '$totalUsers' },
            averageScore: { $round: ['$averageScore', 2] },
            passRate: {
              $round: [
                { $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100] },
                2
              ]
            },
            totalMarksObtained: 1,
            totalMarksPossible: 1
          }
        }
      ]);

      return stats[0] || {
        totalAttempts: 0,
        totalUsers: 0,
        averageScore: 0,
        passRate: 0,
        totalMarksObtained: 0,
        totalMarksPossible: 0
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching batch statistics: ${error.message}`);
    }
  }
}

module.exports = ReportsRepository;

