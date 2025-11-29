/**
 * Data Migration Script
 * Migrates data from old database to new MongoDB Atlas database
 * 
 * Usage:
 * 1. Set OLD_MONGODB_URI in .env or pass as argument
 * 2. Run: node scripts/migrate-data.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const OLD_MONGODB_URI = process.argv[2] || process.env.OLD_MONGODB_URI;
const NEW_MONGODB_URI = process.env.MONGODB_URI;

if (!OLD_MONGODB_URI) {
  console.error('❌ Error: OLD_MONGODB_URI not provided');
  console.log('Usage: node scripts/migrate-data.js <old_connection_string>');
  console.log('Or set OLD_MONGODB_URI in .env file');
  process.exit(1);
}

if (!NEW_MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env');
  process.exit(1);
}

const collectionsToMigrate = [
  'users',
  'quizzes',
  'quiz_attempts',
  'batches',
  'roles',
  'sessions',
  'otp_logs'
];

async function migrateCollection(oldDb, newDb, collectionName) {
  try {
    console.log(`\n📦 Migrating ${collectionName}...`);
    
    const oldCollection = oldDb.collection(collectionName);
    const newCollection = newDb.collection(collectionName);
    
    // Check if collection exists in old DB
    const collections = await oldDb.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(`   ⚠️  Collection ${collectionName} not found in old database - skipping`);
      return { migrated: 0, skipped: true };
    }
    
    // Get count
    const count = await oldCollection.countDocuments();
    console.log(`   📊 Found ${count} documents`);
    
    if (count === 0) {
      console.log(`   ⚠️  No documents to migrate - skipping`);
      return { migrated: 0, skipped: true };
    }
    
    // Fetch all documents
    const documents = await oldCollection.find({}).toArray();
    
    // Insert into new database
    if (documents.length > 0) {
      await newCollection.insertMany(documents, { ordered: false });
      console.log(`   ✅ Migrated ${documents.length} documents`);
    }
    
    return { migrated: documents.length, skipped: false };
  } catch (error) {
    if (error.code === 11000) {
      console.log(`   ⚠️  Duplicate documents found - skipping duplicates`);
      return { migrated: 0, skipped: true, error: 'duplicates' };
    }
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    return { migrated: 0, skipped: false, error: error.message };
  }
}

async function migrate() {
  let oldConnection, newConnection;
  
  try {
    console.log('🔄 Starting database migration...\n');
    console.log(`📥 Source: ${OLD_MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`📤 Destination: ${NEW_MONGODB_URI.replace(/:[^:@]+@/, ':****@')}\n`);
    
    // Connect to old database
    console.log('🔌 Connecting to old database...');
    oldConnection = await mongoose.createConnection(OLD_MONGODB_URI).asPromise();
    const oldDb = oldConnection.db;
    console.log('✅ Connected to old database');
    
    // Connect to new database
    console.log('🔌 Connecting to new database...');
    newConnection = await mongoose.createConnection(NEW_MONGODB_URI).asPromise();
    const newDb = newConnection.db;
    console.log('✅ Connected to new database\n');
    
    // Migrate each collection
    const results = {};
    let totalMigrated = 0;
    
    for (const collectionName of collectionsToMigrate) {
      const result = await migrateCollection(oldDb, newDb, collectionName);
      results[collectionName] = result;
      if (!result.skipped) {
        totalMigrated += result.migrated;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    
    for (const [collection, result] of Object.entries(results)) {
      if (result.skipped) {
        console.log(`   ${collection}: ⚠️  Skipped`);
      } else if (result.error) {
        console.log(`   ${collection}: ❌ Error - ${result.error}`);
      } else {
        console.log(`   ${collection}: ✅ ${result.migrated} documents`);
      }
    }
    
    console.log(`\n✅ Total documents migrated: ${totalMigrated}`);
    console.log('✅ Migration completed!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('💡 Check your connection strings and credentials');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Check your network connection and MongoDB Atlas IP whitelist');
    }
    process.exit(1);
  } finally {
    // Close connections
    if (oldConnection) {
      await oldConnection.close();
      console.log('🔌 Closed old database connection');
    }
    if (newConnection) {
      await newConnection.close();
      console.log('🔌 Closed new database connection');
    }
    process.exit(0);
  }
}

migrate();

