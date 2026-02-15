const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Quiz Set Validation Schemas
 */

const createQuizSetSchema = z.object({
  body: z.object({
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID'),
    quizId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
    setName: z
      .string()
      .max(200, 'Set name cannot exceed 200 characters')
      .trim()
      .optional(),
    order: z
      .number()
      .int()
      .min(0)
      .default(0)
      .optional(),
    quizNumber: z
      .number()
      .int()
      .min(0)
      .optional()
      .nullable(),
    isActive: z
      .boolean()
      .default(true)
      .optional()
  })
});

const updateQuizSetSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz set ID')
  }),
  body: createQuizSetSchema.shape.body.partial().extend({
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
      .optional(),
    quizId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID')
      .optional()
  })
});

const quizSetIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz set ID')
  })
});

const topicIdParamSchema = z.object({
  params: z.object({
    topicId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
  })
});

const quizIdParamSchema = z.object({
  params: z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID')
  })
});

module.exports = {
  createQuizSetSchema,
  updateQuizSetSchema,
  quizSetIdParamSchema,
  topicIdParamSchema,
  quizIdParamSchema,
  validate
};

