const express = require('express');
const EnrollmentController = require('./enrollments.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { requestEnrollmentSchema, rejectEnrollmentSchema, enrollmentIdParamSchema, studentIdParamSchema, subjectIdParamSchema, validate } = require('./enrollments.validation');

const router = express.Router();

// Admin routes - require admin roles
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin', 'institution_admin'])];

// User routes - require authentication
const userMiddleware = [authenticate];

// Student: Request enrollment
router.post('/request', userMiddleware, validate(requestEnrollmentSchema), EnrollmentController.requestEnrollment);

// Admin: Approve enrollment
router.post('/:id/approve', adminMiddleware, validate(enrollmentIdParamSchema), EnrollmentController.approveEnrollment);

// Admin: Reject enrollment
router.post('/:id/reject', adminMiddleware, validate(rejectEnrollmentSchema), EnrollmentController.rejectEnrollment);

// User: Get enrollment by ID
router.get('/:id', userMiddleware, validate(enrollmentIdParamSchema), EnrollmentController.getEnrollmentById);

// User: Get student enrollments
router.get('/student/:studentId?', userMiddleware, EnrollmentController.getStudentEnrollments);

// Admin: Get subject enrollments
router.get('/subject/:subjectId', adminMiddleware, validate(subjectIdParamSchema), EnrollmentController.getSubjectEnrollments);

// Admin: Get all enrollments
router.get('/', adminMiddleware, EnrollmentController.getAllEnrollments);

module.exports = router;

