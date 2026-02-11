const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Subject Validation Schemas
 */

const createSubjectSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Subject title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .trim()
      .optional(),
    thumbnail: z
      .union([
        z.string().url('Thumbnail must be a valid URL'),
        z.literal('')
      ])
      .optional(),
    category: z
      .string()
      .max(100, 'Category cannot exceed 100 characters')
      .trim()
      .optional(),
    level: z
      .union([
        z.enum(['basic', 'hard']),
        z.literal('')
      ])
      .optional(),
    batches: z
      .array(z.string().trim().min(1))
      .default([])
      .optional(),
    requiresApproval: z
      .boolean()
      .default(true)
      .optional(),
    order: z
      .number()
      .int()
      .min(0)
      .default(0)
      .optional(),
    isActive: z
      .boolean()
      .default(true)
      .optional()
  })
});

const updateSubjectSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID')
  }),
  body: createSubjectSchema.shape.body.partial()
});

const subjectIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID')
  })
});

module.exports = {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdParamSchema,
  validate
};

