const mongoose = require('mongoose');

/**
 * Batch Join Request Schema
 * Students request to join a batch; admins approve/reject.
 */
const batchJoinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    batchCode: {
      type: String,
      required: true,
      trim: true,
      index: true
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
    collection: 'batch_join_requests'
  }
);

batchJoinRequestSchema.index({ userId: 1, batchCode: 1, status: 1 });

const BatchJoinRequest = mongoose.model('BatchJoinRequest', batchJoinRequestSchema);
module.exports = BatchJoinRequest;

