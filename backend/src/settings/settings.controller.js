const settingsService = require('./settings.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/settings
 * Returns profile completion settings (public so dashboard can read).
 */
async function getSettings(req, res) {
  const settings = await settingsService.getSettings();
  res.status(200).json({
    success: true,
    data: {
      profileCompletionEnforced: settings.profileCompletionEnforced,
      profileMinCompletionPercent: settings.profileMinCompletionPercent,
    },
  });
}

/**
 * PUT /api/settings
 * Update settings (super_admin only).
 */
async function updateSettings(req, res) {
  const body = req.body || {};
  const data = await settingsService.updateSettings({
    profileCompletionEnforced: body.profileCompletionEnforced,
    profileMinCompletionPercent: body.profileMinCompletionPercent,
  });
  res.status(200).json({
    success: true,
    message: 'Settings updated',
    data,
  });
}

module.exports = {
  getSettings: asyncHandler(getSettings),
  updateSettings: asyncHandler(updateSettings),
};
