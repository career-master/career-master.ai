const mongoose = require('mongoose');

/**
 * Subject Enrollment Schema
 * Tracks student enrollment requests and approvals for subjects
 */
const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    collection: 'enrollments'
  }
);

// Compound index to ensure one enrollment per student-subject pair
enrollmentSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ requestedAt: -1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;

