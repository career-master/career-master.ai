const { z } = require('zod');

/**
 * Roles Validation Schemas
 * Uses Zod for type-safe validation
 */

// Common field schemas
const roleNameSchema = z
  .string()
  .min(2, 'Role name must be at least 2 characters')
  .max(100, 'Role name cannot exceed 100 characters')
  .trim()
  .toLowerCase();

const permissionsArraySchema = z
  .array(
    z
      .string()
      .min(1, 'Permission cannot be empty')
      .trim()
      .toLowerCase()
  )
  .optional();

/**
 * Create role schema
 * POST /roles
 */
const createRoleSchema = z.object({
  body: z.object({
    name: roleNameSchema,
    permissions: permissionsArraySchema
  })
});

/**
 * Update role schema
 * PUT /roles/:id
 */
const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Role ID is required')
  }),
  body: z
    .object({
      name: roleNameSchema.optional(),
      permissions: permissionsArraySchema
    })
    .refine(
      (data) => data.name !== undefined || data.permissions !== undefined,
      {
        message: 'At least one of name or permissions must be provided',
        path: ['body']
      }
    )
});

/**
 * Assign/remove role schema
 * POST /roles/assign
 * POST /roles/remove
 */
const modifyUserRoleSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: roleNameSchema
  })
});

/**
 * Generic validation middleware
 * (duplicated from auth.validation to keep modules decoupled)
 * @param {z.ZodSchema} schema
 * @returns {Function}
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors
          }
        });
      }

      next(error);
    }
  };
};

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  modifyUserRoleSchema,
  validate
};


