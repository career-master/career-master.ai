const mongoose = require('mongoose');
const env = require('./env');

/**
 * MongoDB Connection
 * Handles database connection with proper error handling and reconnection logic
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for DNS resolution
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 10000, // Connection timeout
        family: 4 // Use IPv4, skip trying IPv6
      };

      console.log('🔄 Connecting to MongoDB...');
      console.log(`📍 URI: ${env.MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs

      this.connection = await mongoose.connect(env.MONGODB_URI, options);

      console.log(`✅ MongoDB connected: ${this.connection.connection.host}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Check MongoDB Atlas IP whitelist (Network Access)');
        console.error('   2. Verify connection string in .env file');
        console.error('   3. Check network connectivity and DNS resolution');
        console.error('   4. Ensure database user credentials are correct');
        console.error('   5. See MONGODB_CONNECTION_TROUBLESHOOTING.md for details\n');
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log(' MongoDB disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   * @returns {number} 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
   */
  getStatus() {
    return mongoose.connection.readyState;
  }

  /** 
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
const database = new Database();
module.exports = database;
