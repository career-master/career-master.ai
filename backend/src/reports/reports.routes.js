const express = require('express');
const ReportsController = require('./reports.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Top performers/Leaderboard
router.get('/top-performers', ReportsController.getTopPerformers);

// User rank and comparison
router.get('/user-rank/:userId', ReportsController.getUserRankAndComparison);

// Quiz leaderboard
router.get('/quiz-leaderboard/:quizId', ReportsController.getQuizLeaderboard);

// Batch statistics
router.get('/batch-statistics/:batchId', ReportsController.getBatchStatistics);

// Quiz attempt reports
router.get('/quiz-attempt/:attemptId', ReportsController.getQuizAttemptReport);
router.get('/quiz-attempt/:attemptId/pdf', ReportsController.downloadPDFReport);
router.get('/quiz-attempt/:attemptId/excel', ReportsController.downloadExcelReport);
router.get('/user-quiz-attempts', ReportsController.getUserQuizAttempts);

module.exports = router;

