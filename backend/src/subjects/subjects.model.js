const mongoose = require('mongoose');

/**
 * Subject Schema
 * Represents a learning module/course (e.g., "C Programming", "Data Structures")
 */
const subjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subject title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    thumbnail: {
      type: String, // URL to thumbnail image
      default: ''
    },
    // High-level domain from QUIZ TOPICS LIST.xlsx (e.g. "3 CLASS", "TECHNOLOGY", "STATE LEVEL ENTRANCE EXAMS")
    domain: {
      type: String,
      trim: true,
      maxlength: [100, 'Domain cannot exceed 100 characters']
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters']
    },
    level: {
      type: String,
      enum: ['basic', 'hard'],
      default: 'basic'
    },
    batches: {
      type: [String], // Batch codes this subject is assigned to; empty means available to all
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: true // By default, students need approval to enroll
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: Number,
      default: 0 // For ordering subjects
    },
    courseCategories: {
      type: [String], // Array of course category IDs (e.g., "Maths_10", "JEE MAIN", "Technology_Programming Languages_JavaScript")
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'subjects'
  }
);

// Indexes
subjectSchema.index({ title: 1 });
subjectSchema.index({ isActive: 1 });
subjectSchema.index({ category: 1 });
subjectSchema.index({ domain: 1 });
subjectSchema.index({ createdAt: -1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;

