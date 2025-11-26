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
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Don't return password by default
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
userSchema.index({ status: 1 });
userSchema.index({ 'roles': 1 });
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
  delete obj.verification.otp;
  delete obj.verification.otpExpiry;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
