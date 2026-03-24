console.log('🔄 Loading backend...');
const http = require('http');
// Use explicit .js so resolution never picks up an unexpected `app` folder/package.
const app = require('./src/app.js');
const database = require('./src/config/db');
const env = require('./src/config/env');
const RolesService = require('./src/roles/roles.service');
const QuizAttemptRetentionService = require('./src/reports/quiz_attempt_retention.service');

/**
 * Start HTTP server from an Express app.
 * Uses app.listen when present; falls back to http.createServer (handles odd partial loads).
 */
function startHttpServer(expressApp, port, onListening) {
  if (expressApp && typeof expressApp.listen === 'function') {
    return expressApp.listen(port, onListening);
  }
  if (typeof expressApp === 'function') {
    return http.createServer(expressApp).listen(port, onListening);
  }
  throw new TypeError(
    `Cannot bind HTTP server: invalid Express app (type=${typeof expressApp}, hasListen=${Boolean(
      expressApp && expressApp.listen
    )})`
  );
}

/**
 * Server Entry Point
 * Initializes database connection and starts Express server
 */

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(' Unhandled Promise Rejection:', err);
  // Close server gracefully
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
  process.exit(1);
});

/**
 * Start server
 */
async function startServer() {
  console.log('🔄 Server starting...');
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await database.connect();

    // Initialize default roles (only if they don't exist)
    console.log('🔄 Initializing default roles...');
    try {
      if (typeof RolesService.initializeDefaultRoles === 'function') {
        await RolesService.initializeDefaultRoles();
      } else {
        console.warn(
          '⚠️  Warning: RolesService.initializeDefaultRoles is missing; skipping role seed.'
        );
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not initialize default roles:', error.message);
      // Continue even if role initialization fails
    }

    // Quiz attempt retention:
    // - Normal (detailed) attempts are deleted after 30 days.
    // - Cumulative snapshots are preserved in `quiz_attempt_summaries`.
    const retentionEnabled =
      env.NODE_ENV === 'production' || process.env.ENABLE_QUIZ_ATTEMPT_RETENTION_CLEANUP === 'true';
    if (retentionEnabled) {
      // Fire once at startup, then run daily.
      QuizAttemptRetentionService.runQuizAttemptRetentionCleanup().catch((e) => {
        console.error('Quiz attempt retention cleanup (startup) failed:', e);
      });
      setInterval(() => {
        QuizAttemptRetentionService.runQuizAttemptRetentionCleanup().catch((e) => {
          console.error('Quiz attempt retention cleanup (interval) failed:', e);
        });
      }, 24 * 60 * 60 * 1000);
    }

    // Start Express server
    const PORT = env.PORT;
    startHttpServer(app, PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(` API Base URL: http://localhost:${PORT}/api`);
      console.log(` Health Check: http://localhost:${PORT}/health`);
      console.log(` Auth Endpoints: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
