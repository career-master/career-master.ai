const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Topic Validation Schemas
 */

const createTopicSchema = z.object({
  body: z.object({
    subjectId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID'),
    title: z
      .string()
      .min(1, 'Topic title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .trim()
      .optional(),
    order: z
      .number()
      .int()
      .min(0)
      .default(0)
      .optional(),
    prerequisites: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid prerequisite topic ID'))
      .default([])
      .optional(),
    requiredQuizzesToUnlock: z
      .number()
      .int()
      .min(0)
      .default(2)
      .optional(),
    isActive: z
      .boolean()
      .default(true)
      .optional()
  })
});

const updateTopicSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
  }),
  body: createTopicSchema.shape.body.partial().extend({
    subjectId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID')
      .optional()
  })
});

const topicIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
  })
});

module.exports = {
  createTopicSchema,
  updateTopicSchema,
  topicIdParamSchema,
  validate
};

