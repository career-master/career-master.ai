const mongoose = require('mongoose');

/**
 * Quiz Set Schema
 * Links quizzes to topics (admin can assign multiple quiz sets to a topic)
 */
const quizSetSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic ID is required'],
      index: true
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required'],
      index: true
    },
    setName: {
      type: String,
      trim: true,
      maxlength: [200, 'Set name cannot exceed 200 characters'],
      default: 'Quiz Set'
    },
    order: {
      type: Number,
      default: 0 // Order within the topic
    },
    quizNumber: {
      type: Number,
      default: null // Admin-defined quiz number (e.g. for display/ordering)
    },
    isActive: {
      type: Boolean,
      default: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'quiz_sets'
  }
);

// Indexes
quizSetSchema.index({ topicId: 1, order: 1 });
quizSetSchema.index({ topicId: 1, isActive: 1 });
quizSetSchema.index({ quizId: 1 });

const QuizSet = mongoose.model('QuizSet', quizSetSchema);

module.exports = QuizSet;

