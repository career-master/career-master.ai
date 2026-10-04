const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');
const mongoose = require('mongoose');

const { copyCollection } = require('../scripts/copy-db-to-main');

// Tests run against throwaway databases on a local MongoDB; never point this at real data.
const MONGO_BASE_URL = process.env.MONGO_TEST_URL || 'mongodb://127.0.0.1:27017';
const SCRIPT_PATH = path.join(__dirname, '../scripts/copy-db-to-main.js');
const suffix = `${process.pid}_${Date.now()}`;
const SRC_DB_NAME = `cm_test_copy_src_${suffix}`;
const DEST_DB_NAME = `cm_test_copy_dest_${suffix}`;

let connection;
let srcDb;
let destDb;

const silence = () => {
  const original = { log: console.log, error: console.error };
  console.log = () => {};
  console.error = () => {};
  return () => Object.assign(console, original);
};

const copy = async (name, strategy) => {
  const restore = silence();
  try {
    return await copyCollection(srcDb, destDb, name, strategy);
  } finally {
    restore();
  }
};

const runScript = (env) =>
  spawnSync(process.execPath, [SCRIPT_PATH], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 60000,
  });

before(async () => {
  try {
    connection = await mongoose
      .createConnection(MONGO_BASE_URL, { serverSelectionTimeoutMS: 3000 })
      .asPromise();
  } catch (error) {
    throw new Error(`MongoDB not reachable at ${MONGO_BASE_URL}: ${error.message}`);
  }
  srcDb = connection.useDb(SRC_DB_NAME).db;
  destDb = connection.useDb(DEST_DB_NAME).db;
});

after(async () => {
  if (!connection) return;
  await srcDb.dropDatabase();
  await destDb.dropDatabase();
  await connection.close();
});

beforeEach(async () => {
  await srcDb.dropDatabase();
  await destDb.dropDatabase();
});

