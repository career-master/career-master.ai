const express = require('express');
const CertificatesController = require('./certificates.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const {
  eligibleQuerySchema,
  generateBodySchema,
  listQuerySchema,
  idParamSchema,
  verifyParamSchema,
  updateBodySchema,
  validate
} = require('./certificates.validation');

const router = express.Router();

const superAdmin = [authenticate, requireRole(['super_admin'])];

/** Public: verify a certificate by its number (target of the QR code printed on the PDF) */
router.get('/verify/:certificateNumber', validate(verifyParamSchema), CertificatesController.verify);
router.get('/verify/:certificateNumber/pdf', validate(verifyParamSchema), CertificatesController.verifyPdf);

/** Student / user: my certificates (must be before /:id) */
router.get('/my', authenticate, CertificatesController.my);

/** Admin: who qualifies for subject certificates */
router.get('/eligible', ...superAdmin, validate(eligibleQuerySchema), CertificatesController.eligible);

/** Admin: all students with attempts on subject + pass/avg breakdown (for filters / visibility) */
router.get('/subject-progress', ...superAdmin, validate(eligibleQuerySchema), CertificatesController.subjectProgress);

router.post('/generate', ...superAdmin, validate(generateBodySchema), CertificatesController.generate);

router.get('/', ...superAdmin, validate(listQuerySchema), CertificatesController.list);

router.get('/:id', authenticate, validate(idParamSchema), CertificatesController.getOne);

/** Owner or super_admin: stream the issued PDF */
router.get('/:id/pdf', authenticate, validate(idParamSchema), CertificatesController.pdf);

router.put('/:id', ...superAdmin, validate(updateBodySchema), CertificatesController.update);

router.delete('/:id', ...superAdmin, validate(idParamSchema), CertificatesController.remove);

module.exports = router;
