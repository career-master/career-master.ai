const express = require('express');
const InstitutionsController = require('./institutions.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const {
  createInstitutionSchema,
  updateInstitutionSchema,
  institutionIdParamSchema,
  listInstitutionsQuerySchema,
  validate
} = require('./institutions.validation');

const router = express.Router();

const adminMiddleware = [authenticate, requireRole(['super_admin', 'institution_admin'])];

router.get('/', adminMiddleware, validate(listInstitutionsQuerySchema), InstitutionsController.list);
router.get('/:id', adminMiddleware, validate(institutionIdParamSchema), InstitutionsController.getById);
router.post('/', adminMiddleware, validate(createInstitutionSchema), InstitutionsController.create);
router.put('/:id', adminMiddleware, validate(updateInstitutionSchema), InstitutionsController.update);
router.delete('/:id', adminMiddleware, validate(institutionIdParamSchema), InstitutionsController.delete);

module.exports = router;
