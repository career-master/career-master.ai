const express = require('express');
const CheatSheetController = require('./cheatsheets.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createCheatSheetSchema, updateCheatSheetSchema, cheatsheetIdParamSchema, topicIdParamSchema, validate } = require('./cheatsheets.validation');

const router = express.Router();

// Admin routes - require admin roles
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin'])];

// User routes - require authentication
const userMiddleware = [authenticate];

// Admin: Create cheatsheet
router.post('/', adminMiddleware, validate(createCheatSheetSchema), CheatSheetController.createCheatSheet);

// User: Get cheatsheet by topic ID
router.get('/topic/:topicId', userMiddleware, validate(topicIdParamSchema), CheatSheetController.getCheatSheetByTopicId);

// User: Get cheatsheet by ID
router.get('/:id', userMiddleware, validate(cheatsheetIdParamSchema), CheatSheetController.getCheatSheetById);

// Admin: Update cheatsheet
router.put('/:id', adminMiddleware, validate(updateCheatSheetSchema), CheatSheetController.updateCheatSheet);

// Admin: Delete cheatsheet
router.delete('/:id', adminMiddleware, validate(cheatsheetIdParamSchema), CheatSheetController.deleteCheatSheet);

module.exports = router;

