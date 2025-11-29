const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Quiz Attempt Validation Schemas
 */

const submitAttemptSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Quiz ID is required')
  }),
  body: z.object({
    email: z.string().email('Invalid email address'),
    answers: z.record(z.string(), z.number().int().min(0)).refine(
      (val) => Object.keys(val).length > 0,
      'At least one answer is required'
    ),
    timeSpentInSeconds: z.number().int().min(0).optional().default(0)
  })
});

const getUserQuizzesSchema = z.object({
  params: z.object({
    email: z.string().email('Invalid email address')
  })
});

module.exports = {
  submitAttemptSchema,
  getUserQuizzesSchema,
  validate
};

