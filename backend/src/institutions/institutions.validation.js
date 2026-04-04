const { z } = require('zod');
const { validate } = require('../auth/auth.validation');

const institutionTypeEnum = z.enum(['school', 'college', 'coaching', 'training_institute', 'university']);

const reqStr = (max, label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);

const institutionBodySchema = z.object({
  institutionName: z.string().trim().min(2, 'Institution name must be at least 2 characters').max(200),
  institutionType: institutionTypeEnum,
  yearEstablished: z.coerce
    .number({ invalid_type_error: 'Year established is required' })
    .int()
    .min(1800)
    .max(2100),
  affiliationBoard: reqStr(200, 'Affiliation / board'),
  studentStrength: z.coerce
    .number({ invalid_type_error: 'Student strength is required' })
    .min(0, 'Student strength cannot be negative'),
  logoUrl: z
    .string()
    .trim()
    .min(1, 'Logo is required (upload a file or paste a URL)')
    .max(2000)
    .refine((s) => /^https?:\/\//i.test(s), { message: 'Logo must be a valid http(s) URL' }),
  chairmanName: reqStr(120, 'Chairman name'),
  principalName: reqStr(120, 'Principal / head name'),
  adminName: reqStr(120, 'Admin name'),
  adminEmail: z.string().trim().min(1, 'Admin email is required').email('Invalid admin email').max(254),
  adminMobile: reqStr(20, 'Admin mobile'),
  officialEmail: z.string().trim().min(1, 'Official email is required').email('Invalid official email').max(254),
  contactMobile1: reqStr(20, 'Contact mobile 1'),
  contactMobile2: reqStr(20, 'Contact mobile 2'),
  addressLine1: reqStr(300, 'Address line 1'),
  addressLine2: reqStr(300, 'Address line 2'),
  city: reqStr(120, 'City'),
  mandal: reqStr(120, 'Mandal'),
  district: reqStr(120, 'District'),
  state: reqStr(120, 'State'),
  pinCode: reqStr(12, 'PIN code'),
  googleMapLocation: z.string().trim().min(1, 'Google Maps link is required').max(2000)
});

const createInstitutionSchema = z.object({
  body: institutionBodySchema
});

const updateInstitutionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Institution ID is required')
  }),
  body: institutionBodySchema
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
    search: z.string().optional(),
    institutionType: z.string().optional(),
    location: z.string().optional(),
    minStudentStrength: z.string().optional(),
    maxStudentStrength: z.string().optional(),
    sortBy: z.enum(['createdAt', 'institutionName', 'studentStrength']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

module.exports = {
  createInstitutionSchema,
  updateInstitutionSchema,
  institutionIdParamSchema,
  listInstitutionsQuerySchema,
  validate
};
