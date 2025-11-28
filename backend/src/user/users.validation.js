const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

const createUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    phone: z
      .string()
      .min(8, 'Phone number must be at least 8 digits')
      .max(20, 'Phone number cannot exceed 20 characters')
      .optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    roles: z.array(z.string().min(1)).optional(),
    batches: z.array(z.string().min(1)).optional()
  })
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required')
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim()
      .optional(),
    phone: z
      .string()
      .min(8, 'Phone number must be at least 8 digits')
      .max(20, 'Phone number cannot exceed 20 characters')
      .optional(),
    roles: z.array(z.string().min(1)).optional(),
    batches: z.array(z.string().min(1)).optional(),
    status: z.enum(['active', 'banned']).optional()
  })
});

const listUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: z.string().optional(),
    batch: z.string().optional()
  })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
  validate
};


