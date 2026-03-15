/**
 * Seed Domains, Categories, Subjects, and Topics from QUIZ TOPICS LIST (1).xlsx
 * so filter dropdowns (Domain, Subject, Topic) show all options by default.
 *
 * Run from backend folder: node scripts/seed-from-excel.js
 * Ensure MONGODB_URI is set in .env and the Excel file is at ../QUIZ TOPICS LIST (1).xlsx
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');
const XLSX = require('xlsx');

const Domain = require('../src/domains/domains.model');
const Category = require('../src/categories/categories.model');
const Subject = require('../src/subjects/subjects.model');
const Topic = require('../src/topics/topics.model');
const User = require('../src/user/users.model');

const EXCEL_PATH = path.resolve(__dirname, '../../QUIZ TOPICS LIST (1).xlsx');

function readSheet(wb, name, opts = {}) {
  if (!wb.SheetNames.includes(name)) return [];
  const ws = wb.Sheets[name];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', ...opts });
}

async function getSeedUserId() {
  const user = await User.findOne().sort({ createdAt: 1 }).select('_id').lean();
  if (user) return user._id;
  const admin = await User.findOne({ roles: 'super_admin' }).select('_id').lean();
  if (admin) return admin._id;
  throw new Error('No user found in DB. Create at least one user (e.g. super_admin) before running seed.');
}

async function seedDomains(rows) {
  // rows: [["SNO","DOMAIN",""], [1,"3 CLASS",""], ...]
  const names = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[1] && String(row[1]).trim()) || '';
    if (!name) continue;
    names.push(name);
  }
  let inserted = 0;
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const exists = await Domain.findOne({ name });
    if (!exists) {
      await Domain.create({ name, order: i + 1, isActive: true });
      inserted++;
      console.log('  Domain:', name);
    }
  }
  return inserted;
}

async function seedCategoriesFromFinalTopicList(rows) {
  // FINAL TOPIC LIST: SNO, DOMAIN, CATEGORY, SUBJECT, TOPIC
  const seen = new Set();
  let inserted = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const domain = (row[1] && String(row[1]).trim()) || '';
    const category = (row[2] && String(row[2]).trim()) || '';
    if (!domain || !category) continue;
    const key = `${domain}|${category}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const exists = await Category.findOne({ domain, name: category });
    if (!exists) {
      await Category.create({ domain, name: category, order: inserted, isActive: true });
      inserted++;
      console.log('  Category:', domain, '->', category);
    }
  }
  return inserted;
}

async function seedSubjectsFromFinalTopicList(rows, userId) {
  const seen = new Set();
  let inserted = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const domain = (row[1] && String(row[1]).trim()) || '';
    const category = (row[2] && String(row[2]).trim()) || '';
    const title = (row[3] && String(row[3]).trim()) || '';
    if (!domain || !title) continue;
    const key = `${domain}|${category}|${title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const exists = await Subject.findOne({ domain, title });
    if (!exists) {
      await Subject.create({
        title,
        domain,
        category: category || undefined,
        createdBy: userId,
        order: i,
        isActive: true,
      });
      inserted++;
      console.log('  Subject:', domain, '/', title);
    }
  }
  return inserted;
}

async function seedTopicsFromFinalTopicList(rows, userId) {
  const subjectCache = new Map(); // "domain|title" -> subjectId
  let inserted = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const domain = (row[1] && String(row[1]).trim()) || '';
    const title = (row[3] && String(row[3]).trim()) || '';
    const topicTitle = (row[4] && String(row[4]).trim()) || '';
    if (!domain || !title || !topicTitle) continue;
    const cacheKey = `${domain}|${title}`;
    let subjectId = subjectCache.get(cacheKey);
    if (!subjectId) {
      const sub = await Subject.findOne({ domain, title }).select('_id').lean();
      if (!sub) continue;
      subjectId = sub._id;
      subjectCache.set(cacheKey, subjectId);
    }
    const exists = await Topic.findOne({ subjectId, title: topicTitle });
    if (!exists) {
      await Topic.create({
        subjectId,
        title: topicTitle,
        order: i,
        isActive: true,
        createdBy: userId,
      });
      inserted++;
      console.log('  Topic:', title, '->', topicTitle);
    }
  }
  return inserted;
}

/** SUB TOPICS sheet: blocks of [SNO, SUBJECT, TOPIC]. Subject = e.g. C, C++. Create under TECHNOLOGY. */
async function seedFromSubTopics(rows, userId) {
  const TECHNOLOGY = 'TECHNOLOGY';
  const categoryName = 'Programming Languages';
  let domainExists = await Domain.findOne({ name: TECHNOLOGY });
  if (!domainExists) {
    await Domain.create({ name: TECHNOLOGY, order: 100, isActive: true });
    console.log('  Domain (from SUB TOPICS):', TECHNOLOGY);
  }
  let catExists = await Category.findOne({ domain: TECHNOLOGY, name: categoryName });
  if (!catExists) {
    await Category.create({ domain: TECHNOLOGY, name: categoryName, order: 0, isActive: true });
    console.log('  Category:', TECHNOLOGY, '->', categoryName);
  }
  const subjectCache = new Map();
  let subjectsAdded = 0;
  let topicsAdded = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const subName = (row[1] && String(row[1]).trim()) || '';
    const topicTitle = (row[2] && String(row[2]).trim()) || '';
    if (!subName || !topicTitle) continue;
    if (subName === 'SUBJECT' || subName === 'SNO') continue;
    let subjectId = subjectCache.get(subName);
    if (!subjectId) {
      let sub = await Subject.findOne({ domain: TECHNOLOGY, title: subName }).select('_id').lean();
      if (!sub) {
        const created = await Subject.create({
          title: subName,
          domain: TECHNOLOGY,
          category: categoryName,
          createdBy: userId,
          order: subjectCache.size,
          isActive: true,
        });
        sub = { _id: created._id };
        subjectsAdded++;
        console.log('  Subject (SUB TOPICS):', TECHNOLOGY, '/', subName);
      }
      subjectId = sub._id;
      subjectCache.set(subName, subjectId);
    }
    const exists = await Topic.findOne({ subjectId, title: topicTitle });
    if (!exists) {
      await Topic.create({
        subjectId,
        title: topicTitle,
        order: i,
        isActive: true,
        createdBy: userId,
      });
      topicsAdded++;
    }
  }
  return { subjectsAdded, topicsAdded };
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  const fs = require('fs');
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('Excel file not found at:', EXCEL_PATH);
    process.exit(1);
  }
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  const userId = await getSeedUserId();
  console.log('Using userId for createdBy:', userId);

  const wb = XLSX.readFile(EXCEL_PATH);
  console.log('\n1. Seeding Domains from sheet DOMAINS');
  const domainRows = readSheet(wb, 'DOMAINS');
  const domainsInserted = await seedDomains(domainRows);
  console.log('Domains inserted:', domainsInserted);

  console.log('\n2. Seeding Categories from FINAL TOPIC LIST');
  const finalRows = readSheet(wb, 'FINAL TOPIC LIST');
  const categoriesInserted = await seedCategoriesFromFinalTopicList(finalRows);
  console.log('Categories inserted:', categoriesInserted);

  console.log('\n3. Seeding Subjects from FINAL TOPIC LIST');
  const subjectsInserted = await seedSubjectsFromFinalTopicList(finalRows, userId);
  console.log('Subjects inserted:', subjectsInserted);

  console.log('\n4. Seeding Topics from FINAL TOPIC LIST (where TOPIC not empty)');
  const topicsInserted = await seedTopicsFromFinalTopicList(finalRows, userId);
  console.log('Topics inserted:', topicsInserted);

  console.log('\n5. Seeding from SUB TOPICS (Technology subjects & topics)');
  const subTopicRows = readSheet(wb, 'SUB TOPICS');
  const { subjectsAdded: subSubjects, topicsAdded: subTopics } = await seedFromSubTopics(subTopicRows, userId);
  console.log('SUB TOPICS: subjects added:', subSubjects, ', topics added:', subTopics);

  console.log('\nDone. Filters (Domain, Subject, Topic) will now show all options from the Excel.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
