const QuizAttempt = require('../quiz/quiz_attempts.model');
const QuizAttemptSummary = require('../quiz/quiz_attempt_summaries.model');
const Quiz = require('../quiz/quiz.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class QuizAttemptRetentionService {
  /**
   * Deletes old detailed quiz attempts after N days.
   * Before deletion, ensures `quiz_attempt_summaries` exists so cumulative reports remain intact.
   */
  static async runQuizAttemptRetentionCleanup(options = {}) {
    const {
      retentionDays = 30,
      batchSize = 500,
      maxBatches = 200,
    } = options;

    const thresholdDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    try {
      let batches = 0;
      while (batches < maxBatches) {
        batches++;

        // Fetch attempts older than threshold that do NOT yet have a summary snapshot
        const missingAttempts = await QuizAttempt.aggregate([
          { $match: { submittedAt: { $lt: thresholdDate } } },
          {
            $lookup: {
              from: 'quiz_attempt_summaries',
              localField: '_id',
              foreignField: 'attemptId',
              as: 'summary',
            },
          },
          { $match: { 'summary.0': { $exists: false } } },
          { $sort: { submittedAt: 1 } },
          { $limit: batchSize },
          {
            $project: {
              _id: 1,
              quizId: 1,
              userId: 1,
              userEmail: 1,
              subjectId: 1,
              topicId: 1,
              submittedAt: 1,
              timeSpentInSeconds: 1,
              marksObtained: 1,
              totalMarks: 1,
              percentage: 1,
              result: 1,
              correctAnswers: 1,
              incorrectAnswers: 1,
              unattemptedAnswers: 1,
            },
          },
        ]);

        if (!missingAttempts || missingAttempts.length === 0) break;

        const quizIds = Array.from(
          new Set(missingAttempts.map((a) => a.quizId?.toString()).filter(Boolean))
        );
        const quizzes = await Quiz.find({ _id: { $in: quizIds } }).lean();
        const quizDurationMap = new Map(quizzes.map((q) => [q._id.toString(), q.durationMinutes]));

        const missingAttemptIds = missingAttempts.map((a) => a._id);

        const summaryUpserts = missingAttempts.map((a) => {
          const durationMinutes = quizDurationMap.get(a.quizId?.toString()) ?? 30;
          return {
            updateOne: {
              filter: { attemptId: a._id },
              update: {
                $setOnInsert: {
                  attemptId: a._id,
                  quizId: a.quizId,
                  userId: a.userId,
                  userEmail: a.userEmail,
                  topicId: a.topicId ?? null,
                  subjectId: a.subjectId ?? null,
                  submittedAt: a.submittedAt,
                  timeSpentInSeconds: a.timeSpentInSeconds || 0,
                  durationMinutesSnapshot: durationMinutes,
                  marksObtained: a.marksObtained || 0,
                  totalMarks: a.totalMarks || 0,
                  percentage: a.percentage || 0,
                  result: a.result || 'fail',
                  correctAnswers: a.correctAnswers || 0,
                  incorrectAnswers: a.incorrectAnswers || 0,
                  unattemptedAnswers: a.unattemptedAnswers || 0,
                },
              },
              upsert: true,
            },
          };
        });

        await QuizAttemptSummary.bulkWrite(summaryUpserts, { ordered: false });

        // Safe delete: we just created summaries for this batch
        await QuizAttempt.deleteMany({ _id: { $in: missingAttemptIds } });
      }

      // If we fully processed all missing summaries, we can safely delete the remaining old attempts too.
      // (If we hit maxBatches early, we avoid deleting everything to prevent data loss.)
      const stillMissing = await QuizAttempt.aggregate([
        { $match: { submittedAt: { $lt: thresholdDate } } },
        {
          $lookup: {
            from: 'quiz_attempt_summaries',
            localField: '_id',
            foreignField: 'attemptId',
            as: 'summary',
          },
        },
        { $match: { 'summary.0': { $exists: false } } },
        { $limit: 1 },
      ]);

      if (!stillMissing || stillMissing.length === 0) {
        await QuizAttempt.deleteMany({ submittedAt: { $lt: thresholdDate } });
      }
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      throw new ErrorHandler(500, `QuizAttemptRetentionCleanup failed: ${error.message}`);
    }
  }
}

module.exports = QuizAttemptRetentionService;

