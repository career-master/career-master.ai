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

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// SMTP test endpoint (for debugging)
app.get('/api/test-smtp', async (req, res) => {
  try {
    const emailUtil = require('./utils/email');
    const env = require('./config/env');
    
    const smtpConfig = {
      smtpConfigured: !!emailUtil.transporter,
      smtpHost: env.SMTP_HOST,
      smtpPort: env.SMTP_PORT,
      smtpSecure: env.SMTP_SECURE,
      smtpUser: env.SMTP_USER ? 'Set (hidden)' : 'NOT SET',
      smtpPass: env.SMTP_PASS ? 'Set (hidden)' : 'NOT SET',
      emailFrom: env.EMAIL_FROM,
      emailFromName: env.EMAIL_FROM_NAME
    };

    let smtpWorking = false;
    let smtpError = null;

    if (emailUtil.transporter) {
      try {
        smtpWorking = await emailUtil.testEmailConfig();
      } catch (error) {
        smtpError = {
          message: error.message,
          code: error.code,
          command: error.command
        };
      }
    }

    res.status(200).json({
      success: true,
      smtp: {
        ...smtpConfig,
        smtpWorking,
        smtpError
      },
      message: smtpWorking 
        ? 'SMTP is configured and working' 
        : smtpConfig.smtpConfigured 
          ? 'SMTP is configured but connection failed' 
          : 'SMTP is not configured'
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
      dashboard: '/api/dashboard'
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
      dashboard: '/api/dashboard'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
