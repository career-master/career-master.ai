const mongoose = require('mongoose');

/**
 * OTP Logs Schema
 * Tracks OTP generation and usage for audit and security purposes
 * Stores OTP attempts for signup, login, and password reset flows
 */
const otpLogsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      select: false // Don't return OTP by default in queries
    },
    purpose: {
      type: String,
      required: [true, 'OTP purpose is required'],
      enum: {
        values: ['signup', 'login', 'forgot_password'],
        message: 'Invalid OTP purpose'
      },
      index: true
    },
    ip: {
      type: String,
      required: [true, 'IP address is required'],
      trim: true
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: { expireAfterSeconds: 0 } // TTL index for automatic deletion
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'otp_logs'
  }
);

// Indexes for performance and cleanup
otpLogsSchema.index({ email: 1, purpose: 1, createdAt: -1 }); // Find recent OTPs for user
otpLogsSchema.index({ expiresAt: 1 }); // TTL index for automatic cleanup
otpLogsSchema.index({ email: 1, verified: 1 }); // Find unverified OTPs
otpLogsSchema.index({ createdAt: -1 }); // Sort by creation time

// Instance method to check if OTP is expired
otpLogsSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Instance method to check if OTP is valid (not expired and not verified)
otpLogsSchema.methods.isValid = function() {
  return !this.isExpired() && !this.verified;
};

// Instance method to mark OTP as verified
otpLogsSchema.methods.markAsVerified = function() {
  this.verified = true;
  this.verifiedAt = new Date();
  return this;
};

// Pre-save hook to set default expiry if not provided (10 minutes)
otpLogsSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Default 10 minutes
    this.expiresAt = expiryDate;
  }
  next();
});

const OtpLog = mongoose.model('OtpLog', otpLogsSchema);

module.exports = OtpLog;
