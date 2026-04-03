const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

const institutionTypeEnum = z.enum(['school', 'college', 'coaching', 'training_institute']);

const emptyToUndef = (val) => (val === '' || val === undefined || val === null ? undefined : val);

const optionalString = (max, msg) =>
  z
    .union([z.string().max(max, msg).trim(), z.literal('')])
    .optional()
    .transform((v) => emptyToUndef(v));

const optionalEmail = z
  .union([z.string().email('Invalid email').toLowerCase().trim().max(254), z.literal('')])
  .optional()
  .transform((v) => emptyToUndef(v));

const institutionBodySchema = z.object({
  institutionName: z
    .string()
    .min(2, 'Institution name must be at least 2 characters')
    .max(200, 'Institution name cannot exceed 200 characters')
    .trim(),
  institutionType: institutionTypeEnum.optional(),
  yearEstablished: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(1800).max(2100).optional()
  ),
  affiliationBoard: optionalString(200, 'Affiliation / board is too long'),
  studentStrength: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().min(0).optional()
  ),
  logoUrl: optionalString(2000, 'Logo URL is too long'),
  chairmanName: optionalString(120, 'Chairman name is too long'),
  principalName: optionalString(120, 'Principal name is too long'),
  adminName: optionalString(120, 'Admin name is too long'),
  adminEmail: optionalEmail,
  adminMobile: optionalString(20, 'Admin mobile is too long'),
  officialEmail: optionalEmail,
  contactMobile1: optionalString(20, 'Contact mobile is too long'),
  contactMobile2: optionalString(20, 'Contact mobile is too long'),
  addressLine1: optionalString(300, 'Address line 1 is too long'),
  addressLine2: optionalString(300, 'Address line 2 is too long'),
  city: optionalString(120, 'City is too long'),
  mandal: optionalString(120, 'Mandal is too long'),
  district: optionalString(120, 'District is too long'),
  state: optionalString(120, 'State is too long'),
  pinCode: optionalString(12, 'PIN code is too long'),
  googleMapLocation: optionalString(2000, 'Map link is too long')
});

const createInstitutionSchema = z.object({
  body: institutionBodySchema
});

const updateInstitutionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution ID is required')
  }),
  body: institutionBodySchema.partial()
});

const institutionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution ID is required')
  })
});

const listInstitutionsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional()
  })
});

module.exports = {
  createInstitutionSchema,
  updateInstitutionSchema,
  institutionIdParamSchema,
  listInstitutionsQuerySchema,
  validate
};
