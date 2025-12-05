const express = require('express');
const TopicProgressController = require('./topic-progress.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { markCheatSheetReadSchema, recordQuizCompletionSchema, topicIdParamSchema, subjectIdParamSchema, validate } = require('./topic-progress.validation');

const router = express.Router();

// All routes require authentication
const userMiddleware = [authenticate];

// Mark cheatsheet as read
router.post('/cheat-viewed', userMiddleware, validate(markCheatSheetReadSchema), TopicProgressController.markCheatSheetRead);

// Record quiz completion
router.post('/quiz-completed', userMiddleware, validate(recordQuizCompletionSchema), TopicProgressController.recordQuizCompletion);

// Get topic progress
router.get('/topic/:topicId', userMiddleware, validate(topicIdParamSchema), TopicProgressController.getTopicProgress);

// Get subject progress
router.get('/subject/:subjectId', userMiddleware, validate(subjectIdParamSchema), TopicProgressController.getSubjectProgress);

// Get all student progress
router.get('/', userMiddleware, TopicProgressController.getStudentProgress);

module.exports = router;

