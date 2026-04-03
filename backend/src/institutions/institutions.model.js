const mongoose = require('mongoose');

const INSTITUTION_TYPES = ['school', 'college', 'coaching', 'training_institute'];

const institutionSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: [200, 'Institution name cannot exceed 200 characters']
    },
    institutionType: {
      type: String,
      enum: {
        values: INSTITUTION_TYPES,
        message: 'Invalid institution type'
      },
      default: 'school'
    },
    yearEstablished: {
      type: Number,
      min: [1800, 'Year established seems invalid'],
      max: [2100, 'Year established seems invalid']
    },
    affiliationBoard: {
      type: String,
      trim: true,
      maxlength: [200, 'Affiliation / board cannot exceed 200 characters']
    },
    studentStrength: {
      type: Number,
      min: [0, 'Student strength cannot be negative']
    },
    logoUrl: {
      type: String,
      trim: true,
      maxlength: [2000, 'Logo URL is too long']
    },
    chairmanName: {
      type: String,
      trim: true,
      maxlength: [120, 'Chairman name cannot exceed 120 characters']
    },
    principalName: {
      type: String,
      trim: true,
      maxlength: [120, 'Principal / head name cannot exceed 120 characters']
    },
    adminName: {
      type: String,
      trim: true,
      maxlength: [120, 'Admin name cannot exceed 120 characters']
    },
    adminEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email is too long']
    },
    adminMobile: {
      type: String,
      trim: true,
      maxlength: [20, 'Mobile cannot exceed 20 characters']
    },
    officialEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email is too long']
    },
    contactMobile1: {
      type: String,
      trim: true,
      maxlength: [20, 'Mobile cannot exceed 20 characters']
    },
    contactMobile2: {
      type: String,
      trim: true,
      maxlength: [20, 'Mobile cannot exceed 20 characters']
    },
    addressLine1: {
      type: String,
      trim: true,
      maxlength: [300, 'Address line 1 cannot exceed 300 characters']
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [300, 'Address line 2 cannot exceed 300 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [120, 'City cannot exceed 120 characters']
    },
    mandal: {
      type: String,
      trim: true,
      maxlength: [120, 'Mandal cannot exceed 120 characters']
    },
    district: {
      type: String,
      trim: true,
      maxlength: [120, 'District cannot exceed 120 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [120, 'State cannot exceed 120 characters']
    },
    pinCode: {
      type: String,
      trim: true,
      maxlength: [12, 'PIN code cannot exceed 12 characters']
    },
    googleMapLocation: {
      type: String,
      trim: true,
      maxlength: [2000, 'Map link is too long']
    }
  },
  {
    timestamps: true,
    collection: 'institutions'
  }
);

institutionSchema.index({ institutionName: 1 });
institutionSchema.index({ createdAt: -1 });

const Institution = mongoose.model('Institution', institutionSchema);
Institution.INSTITUTION_TYPES = INSTITUTION_TYPES;

module.exports = Institution;
