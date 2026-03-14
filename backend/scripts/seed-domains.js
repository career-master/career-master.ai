/**
 * One-time seed: insert default domains so dropdowns work.
 * Run: node scripts/seed-domains.js (from backend folder, with MONGO_URI set)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const DEFAULT_DOMAINS = [
  '3 CLASS', '4 CLASS', '5 CLASS', '6 CLASS', '7 CLASS', '8 CLASS', '9 CLASS', '10 CLASS',
  'INTER (10+2)', 'Technology', 'Olympiad Exams',
  'National Level (All-India) Government Exams', 'STATE LEVEL GOVT EXAMS', 'STATE LEVEL ENTRANCE EXAMS',
  'National Level (All-India) Entrance Exams',
];

async function seed() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGO_URI or MONGODB_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const Domain = require('../src/domains/domains.model');
  let inserted = 0;
  for (let i = 0; i < DEFAULT_DOMAINS.length; i++) {
    const name = DEFAULT_DOMAINS[i];
    const exists = await Domain.findOne({ name });
    if (!exists) {
      await Domain.create({ name, order: i, isActive: true });
      inserted++;
      console.log('Inserted domain:', name);
    }
  }
  console.log('Done. Inserted', inserted, 'domains.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
