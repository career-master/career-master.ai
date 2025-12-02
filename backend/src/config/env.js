require('dotenv').config();

/**
 * Environment Configuration
 * Centralized environment variables with validation
 */
const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/career-master',

  // JWT Secrets
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // Email Configuration
  // Resend API (preferred - more reliable)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  // SMTP Configuration (fallback)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === true, // true for 465, false for other ports
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@careermaster.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Career Master',

  // OTP Configuration
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),

  // Password Hashing
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001',

  // Cloudinary Configuration
  // Get credentials from: https://cloudinary.com/console
  // Example format:
  // CLOUDINARY_CLOUD_NAME=dxyz12345 (alphanumeric, 8-15 chars)
  // CLOUDINARY_API_KEY=123456789012345 (numeric, 15-20 digits)
  // CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456 (alphanumeric, 30-40 chars)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
};

// Validate required environment variables in production
if (env.NODE_ENV === 'production') {
  const required = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  // Email is required - either Resend API key OR SMTP credentials
  const hasEmailConfig = env.RESEND_API_KEY || (env.SMTP_USER && env.SMTP_PASS);
  if (!hasEmailConfig) {
    required.push('RESEND_API_KEY or (SMTP_USER and SMTP_PASS)');
  }

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = env;
