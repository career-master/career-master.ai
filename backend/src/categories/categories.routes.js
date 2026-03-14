const express = require('express');
const CategoriesController = require('./categories.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin'])];
const userMiddleware = [authenticate];

router.get('/', userMiddleware, CategoriesController.list);
router.post('/', adminMiddleware, CategoriesController.create);
router.put('/:id', adminMiddleware, CategoriesController.update);
router.delete('/:id', adminMiddleware, CategoriesController.delete);

module.exports = router;
