const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

const batchBaseSchema = z.object({
  name: z
    .string()
    .min(2, 'Batch name must be at least 2 characters')
    .max(100, 'Batch name cannot exceed 100 characters')
    .trim(),
  code: z
    .string()
    .min(2, 'Batch code must be at least 2 characters')
    .max(50, 'Batch code cannot exceed 50 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional(),
  startDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
      z.literal('')
    ])
    .optional()
    .transform((val) => val === '' ? undefined : val),
  endDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
      z.literal('')
    ])
    .optional()
    .transform((val) => val === '' ? undefined : val),
  isActive: z.boolean().optional()
});

const createBatchSchema = z.object({
  body: batchBaseSchema
});

const updateBatchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Batch ID is required')
  }),
  body: batchBaseSchema.partial()
});

const batchIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Batch ID is required')
  })
});

const addRemoveStudentsSchema = z.object({
  params: z.object({
    code: z.string().min(1, 'Batch code is required')
  }),
  body: z.object({
    userIds: z.array(z.string().min(1)).min(1, 'At least one user ID is required')
  })
});

const paginatedStudentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    batchCode: z.string().optional()
  })
});

module.exports = {
  createBatchSchema,
  updateBatchSchema,
  batchIdParamSchema,
  addRemoveStudentsSchema,
  paginatedStudentsSchema,
  validate
};


