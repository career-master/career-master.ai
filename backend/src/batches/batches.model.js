const mongoose = require('mongoose');

/**
 * Batch Schema
 * Represents a group of students (e.g. Batch A, 2025-CSE, etc.)
 */
const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [100, 'Batch name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: [true, 'Batch code is required'],
      trim: true,
      maxlength: [50, 'Batch code cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    startDate: {
      type: Date,
      required: false
    },
    endDate: {
      type: Date,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'batches'
  }
);

batchSchema.index({ code: 1 }, { unique: true });
batchSchema.index({ name: 1 });
batchSchema.index({ isActive: 1 });

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;


