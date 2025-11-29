const express = require('express');
const DashboardController = require('./dashboard.controller');
const UserDashboardController = require('./user_dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

const adminMiddleware = [authenticate, requireRole(['super_admin', 'institution_admin'])];
const userMiddleware = [authenticate];

// Admin dashboard statistics
router.get('/statistics', adminMiddleware, DashboardController.getStatistics);

// User dashboard statistics
router.get('/user/stats', userMiddleware, UserDashboardController.getUserStats);

module.exports = router;

