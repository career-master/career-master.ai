const mongoose = require('mongoose');

/**
 * Quiz Attempt Summary
 * Stores only aggregated fields required for cumulative admin reports.
 * This collection must NOT be deleted by the 30-day retention job.
 */
const quizAttemptSummarySchema = new mongoose.Schema(
  {
    // Points to the original QuizAttempt document
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Stored for filtering without expensive joins
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: false,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: false,
    },

    submittedAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Attempt metrics (copy from quiz_attempts at submission time)
    timeSpentInSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationMinutesSnapshot: {
      type: Number,
      default: 30,
      min: 1,
    },

    marksObtained: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    result: {
      type: String,
      enum: ['pass', 'fail'],
      default: 'fail',
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    unattemptedAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: false,
    collection: 'quiz_attempt_summaries',
  }
);

// Indexes for typical report filters
quizAttemptSummarySchema.index({ subjectId: 1, topicId: 1, quizId: 1, submittedAt: -1 });
quizAttemptSummarySchema.index({ userId: 1, subjectId: 1, quizId: 1, submittedAt: -1 });

const QuizAttemptSummary = mongoose.model('QuizAttemptSummary', quizAttemptSummarySchema);

module.exports = QuizAttemptSummary;

