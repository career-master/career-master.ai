const app = require('./src/app');
const database = require('./src/config/db');
const env = require('./src/config/env');
const RolesService = require('./src/roles/roles.service');
const AdminSeed = require('./src/admin/admin.seed');

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

    // Seed default admin user (only if it doesn't exist)
    console.log('🔄 Seeding default admin user...');
    try {
      await AdminSeed.seedAdminUser();
    } catch (error) {
      console.warn('⚠️  Warning: Could not seed admin user:', error.message);
      // Continue even if admin seeding fails
    }

    // Seed default course with quiz (only if it doesn't exist)
    console.log('🔄 Seeding default course...');
    try {
      const DefaultCourseSeed = require('./src/admin/default-course.seed');
      await DefaultCourseSeed.seedDefaultCourse();
    } catch (error) {
      console.warn('⚠️  Warning: Could not seed default course:', error.message);
      // Continue even if course seeding fails
    }

    // Seed comprehensive quizzes (Technology, Maths, Science, etc.)
    console.log('🔄 Seeding comprehensive quizzes...');
    try {
      const ComprehensiveQuizzesSeed = require('./src/admin/comprehensive-quizzes.seed');
      await ComprehensiveQuizzesSeed.seedComprehensiveQuizzes();
      console.log('✅ All default quizzes are linked to topics via QuizSet');
    } catch (error) {
      console.warn('⚠️  Warning: Could not seed comprehensive quizzes:', error.message);
      // Continue even if comprehensive seeding fails
    }

    // Seed level-test quizzes (Beginner/Intermediate/Advanced per subject for filter testing)
    console.log('🔄 Seeding level-test quizzes (beginner/intermediate/advanced per subject)...');
    try {
      const LevelTestQuizzesSeed = require('./src/admin/level-test-quizzes.seed');
      await LevelTestQuizzesSeed.seedLevelTestQuizzes();
    } catch (error) {
      console.warn('⚠️  Warning: Could not seed level-test quizzes:', error.message);
    }
    
    // Optional: Verify all quizzes are linked to topics (can be enabled for debugging)
    // Uncomment the following lines to run verification after seeding:
    /*
    try {
      const QuizTopicLinkVerifier = require('./src/admin/verify-quiz-topic-links');
      await QuizTopicLinkVerifier.verifyAllQuizzesLinked();
    } catch (error) {
      console.warn('⚠️  Warning: Could not verify quiz-topic links:', error.message);
    }
    */

    // Start Express server
    const PORT = env.PORT;
    app.listen(PORT, () => {
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
