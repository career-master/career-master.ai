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
      // Validate connection string format
      if (!env.MONGODB_URI || !env.MONGODB_URI.startsWith('mongodb')) {
        throw new Error('Invalid MONGODB_URI: Must start with mongodb:// or mongodb+srv://');
      }

      // In development, fail fast (10s) so you don't wait forever; production keeps longer timeouts
      const isDev = env.NODE_ENV !== 'production';
      const connectTimeout = isDev ? 10000 : 30000;
      const serverSelectionTimeout = isDev ? 10000 : 30000;

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: serverSelectionTimeout,
        socketTimeoutMS: 45000,
        connectTimeoutMS: connectTimeout,
        retryWrites: true,
        retryReads: true,
      };

      console.log('🔄 Connecting to MongoDB...');
      const maskedUri = env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
      console.log(`📍 URI: ${maskedUri}`);
      
      // Check if it's a mongodb+srv connection
      if (env.MONGODB_URI.includes('mongodb+srv://')) {
        console.log('📡 Using SRV connection (MongoDB Atlas)');
        console.log('💡 If connection fails, check:');
        console.log('   1. Network Access IP whitelist in MongoDB Atlas');
        console.log('   2. DNS resolution (try: nslookup cluster0.hjokhqk.mongodb.net)');
        console.log('   3. Internet connectivity');
      }

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
        console.error('\n💡 Troubleshooting tips for DNS/Connection issues:');
        console.error('   1. ✅ Check MongoDB Atlas Network Access:');
        console.error('      - Go to: https://cloud.mongodb.com/ → Network Access');
        console.error('      - Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)');
        console.error('      - Wait 1-2 minutes for changes to propagate');
        console.error('   2. ✅ Test DNS resolution:');
        console.error('      - Run: nslookup cluster0.hjokhqk.mongodb.net');
        console.error('      - Or: dig cluster0.hjokhqk.mongodb.net');
        console.error('   3. ✅ Verify connection string format in .env:');
        console.error('      - Should be: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?appName=...');
        console.error('      - Check for special characters in password (URL encode if needed)');
        console.error('   4. ✅ Check internet connectivity:');
        console.error('      - Try: ping 8.8.8.8');
        console.error('      - Check firewall/VPN settings');
        console.error('   5. ✅ Verify database user exists and has correct password');
        console.error('   6. ✅ Check if MongoDB Atlas cluster is running (not paused)');
        console.error('   7. ✅ Try using direct connection instead of SRV:');
        console.error('      - Get connection string from Atlas → Connect → Drivers');
        console.error('      - Use "Standard connection string" instead of "SRV connection string"\n');
      } else if (error.message.includes('authentication failed')) {
        console.error('\n💡 Authentication failed - check:');
        console.error('   1. Database username and password in connection string');
        console.error('   2. User exists in MongoDB Atlas → Database Access');
        console.error('   3. User has correct database permissions\n');
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
