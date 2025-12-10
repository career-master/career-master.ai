#!/usr/bin/env node

/**
 * Migrate data from MongoDB Atlas to Local MongoDB
 * 
 * Usage:
 *   node scripts/migrate-atlas-to-local.js
 * 
 * This script will:
 * 1. Connect to MongoDB Atlas (source)
 * 2. Connect to Local MongoDB (destination)
 * 3. Copy all collections and data
 * 4. Preserve indexes
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Source: MongoDB Atlas
const SOURCE_URI = process.env.SOURCE_MONGODB_URI || 'mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0';
const SOURCE_DB_NAME = 'careermaster';

// Destination: Local MongoDB
const DEST_URI = process.env.DEST_MONGODB_URI || 'mongodb://localhost:27017/careermaster2';
const DEST_DB_NAME = 'careermaster2';

// Collections to migrate (empty array = migrate all)
const collectionsToMigrate = [];

async function migrateCollection(sourceDb, destDb, collectionName) {
  try {
    console.log(`\n📦 Migrating collection: ${collectionName}...`);
    
    const sourceCollection = sourceDb.collection(collectionName);
    const destCollection = destDb.collection(collectionName);
    
    // Check if collection exists in source
    const collections = await sourceDb.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(`   ⚠️  Collection ${collectionName} not found in source, skipping...`);
      return { skipped: true, migrated: 0 };
    }
    
    // Get count
    const count = await sourceCollection.countDocuments();
    console.log(`   📊 Found ${count} documents`);
    
    if (count === 0) {
      console.log(`   ⚠️  Collection is empty, skipping...`);
      return { skipped: true, migrated: 0 };
    }
    
    // Get all documents
    const documents = await sourceCollection.find({}).toArray();
    
    // Clear destination collection if it exists
    const destExists = (await destDb.listCollections({ name: collectionName }).toArray()).length > 0;
    if (destExists) {
      const destCount = await destCollection.countDocuments();
      if (destCount > 0) {
        console.log(`   🗑️  Clearing existing ${destCount} documents in destination...`);
        await destCollection.deleteMany({});
      }
    }
    
    // Insert documents in batches
    const batchSize = 1000;
    let inserted = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await destCollection.insertMany(batch, { ordered: false });
      inserted += batch.length;
      process.stdout.write(`   ⏳ Inserted ${inserted}/${documents.length} documents...\r`);
    }
    
    console.log(`\n   ✅ Successfully migrated ${inserted} documents`);
    
    // Copy indexes
    try {
      const indexes = await sourceCollection.indexes();
      if (indexes.length > 1) { // More than just the default _id index
        console.log(`   📑 Copying ${indexes.length - 1} index(es)...`);
        for (const index of indexes) {
          if (index.name !== '_id_') {
            try {
              const indexSpec = { ...index.key };
              const indexOptions = {
                unique: index.unique || false,
                sparse: index.sparse || false,
                background: true
              };
              await destCollection.createIndex(indexSpec, indexOptions);
            } catch (idxError) {
              console.log(`   ⚠️  Could not create index ${index.name}: ${idxError.message}`);
            }
          }
        }
      }
    } catch (idxError) {
      console.log(`   ⚠️  Could not copy indexes: ${idxError.message}`);
    }
    
    return { skipped: false, migrated: inserted };
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    return { skipped: false, migrated: 0, error: error.message };
  }
}

async function migrate() {
  let sourceConnection, destConnection;
  
  try {
    console.log('🔄 Starting database migration from MongoDB Atlas to Local MongoDB...\n');
    console.log(`📥 Source: ${SOURCE_URI.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`📤 Destination: ${DEST_URI}\n`);
    
    // Connect to source database (MongoDB Atlas)
    console.log('🔌 Connecting to MongoDB Atlas...');
    try {
      sourceConnection = await mongoose.createConnection(SOURCE_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
      }).asPromise();
      const sourceDb = sourceConnection.db;
      console.log('✅ Connected to MongoDB Atlas');
      
      // List collections in source DB
      const sourceCollections = await sourceDb.listCollections().toArray();
      console.log(`📁 Found ${sourceCollections.length} collections in source database:`);
      sourceCollections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      
      // Connect to destination database (Local MongoDB)
      console.log('\n🔌 Connecting to Local MongoDB...');
      try {
        destConnection = await mongoose.createConnection(DEST_URI, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        }).asPromise();
        const destDb = destConnection.db;
        console.log('✅ Connected to Local MongoDB\n');
        
        // Determine which collections to migrate
        const collections = collectionsToMigrate.length > 0 
          ? collectionsToMigrate 
          : sourceCollections.map(col => col.name);
        
        console.log(`🚀 Starting migration of ${collections.length} collection(s)...\n`);
        console.log('='.repeat(60));
        
        // Migrate each collection
        const results = {};
        let totalMigrated = 0;
        let totalSkipped = 0;
        
        for (const collectionName of collections) {
          const result = await migrateCollection(sourceDb, destDb, collectionName);
          results[collectionName] = result;
          if (result.skipped) {
            totalSkipped++;
          } else if (result.migrated > 0) {
            totalMigrated += result.migrated;
          }
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 Migration Summary:\n');
        console.log(`✅ Successfully migrated: ${totalMigrated} total documents`);
        console.log(`⏭️  Skipped: ${totalSkipped} collection(s)`);
        console.log(`📦 Collections processed: ${collections.length}\n`);
        
        console.log('📋 Detailed Results:');
        for (const [collectionName, result] of Object.entries(results)) {
          if (result.skipped) {
            console.log(`   ⏭️  ${collectionName}: Skipped`);
          } else if (result.error) {
            console.log(`   ❌ ${collectionName}: Error - ${result.error}`);
          } else {
            console.log(`   ✅ ${collectionName}: ${result.migrated} documents`);
          }
        }
        
        console.log('\n✅ Migration completed successfully!');
        console.log(`\n💡 Update your .env file with:`);
        console.log(`   MONGODB_URI=${DEST_URI}\n`);
        
      } catch (destError) {
        console.error('❌ Failed to connect to Local MongoDB:', destError.message);
        console.error('\n💡 Make sure MongoDB is running locally:');
        console.error('   macOS: brew services start mongodb-community');
        console.error('   Linux: sudo systemctl start mongod');
        console.error('   Or check: mongosh --eval "db.version()"');
        process.exit(1);
      }
      
    } catch (sourceError) {
      console.error('❌ Failed to connect to MongoDB Atlas:', sourceError.message);
      if (sourceError.message.includes('ECONNREFUSED') || sourceError.message.includes('querySrv')) {
        console.error('\n💡 Check:');
        console.error('   1. MongoDB Atlas Network Access (IP whitelist)');
        console.error('   2. Internet connectivity');
        console.error('   3. Connection string format');
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close connections
    if (sourceConnection) {
      await sourceConnection.close();
      console.log('\n🔌 Closed source connection');
    }
    if (destConnection) {
      await destConnection.close();
      console.log('🔌 Closed destination connection');
    }
  }
}

// Run migration
migrate().then(() => {
  console.log('\n✨ Done!\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

