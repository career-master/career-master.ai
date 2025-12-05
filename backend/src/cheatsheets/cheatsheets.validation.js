const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * CheatSheet Validation Schemas
 */

const resourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required'),
  url: z.string().url('Resource URL must be valid'),
  type: z.enum(['link', 'video', 'document']).default('link').optional()
});

const createCheatSheetSchema = z.object({
  body: z.object({
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID'),
    content: z
      .string()
      .min(1, 'Content is required')
      .trim(),
    contentType: z
      .enum(['html', 'markdown', 'text'])
      .default('html')
      .optional(),
    estReadMinutes: z
      .number()
      .int()
      .min(0)
      .default(5)
      .optional(),
    resources: z
      .array(resourceSchema)
      .default([])
      .optional()
  })
});

const updateCheatSheetSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cheatsheet ID')
  }),
  body: createCheatSheetSchema.shape.body.partial().extend({
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
      .optional()
  })
});

const cheatsheetIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cheatsheet ID')
  })
});

const topicIdParamSchema = z.object({
  params: z.object({
    topicId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
  })
});

module.exports = {
  createCheatSheetSchema,
  updateCheatSheetSchema,
  cheatsheetIdParamSchema,
  topicIdParamSchema,
  validate
};

