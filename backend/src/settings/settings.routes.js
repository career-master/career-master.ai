const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const settingsController = require('./settings.controller');

const router = express.Router();

router.get('/', settingsController.getSettings);
router.put('/', authenticate, requireRole(['super_admin']), settingsController.updateSettings);

module.exports = router;
