const express = require('express');
const multer = require('multer');
const QuizController = require('./quiz.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createQuizSchema, updateQuizSchema, quizIdParamSchema, validate } = require('./quiz.validation');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Quiz management routes are restricted to admin roles
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin'])];
// Quiz access routes (listing, taking) are available to any authenticated user
const userMiddleware = [authenticate];

// Admin: Create quiz with JSON payload
router.post('/', adminMiddleware, validate(createQuizSchema), QuizController.createQuiz);

// Admin: Upload quiz questions via Excel
router.post(
  '/upload-excel',
  adminMiddleware,
  upload.single('file'),
  QuizController.uploadQuizExcel
);

// Authenticated users: Get all quizzes (for listing/attempts)
router.get('/', userMiddleware, QuizController.getQuizzes);

// Authenticated users: Get quiz by ID (for taking quiz)
router.get('/:id', userMiddleware, validate(quizIdParamSchema), QuizController.getQuizById);

// Admin: Update quiz
router.put('/:id', adminMiddleware, validate(updateQuizSchema), QuizController.updateQuiz);

// Admin: Delete quiz
router.delete('/:id', adminMiddleware, validate(quizIdParamSchema), QuizController.deleteQuiz);

module.exports = router;


