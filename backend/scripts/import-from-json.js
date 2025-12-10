#!/usr/bin/env node

/**
 * Import data from JSON files to Local MongoDB
 * 
 * Usage:
 *   1. Export collections from MongoDB Atlas using MongoDB Compass
 *   2. Place JSON files in ./backup/ directory
 *   3. Run: node scripts/import-from-json.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DEST_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careermaster2';
const BACKUP_DIR = path.join(__dirname, '../backup');

async function importCollection(db, collectionName, filePath) {
  try {
    console.log(`\n📦 Importing ${collectionName}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${filePath}`);
      return { imported: 0, skipped: true };
    }
    
    // Read JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let documents;
    
    // Handle both JSON array and newline-delimited JSON
    if (fileContent.trim().startsWith('[')) {
      documents = JSON.parse(fileContent);
    } else {
      // Newline-delimited JSON
      documents = fileContent
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    }
    
    if (!Array.isArray(documents) || documents.length === 0) {
      console.log(`   ⚠️  No documents found in file`);
      return { imported: 0, skipped: true };
    }
    
    console.log(`   📊 Found ${documents.length} documents`);
    
    const collection = db.collection(collectionName);
    
    // Clear existing data
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`   🗑️  Clearing existing ${existingCount} documents...`);
      await collection.deleteMany({});
    }
    
    // Insert documents in batches
    const batchSize = 1000;
    let inserted = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await collection.insertMany(batch, { ordered: false });
      inserted += batch.length;
      process.stdout.write(`   ⏳ Inserted ${inserted}/${documents.length} documents...\r`);
    }
    
    console.log(`\n   ✅ Successfully imported ${inserted} documents`);
    
    return { imported: inserted, skipped: false };
  } catch (error) {
    console.error(`   ❌ Error importing ${collectionName}:`, error.message);
    return { imported: 0, skipped: false, error: error.message };
  }
}

async function importData() {
  let connection;
  
  try {
    console.log('🔄 Starting data import from JSON files...\n');
    console.log(`📤 Destination: ${DEST_URI}\n`);
    
    // Check if backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      console.error(`❌ Backup directory not found: ${BACKUP_DIR}`);
      console.error('\n💡 Please:');
      console.error('   1. Export collections from MongoDB Atlas using MongoDB Compass');
      console.error('   2. Save JSON files to: backend/backup/');
      console.error('   3. Run this script again');
      process.exit(1);
    }
    
    // Connect to destination database
    console.log('🔌 Connecting to Local MongoDB...');
    try {
      connection = await mongoose.createConnection(DEST_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }).asPromise();
      const db = connection.db;
      console.log('✅ Connected to Local MongoDB\n');
      
      // Find all JSON files in backup directory
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          name: path.basename(file, '.json'),
          path: path.join(BACKUP_DIR, file)
        }));
      
      if (files.length === 0) {
        console.error(`❌ No JSON files found in: ${BACKUP_DIR}`);
        console.error('\n💡 Please export collections from MongoDB Atlas and save JSON files to the backup directory');
        process.exit(1);
      }
      
      console.log(`📁 Found ${files.length} JSON file(s):`);
      files.forEach(file => {
        console.log(`   - ${file.name}.json`);
      });
      
      console.log('\n🚀 Starting import...\n');
      console.log('='.repeat(60));
      
      // Import each collection
      const results = {};
      let totalImported = 0;
      
      for (const file of files) {
        const result = await importCollection(db, file.name, file.path);
        results[file.name] = result;
        if (!result.skipped && result.imported > 0) {
          totalImported += result.imported;
        }
      }
      
      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('\n📊 Import Summary:\n');
      console.log(`✅ Successfully imported: ${totalImported} total documents`);
      console.log(`📦 Collections processed: ${files.length}\n`);
      
      console.log('📋 Detailed Results:');
      for (const [collectionName, result] of Object.entries(results)) {
        if (result.skipped) {
          console.log(`   ⏭️  ${collectionName}: Skipped`);
        } else if (result.error) {
          console.log(`   ❌ ${collectionName}: Error - ${result.error}`);
        } else {
          console.log(`   ✅ ${collectionName}: ${result.imported} documents`);
        }
      }
      
      console.log('\n✅ Import completed successfully!');
      console.log(`\n💡 Update your .env file with:`);
      console.log(`   MONGODB_URI=${DEST_URI}\n`);
      
    } catch (destError) {
      console.error('❌ Failed to connect to Local MongoDB:', destError.message);
      console.error('\n💡 Make sure MongoDB is running locally:');
      console.error('   macOS: brew services start mongodb-community');
      console.error('   Linux: sudo systemctl start mongod');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('🔌 Closed connection');
    }
  }
}

// Run import
importData().then(() => {
  console.log('\n✨ Done!\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

