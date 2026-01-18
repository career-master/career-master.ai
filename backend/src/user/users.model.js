const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user authentication and profile information
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    profile: {
      // Personal Details
      firstName: { type: String, trim: true, maxlength: 100 },
      lastName: { type: String, trim: true, maxlength: 100 },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], trim: true },
      guardianName: { type: String, trim: true, maxlength: 200 },
      guardianRelation: { type: String, enum: ['father', 'mother', 'guardian'], trim: true },
      
      // Contact Details
      alternateMobile: { type: String, trim: true, maxlength: 20 },
      whatsappNumber: { type: String, trim: true, maxlength: 20 },
      whatsappSameAsMobile: { type: Boolean, default: false },
      
      // Present Address
      presentAddress: {
        houseNo: { type: String, trim: true, maxlength: 100 },
        street: { type: String, trim: true, maxlength: 200 },
        area: { type: String, trim: true, maxlength: 200 },
        city: { type: String, trim: true, maxlength: 100 },
        district: { type: String, trim: true, maxlength: 100 },
        state: { type: String, trim: true, maxlength: 100 },
        pinCode: { type: String, trim: true, maxlength: 10 },
        country: { type: String, trim: true, maxlength: 100 }
      },
      
      // Permanent Address
      permanentAddress: {
        houseNo: { type: String, trim: true, maxlength: 100 },
        street: { type: String, trim: true, maxlength: 200 },
        area: { type: String, trim: true, maxlength: 200 },
        city: { type: String, trim: true, maxlength: 100 },
        district: { type: String, trim: true, maxlength: 100 },
        state: { type: String, trim: true, maxlength: 100 },
        pinCode: { type: String, trim: true, maxlength: 10 },
        country: { type: String, trim: true, maxlength: 100 }
      },
      sameAsPresentAddress: { type: Boolean, default: false },
      
      // Academic Details
      currentQualification: { 
        type: String, 
        enum: [
          'school_3', 'school_4', 'school_5', 'school_6', 'school_7', 'school_8', 'school_9', 'school_10',
          'inter_mpc', 'inter_bipc', 'inter_cec', 'inter_others',
          'diploma_ece', 'diploma_eee', 'diploma_cse', 'diploma_mech', 'diploma_civil', 'diploma_others',
          'ug_btech', 'ug_bsc', 'ug_ba', 'ug_bcom', 'ug_bba', 'ug_others',
          'pg_mtech', 'pg_msc', 'pg_ma', 'pg_mcom', 'pg_mba', 'pg_others',
          'phd', 'other'
        ],
        trim: true
      },
      institutionName: { type: String, trim: true, maxlength: 300 },
      university: { type: String, trim: true, maxlength: 200 },
      yearOfStudy: { type: Number, min: 1, max: 10 },
      expectedPassingYear: { type: Number, min: 1900, max: 2100 },
      percentage: { type: Number, min: 0, max: 100 },
      cgpa: { type: Number, min: 0, max: 10 },
      gradeType: { type: String, enum: ['percentage', 'cgpa'], default: 'percentage' },
      
      // Course Preferences (selected courses user wants to practice)
      selectedCourses: { type: [String], default: [] }, // Array of course IDs or course names
      
      // Legacy fields (keeping for backward compatibility)
      college: { type: String, trim: true, maxlength: 200 },
      school: { type: String, trim: true, maxlength: 200 },
      jobTitle: { type: String, trim: true, maxlength: 200 },
      currentStatus: { type: String, trim: true, maxlength: 100 },
      interests: { type: [String], default: [] },
      learningGoals: { type: String, trim: true, maxlength: 1000 },
      city: { type: String, trim: true, maxlength: 100 },
      country: { type: String, trim: true, maxlength: 100 }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      minlength: [8, 'Phone number must be at least 8 digits'],
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    passwordHash: {
      type: String,
      required: function() {
        // Password is required only if user doesn't have Google ID
        return !this.googleId;
      },
      select: false // Don't return password by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      select: false
    },
    profilePicture: {
      type: String,
      trim: true
    },
    batches: {
      type: [String],
      default: []
    },
    roles: {
      type: [String],
      default: ['student'],
      enum: {
        values: [
          'super_admin',
          'technical_admin',
          'content_admin',
          'institution_admin',
          'partner',
          'parent',
          'subscriber',
          'student'
        ],
        message: 'Invalid role provided'
      }
    },
    verification: {
      emailVerified: {
        type: Boolean,
        default: false
      },
      emailOtp: {
        type: String,
        select: false
      },
      emailOtpExpiry: {
        type: Date,
        select: false
      },
      phoneVerified: {
        type: Boolean,
        default: false
      },
      phoneOtp: {
        type: String,
        select: false
      },
      phoneOtpExpiry: {
        type: Date,
        select: false
      },
      // Legacy OTP fields (keeping for backward compatibility)
      otp: {
        type: String,
        select: false
      },
      otpExpiry: {
        type: Date,
        select: false
      }
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active'
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
  }
);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'roles': 1 });
userSchema.index({ batches: 1 });
userSchema.index({ createdAt: -1 });

// Instance method to check if user is verified
userSchema.methods.isEmailVerified = function() {
  return this.verification.emailVerified === true;
};

// Instance method to check if user is active
userSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Instance method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Transform output to remove sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  if (obj.verification) {
    delete obj.verification.otp;
    delete obj.verification.otpExpiry;
  }
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
