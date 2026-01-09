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
      college: { type: String, trim: true, maxlength: 200 },
      school: { type: String, trim: true, maxlength: 200 },
      jobTitle: { type: String, trim: true, maxlength: 200 },
      currentStatus: { type: String, trim: true, maxlength: 100 }, // e.g., student, working professional
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
      otp: {
        type: String,
        select: false // Don't return OTP by default
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
