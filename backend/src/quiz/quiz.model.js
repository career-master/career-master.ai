const mongoose = require('mongoose');

/**
 * Quiz Schema
 * Stores quiz configuration and embedded questions
 */
const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 6,
        message: 'Questions must have between 2 and 6 options'
      }
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    negativeMarks: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  {
    _id: false
  }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Quiz title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes']
    },
    availableFrom: {
      type: Date,
      required: false
    },
    availableTo: {
      type: Date,
      required: false
    },
    batches: {
      type: [String],
      default: []
    },
    availableToEveryone: {
      type: Boolean,
      default: false
    },
    maxAttempts: {
      type: Number,
      default: 999, // Unlimited by default (999 means unlimited)
      min: [1, 'Max attempts must be at least 1'],
      max: [999, 'Max attempts cannot exceed 999']
    },
    questions: {
      type: [questionSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true,
    collection: 'quizzes'
  }
);

// Indexes
quizSchema.index({ title: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ availableFrom: 1 });
quizSchema.index({ availableTo: 1 });
quizSchema.index({ batches: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;


