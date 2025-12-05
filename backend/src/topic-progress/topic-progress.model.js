const mongoose = require('mongoose');

/**
 * Topic Progress Schema
 * Tracks student progress through topics (unlock status, quiz completions)
 */
const topicProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic ID is required'],
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true
    },
    isUnlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: {
      type: Date
    },
    cheatSheetRead: {
      type: Boolean,
      default: false
    },
    cheatSheetReadAt: {
      type: Date
    },
    completedQuizzes: {
      type: [{
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Quiz',
          required: true
        },
        attemptId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QuizAttempt',
          required: true
        },
        completedAt: {
          type: Date,
          default: Date.now
        },
        score: {
          type: Number,
          required: true
        },
        percentage: {
          type: Number,
          required: true
        }
      }],
      default: []
    },
    totalQuizzesCompleted: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'topic_progress'
  }
);

// Compound index to ensure one progress record per student-topic pair
topicProgressSchema.index({ studentId: 1, topicId: 1 }, { unique: true });
topicProgressSchema.index({ studentId: 1, subjectId: 1 });
topicProgressSchema.index({ isUnlocked: 1 });
topicProgressSchema.index({ isCompleted: 1 });

const TopicProgress = mongoose.model('TopicProgress', topicProgressSchema);

module.exports = TopicProgress;