describe('copyCollection', () => {
  it('copies every document into an empty destination', async () => {
    await srcDb.collection('users').insertMany([
      { name: 'Asha', email: 'asha@example.com' },
      { name: 'Ravi', email: 'ravi@example.com' },
      { name: 'Meera', email: 'meera@example.com' },
    ]);

    const result = await copy('users', 'skip');

    assert.deepEqual(result, { copied: 3, skipped: 0, overwritten: 0 });
    const srcDocs = await srcDb.collection('users').find().sort({ _id: 1 }).toArray();
    const destDocs = await destDb.collection('users').find().sort({ _id: 1 }).toArray();
    assert.deepEqual(destDocs, srcDocs);
  });

  it('skip strategy keeps existing destination documents untouched', async () => {
    const sharedId = new mongoose.Types.ObjectId();
    await srcDb.collection('users').insertMany([
      { _id: sharedId, name: 'Source version' },
      { name: 'New user' },
    ]);
    await destDb.collection('users').insertOne({ _id: sharedId, name: 'Main version' });

    const result = await copy('users', 'skip');

    assert.deepEqual(result, { copied: 1, skipped: 1, overwritten: 0 });
    assert.equal(await destDb.collection('users').countDocuments(), 2);
    const kept = await destDb.collection('users').findOne({ _id: sharedId });
    assert.equal(kept.name, 'Main version');
  });

  it('overwrite strategy replaces existing documents and counts them separately', async () => {
    const sharedId = new mongoose.Types.ObjectId();
    await srcDb.collection('users').insertMany([
      { _id: sharedId, name: 'Source version' },
      { name: 'New user 1' },
      { name: 'New user 2' },
    ]);
    await destDb.collection('users').insertOne({ _id: sharedId, name: 'Main version', stale: true });

    const result = await copy('users', 'overwrite');

    assert.deepEqual(result, { copied: 2, skipped: 0, overwritten: 1 });
    assert.equal(await destDb.collection('users').countDocuments(), 3);
    const replaced = await destDb.collection('users').findOne({ _id: sharedId });
    assert.deepEqual(replaced, { _id: sharedId, name: 'Source version' });
  });

  it('overwrite strategy leaves destination-only documents alone', async () => {
    await srcDb.collection('users').insertOne({ name: 'From source' });
    const destOnlyId = new mongoose.Types.ObjectId();
    await destDb.collection('users').insertOne({ _id: destOnlyId, name: 'Only in main' });

    await copy('users', 'overwrite');

    const destOnly = await destDb.collection('users').findOne({ _id: destOnlyId });
    assert.equal(destOnly.name, 'Only in main');
    assert.equal(await destDb.collection('users').countDocuments(), 2);
  });

  it('is idempotent when run twice with skip strategy', async () => {
    await srcDb.collection('quizzes').insertMany([{ title: 'Q1' }, { title: 'Q2' }]);

    await copy('quizzes', 'skip');
    const second = await copy('quizzes', 'skip');

    assert.deepEqual(second, { copied: 0, skipped: 2, overwritten: 0 });
    assert.equal(await destDb.collection('quizzes').countDocuments(), 2);
  });

  it('skips a collection that does not exist in the source', async () => {
    const result = await copy('does_not_exist', 'skip');

    assert.deepEqual(result, { skipped: true, copied: 0 });
    const destCollections = await destDb.listCollections({ name: 'does_not_exist' }).toArray();
    assert.equal(destCollections.length, 0);
  });

  it('skips an empty source collection', async () => {
    await srcDb.createCollection('empty_things');

    const result = await copy('empty_things', 'skip');

    assert.deepEqual(result, { skipped: true, copied: 0 });
  });

  it('copies documents across multiple 1000-document batches', async () => {
    const docs = Array.from({ length: 2345 }, (_, i) => ({ index: i }));
    await srcDb.collection('quiz_attempts').insertMany(docs);

    const restoreWrite = process.stdout.write;
    process.stdout.write = () => true;
    let result;
    try {
      result = await copy('quiz_attempts', 'skip');
    } finally {
      process.stdout.write = restoreWrite;
    }

    assert.deepEqual(result, { copied: 2345, skipped: 0, overwritten: 0 });
    assert.equal(await destDb.collection('quiz_attempts').countDocuments(), 2345);
  });

  it('preserves BSON types such as ObjectId references, dates and nested arrays', async () => {
    const userId = new mongoose.Types.ObjectId();
    const createdAt = new Date('2025-01-15T10:30:00Z');
    await srcDb.collection('quiz_attempts').insertOne({
      user: userId,
      createdAt,
      answers: [{ q: 1, selected: ['a', 'c'] }, { q: 2, selected: [] }],
      score: 7.5,
    });

    await copy('quiz_attempts', 'skip');

    const copied = await destDb.collection('quiz_attempts').findOne({});
    assert.ok(copied.user instanceof mongoose.mongo.ObjectId);
    assert.ok(copied.user.equals(userId));
    assert.ok(copied.createdAt instanceof Date);
    assert.equal(copied.createdAt.getTime(), createdAt.getTime());
    assert.deepEqual(copied.answers, [{ q: 1, selected: ['a', 'c'] }, { q: 2, selected: [] }]);
    assert.equal(copied.score, 7.5);
  });

  it('copies custom indexes with unique and sparse options but not the default _id index', async () => {
    const users = srcDb.collection('users');
    await users.insertOne({ email: 'a@example.com', phone: '123' });
    await users.createIndex({ email: 1 }, { name: 'email_unique', unique: true });
    await users.createIndex({ phone: 1 }, { name: 'phone_sparse', sparse: true });
    await users.createIndex({ batch: 1, createdAt: -1 }, { name: 'batch_created' });

    await copy('users', 'skip');

    const indexes = await destDb.collection('users').indexes();
    const byName = Object.fromEntries(indexes.map((idx) => [idx.name, idx]));
    assert.deepEqual(Object.keys(byName).sort(), ['_id_', 'batch_created', 'email_unique', 'phone_sparse']);
    assert.equal(byName.email_unique.unique, true);
    assert.equal(byName.phone_sparse.sparse, true);
    assert.deepEqual(byName.batch_created.key, { batch: 1, createdAt: -1 });
  });

  it('does not fail when the destination already has the same index', async () => {
    await srcDb.collection('users').insertOne({ email: 'a@example.com' });
    await srcDb.collection('users').createIndex({ email: 1 }, { name: 'email_unique', unique: true });
    await destDb.collection('users').createIndex({ email: 1 }, { name: 'email_unique', unique: true });

    const result = await copy('users', 'skip');

    assert.deepEqual(result, { copied: 1, skipped: 0, overwritten: 0 });
  });

  it('counts a unique-index conflict in the destination as skipped instead of crashing', async () => {
    await destDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await destDb.collection('users').insertOne({ email: 'taken@example.com', name: 'Existing' });
    await srcDb.collection('users').insertMany([
      { email: 'taken@example.com', name: 'Conflicting' },
      { email: 'free@example.com', name: 'Fresh' },
    ]);

    const result = await copy('users', 'skip');

    assert.deepEqual(result, { copied: 1, skipped: 1, overwritten: 0 });
    const existing = await destDb.collection('users').findOne({ email: 'taken@example.com' });
    assert.equal(existing.name, 'Existing');
  });
});

