const mongoose = require('mongoose');

/**
 * Announcement Schema
 * Represents home-page announcements like quick updates, online trainings, and latest exams.
 */
const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['update', 'training', 'exam'],
      required: [true, 'Type is required'],
      index: true
    },
    /**
     * Human-readable date/time text shown in UI, e.g. "Jan 28, 2026" or "Feb 15, 2026 - 2:00 PM".
     * This is stored as text so admin can fully control formatting.
     */
    dateText: {
      type: String,
      trim: true,
      maxlength: [120, 'Date text cannot exceed 120 characters']
    },
    /**
     * Optional actual dates used for ordering and filtering (not required for UI).
     */
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    /**
     * Extra status label, mainly for exams (e.g. "Applications Open").
     */
    status: {
      type: String,
      trim: true,
      maxlength: [120, 'Status cannot exceed 120 characters']
    },
    /**
     * Optional CTA link (e.g. registration page).
     */
    linkUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Link URL cannot exceed 500 characters']
    },
    linkLabel: {
      type: String,
      trim: true,
      maxlength: [80, 'Link label cannot exceed 80 characters']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    /**
     * Manual ordering within a type (smaller comes first).
     */
    order: {
      type: Number,
      default: 0,
      index: true
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
    collection: 'announcements'
  }
);

announcementSchema.index({ type: 1, isActive: 1, order: 1, startDate: -1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;

