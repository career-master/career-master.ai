const mongoose = require('mongoose');

/**
 * Domain Schema
 * Master list of domains (e.g. "3 CLASS", "Technology"). Used in dropdowns across admin and user pages.
 * When admin adds a new domain here, it appears in all Domain dropdowns (Subjects & Topics, Quiz, etc.).
 */
const domainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Domain name is required'],
      trim: true,
      maxlength: [100, 'Domain name cannot exceed 100 characters'],
      unique: true,
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
    collection: 'domains',
  }
);

domainSchema.index({ order: 1, name: 1 });
domainSchema.index({ isActive: 1 });

module.exports = mongoose.model('Domain', domainSchema);
