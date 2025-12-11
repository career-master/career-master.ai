const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Topic Progress Validation Schemas
 */

const markCheatSheetReadSchema = z.object({
  body: z.object({
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
  })
});

const recordQuizCompletionSchema = z.object({
  body: z.object({
    quizId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
    attemptId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID')
  })
});

const topicIdParamSchema = z.object({
  params: z.object({
    topicId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid topic ID')
  })
});

const subjectIdParamSchema = z.object({
  params: z.object({
    subjectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID')
  })
});

module.exports = {
  markCheatSheetReadSchema,
  recordQuizCompletionSchema,
  topicIdParamSchema,
  subjectIdParamSchema,
  validate
};

