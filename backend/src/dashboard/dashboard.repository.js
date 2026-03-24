const User = require('../user/users.model');
const Quiz = require('../quiz/quiz.model');
const Batch = require('../batches/batches.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class DashboardRepository {
  static async getStatistics() {
    try {
      // Get total counts
      const [
        totalUsers,
        totalQuizzes,
        totalBatches,
        activeUsers,
        activeQuizzes,
        activeBatches,
        usersThisWeek,
        usersThisMonth,
        quizzesThisWeek,
        quizzesThisMonth,
      ] = await Promise.all([
        User.countDocuments(),
        Quiz.countDocuments(),
        Batch.countDocuments(),
        User.countDocuments({ status: 'active' }),
        Quiz.countDocuments({ isActive: true }),
        Batch.countDocuments({ isActive: true }),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        Quiz.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        Quiz.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
      ]);

      // Get user growth data (last 7 days)
      const userGrowthData = [];
      const quizGrowthData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [dayUsers, dayQuizzes] = await Promise.all([
          User.countDocuments({
            createdAt: { $gte: date, $lt: nextDate }
          }),
          Quiz.countDocuments({
            createdAt: { $gte: date, $lt: nextDate }
          }),
        ]);

        userGrowthData.push({
          date: date.toISOString().split('T')[0],
          count: dayUsers
        });
        quizGrowthData.push({
          date: date.toISOString().split('T')[0],
          count: dayQuizzes
        });
      }

      // Get users by role
      const usersByRole = await User.aggregate([
        { $unwind: '$roles' },
        { $group: { _id: '$roles', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get recent users (last 10)
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email roles status createdAt')
        .lean();

      // Get quizzes by batch assignment
      const quizzesWithBatches = await Quiz.countDocuments({
        batches: { $exists: true, $ne: [] }
      });
      const quizzesWithoutBatches = await Quiz.countDocuments({
        $or: [{ batches: { $exists: false } }, { batches: [] }]
      });

      // Get batch distribution
      const batchDistribution = await Batch.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'code',
            foreignField: 'batches',
            as: 'students'
          }
        },
        {
          $project: {
            name: 1,
            code: 1,
            studentCount: { $size: '$students' }
          }
        },
        { $sort: { studentCount: -1 } },
        { $limit: 10 }
      ]);

      // Quizzes linked via quiz_sets → topic → subject: count distinct quizId per domain
      let quizzesByDomain = [];
      let quizzesUnlinkedToTopic = 0;
      try {
        const domainRows = await QuizSet.aggregate([
          {
            $lookup: {
              from: 'topics',
              localField: 'topicId',
              foreignField: '_id',
              as: 'topic',
            },
          },
          { $unwind: { path: '$topic', preserveNullAndEmptyArrays: false } },
          {
            $lookup: {
              from: 'subjects',
              localField: 'topic.subjectId',
              foreignField: '_id',
              as: 'subject',
            },
          },
          { $unwind: { path: '$subject', preserveNullAndEmptyArrays: false } },
          {
            $group: {
              _id: { domain: '$subject.domain', quizId: '$quizId' },
            },
          },
          {
            $group: {
              _id: '$_id.domain',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]);
        quizzesByDomain = (domainRows || []).map((r) => ({
          domain: r._id || 'Unknown',
          count: r.count || 0,
        }));

        const linkedQuizIds = await QuizSet.distinct('quizId');
        const linkedIds = (linkedQuizIds || []).filter(Boolean);
        if (linkedIds.length > 0) {
          quizzesUnlinkedToTopic = await Quiz.countDocuments({
            _id: { $nin: linkedIds },
          });
        } else {
          quizzesUnlinkedToTopic = totalQuizzes;
        }
      } catch (e) {
        quizzesByDomain = [];
        quizzesUnlinkedToTopic = 0;
      }

      return {
        overview: {
          totalUsers,
          totalQuizzes,
          totalBatches,
          activeUsers,
          activeQuizzes,
          activeBatches,
          // Super admin dashboard headline metrics (can be wired to real data later)
          institutions: 0,
          totalRevenue: 0,
          subscriptions: activeUsers,
        },
        growth: {
          usersThisWeek,
          usersThisMonth,
          quizzesThisWeek,
          quizzesThisMonth,
        },
        charts: {
          userGrowth: userGrowthData,
          quizGrowth: quizGrowthData,
          usersByRole: usersByRole.map(r => ({ role: r._id, count: r.count })),
          batchDistribution: batchDistribution.map(b => ({
            name: b.name,
            code: b.code,
            studentCount: b.studentCount
          })),
          quizzesByBatch: {
            withBatches: quizzesWithBatches,
            withoutBatches: quizzesWithoutBatches
          },
          quizzesByDomain,
          quizzesUnlinkedToTopic,
        },
        recentUsers: recentUsers.map(u => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          roles: u.roles,
          status: u.status || 'active',
          joined: u.createdAt
        }))
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching dashboard statistics: ${error.message}`);
    }
  }
}

module.exports = DashboardRepository;

