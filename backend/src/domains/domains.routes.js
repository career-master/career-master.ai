const express = require('express');
const DomainsController = require('./domains.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin'])];
const userMiddleware = [authenticate];

router.get('/', userMiddleware, DomainsController.list);
router.post('/', adminMiddleware, DomainsController.create);
router.put('/:id', adminMiddleware, DomainsController.update);
router.delete('/:id', adminMiddleware, DomainsController.delete);

module.exports = router;
