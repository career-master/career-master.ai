const express = require('express');
const CertificatesController = require('./certificates.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const {
  eligibleQuerySchema,
  generateBodySchema,
  listQuerySchema,
  idParamSchema,
  updateBodySchema,
  validate
} = require('./certificates.validation');

const router = express.Router();

const superAdmin = [authenticate, requireRole(['super_admin'])];

/** Student / user: my certificates (must be before /:id) */
router.get('/my', authenticate, CertificatesController.my);

/** Admin: who qualifies for subject certificates */
router.get('/eligible', ...superAdmin, validate(eligibleQuerySchema), CertificatesController.eligible);

/** Admin: all students with attempts on subject + pass/avg breakdown (for filters / visibility) */
router.get('/subject-progress', ...superAdmin, validate(eligibleQuerySchema), CertificatesController.subjectProgress);

router.post('/generate', ...superAdmin, validate(generateBodySchema), CertificatesController.generate);

router.get('/', ...superAdmin, validate(listQuerySchema), CertificatesController.list);

router.get('/:id', authenticate, validate(idParamSchema), CertificatesController.getOne);

router.put('/:id', ...superAdmin, validate(updateBodySchema), CertificatesController.update);

router.delete('/:id', ...superAdmin, validate(idParamSchema), CertificatesController.remove);

module.exports = router;