describe('copy-db-to-main script (end to end)', () => {
  it('copies all collections and prints a correct summary', async () => {
    await srcDb.collection('users').insertMany([{ name: 'A' }, { name: 'B' }]);
    await srcDb.collection('batches').insertMany([{ code: 'B1' }]);
    await srcDb.collection('subjects').insertMany([{ title: 'Math' }, { title: 'Physics' }, { title: 'Chem' }]);
    const existingId = new mongoose.Types.ObjectId();
    await srcDb.collection('topics').insertOne({ _id: existingId, title: 'Source topic' });
    await destDb.collection('topics').insertOne({ _id: existingId, title: 'Main topic' });

    const run = runScript({
      OLD_DB_URI: `${MONGO_BASE_URL}/${SRC_DB_NAME}`,
      MAIN_DB_URI: `${MONGO_BASE_URL}/${DEST_DB_NAME}`,
      DUPLICATE_STRATEGY: 'skip',
    });

    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /Total documents copied: 6/);
    assert.match(run.stdout, /Total documents skipped: 1/);
    assert.match(run.stdout, /Total documents overwritten: 0/);
    assert.match(run.stdout, /Collections processed: 4/);
    assert.match(run.stdout, /Database copy completed successfully/);
    assert.equal(await destDb.collection('users').countDocuments(), 2);
    assert.equal(await destDb.collection('batches').countDocuments(), 1);
    assert.equal(await destDb.collection('subjects').countDocuments(), 3);
    const topic = await destDb.collection('topics').findOne({ _id: existingId });
    assert.equal(topic.title, 'Main topic');
  });

  it('honours DUPLICATE_STRATEGY=overwrite from the environment', async () => {
    const existingId = new mongoose.Types.ObjectId();
    await srcDb.collection('topics').insertMany([
      { _id: existingId, title: 'Source topic' },
      { title: 'Another topic' },
    ]);
    await destDb.collection('topics').insertOne({ _id: existingId, title: 'Main topic' });

    const run = runScript({
      OLD_DB_URI: `${MONGO_BASE_URL}/${SRC_DB_NAME}`,
      MAIN_DB_URI: `${MONGO_BASE_URL}/${DEST_DB_NAME}`,
      DUPLICATE_STRATEGY: 'overwrite',
    });

    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /Strategy: overwrite duplicates/);
    assert.match(run.stdout, /Total documents copied: 1/);
    assert.match(run.stdout, /Total documents overwritten: 1/);
    const topic = await destDb.collection('topics').findOne({ _id: existingId });
    assert.equal(topic.title, 'Source topic');
  });

  it('masks passwords in the printed connection strings', async () => {
    const run = runScript({
      OLD_DB_URI: 'mongodb://admin:SuperSecret123@127.0.0.1:1/careermaster2?serverSelectionTimeoutMS=500',
      MAIN_DB_URI: `${MONGO_BASE_URL}/${DEST_DB_NAME}`,
    });

    assert.doesNotMatch(run.stdout + run.stderr, /SuperSecret123/);
    assert.match(run.stdout, /admin:\*\*\*\*@127\.0\.0\.1/);
  });

  it('exits with code 1 when the source database is unreachable', async () => {
    const run = runScript({
      OLD_DB_URI: 'mongodb://127.0.0.1:1/careermaster2?serverSelectionTimeoutMS=500',
      MAIN_DB_URI: `${MONGO_BASE_URL}/${DEST_DB_NAME}`,
    });

    assert.equal(run.status, 1);
    assert.match(run.stderr, /Error during database copy/);
  });
});
