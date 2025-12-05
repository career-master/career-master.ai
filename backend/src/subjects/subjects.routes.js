const express = require('express');
const SubjectController = require('./subjects.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createSubjectSchema, updateSubjectSchema, subjectIdParamSchema, validate } = require('./subjects.validation');

const router = express.Router();

// Admin routes - require admin roles
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin'])];

// User routes - require authentication
const userMiddleware = [authenticate];

// Admin: Create subject
router.post('/', adminMiddleware, validate(createSubjectSchema), SubjectController.createSubject);

// User: Get all subjects (with optional filters)
router.get('/', userMiddleware, SubjectController.getSubjects);

// User: Get subject by ID
router.get('/:id', userMiddleware, validate(subjectIdParamSchema), SubjectController.getSubjectById);

// Admin: Update subject
router.put('/:id', adminMiddleware, validate(updateSubjectSchema), SubjectController.updateSubject);

// Admin: Delete subject
router.delete('/:id', adminMiddleware, validate(subjectIdParamSchema), SubjectController.deleteSubject);

module.exports = router;

