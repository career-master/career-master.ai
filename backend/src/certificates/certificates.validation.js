const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

const eligibleQuerySchema = z.object({
  query: z.object({
    subjectId: z.string().min(1, 'subjectId is required'),
    minAverage: z.string().optional(),
    batchScope: z.string().optional(),
    batchCode: z.string().optional(),
    /** Comma-separated topic ids; limits quizzes to those roots + their subtopics */
    topicIds: z.string().optional()
  })
});

const generateBodySchema = z.object({
  body: z.object({
    subjectId: z.string().min(1),
    userIds: z.array(z.string().min(1)).min(1, 'Select at least one student'),
    minAverage: z.coerce.number().min(0).max(100).optional(),
    batchScope: z.string().optional(),
    batchCode: z.string().optional(),
    sendEmail: z.boolean().optional(),
    /** If set, certificate uses only quizzes under these topic roots (and nested subtopics) */
    topicScopeIds: z.array(z.string().min(1)).max(40).optional()
  })
});

const listQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    subjectId: z.string().optional(),
    search: z.string().optional()
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const updateBodySchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z
    .object({
      recipientName: z.string().min(1).max(200).optional(),
      issuedOnText: z.string().max(200).optional()
    })
    .refine((b) => b.recipientName !== undefined || b.issuedOnText !== undefined, {
      message: 'Provide recipientName and/or issuedOnText'
    })
});

module.exports = {
  eligibleQuerySchema,
  generateBodySchema,
  listQuerySchema,
  idParamSchema,
  updateBodySchema,
  validate
};
