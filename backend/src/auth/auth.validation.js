const { z } = require('zod');

/**
 * Auth Validation Schemas
 * Uses Zod for type-safe validation
 */

// Common validation patterns
const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .trim();

const phoneSchema = z
  .string()
  .min(8, 'Phone number must be at least 8 digits')
  .max(20, 'Phone number cannot exceed 20 characters')
  .regex(/^[0-9+\-\s()]+$/, 'Phone number can contain digits, spaces, +, -, and parentheses')
  .optional();

const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits');

/**
 * Signup validation schema (OLD - OTP based, kept for backward compatibility)
 * POST /auth/signup
 * Only requires email - sends OTP for verification
 */
const signupSchema = z.object({
  body: z.object({
    email: emailSchema
  })
});

/**
 * Direct signup validation schema (NEW - without OTP)
 * POST /auth/signup-direct
 * Creates account directly without OTP verification
 */
const directSignupSchema = z.object({
  body: z.object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
    phone: phoneSchema
  })
});

/**
 * Google OAuth validation schema
 * POST /auth/google
 */
const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID token is required')
  })
});

/**
 * Verify OTP validation schema
 * POST /auth/verify-otp
 */
const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
    name: nameSchema,
    password: passwordSchema,
    phone: phoneSchema
  })
});

/**
 * Login validation schema
 * POST /auth/login
 */
const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
  })
});

/**
 * Refresh token validation schema
 * POST /auth/refresh
 */
const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

/**
 * Forgot password validation schema
 * POST /auth/forgot-password
 */
const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema
  })
});

/**
 * Reset password validation schema
 * POST /auth/reset-password
 */
const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema
  })
});

/**
 * Change password validation schema (for authenticated users)
 * POST /auth/change-password
 */
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema.refine(
      (val) => val !== undefined,
      'New password is required'
    )
  }).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: 'New password must be different from current password',
      path: ['newPassword']
    }
  )
});

/**
 * Logout validation schema
 * POST /auth/logout
 */
const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

/**
 * Logout all devices validation schema (optional - can be empty)
 * POST /auth/logout-all
 */
const logoutAllSchema = z.object({
  body: z.object({}).optional()
});

// Update current user profile
const updateCurrentUserSchema = z.object({
  body: z.object({
    name: nameSchema.optional(),
    phone: phoneSchema.optional(),
    profilePicture: z.string().url().optional().or(z.literal('')),
    profile: z
      .object({
        // Personal Details
        firstName: z.string().max(100).trim().optional(),
        lastName: z.string().max(100).trim().optional(),
        dateOfBirth: z.date().optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        guardianName: z.string().max(200).trim().optional(),
        guardianRelation: z.enum(['father', 'mother', 'guardian']).optional(),
        
        // Contact Details
        alternateMobile: z.string().max(20).trim().optional(),
        whatsappNumber: z.string().max(20).trim().optional(),
        whatsappSameAsMobile: z.boolean().optional(),
        
        // Address Details
        presentAddress: z.object({
          houseNo: z.string().max(100).trim().optional(),
          street: z.string().max(200).trim().optional(),
          area: z.string().max(200).trim().optional(),
          city: z.string().max(100).trim().optional(),
          district: z.string().max(100).trim().optional(),
          state: z.string().max(100).trim().optional(),
          pinCode: z.string().max(10).trim().optional(),
          country: z.string().max(100).trim().optional(),
        }).optional(),
        
        permanentAddress: z.object({
          houseNo: z.string().max(100).trim().optional(),
          street: z.string().max(200).trim().optional(),
          area: z.string().max(200).trim().optional(),
          city: z.string().max(100).trim().optional(),
          district: z.string().max(100).trim().optional(),
          state: z.string().max(100).trim().optional(),
          pinCode: z.string().max(10).trim().optional(),
          country: z.string().max(100).trim().optional(),
        }).optional(),
        sameAsPresentAddress: z.boolean().optional(),
        
        // Academic Details
        currentQualification: z.string().optional(),
        institutionName: z.string().max(300).trim().optional(),
        university: z.string().max(200).trim().optional(),
        yearOfStudy: z.number().int().min(1).max(10).optional(),
        expectedPassingYear: z.number().int().min(1900).max(2100).optional(),
        percentage: z.number().min(0).max(100).optional(),
        cgpa: z.number().min(0).max(10).optional(),
        gradeType: z.enum(['percentage', 'cgpa']).optional(),
        
        // Course Preferences
        selectedCourses: z.array(z.string()).optional(),
        
        // Legacy fields
        college: z.string().max(200).trim().optional(),
        school: z.string().max(200).trim().optional(),
        jobTitle: z.string().max(200).trim().optional(),
        currentStatus: z.string().max(100).trim().optional(),
        interests: z.array(z.string().trim().min(1)).optional(),
        learningGoals: z.string().max(1000).trim().optional(),
        city: z.string().max(100).trim().optional(),
        country: z.string().max(100).trim().optional()
      })
      .partial()
      .optional()
  })
});

/**
 * Validation middleware factory
 * Creates a middleware function that validates request data against a Zod schema
 * @param {z.ZodSchema} schema - Zod validation schema
 * @returns {Function} - Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request data
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        // Log validation errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Validation error:', {
            errors: error.errors,
            receivedData: {
              body: req.body,
              params: req.params,
              query: req.query
            }
          });
        }

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
  signupSchema,
  directSignupSchema,
  googleAuthSchema,
  verifyOtpSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  logoutSchema,
  logoutAllSchema,
  updateCurrentUserSchema,
  validate
};
