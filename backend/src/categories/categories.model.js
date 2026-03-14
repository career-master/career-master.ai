const mongoose = require('mongoose');

/**
 * Category Schema
 * Categories belong to a domain (e.g. under "Technology": "Programming", "Databases").
 * Used in dropdowns when domain is selected. Subject has domain + category strings.
 */
const categorySchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      maxlength: [100, 'Domain cannot exceed 100 characters'],
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'categories',
  }
);

// Unique per domain
categorySchema.index({ domain: 1, name: 1 }, { unique: true });
categorySchema.index({ domain: 1, order: 1 });
categorySchema.index({ isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
