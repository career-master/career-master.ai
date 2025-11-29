/**
 * Test MongoDB Connection Script
 * Tests connection to the new MongoDB Atlas database
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log(`📍 Connection String: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📁 Existing Collections (${collections.length}):`);
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (No collections found - database is empty)');
    }

    // Test a simple query
    const adminUser = await mongoose.connection.db.collection('users').findOne({ 
      roles: { $in: ['super_admin'] } 
    });
    
    if (adminUser) {
      console.log('\n✅ Admin user found in database');
    } else {
      console.log('\n⚠️  No admin user found - will be created on server start');
    }

    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('💡 Check your username and password in the connection string');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Check your network connection and MongoDB Atlas IP whitelist');
    }
    process.exit(1);
  }
}

testConnection();

