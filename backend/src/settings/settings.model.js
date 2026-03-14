const mongoose = require('mongoose');
const env = require('../config/env');

const settingsSchema = new mongoose.Schema(
  {
    profileCompletionEnforced: {
      type: Boolean,
      default: () => env.PROFILE_COMPLETION_ENFORCED,
    },
    profileMinCompletionPercent: {
      type: Number,
      default: () => env.PROFILE_MIN_COMPLETION_PERCENT,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingsSchema);
