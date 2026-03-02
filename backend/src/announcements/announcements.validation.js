const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

const baseAnnouncementBody = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  type: z.enum(['update', 'training', 'exam'], {
    required_error: 'Type is required'
  }),
  dateText: z
    .string()
    .max(120, 'Date text cannot exceed 120 characters')
    .trim()
    .optional(),
  // Dates are accepted as YYYY-MM-DD strings from admin UI; service converts to Date
  startDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
      z.literal('')
    ])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  endDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
      z.literal('')
    ])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  status: z
    .string()
    .max(120, 'Status cannot exceed 120 characters')
    .trim()
    .optional(),
  linkUrl: z
    .string()
    .url('Link URL must be a valid URL')
    .max(500, 'Link URL cannot exceed 500 characters')
    .trim()
    .optional(),
  linkLabel: z
    .string()
    .max(80, 'Link label cannot exceed 80 characters')
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
  order: z
    .number()
    .int()
    .min(0, 'Order cannot be negative')
    .optional()
});

const createAnnouncementSchema = z.object({
  body: baseAnnouncementBody
});

const updateAnnouncementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid announcement ID')
  }),
  body: baseAnnouncementBody.partial()
});

const announcementIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid announcement ID')
  })
});

const listAnnouncementsPublicSchema = z.object({
  query: z.object({
    type: z.enum(['update', 'training', 'exam']).optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .optional()
  })
});

const listAnnouncementsAdminSchema = z.object({
  query: z.object({
    type: z.enum(['update', 'training', 'exam']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .optional()
  })
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdParamSchema,
  listAnnouncementsPublicSchema,
  listAnnouncementsAdminSchema,
  validate
};

