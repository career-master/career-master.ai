const mongoose = require('mongoose');

/**
 * Subject Join Request Schema
 * Students request to join a subject that requires approval; admins approve/reject.
 */
const subjectJoinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'subject_join_requests'
  }
);

subjectJoinRequestSchema.index({ userId: 1, subjectId: 1, status: 1 });

const SubjectJoinRequest = mongoose.model('SubjectJoinRequest', subjectJoinRequestSchema);
module.exports = SubjectJoinRequest;

