const express = require('express');
const TopicController = require('./topics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createTopicSchema, updateTopicSchema, topicIdParamSchema, validate } = require('./topics.validation');

const router = express.Router();

// Admin routes - require admin roles
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin'])];

// User routes - require authentication
const userMiddleware = [authenticate];

// Admin: Create topic
router.post('/', adminMiddleware, validate(createTopicSchema), TopicController.createTopic);

// User: Get all topics (optionally filtered by subjectId)
router.get('/', userMiddleware, TopicController.getTopics);

// User: Get topic by ID
router.get('/:id', userMiddleware, validate(topicIdParamSchema), TopicController.getTopicById);

// Admin: Update topic
router.put('/:id', adminMiddleware, validate(updateTopicSchema), TopicController.updateTopic);

// Admin: Delete topic
router.delete('/:id', adminMiddleware, validate(topicIdParamSchema), TopicController.deleteTopic);

// Admin: Bulk update topic orders
router.put('/orders', adminMiddleware, TopicController.bulkUpdateOrders);

module.exports = router;

