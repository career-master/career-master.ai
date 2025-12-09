const express = require('express');
const BatchesController = require('./batches.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const {
  createBatchSchema,
  updateBatchSchema,
  batchIdParamSchema,
  addRemoveStudentsSchema,
  paginatedStudentsSchema,
  validate
} = require('./batches.validation');
const batchRequestRoutes = require('./batch-requests.routes');

const router = express.Router();

const adminMiddleware = [authenticate, requireRole(['super_admin', 'institution_admin'])];

// Get batches (paginated)
router.get('/', adminMiddleware, BatchesController.getBatches);

// Get paginated students
router.get(
  '/students/paginated',
  adminMiddleware,
  validate(paginatedStudentsSchema),
  BatchesController.getPaginatedStudents
);

// Get batch by ID
router.get('/:id', adminMiddleware, validate(batchIdParamSchema), BatchesController.getBatchById);

// Create batch
router.post('/', adminMiddleware, validate(createBatchSchema), BatchesController.createBatch);

// Update batch
router.put('/:id', adminMiddleware, validate(updateBatchSchema), BatchesController.updateBatch);

// Delete batch
router.delete('/:id', adminMiddleware, validate(batchIdParamSchema), BatchesController.deleteBatch);

// Add students to batch (by batch code)
router.post(
  '/:code/students',
  adminMiddleware,
  validate(addRemoveStudentsSchema),
  BatchesController.addStudentsToBatch
);

// Remove students from batch (by batch code)
router.delete(
  '/:code/students',
  adminMiddleware,
  validate(addRemoveStudentsSchema),
  BatchesController.removeStudentsFromBatch
);

// Batch join requests (mounted under /batches/requests)
router.use('/requests', batchRequestRoutes);

module.exports = router;


