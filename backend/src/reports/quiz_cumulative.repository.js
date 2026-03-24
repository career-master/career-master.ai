const QuizAttemptSummary = require('../quiz/quiz_attempt_summaries.model');
const QuizAttempt = require('../quiz/quiz_attempts.model');
const Quiz = require('../quiz/quiz.model');
const Subject = require('../subjects/subjects.model');
const User = require('../user/users.model');
const mongoose = require('mongoose');
const { ErrorHandler } = require('../middleware/errorHandler');
const { userDocBatchMatchStages } = require('./batch_report_filters');

class QuizCumulativeRepository {
  static formatTime(seconds) {
    if (!seconds || seconds <= 0) return '0m 0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
  }

  /**
   * Admin: cumulative (user-wise) summary across all attempts.
   * Aggregates per user (not a single total row).
   */
  static async getAdminCumulativeUsersQuizSummary(filters = {}) {
    try {
      const {
        quizId,
        subjectId,
        topicId,
        userId,
        domain,
        category,
        email,
        name,
        batchScope,
        batchCode,
      } = filters || {};

      const castId = (v) => {
        if (!v || typeof v !== 'string') return null;
        if (!mongoose.Types.ObjectId.isValid(v)) return null;
        return new mongoose.Types.ObjectId(v);
      };

      const quizIdObj = castId(quizId);
      const subjectIdObj = castId(subjectId);
      const topicIdObj = castId(topicId);
      const userIdObj = castId(userId);

      const emailRegex = email ? new RegExp(String(email), 'i') : null;
      const nameRegex = name ? new RegExp(String(name), 'i') : null;

      // ---------- Summary collection pipeline (already snapshotted attempts) ----------
      const summaryMatch = {};
      if (quizIdObj) summaryMatch.quizId = quizIdObj;
      if (subjectIdObj) summaryMatch.subjectId = subjectIdObj;
      if (topicIdObj) summaryMatch.topicId = topicIdObj;
      if (userIdObj) summaryMatch.userId = userIdObj;
      if (emailRegex) summaryMatch.userEmail = emailRegex;

      const summaryPipeline = [{ $match: summaryMatch }];

      if (domain || category) {
        summaryPipeline.push(
          {
            $lookup: {
              from: 'subjects',
              localField: 'subjectId',
              foreignField: '_id',
              as: 'subject',
            },
          },
          { $unwind: { path: '$subject', preserveNullAndEmptyArrays: false } }
        );

        const subjectMatch = {};
        if (domain) subjectMatch['subject.domain'] = domain;
        if (category) subjectMatch['subject.category'] = category;
        summaryPipeline.push({ $match: subjectMatch });
      }

      // Always join users for name output (and optional name filtering).
      summaryPipeline.push(
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } }
      );

      if (nameRegex) {
        summaryPipeline.push({ $match: { 'user.name': nameRegex } });
      }

      const summaryBatchStages = userDocBatchMatchStages(batchScope, batchCode);
      if (summaryBatchStages) {
        summaryBatchStages.forEach((stage) => summaryPipeline.push(stage));
      }

