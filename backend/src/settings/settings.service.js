const Settings = require('./settings.model');
const env = require('../config/env');

let cachedSettings = null;

/**
 * Get app settings (cached in memory, fallback to env).
 * Used by subject-requests and quiz-attempts to enforce profile completion.
 */
async function getSettings() {
  if (cachedSettings) return cachedSettings;
  try {
    const doc = await Settings.findOne();
    if (doc) {
      cachedSettings = {
        profileCompletionEnforced: doc.profileCompletionEnforced,
        profileMinCompletionPercent: doc.profileMinCompletionPercent ?? env.PROFILE_MIN_COMPLETION_PERCENT,
      };
      return cachedSettings;
    }
  } catch (err) {
    console.warn('Settings getSettings error:', err.message);
  }
  cachedSettings = {
    profileCompletionEnforced: env.PROFILE_COMPLETION_ENFORCED,
    profileMinCompletionPercent: env.PROFILE_MIN_COMPLETION_PERCENT,
  };
  return cachedSettings;
}

/**
 * Update app settings (admin only). Clears cache.
 */
async function updateSettings(updates) {
  const doc = await Settings.findOneAndUpdate(
    {},
    {
      $set: {
        ...(typeof updates.profileCompletionEnforced === 'boolean' && {
          profileCompletionEnforced: updates.profileCompletionEnforced,
        }),
        ...(typeof updates.profileMinCompletionPercent === 'number' && {
          profileMinCompletionPercent: Math.min(100, Math.max(0, updates.profileMinCompletionPercent)),
        }),
      },
    },
    { new: true, upsert: true }
  );
  cachedSettings = null;
  return {
    profileCompletionEnforced: doc.profileCompletionEnforced,
    profileMinCompletionPercent: doc.profileMinCompletionPercent,
  };
}

module.exports = { getSettings, updateSettings };
