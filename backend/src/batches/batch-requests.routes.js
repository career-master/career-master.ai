const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const BatchJoinRequestController = require('./batch-requests.controller');

const router = express.Router();

// Students: create request
router.post('/', authenticate, BatchJoinRequestController.createRequest);

// Admin: list requests
router.get('/', authenticate, requireRole(['super_admin', 'technical_admin']), BatchJoinRequestController.listRequests);

// Admin: approve/reject
router.post('/:id/approve', authenticate, requireRole(['super_admin', 'technical_admin']), BatchJoinRequestController.approveRequest);
router.post('/:id/reject', authenticate, requireRole(['super_admin', 'technical_admin']), BatchJoinRequestController.rejectRequest);

module.exports = router;

