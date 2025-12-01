const mongoose = require('mongoose');

/**
 * Sessions Schema
 * Tracks active refresh tokens for users across devices
 * Used for logout functionality and security
 */
const sessionsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
      unique: true
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    ip: {
      type: String,
      required: [true, 'IP address is required'],
      trim: true
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required']
    }
  },
  {
    timestamps: true,
    collection: 'sessions'
  }
);

// Indexes for performance and cleanup
sessionsSchema.index({ userId: 1, createdAt: -1 }); // Find user sessions
sessionsSchema.index({ refreshToken: 1 }, { unique: true }); // Lookup by token
sessionsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup
sessionsSchema.index({ userId: 1, expiresAt: 1 }); // Composite index for user session queries

// Instance method to check if session is expired
sessionsSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Instance method to extend session expiry
sessionsSchema.methods.extendExpiry = function(days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  this.expiresAt = expiryDate;
  return this;
};

// Pre-save hook to ensure expiresAt is set
sessionsSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Default 7 days
    this.expiresAt = expiryDate;
  }
  next();
});

const Session = mongoose.model('Session', sessionsSchema);

module.exports = Session;
