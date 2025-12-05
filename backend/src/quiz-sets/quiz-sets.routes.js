const express = require('express');
const QuizSetController = require('./quiz-sets.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createQuizSetSchema, updateQuizSetSchema, quizSetIdParamSchema, topicIdParamSchema, validate } = require('./quiz-sets.validation');

const router = express.Router();

// Admin routes - require admin roles
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin'])];

// User routes - require authentication
const userMiddleware = [authenticate];

// Admin: Create quiz set
router.post('/', adminMiddleware, validate(createQuizSetSchema), QuizSetController.createQuizSet);

// User: Get quiz sets by topic ID
router.get('/topic/:topicId', userMiddleware, validate(topicIdParamSchema), QuizSetController.getQuizSetsByTopicId);

// User: Get quiz set by ID
router.get('/:id', userMiddleware, validate(quizSetIdParamSchema), QuizSetController.getQuizSetById);

// Admin: Update quiz set
router.put('/:id', adminMiddleware, validate(updateQuizSetSchema), QuizSetController.updateQuizSet);

// Admin: Delete quiz set
router.delete('/:id', adminMiddleware, validate(quizSetIdParamSchema), QuizSetController.deleteQuizSet);

module.exports = router;

