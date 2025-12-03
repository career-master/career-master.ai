const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

/**
 * Quiz Attempt Validation Schemas
 */

// Accept different answer types: number (single choice), array (multiple choice/match/reorder), string (fill in blank), object (hotspot)
// Use z.any() with refinement for more flexible validation
const answerValueSchema = z.any().refine((val) => {
  // Allow null or undefined
  if (val === null || val === undefined) return true;
  
  // Allow number (single choice) - can be integer or float, but we'll convert to int
  if (typeof val === 'number') {
    // Allow any number (will be validated in service)
    return true;
  }
  
  // Allow string (fill in blank) - even empty strings are allowed (will be filtered in service)
  if (typeof val === 'string') return true;
  
  // Allow arrays of any type (will be validated in service)
  if (Array.isArray(val)) return true;
  
  // Allow boolean (for true/false questions)
  if (typeof val === 'boolean') return true;
  
  // Allow object (for hotspot questions - { x: number, y: number })
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    // For hotspot answers, validate that it has x and y properties
    if ('x' in val && 'y' in val && typeof val.x === 'number' && typeof val.y === 'number') {
      return true;
    }
    // Allow other objects too (for future extensibility)
    return true;
  }
  
  return false;
}, {
  message: 'Answer must be a number, string, array, boolean, object (with x and y for hotspot), null, or undefined'
});

const submitAttemptSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Quiz ID is required')
  }),
  body: z.object({
    email: z.string().email('Invalid email address'),
    // Answers can be empty (user might submit without answering any questions)
    // Use z.any() for answers to be more flexible with different answer types
    answers: z.record(z.string(), answerValueSchema).optional().default({}),
    timeSpentInSeconds: z.union([
      z.number().int().min(0),
      z.string().transform((val) => parseInt(val, 10))
    ]).optional().default(0)
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

