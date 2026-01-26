const mongoose = require('mongoose');
const { QUESTION_TYPES } = require('./question-types.config');

/**
 * Quiz Schema
 * Stores quiz configuration and embedded questions
 */
const questionSchema = new mongoose.Schema(
  {
    questionType: {
      type: String,
      enum: Object.values(QUESTION_TYPES),
      default: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
      required: true
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    // For multiple choice (single/multiple), passage, dropdown, poll, true/false
    options: {
      type: [String],
      required: function() {
        return [
          'multiple_choice',
          'multiple_choice_single',
          'multiple_choice_multiple',
          'dropdown',
          'poll',
          'true_false'
        ].includes(this.questionType);
      },
      validate: {
        validator: function(v) {
          const typesRequiringOptions = [
            'multiple_choice',
            'multiple_choice_single',
            'multiple_choice_multiple',
            'dropdown',
            'poll',
            'true_false'
          ];
          if (!typesRequiringOptions.includes(this.questionType)) {
            return true; // Not required for other types
          }
          // True/False always has 2 options
          if (this.questionType === 'true_false') {
            return Array.isArray(v) && v.length === 2;
          }
          return Array.isArray(v) && v.length >= 2 && v.length <= 6;
        },
        message: 'Questions must have between 2 and 6 options (True/False must have exactly 2)'
      }
    },
    // For multiple choice single, dropdown, true/false
    correctOptionIndex: {
      type: Number,
      required: function() {
        return ['multiple_choice', 'multiple_choice_single', 'dropdown', 'true_false'].includes(this.questionType);
      },
      min: 0
    },
    // For multiple choice multiple - array of correct indices
    correctOptionIndices: {
      type: [Number],
      required: function() {
        return this.questionType === 'multiple_choice_multiple';
      },
      validate: {
        validator: function(v) {
          // Only validate if this is an MCQ Multiple question
          if (this.questionType !== 'multiple_choice_multiple') {
            return true; // Skip validation for other question types
          }
          // For MCQ Multiple, must have at least one correct option
          if (!Array.isArray(v) || v.length === 0) {
            return false;
          }
          // Validate indices are within bounds
          if (this.options && v.some(idx => idx < 0 || idx >= this.options.length)) {
            return false;
          }
          return true;
        },
        message: 'At least one correct option is required for multiple choice multiple'
      }
    },
    // For fill in blank - array of correct answers
    correctAnswers: {
      type: [String],
      required: function() {
        return this.questionType === 'fill_in_blank';
      }
    },
    // For match questions - pairs of items
    matchPairs: {
      type: [{
        left: {
          type: String,
          required: true,
          trim: true
        },
        right: {
          type: String,
          required: true,
          trim: true
        }
      }],
      required: function() {
        return this.questionType === 'match';
      },
      validate: {
        validator: function(v) {
          // Only validate if this is a match question
          if (this.questionType !== 'match') {
            return true; // Skip validation for other question types
          }
          // For match questions, must have at least one pair
          if (!Array.isArray(v) || v.length === 0) {
            return false;
          }
          // Validate that all pairs have both left and right
          return v.every(pair => 
            pair && 
            typeof pair === 'object' &&
            pair.left && pair.left.trim().length > 0 &&
            pair.right && pair.right.trim().length > 0
          );
        },
        message: 'Match questions must have at least one valid pair with both left and right values'
      }
    },
    // For drag and drop, categorize, reorder
    correctOrder: {
      type: [String],
      required: function() {
        return ['reorder', 'drag_drop'].includes(this.questionType);
      }
    },
    // For categorize - items and their categories
    categories: {
      type: [{
        name: String,
        items: [String]
      }],
      required: function() {
        return this.questionType === 'categorize';
      }
    },
    // For hotspot - coordinates and regions
    hotspotRegions: {
      type: [{
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        label: String
      }],
      required: function() {
        return this.questionType === 'hotspot';
      }
    },
    // For labeling, hotspot, image-based, draw - image URL
    imageUrl: {
      type: String,
      required: function() {
        return ['hotspot', 'labeling', 'draw', 'image_based'].includes(this.questionType);
      }
    },
    // For passage questions
    passageText: {
      type: String,
      required: function() {
        return this.questionType === 'passage';
      },
      maxlength: 10000
    },
    // For open ended - sample answer or rubric
    sampleAnswer: {
      type: String,
      maxlength: 5000
    },
    // For math response - LaTeX or math expression
    mathExpression: {
      type: String
    },
    // For all question types
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
    },
    // Difficulty level: easy (conceptual recall), medium (applied understanding), hard (scenario/problem solving)
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      required: true
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    _id: false
  }
);

// Section Schema - for organizing questions into sections
const sectionSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    sectionDescription: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    questionType: {
      type: String,
      enum: Object.values(QUESTION_TYPES),
      required: false // Optional - if set, all questions in section must be this type
    },
    questions: {
      type: [questionSchema],
      default: [],
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    _id: true
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
    // Quiz structure: sections-based (new) or flat questions (legacy)
    useSections: {
      type: Boolean,
      default: false
    },
    sections: {
      type: [sectionSchema],
      default: [],
      required: function() {
        return this.useSections === true;
      }
    },
    // Legacy: flat questions array (for backward compatibility)
    questions: {
      type: [questionSchema],
      default: [],
      required: function() {
        return this.useSections === false;
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    courseCategories: {
      type: [String], // Array of course category IDs (e.g., "Maths_10", "JEE MAIN", "Technology_Programming Languages_JavaScript")
      default: []
    },
    // Quiz level: beginner | intermediate | advanced. Optional: if null/undefined, shown for all level preferences.
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: false,
      default: null
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


