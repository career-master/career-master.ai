const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Enrollment Validation Schemas
 */

const requestEnrollmentSchema = z.object({
  subjectId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID')
});

const rejectEnrollmentSchema = z.object({
  rejectionReason: z
    .string()
    .max(500, 'Rejection reason cannot exceed 500 characters')
    .trim()
    .optional()
});

const enrollmentIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid enrollment ID')
});

const studentIdParamSchema = z.object({
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID')
});

const subjectIdParamSchema = z.object({
  subjectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID')
});

module.exports = {
  requestEnrollmentSchema,
  rejectEnrollmentSchema,
  enrollmentIdParamSchema,
  studentIdParamSchema,
  subjectIdParamSchema,
  validate
};

