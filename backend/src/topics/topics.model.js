const mongoose = require('mongoose');

/**
 * Topic Schema
 * Represents a topic within a subject (e.g., "C Basics", "Variables", "Data Types")
 */
const topicSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    order: {
      type: Number,
      required: true,
      default: 0 // Order within the subject
    },
    isActive: {
      type: Boolean,
      default: true
    },
    prerequisites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Topic',
      default: [] // Array of topic IDs that must be completed before this topic is unlocked
    },
    requiredQuizzesToUnlock: {
      type: Number,
      default: 2, // Number of quizzes to complete to unlock next topic
      min: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'topics'
  }
);

// Indexes
topicSchema.index({ subjectId: 1, order: 1 });
topicSchema.index({ subjectId: 1, isActive: 1 });
topicSchema.index({ title: 1 });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;

