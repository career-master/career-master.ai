const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Quiz Validation Schemas
 */

const optionSchema = z
  .string()
  .min(1, 'Option text is required')
  .max(1000, 'Option text cannot exceed 1000 characters')
  .trim();

const questionSchema = z.object({
  questionText: z
    .string()
    .min(1, 'Question text is required')
    .max(2000, 'Question text cannot exceed 2000 characters')
    .trim(),
  options: z
    .array(optionSchema)
    .min(2, 'At least 2 options are required')
    .max(6, 'No more than 6 options are allowed'),
  correctOptionIndex: z
    .number()
    .int('Correct option index must be an integer')
    .min(0, 'Correct option index cannot be negative'),
  marks: z
    .number()
    .int('Marks must be an integer')
    .min(0, 'Marks cannot be negative')
    .default(1),
  negativeMarks: z
    .number()
    .min(0, 'Negative marks cannot be negative')
    .default(0)
});

const createQuizSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .trim()
      .optional(),
    durationMinutes: z
      .number()
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 minute')
      .max(600, 'Duration cannot exceed 600 minutes'),
    availableFrom: z
      .string()
      .datetime()
      .optional(),
    availableTo: z
      .string()
      .datetime()
      .optional(),
    batches: z.array(z.string().min(1)).optional(),
    availableToEveryone: z.boolean().optional(),
    maxAttempts: z
      .number()
      .int('Max attempts must be an integer')
      .min(1, 'Max attempts must be at least 1')
      .max(999, 'Max attempts cannot exceed 999')
      .optional()
      .default(999),
    questions: z
      .array(questionSchema)
      .min(1, 'At least one question is required')
  })
});

const updateQuizSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Quiz ID is required')
  }),
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .trim()
      .optional(),
    durationMinutes: z
      .number()
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 minute')
      .max(600, 'Duration cannot exceed 600 minutes')
      .optional(),
    availableFrom: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Available from date must be in YYYY-MM-DD format'),
        z.literal('')
      ])
      .optional()
      .transform((val) => val === '' ? undefined : val),
    availableTo: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Available to date must be in YYYY-MM-DD format'),
        z.literal('')
      ])
      .optional()
      .transform((val) => val === '' ? undefined : val),
    batches: z.array(z.string().min(1)).optional(),
    availableToEveryone: z.boolean().optional(),
    maxAttempts: z
      .number()
      .int('Max attempts must be an integer')
      .min(1, 'Max attempts must be at least 1')
      .max(999, 'Max attempts cannot exceed 999')
      .optional(),
    isActive: z.boolean().optional(),
    questions: z.array(questionSchema).optional()
  })
});

const quizIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Quiz ID is required')
  })
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  quizIdParamSchema,
  validate
};


