/**
 * Migrate Users from Local MongoDB to MongoDB Atlas
 * This script specifically migrates users, handling duplicates by email
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const OLD_DB_URI = 'mongodb://localhost:27017/career-master';
const NEW_DB_URI = process.env.MONGODB_URI;

async function migrateUsers() {
  let oldConnection, newConnection;
  
  try {
    console.log('🔄 Migrating users from local MongoDB to Atlas...\n');
    
    // Connect to old database
    console.log('🔌 Connecting to local MongoDB...');
    oldConnection = await mongoose.createConnection(OLD_DB_URI, {
      serverSelectionTimeoutMS: 3000
    }).asPromise();
    const oldDb = oldConnection.db;
    console.log('✅ Connected to local MongoDB');
    
    // Connect to new database
    console.log('🔌 Connecting to MongoDB Atlas...');
    newConnection = await mongoose.createConnection(NEW_DB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).asPromise();
    const newDb = newConnection.db;
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Get users from old database
    const oldUsers = await oldDb.collection('users').find({}).toArray();
    console.log(`📊 Found ${oldUsers.length} users in local database\n`);
    
    if (oldUsers.length === 0) {
      console.log('⚠️  No users to migrate');
      return;
    }
    
    // Get existing users from new database
    const existingUsers = await newDb.collection('users').find({}).toArray();
    const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase()));
    console.log(`📊 Found ${existingUsers.length} existing users in Atlas database\n`);
    
    // Migrate users
    let migrated = 0;
    let skipped = 0;
    let updated = 0;
    
    for (const user of oldUsers) {
      const email = user.email?.toLowerCase();
      
      if (!email) {
        console.log(`⚠️  Skipping user without email: ${user._id}`);
        skipped++;
        continue;
      }
      
      if (existingEmails.has(email)) {
        console.log(`⚠️  User already exists: ${email} - skipping`);
        skipped++;
        continue;
      }
      
      try {
        // Remove _id to let MongoDB generate new one, or keep it
        // We'll keep the _id to maintain relationships with other collections
        await newDb.collection('users').insertOne(user);
        console.log(`✅ Migrated user: ${email}`);
        migrated++;
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - try to update instead
          try {
            await newDb.collection('users').replaceOne({ email: user.email }, user, { upsert: true });
            console.log(`🔄 Updated user: ${email}`);
            updated++;
          } catch (updateError) {
            console.log(`❌ Error updating user ${email}: ${updateError.message}`);
            skipped++;
          }
        } else {
          console.log(`❌ Error migrating user ${email}: ${error.message}`);
          skipped++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`   ✅ Migrated: ${migrated} users`);
    console.log(`   🔄 Updated: ${updated} users`);
    console.log(`   ⚠️  Skipped: ${skipped} users`);
    console.log(`   📊 Total: ${oldUsers.length} users processed\n`);
    
    // Verify
    const finalCount = await newDb.collection('users').countDocuments();
    console.log(`✅ Final user count in Atlas: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (oldConnection) await oldConnection.close();
    if (newConnection) await newConnection.close();
    process.exit(0);
  }
}

migrateUsers();

