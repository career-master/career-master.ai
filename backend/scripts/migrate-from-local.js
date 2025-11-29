/**
 * Migrate Data from Local MongoDB to MongoDB Atlas
 * Migrates users and quizzes data from local database to Atlas
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const OLD_DB_URI = 'mongodb://localhost:27017/career-master';
const NEW_DB_URI = process.env.MONGODB_URI;

if (!NEW_DB_URI) {
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

async function getCollectionCount(db, collectionName) {
  try {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      return 0;
    }
    return await db.collection(collectionName).countDocuments();
  } catch (error) {
    return 0;
  }
}

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
    console.log(`   📊 Found ${count} documents in old database`);
    
    if (count === 0) {
      console.log(`   ⚠️  No documents to migrate - skipping`);
      return { migrated: 0, skipped: true };
    }
    
    // Check existing count in new DB
    const existingCount = await getCollectionCount(newDb, collectionName);
    if (existingCount > 0) {
      console.log(`   ⚠️  Collection already has ${existingCount} documents in new database`);
      console.log(`   💡 Use --overwrite flag to replace, or skipping to avoid duplicates...`);
      return { migrated: 0, skipped: true, reason: 'exists' };
    }
    
    // Fetch all documents
    console.log(`   🔄 Fetching documents...`);
    const documents = await oldCollection.find({}).toArray();
    
    if (documents.length === 0) {
      console.log(`   ⚠️  No documents fetched - skipping`);
      return { migrated: 0, skipped: true };
    }
    
    // Insert into new database
    console.log(`   💾 Inserting ${documents.length} documents into new database...`);
    
    // Handle duplicates gracefully
    let inserted = 0;
    let duplicates = 0;
    
    for (const doc of documents) {
      try {
        // Remove _id to let MongoDB generate new ones, or keep if you want to preserve IDs
        // For users and critical data, we might want to preserve _id
        await newCollection.insertOne(doc);
        inserted++;
      } catch (error) {
        if (error.code === 11000) {
          duplicates++;
          // Try to update instead
          try {
            await newCollection.replaceOne({ _id: doc._id }, doc, { upsert: true });
            inserted++;
            duplicates--;
          } catch (updateError) {
            console.log(`   ⚠️  Could not insert/update document: ${updateError.message}`);
          }
        } else {
          console.log(`   ⚠️  Error inserting document: ${error.message}`);
        }
      }
    }
    
    if (duplicates > 0) {
      console.log(`   ⚠️  ${duplicates} duplicate documents skipped`);
    }
    
    console.log(`   ✅ Successfully migrated ${inserted} documents`);
    
    return { migrated: inserted, skipped: false, duplicates };
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    return { migrated: 0, skipped: false, error: error.message };
  }
}

async function migrate() {
  let oldConnection, newConnection;
  
  try {
    console.log('🔄 Starting database migration from local MongoDB to Atlas...\n');
    console.log(`📥 Source: ${OLD_DB_URI}`);
    console.log(`📤 Destination: ${NEW_DB_URI.replace(/:[^:@]+@/, ':****@')}\n`);
    
    // Connect to old database (local)
    console.log('🔌 Connecting to local MongoDB...');
    try {
      oldConnection = await mongoose.createConnection(OLD_DB_URI, {
        serverSelectionTimeoutMS: 3000
      }).asPromise();
      const oldDb = oldConnection.db;
      console.log('✅ Connected to local MongoDB');
      
      // List collections in old DB
      const oldCollections = await oldDb.listCollections().toArray();
      console.log(`📁 Found ${oldCollections.length} collections in old database:`);
      oldCollections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } catch (error) {
      console.error('❌ Failed to connect to local MongoDB:', error.message);
      console.error('💡 Make sure MongoDB is running locally: brew services start mongodb-community (Mac) or sudo systemctl start mongod (Linux)');
      process.exit(1);
    }
    
    // Connect to new database (Atlas)
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    newConnection = await mongoose.createConnection(NEW_DB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).asPromise();
    const newDb = newConnection.db;
    console.log('✅ Connected to MongoDB Atlas\n');
    
    const oldDb = oldConnection.db;
    
    // Migrate each collection
    const results = {};
    let totalMigrated = 0;
    
    for (const collectionName of collectionsToMigrate) {
      const result = await migrateCollection(oldDb, newDb, collectionName);
      results[collectionName] = result;
      if (!result.skipped && result.migrated > 0) {
        totalMigrated += result.migrated;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    
    for (const [collection, result] of Object.entries(results)) {
      if (result.skipped) {
        const reason = result.reason === 'exists' ? ' (already exists)' : '';
        console.log(`   ${collection.padEnd(20)}: ⚠️  Skipped${reason}`);
      } else if (result.error) {
        console.log(`   ${collection.padEnd(20)}: ❌ Error - ${result.error}`);
      } else {
        console.log(`   ${collection.padEnd(20)}: ✅ ${result.migrated} documents`);
      }
    }
    
    console.log(`\n✅ Total documents migrated: ${totalMigrated}`);
    console.log('✅ Migration completed!\n');
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    for (const collectionName of ['users', 'quizzes']) {
      const oldCount = await getCollectionCount(oldDb, collectionName);
      const newCount = await getCollectionCount(newDb, collectionName);
      console.log(`   ${collectionName}: ${oldCount} → ${newCount} documents`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('💡 Check your MongoDB Atlas connection string and credentials');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Check your network connection and MongoDB Atlas IP whitelist');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Make sure MongoDB is running locally');
    }
    process.exit(1);
  } finally {
    // Close connections
    if (oldConnection) {
      await oldConnection.close();
      console.log('\n🔌 Closed local database connection');
    }
    if (newConnection) {
      await newConnection.close();
      console.log('🔌 Closed Atlas database connection');
    }
    process.exit(0);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');

if (overwrite) {
  console.log('⚠️  Overwrite mode enabled - existing data may be replaced\n');
}

migrate();

