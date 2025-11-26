const app = require('./src/app');
const database = require('./src/config/db');
const env = require('./src/config/env');
const RolesService = require('./src/roles/roles.service');

/**
 * Server Entry Point
 * Initializes database connection and starts Express server
 */

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server gracefully
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

/**
 * Start server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await database.connect();

    // Initialize default roles (only if they don't exist)
    console.log('🔄 Initializing default roles...');
    try {
      await RolesService.initializeDefaultRoles();
    } catch (error) {
      console.warn('⚠️  Warning: Could not initialize default roles:', error.message);
      // Continue even if role initialization fails
    }

    // Start Express server
    const PORT = env.PORT;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
