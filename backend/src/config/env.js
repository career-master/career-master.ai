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

  // Email Configuration (SMTP)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
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
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001'
};

// Validate required environment variables in production
if (env.NODE_ENV === 'production') {
  const required = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'SMTP_USER',
    'SMTP_PASS'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = env;
