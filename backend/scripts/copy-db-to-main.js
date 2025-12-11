#!/usr/bin/env node

/**
 * Copy data from old database to main database
 * 
 * Usage:
 *   node scripts/copy-db-to-main.js
 * 
 * Environment variables:
 *   OLD_DB_URI - Source database URI (default: mongodb://localhost:27017/careermaster2)
 *   MAIN_DB_URI - Destination database URI (default: mongodb://localhost:27017/careermaster)
 * 
 * This script will:
 * 1. Connect to old database (source)
 * 2. Connect to main database (destination)
 * 3. Copy all collections and data
 * 4. Handle duplicates (skip or merge based on _id)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Source: Old Database
const OLD_DB_URI = process.env.OLD_DB_URI || 'mongodb://localhost:27017/careermaster2';
const OLD_DB_NAME = OLD_DB_URI.split('/').pop().split('?')[0] || 'careermaster2';

// Destination: Main Database
const MAIN_DB_URI = process.env.MAIN_DB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/careermaster';
const MAIN_DB_NAME = MAIN_DB_URI.split('/').pop().split('?')[0] || 'careermaster';

// Collections to copy (empty array = copy all)
const collectionsToCopy = [];

// Strategy: 'skip' (skip duplicates) or 'overwrite' (replace existing)
const duplicateStrategy = process.env.DUPLICATE_STRATEGY || 'skip';

async function copyCollection(oldDb, mainDb, collectionName) {
  try {
    console.log(`\n📦 Copying collection: ${collectionName}...`);
    
    const oldCollection = oldDb.collection(collectionName);
    const mainCollection = mainDb.collection(collectionName);
    
    // Check if collection exists in source
    const collections = await oldDb.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(`   ⚠️  Collection ${collectionName} not found in old database, skipping...`);
      return { skipped: true, copied: 0 };
    }
    
    // Get count
    const count = await oldCollection.countDocuments();
    console.log(`   📊 Found ${count} documents in old database`);
    
    if (count === 0) {
      console.log(`   ⚠️  Collection is empty, skipping...`);
      return { skipped: true, copied: 0 };
    }
    
    // Check existing count in destination
    const existingCount = await mainCollection.countDocuments();
    console.log(`   📊 Found ${existingCount} existing documents in main database`);
    
    // Copy documents
    let copied = 0;
    let skipped = 0;
    let overwritten = 0;
    
    const batchSize = 1000;
    let processed = 0;
    
    const cursor = oldCollection.find({});
    
    while (await cursor.hasNext()) {
      const batch = [];
      for (let i = 0; i < batchSize && await cursor.hasNext(); i++) {
        batch.push(await cursor.next());
      }
      
      if (batch.length === 0) break;
      
      for (const doc of batch) {
        try {
          if (duplicateStrategy === 'overwrite') {
            // Replace existing document
            await mainCollection.replaceOne(
              { _id: doc._id },
              doc,
              { upsert: true }
            );
            if (existingCount > 0 && await mainCollection.findOne({ _id: doc._id })) {
              overwritten++;
            } else {
              copied++;
            }
          } else {
            // Skip duplicates (default)
            const exists = await mainCollection.findOne({ _id: doc._id });
            if (!exists) {
              await mainCollection.insertOne(doc);
              copied++;
            } else {
              skipped++;
            }
          }
          processed++;
          
          if (processed % 100 === 0) {
            process.stdout.write(`\r   ⏳ Progress: ${processed}/${count} documents processed...`);
          }
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate key error
            skipped++;
          } else {
            console.error(`\n   ❌ Error copying document ${doc._id}:`, error.message);
          }
        }
      }
    }
    
    console.log(`\r   ✅ Completed: ${copied} copied, ${skipped} skipped, ${overwritten} overwritten`);
    
    // Copy indexes
    try {
      const indexes = await oldCollection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_') { // Skip default _id index
          try {
            await mainCollection.createIndex(index.key, {
              name: index.name,
              unique: index.unique || false,
              sparse: index.sparse || false,
              background: true
            });
            console.log(`   📌 Created index: ${index.name}`);
          } catch (indexError) {
            if (indexError.code !== 85) { // Ignore duplicate index errors
              console.log(`   ⚠️  Could not create index ${index.name}: ${indexError.message}`);
            }
          }
        }
      }
    } catch (indexError) {
      console.log(`   ⚠️  Could not copy indexes: ${indexError.message}`);
    }
    
    return { copied, skipped, overwritten };
  } catch (error) {
    console.error(`\n   ❌ Error copying collection ${collectionName}:`, error.message);
    return { error: error.message };
  }
}

async function main() {
  let oldConnection = null;
  let mainConnection = null;
  
  try {
    console.log('🚀 Starting database copy process...\n');
    console.log(`📂 Source (Old DB): ${OLD_DB_URI.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`📂 Destination (Main DB): ${MAIN_DB_URI.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`📋 Strategy: ${duplicateStrategy} duplicates\n`);
    
    // Connect to old database
    console.log('🔄 Connecting to old database...');
    oldConnection = await mongoose.createConnection(OLD_DB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    await oldConnection.asPromise();
    const oldDb = oldConnection.db;
    console.log(`✅ Connected to old database: ${OLD_DB_NAME}`);
    
    // Connect to main database
    console.log('🔄 Connecting to main database...');
    mainConnection = await mongoose.createConnection(MAIN_DB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    await mainConnection.asPromise();
    const mainDb = mainConnection.db;
    console.log(`✅ Connected to main database: ${MAIN_DB_NAME}\n`);
    
    // Get all collections from old database
    const allCollections = await oldDb.listCollections().toArray();
    const collections = collectionsToCopy.length > 0
      ? allCollections.filter(c => collectionsToCopy.includes(c.name))
      : allCollections;
    
    console.log(`📚 Found ${collections.length} collection(s) to copy:\n`);
    collections.forEach(c => console.log(`   - ${c.name}`));
    
    // Copy each collection
    const results = {};
    let totalCopied = 0;
    let totalSkipped = 0;
    let totalOverwritten = 0;
    
    for (const collection of collections) {
      const result = await copyCollection(oldDb, mainDb, collection.name);
      results[collection.name] = result;
      
      if (result.copied) totalCopied += result.copied;
      if (result.skipped) totalSkipped += result.skipped;
      if (result.overwritten) totalOverwritten += result.overwritten;
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COPY SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Total documents copied: ${totalCopied}`);
    console.log(`⏭️  Total documents skipped: ${totalSkipped}`);
    console.log(`🔄 Total documents overwritten: ${totalOverwritten}`);
    console.log(`📦 Collections processed: ${collections.length}`);
    console.log('='.repeat(60));
    
    console.log('\n✅ Database copy completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during database copy:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close connections
    if (oldConnection) {
      await oldConnection.close();
      console.log('\n🔌 Closed connection to old database');
    }
    if (mainConnection) {
      await mainConnection.close();
      console.log('🔌 Closed connection to main database');
    }
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { copyCollection, main };

