const mongoose = require('mongoose');

/**
 * CheatSheet Schema
 * Stores scrollable content/cheat sheet for a topic
 */
const cheatsheetSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic ID is required'],
      unique: true, // One cheat sheet per topic
      index: true
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true
      // No maxlength - can be very long (HTML/Markdown content)
    },
    contentType: {
      type: String,
      enum: ['html', 'markdown', 'text'],
      default: 'html'
    },
    estReadMinutes: {
      type: Number,
      min: 0,
      default: 5
    },
    resources: {
      type: [{
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['link', 'video', 'document'],
          default: 'link'
        }
      }],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'cheatsheets'
  }
);

// Indexes
cheatsheetSchema.index({ topicId: 1 });

const CheatSheet = mongoose.model('CheatSheet', cheatsheetSchema);

module.exports = CheatSheet;

