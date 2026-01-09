/**
 * Script to upload topics and cheatsheets from GPT-generated JSON
 * 
 * Usage:
 *   node scripts/upload-topics-from-json.js <json-file-path> <subject-id> <user-id>
 * 
 * Example:
 *   node scripts/upload-topics-from-json.js ./content.json 507f1f77bcf86cd799439011 507f1f77bcf86cd799439012
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Topic = require('../src/topics/topics.model');
const CheatSheet = require('../src/cheatsheets/cheatsheets.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careermaster2';

async function uploadTopicsFromJSON(jsonFilePath, subjectId, userId) {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Read JSON file
    console.log(`📖 Reading JSON file: ${jsonFilePath}`);
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const data = JSON.parse(jsonContent);
    
    if (!data.topics || !Array.isArray(data.topics)) {
      throw new Error('Invalid JSON format: "topics" array is required');
    }

    console.log(`📚 Found ${data.topics.length} topics to upload\n`);
    console.log(`📝 Subject: ${data.subjectTitle || 'N/A'}\n`);

    // Validate subjectId and userId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw new Error('Invalid subjectId format');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    const results = {
      topicsCreated: 0,
      cheatsheetsCreated: 0,
      errors: []
    };

    // Process each topic
    for (let i = 0; i < data.topics.length; i++) {
      const item = data.topics[i];
      const topicData = item.topic;
      const cheatsheetData = item.cheatsheet;

      try {
        console.log(`\n📌 Processing Topic ${i + 1}/${data.topics.length}: ${topicData.title}`);

        // Create topic
        const topic = new Topic({
          subjectId: new mongoose.Types.ObjectId(subjectId),
          title: topicData.title,
          description: topicData.description || '',
          order: topicData.order !== undefined ? topicData.order : i,
          prerequisites: topicData.prerequisites || [],
          requiredQuizzesToUnlock: topicData.requiredQuizzesToUnlock !== undefined 
            ? topicData.requiredQuizzesToUnlock 
            : 2,
          isActive: topicData.isActive !== undefined ? topicData.isActive : true,
          createdBy: new mongoose.Types.ObjectId(userId)
        });

        const savedTopic = await topic.save();
        console.log(`   ✅ Topic created: ${savedTopic._id}`);
        results.topicsCreated++;

        // Create cheatsheet if provided
        if (cheatsheetData && cheatsheetData.content) {
          const cheatsheet = new CheatSheet({
            topicId: savedTopic._id,
            content: cheatsheetData.content,
            contentType: cheatsheetData.contentType || 'html',
            estReadMinutes: cheatsheetData.estReadMinutes || 5,
            resources: cheatsheetData.resources || [],
            createdBy: new mongoose.Types.ObjectId(userId)
          });

          await cheatsheet.save();
          console.log(`   ✅ Cheatsheet created for topic`);
          results.cheatsheetsCreated++;
        } else {
          console.log(`   ⚠️  No cheatsheet data provided for this topic`);
        }

      } catch (error) {
        const errorMsg = `Error processing topic "${topicData.title}": ${error.message}`;
        console.error(`   ❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Topics created: ${results.topicsCreated}`);
    console.log(`✅ Cheatsheets created: ${results.cheatsheetsCreated}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      results.errors.forEach((error, idx) => {
        console.log(`   ${idx + 1}. ${error}`);
      });
    }

    console.log('\n✅ Upload complete!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('❌ Usage: node upload-topics-from-json.js <json-file-path> <subject-id> <user-id>');
  console.error('\nExample:');
  console.error('  node upload-topics-from-json.js ./content.json 507f1f77bcf86cd799439011 507f1f77bcf86cd799439012');
  console.error('\nArguments:');
  console.error('  json-file-path: Path to the JSON file generated by GPT');
  console.error('  subject-id: MongoDB ObjectId of the subject');
  console.error('  user-id: MongoDB ObjectId of the user creating the topics');
  process.exit(1);
}

const [jsonFilePath, subjectId, userId] = args;

// Resolve absolute path
const absolutePath = path.isAbsolute(jsonFilePath) 
  ? jsonFilePath 
  : path.join(__dirname, '..', jsonFilePath);

if (!fs.existsSync(absolutePath)) {
  console.error(`❌ File not found: ${absolutePath}`);
  process.exit(1);
}

uploadTopicsFromJSON(absolutePath, subjectId, userId).catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

