const { z } = require('zod');
const { validate } = require('../auth/auth.validation');
const { QUESTION_TYPES } = require('./question-types.config');

/**
 * Quiz Validation Schemas
 */

const optionSchema = z
  .string()
  .min(1, 'Option text is required')
  .max(1000, 'Option text cannot exceed 1000 characters')
  .trim();

// Flexible question schema that validates based on question type
const questionSchema = z.object({
  questionType: z
    .enum(Object.values(QUESTION_TYPES))
    .default(QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE),
  questionText: z
    .string()
    .min(1, 'Question text is required')
    .max(2000, 'Question text cannot exceed 2000 characters')
    .trim(),
  // Options - required for MCQ types, dropdown, poll, true/false
  options: z
    .array(optionSchema)
    .optional(),
  // Single correct answer index
  correctOptionIndex: z
    .number()
    .int('Correct option index must be an integer')
    .min(0, 'Correct option index cannot be negative')
    .optional(),
  // Multiple correct answer indices - only for MCQ Multiple
  correctOptionIndices: z
    .array(z.number().int().min(0))
    .optional(),
  // Fill in blank correct answers
  correctAnswers: z
    .array(z.string().min(1))
    .min(1, 'At least one correct answer is required')
    .optional(),
  // Match pairs
  matchPairs: z
    .array(z.object({
      left: z.string().min(1),
      right: z.string().min(1)
    }))
    .min(1, 'At least one match pair is required')
    .optional(),
  // Correct order for reorder questions
  correctOrder: z
    .array(z.string().min(1))
    .min(1, 'At least one item is required')
    .optional(),
  // Hotspot regions
  hotspotRegions: z
    .array(z.object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
      width: z.number().min(0).max(100),
      height: z.number().min(0).max(100),
      label: z.string().optional()
    }))
    .min(1, 'At least one hotspot region is required')
    .optional(),
  // Image URL - can be empty string or URL
  imageUrl: z.union([z.string().url(), z.string().length(0)]).optional(),
  // Passage text
  passageText: z.string().max(10000).optional(),
  // Marks
  marks: z
    .number()
    .int('Marks must be an integer')
    .min(0, 'Marks cannot be negative')
    .default(1),
  negativeMarks: z
    .number()
    .min(0, 'Negative marks cannot be negative')
    .default(0),
  // Metadata
  metadata: z.record(z.any()).optional()
}).refine((data) => {
  // Type-specific validation - only validate if question has content
  const { questionType, questionText, options, correctOptionIndex, correctOptionIndices, correctAnswers, matchPairs, correctOrder, imageUrl, hotspotRegions } = data;
  
  // Skip validation if question text is empty (question is being created)
  if (!questionText || questionText.trim().length === 0) {
    return true; // Allow empty questions during creation
  }
  
  if (['multiple_choice_single', 'multiple_choice', 'dropdown', 'true_false'].includes(questionType)) {
    if (!options || options.length < 2) return false;
    if (questionType === 'true_false' && options.length !== 2) return false;
    if (correctOptionIndex === undefined || correctOptionIndex < 0 || correctOptionIndex >= options.length) return false;
  }
  
  if (questionType === 'multiple_choice_multiple') {
    if (!options || options.length < 2) return false;
    // Only validate correctOptionIndices if question has content (not being created)
    if (questionText && questionText.trim().length > 0) {
      // For MCQ Multiple, must have at least one correct answer
      if (!correctOptionIndices || !Array.isArray(correctOptionIndices) || correctOptionIndices.length === 0) {
        return false;
      }
      if (correctOptionIndices.some(idx => idx < 0 || idx >= options.length)) return false;
    }
  }
  
  // For non-MCQ-Multiple questions, ignore correctOptionIndices if present (might be leftover from type change)
  if (questionType !== 'multiple_choice_multiple' && correctOptionIndices !== undefined) {
    // This is okay - just ignore it, don't validate
  }
  
  if (questionType === 'fill_in_blank') {
    if (!correctAnswers || correctAnswers.length === 0 || correctAnswers.every(a => !a || a.trim().length === 0)) return false;
  }
  
  if (questionType === 'match') {
    if (!matchPairs || matchPairs.length === 0) return false;
  }
  
  if (['reorder', 'drag_drop'].includes(questionType)) {
    if (!correctOrder || correctOrder.length === 0) return false;
  }
  
  // Image-based questions can have empty imageUrl during creation
  // if (['hotspot', 'labeling', 'image_based', 'draw'].includes(questionType)) {
  //   if (!imageUrl || imageUrl.trim().length === 0) return false;
  // }
  
  if (questionType === 'hotspot') {
    // For hotspot questions, must have at least one hotspot region
    if (questionText && questionText.trim().length > 0) {
      if (!hotspotRegions || !Array.isArray(hotspotRegions) || hotspotRegions.length === 0) {
        return false;
      }
      // Validate that imageUrl is provided
      if (!imageUrl || imageUrl.trim().length === 0) {
        return false;
      }
    }
  }
  
  if (questionType === 'passage') {
    if (!data.passageText || data.passageText.trim().length === 0) return false;
  }
  
  return true;
}, {
  message: 'Question validation failed for the specified question type'
});

// Section schema
const sectionSchema = z.object({
  sectionTitle: z.string().min(1, 'Section title is required').max(200),
  sectionDescription: z.string().max(1000).optional(),
  questionType: z.enum(Object.values(QUESTION_TYPES)).optional(),
  questions: z.array(questionSchema).min(1, 'Section must have at least one question'),
  order: z.number().int().min(0).default(0)
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
      .union([z.string().datetime(), z.string().length(0), z.literal('')])
      .optional()
      .transform((val) => val === '' ? undefined : val),
    availableTo: z
      .union([z.string().datetime(), z.string().length(0), z.literal('')])
      .optional()
      .transform((val) => val === '' ? undefined : val),
    batches: z.array(z.string().min(1)).optional(),
    availableToEveryone: z.boolean().optional(),
    maxAttempts: z
      .number()
      .int('Max attempts must be an integer')
      .min(1, 'Max attempts must be at least 1')
      .max(999, 'Max attempts cannot exceed 999')
      .optional()
      .default(999),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
    // Quiz structure
    useSections: z.boolean().default(false),
    sections: z.array(sectionSchema).optional(),
    // Legacy flat questions
    questions: z.array(questionSchema).optional()
  }).refine((data) => {
    // Either sections or questions must be provided
    if (data.useSections) {
      return data.sections && data.sections.length > 0;
    } else {
      return data.questions && data.questions.length > 0;
    }
  }, {
    message: 'Quiz must have either sections (if useSections=true) or questions (if useSections=false)'
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
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
    isActive: z.boolean().optional(),
    useSections: z.boolean().optional(),
    sections: z.array(sectionSchema).optional(),
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


