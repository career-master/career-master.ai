const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./auth/auth.routes');
const rolesRoutes = require('./roles/roles.routes');
const quizRoutes = require('./quiz/quiz.routes');
const batchesRoutes = require('./batches/batches.routes');
const usersRoutes = require('./user/users.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const reportsRoutes = require('./reports/reports.routes');
const uploadRoutes = require('./upload/upload.routes');
const env = require('./config/env');

/**
 * Express Application
 * Main application setup and configuration
 */
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Get allowed origins from environment
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ''))
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'https://career-master-ai.onrender.com'
        ];
    
    // Check if origin is allowed (compare normalized versions)
    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count'
  ],
  maxAge: 86400 // 24 hours - how long the browser can cache the preflight response
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Rate limiting middleware - more lenient in development
const limiter = rateLimit({
  windowMs: env.NODE_ENV === 'development' ? 60000 : env.RATE_LIMIT_WINDOW_MS, // 1 minute in dev, 15 minutes in prod
  max: env.NODE_ENV === 'development' ? 1000 : env.RATE_LIMIT_MAX_REQUESTS, // Much higher limit in development
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    if (req.path === '/health' || req.path === '/api/health') {
      return true;
    }
    // In development, be more lenient
    if (env.NODE_ENV === 'development') {
      return false; // Still apply rate limiting but with higher limits
    }
    return false;
  }
});

// Apply rate limiting to all API requests
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Email test endpoint (for debugging)
app.get('/api/test-email', async (req, res) => {
  try {
    const emailUtil = require('./utils/email');
    const env = require('./config/env');
    
    const emailConfig = {
      provider: emailUtil.resend ? 'resend' : 'none',
      resendInitialized: !!emailUtil.resend,
      resendApiKey: env.RESEND_API_KEY ? `Set (${env.RESEND_API_KEY.substring(0, 10)}...)` : 'NOT SET',
      resendApiKeyFormat: env.RESEND_API_KEY ? (env.RESEND_API_KEY.startsWith('re_') ? 'Valid' : 'Invalid (should start with re_)') : 'N/A',
      emailFrom: emailUtil.emailFrom || env.EMAIL_FROM,
      emailFromName: env.EMAIL_FROM_NAME
    };

    let emailWorking = false;
    let emailError = null;

    try {
      emailWorking = await emailUtil.testEmailConfig();
    } catch (error) {
      emailError = {
        message: error.message,
        code: error.code,
        command: error.command
      };
    }

    res.status(200).json({
      success: true,
      email: {
        ...emailConfig,
        emailWorking,
        emailError
      },
      message: emailWorking 
        ? `Email service (${emailConfig.provider}) is configured and working` 
        : emailConfig.resendInitialized
          ? `Email service (${emailConfig.provider}) is configured but connection failed. Check network or API key.` 
          : emailConfig.resendApiKey === 'NOT SET'
            ? 'Email service is not configured. RESEND_API_KEY is not set in Render environment variables. See RENDER_RESEND_SETUP.md'
            : emailConfig.resendApiKeyFormat === 'Invalid (should start with re_)'
              ? 'Email service is not configured. RESEND_API_KEY format is invalid (should start with "re_").'
              : 'Email service is not configured. Check server logs for details.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        stack: env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Career Master API',
    version: '1.0.0',
      endpoints: {
      health: '/health',
      auth: '/api/auth',
      roles: '/api/roles',
      quizzes: '/api/quizzes',
      batches: '/api/batches',
      users: '/api/users',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
      upload: '/api/upload',
      testEmail: '/api/test-email'
    }
  });
});

// API root endpoint (for /api requests)
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Career Master API',
    version: '1.0.0',
      endpoints: {
      health: '/health',
      auth: '/api/auth',
      roles: '/api/roles',
      quizzes: '/api/quizzes',
      batches: '/api/batches',
      users: '/api/users',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
      upload: '/api/upload',
      testEmail: '/api/test-email'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
