const mongoose = require('mongoose');

/**
 * Quiz Attempt Schema
 * Stores user quiz attempts and results
 */
const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required']
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Accepts Number (single choice), Array (multiple/match/reorder), String (fill in blank)
      default: {}
    },
    timeSpentInSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    marksObtained: {
      type: Number,
      default: 0,
      min: 0
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0
    },
    unattemptedAnswers: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    result: {
      type: String,
      enum: ['pass', 'fail'],
      default: 'fail'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'quiz_attempts'
  }
);

// Compound index for user and quiz
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userEmail: 1, quizId: 1 });
quizAttemptSchema.index({ submittedAt: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;