      summaryPipeline.push(
        {
          $group: {
            _id: '$userId',
            userEmail: { $first: '$userEmail' },
            userName: { $first: '$user.name' },

            totalAttempts: { $sum: 1 },
            totalMarksObtained: { $sum: '$marksObtained' },
            totalMarksPossible: { $sum: '$totalMarks' },
            totalPercentageSum: { $sum: '$percentage' },

            correctAnswers: { $sum: '$correctAnswers' },
            incorrectAnswers: { $sum: '$incorrectAnswers' },
            unattemptedAnswers: { $sum: '$unattemptedAnswers' },

            passCount: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },

            timeWithinLimitCount: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      '$timeSpentInSeconds',
                      { $multiply: ['$durationMinutesSnapshot', 60] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalTimeSpentInSeconds: { $sum: '$timeSpentInSeconds' },
          },
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            userEmail: 1,
            userName: 1,

            totalAttempts: 1,
            totalMarksObtained: 1,
            totalMarksPossible: 1,
            totalPercentageSum: 1,

            correctAnswers: 1,
            incorrectAnswers: 1,
            unattemptedAnswers: 1,

            passCount: 1,
            timeWithinLimitCount: 1,
            totalTimeSpentInSeconds: 1,
          },
        }
      );

      // ---------- Fallback pipeline (unsnapshotted attempts) ----------
      // Include quiz_attempts that do NOT yet have a summary snapshot, to avoid missing older attempts.
      const attemptMatch = {};
      if (quizIdObj) attemptMatch.quizId = quizIdObj;
      if (subjectIdObj) attemptMatch.subjectId = subjectIdObj;
      if (topicIdObj) attemptMatch.topicId = topicIdObj;
      if (userIdObj) attemptMatch.userId = userIdObj;
      if (emailRegex) attemptMatch.userEmail = emailRegex;

      const attemptPipeline = [{ $match: attemptMatch }];

      if (domain || category) {
        attemptPipeline.push(
          {
            $lookup: {
              from: 'subjects',
              localField: 'subjectId',
              foreignField: '_id',
              as: 'subject',
            },
          },
          { $unwind: { path: '$subject', preserveNullAndEmptyArrays: false } }
        );

        const subjectMatch = {};
        if (domain) subjectMatch['subject.domain'] = domain;
        if (category) subjectMatch['subject.category'] = category;
        attemptPipeline.push({ $match: subjectMatch });
      }

      attemptPipeline.push(
        // Exclude attempts that already have a summary snapshot
        {
          $lookup: {
            from: 'quiz_attempt_summaries',
            localField: '_id',
            foreignField: 'attemptId',
            as: 'summary',
          },
        },
        { $match: { 'summary.0': { $exists: false } } }
      );

      // Lookup quiz duration to compute time limit
      attemptPipeline.push(
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz',
          },
        },
        { $unwind: { path: '$quiz', preserveNullAndEmptyArrays: false } }
      );

      attemptPipeline.push(
        // Join users (for name)
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
        ...(nameRegex ? [{ $match: { 'user.name': nameRegex } }] : []),
        ...(userDocBatchMatchStages(batchScope, batchCode) || []),

        {
          $group: {
            _id: '$userId',
            userEmail: { $first: '$userEmail' },
            userName: { $first: '$user.name' },

            totalAttempts: { $sum: 1 },
            totalMarksObtained: { $sum: '$marksObtained' },
            totalMarksPossible: { $sum: '$totalMarks' },
            totalPercentageSum: { $sum: '$percentage' },

            correctAnswers: { $sum: '$correctAnswers' },
            incorrectAnswers: { $sum: '$incorrectAnswers' },
            unattemptedAnswers: { $sum: '$unattemptedAnswers' },

            passCount: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },

            timeWithinLimitCount: {
              $sum: {
                $cond: [
                  { $lte: ['$timeSpentInSeconds', { $multiply: ['$quiz.durationMinutes', 60] }] },
                  1,
                  0,
                ],
              },
            },
            totalTimeSpentInSeconds: { $sum: '$timeSpentInSeconds' },
          },
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            userEmail: 1,
            userName: 1,

            totalAttempts: 1,
            totalMarksObtained: 1,
            totalMarksPossible: 1,
            totalPercentageSum: 1,

            correctAnswers: 1,
            incorrectAnswers: 1,
            unattemptedAnswers: 1,

            passCount: 1,
            timeWithinLimitCount: 1,
            totalTimeSpentInSeconds: 1,
          },
        }
      );

      const [summaryAgg, attemptAgg] = await Promise.all([
        QuizAttemptSummary.aggregate(summaryPipeline),
        QuizAttempt.aggregate(attemptPipeline),
      ]);

      const byUser = new Map();
      const mergeRow = (row) => {
        if (!row || !row.userId) return;
        const key = String(row.userId);
        if (!byUser.has(key)) {
          byUser.set(key, {
            userId: row.userId,
            userName: row.userName || '',
            userEmail: row.userEmail || '',
            totalAttempts: 0,
            totalMarksObtained: 0,
            totalMarksPossible: 0,
            totalPercentageSum: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            unattemptedAnswers: 0,
            passCount: 0,
            timeWithinLimitCount: 0,
            totalTimeSpentInSeconds: 0,
          });
        }

        const dst = byUser.get(key);
        dst.totalAttempts += row.totalAttempts || 0;
        dst.totalMarksObtained += row.totalMarksObtained || 0;
        dst.totalMarksPossible += row.totalMarksPossible || 0;
        dst.totalPercentageSum += row.totalPercentageSum || 0;
        dst.correctAnswers += row.correctAnswers || 0;
        dst.incorrectAnswers += row.incorrectAnswers || 0;
        dst.unattemptedAnswers += row.unattemptedAnswers || 0;
        dst.passCount += row.passCount || 0;
        dst.timeWithinLimitCount += row.timeWithinLimitCount || 0;
        dst.totalTimeSpentInSeconds += row.totalTimeSpentInSeconds || 0;
      };

      (summaryAgg || []).forEach(mergeRow);
      (attemptAgg || []).forEach(mergeRow);

      const users = Array.from(byUser.values()).map((u) => {
        const totalAttempts = u.totalAttempts;
        const totalMarksPossible = u.totalMarksPossible;

        const averagePercentage = totalAttempts > 0 ? u.totalPercentageSum / totalAttempts : 0;
        const overallPercentage =
          totalMarksPossible > 0 ? (u.totalMarksObtained / totalMarksPossible) * 100 : 0;

        const accuracyDenom = u.correctAnswers + u.incorrectAnswers;
        const accuracyPercentage = accuracyDenom > 0 ? (u.correctAnswers / accuracyDenom) * 100 : 0;

        const passRate = totalAttempts > 0 ? (u.passCount / totalAttempts) * 100 : 0;

        const timeWithinLimitPercent =
          totalAttempts > 0 ? (u.timeWithinLimitCount / totalAttempts) * 100 : 0;

        const averageTimeSpentSeconds =
          totalAttempts > 0 ? u.totalTimeSpentInSeconds / totalAttempts : 0;

        return {
          userId: String(u.userId),
          userName: u.userName || 'Unknown',
          userEmail: u.userEmail || '',

          totalAttempts: u.totalAttempts,
          totalMarksObtained: u.totalMarksObtained,
          totalMarksPossible: u.totalMarksPossible,
          averagePercentage: Math.round(averagePercentage * 100) / 100,
          overallPercentage: Math.round(overallPercentage * 100) / 100,

          correctAnswers: u.correctAnswers,
          incorrectAnswers: u.incorrectAnswers,
          unattemptedAnswers: u.unattemptedAnswers,
          accuracyPercentage: Math.round(accuracyPercentage * 100) / 100,

          passCount: u.passCount,
          passRate: Math.round(passRate * 100) / 100,

          timeWithinLimitCount: u.timeWithinLimitCount,
          timeWithinLimitPercent: Math.round(timeWithinLimitPercent * 100) / 100,

          averageTimeSpentSeconds: Math.round(averageTimeSpentSeconds),
          averageTimeSpentFormatted: QuizCumulativeRepository.formatTime(averageTimeSpentSeconds),
        };
      });

      // Sort best users first (by overall %)
      users.sort((a, b) => (b.overallPercentage || 0) - (a.overallPercentage || 0));

      // Add rank
      const rankedUsers = users.map((user, idx) => ({ ...user, rank: idx + 1 }));

      return rankedUsers;
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching cumulative quiz user-wise summary: ${error.message}`);
    }
  }

  /**
   * Admin: Quiz-wise performance breakdown for a single user
   * Uses quiz_attempt_summaries snapshots.
   */
  static async getAdminUserQuizPerformanceBreakdown(userId, filters = {}) {
    try {
      const { quizId, subjectId, topicId, domain, category } = filters || {};

      const castId = (v) => {
        if (!v || typeof v !== 'string') return null;
        if (!mongoose.Types.ObjectId.isValid(v)) return null;
        return new mongoose.Types.ObjectId(v);
      };

      const userIdObj = castId(userId) || (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null);
      const quizIdObj = castId(quizId);
      const subjectIdObj = castId(subjectId);
      const topicIdObj = castId(topicId);

      if (!userIdObj) {
        throw new ErrorHandler(400, 'Invalid userId');
      }

      const summaryMatch = {
        userId: userIdObj,
      };
      if (quizIdObj) summaryMatch.quizId = quizIdObj;
      if (subjectIdObj) summaryMatch.subjectId = subjectIdObj;
      if (topicIdObj) summaryMatch.topicId = topicIdObj;

      const pipeline = [{ $match: summaryMatch }];

      if (domain || category) {
        pipeline.push(
          {
            $lookup: {
              from: 'subjects',
              localField: 'subjectId',
              foreignField: '_id',
              as: 'subject',
            },
          },
          { $unwind: { path: '$subject', preserveNullAndEmptyArrays: false } }
        );

        const subjectMatch = {};
        if (domain) subjectMatch['subject.domain'] = domain;
        if (category) subjectMatch['subject.category'] = category;
        pipeline.push({ $match: subjectMatch });
      }

      // Join quiz title
      pipeline.push(
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz',
          },
        },
        { $unwind: { path: '$quiz', preserveNullAndEmptyArrays: false } }
      );

      pipeline.push(
        {
          $group: {
            _id: '$quizId',
            quizTitle: { $first: '$quiz.title' },
            attempts: { $sum: 1 },

            totalMarksObtained: { $sum: '$marksObtained' },
            totalMarksPossible: { $sum: '$totalMarks' },
            totalPercentageSum: { $sum: '$percentage' },

            passCount: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },

            correctAnswers: { $sum: '$correctAnswers' },
            incorrectAnswers: { $sum: '$incorrectAnswers' },
            unattemptedAnswers: { $sum: '$unattemptedAnswers' },

            timeWithinLimitCount: {
              $sum: {
                $cond: [
                  { $lte: ['$timeSpentInSeconds', { $multiply: ['$durationMinutesSnapshot', 60] }] },
                  1,
                  0,
                ],
              },
            },
            totalTimeSpentInSeconds: { $sum: '$timeSpentInSeconds' },
          },
        },
        {
          $project: {
            _id: 0,
            quizId: '$_id',
            quizTitle: 1,
            attempts: 1,

            totalMarksObtained: 1,
            totalMarksPossible: 1,
            averagePercentage: {
              $cond: [{ $gt: ['$attempts', 0] }, { $divide: ['$totalPercentageSum', '$attempts'] }, 0],
            },
            overallPercentage: {
              $cond: [
                { $gt: ['$totalMarksPossible', 0] },
                { $multiply: [{ $divide: ['$totalMarksObtained', '$totalMarksPossible'] }, 100] },
                0,
              ],
            },

            passCount: 1,
            failCount: { $subtract: ['$attempts', '$passCount'] },

            rightAnswers: '$correctAnswers',
            wrongAnswers: '$incorrectAnswers',
            unattemptedAnswers: 1,

            accuracyPercentage: {
              $cond: [
                { $gt: [{ $add: ['$correctAnswers', '$incorrectAnswers'] }, 0] },
                {
                  $multiply: [
                    { $divide: ['$correctAnswers', { $add: ['$correctAnswers', '$incorrectAnswers'] }] },
                    100,
                  ],
                },
                0,
              ],
            },

            passRate: {
              $cond: [{ $gt: ['$attempts', 0] }, { $multiply: [{ $divide: ['$passCount', '$attempts'] }, 100] }, 0],
            },

            timeWithinLimitCount: 1,
            timeWithinLimitPercent: {
              $cond: [
                { $gt: ['$attempts', 0] },
                { $multiply: [{ $divide: ['$timeWithinLimitCount', '$attempts'] }, 100] },
                0,
              ],
            },

            averageTimeSpentSeconds: {
              $cond: [{ $gt: ['$attempts', 0] }, { $divide: ['$totalTimeSpentInSeconds', '$attempts'] }, 0],
            },
            averageTimeSpentFormatted: {
              // quick formatting in JS instead; keep seconds numeric
              $round: [{ $divide: ['$totalTimeSpentInSeconds', '$attempts'] }, 0],
            },
          },
        },
        { $sort: { overallPercentage: -1, attempts: -1 } }
      );

      const rows = await QuizAttemptSummary.aggregate(pipeline);

      // Add formatted time in JS (since we already have formatTime helper)
      return (rows || []).map((r) => {
        const seconds = typeof r.averageTimeSpentSeconds === 'number' ? r.averageTimeSpentSeconds : 0;
        return {
          ...r,
          averageTimeSpentSeconds: Math.round(seconds),
          averageTimeSpentFormatted: QuizCumulativeRepository.formatTime(seconds),
        };
      });
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      throw new ErrorHandler(500, `Error fetching user quiz performance breakdown: ${error.message}`);
    }
  }

  /**
   * Admin: quiz-wise cumulative summary across all users.
   * Combines snapshotted summaries + fallback raw attempts without snapshots.
   */
  static async getAdminCumulativeQuizWiseSummary(filters = {}) {
    try {
      const { subjectId, topicId, userId, domain, category, email, name, batchScope, batchCode } =
        filters || {};

      const castId = (v) => {
        if (!v || typeof v !== 'string') return null;
        if (!mongoose.Types.ObjectId.isValid(v)) return null;
        return new mongoose.Types.ObjectId(v);
      };

      const subjectIdObj = castId(subjectId);
      const topicIdObj = castId(topicId);
      const userIdObj = castId(userId);
      const emailRegex = email ? new RegExp(String(email), 'i') : null;
      const nameRegex = name ? new RegExp(String(name), 'i') : null;

      const summaryMatch = {};
      if (subjectIdObj) summaryMatch.subjectId = subjectIdObj;
      if (topicIdObj) summaryMatch.topicId = topicIdObj;
      if (userIdObj) summaryMatch.userId = userIdObj;
      if (emailRegex) summaryMatch.userEmail = emailRegex;

      const summaryPipeline = [{ $match: summaryMatch }];
      if (domain || category) {
        summaryPipeline.push(
          { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
          { $unwind: { path: '$subject', preserveNullAndEmptyArrays: false } }
        );
        const subjectMatch = {};
        if (domain) subjectMatch['subject.domain'] = domain;
        if (category) subjectMatch['subject.category'] = category;
        summaryPipeline.push({ $match: subjectMatch });
      }
      const quizWiseBatchStages = userDocBatchMatchStages(batchScope, batchCode);
      const quizWiseNeedsUser = nameRegex || quizWiseBatchStages;
      if (quizWiseNeedsUser) {
        summaryPipeline.push(
          { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } }
        );
        if (nameRegex) {
          summaryPipeline.push({ $match: { 'user.name': nameRegex } });
        }
        if (quizWiseBatchStages) {
          quizWiseBatchStages.forEach((stage) => summaryPipeline.push(stage));
        }
      }
      summaryPipeline.push(
        { $lookup: { from: 'quizzes', localField: 'quizId', foreignField: '_id', as: 'quiz' } },
        { $unwind: { path: '$quiz', preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: '$quizId',
            quizTitle: { $first: '$quiz.title' },
            attempts: { $sum: 1 },
            totalMarksObtained: { $sum: '$marksObtained' },
            totalMarksPossible: { $sum: '$totalMarks' },
            passCount: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
          },
        },
        { $project: { _id: 0, quizId: '$_id', quizTitle: 1, attempts: 1, totalMarksObtained: 1, totalMarksPossible: 1, passCount: 1 } }
      );

      const attemptMatch = {};
      if (subjectIdObj) attemptMatch.subjectId = subjectIdObj;
      if (topicIdObj) attemptMatch.topicId = topicIdObj;
      if (userIdObj) attemptMatch.userId = userIdObj;
      if (emailRegex) attemptMatch.userEmail = emailRegex;

      const attemptPipeline = [{ $match: attemptMatch }];
      if (domain || category) {
        attemptPipeline.push(
          { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
          { $unwind: { path: '$subject', preserveNullAndEmptyArrays: false } }
        );
        const subjectMatch = {};
        if (domain) subjectMatch['subject.domain'] = domain;
        if (category) subjectMatch['subject.category'] = category;
        attemptPipeline.push({ $match: subjectMatch });
      }
      attemptPipeline.push(
        { $lookup: { from: 'quiz_attempt_summaries', localField: '_id', foreignField: 'attemptId', as: 'summary' } },
        { $match: { 'summary.0': { $exists: false } } }
      );
      if (quizWiseNeedsUser) {
        attemptPipeline.push(
          { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } }
        );
        if (nameRegex) {
          attemptPipeline.push({ $match: { 'user.name': nameRegex } });
        }
        if (quizWiseBatchStages) {
          quizWiseBatchStages.forEach((stage) => attemptPipeline.push(stage));
        }
      }
      attemptPipeline.push(
        { $lookup: { from: 'quizzes', localField: 'quizId', foreignField: '_id', as: 'quiz' } },
        { $unwind: { path: '$quiz', preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: '$quizId',
            quizTitle: { $first: '$quiz.title' },
            attempts: { $sum: 1 },
            totalMarksObtained: { $sum: '$marksObtained' },
            totalMarksPossible: { $sum: '$totalMarks' },
            passCount: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
          },
        },
        { $project: { _id: 0, quizId: '$_id', quizTitle: 1, attempts: 1, totalMarksObtained: 1, totalMarksPossible: 1, passCount: 1 } }
      );

      const [summaryAgg, attemptAgg] = await Promise.all([
        QuizAttemptSummary.aggregate(summaryPipeline),
        QuizAttempt.aggregate(attemptPipeline),
      ]);

      const byQuiz = new Map();
      const merge = (row) => {
        if (!row?.quizId) return;
        const key = String(row.quizId);
        if (!byQuiz.has(key)) {
          byQuiz.set(key, {
            quizId: key,
            quizTitle: row.quizTitle || 'Untitled Quiz',
            attempts: 0,
            totalMarksObtained: 0,
            totalMarksPossible: 0,
            passCount: 0,
          });
        }
        const dst = byQuiz.get(key);
        dst.attempts += row.attempts || 0;
        dst.totalMarksObtained += row.totalMarksObtained || 0;
        dst.totalMarksPossible += row.totalMarksPossible || 0;
        dst.passCount += row.passCount || 0;
      };

      (summaryAgg || []).forEach(merge);
      (attemptAgg || []).forEach(merge);

      const rows = Array.from(byQuiz.values()).map((q) => {
        const overallPercentage = q.totalMarksPossible > 0
          ? (q.totalMarksObtained / q.totalMarksPossible) * 100
          : 0;
        const passRate = q.attempts > 0 ? (q.passCount / q.attempts) * 100 : 0;
        return {
          ...q,
          overallPercentage: Math.round(overallPercentage * 100) / 100,
          passRate: Math.round(passRate * 100) / 100,
        };
      });

      rows.sort((a, b) => (b.attempts || 0) - (a.attempts || 0));
      return rows;
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching cumulative quiz-wise summary: ${error.message}`);
    }
  }
}

module.exports = QuizCumulativeRepository;

