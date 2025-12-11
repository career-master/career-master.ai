# Copy Database Instructions

## Quick Start

Copy data from old database to main database:

```bash
cd backend
node scripts/copy-db-to-main.js
```

## Configuration

The script uses these defaults:
- **Old DB (Source)**: `mongodb://localhost:27017/careermaster2`
- **Main DB (Destination)**: `mongodb://localhost:27017/careermaster` (or from `MONGODB_URI` in `.env`)

## Custom Configuration

You can set environment variables in your `.env` file or pass them directly:

```bash
# Set in .env file
OLD_DB_URI=mongodb://localhost:27017/careermaster2
MAIN_DB_URI=mongodb://localhost:27017/careermaster
DUPLICATE_STRATEGY=skip  # or 'overwrite'
```

Or run with environment variables:

```bash
OLD_DB_URI=mongodb://localhost:27017/careermaster2 \
MAIN_DB_URI=mongodb://localhost:27017/careermaster \
DUPLICATE_STRATEGY=skip \
node scripts/copy-db-to-main.js
```

## Duplicate Strategy

- **`skip`** (default): Skip documents that already exist in main database (preserves existing data)
- **`overwrite`**: Replace existing documents in main database with data from old database

## What Gets Copied

- All collections from old database
- All documents in each collection
- All indexes (except default `_id` index)

## Example Output

```
🚀 Starting database copy process...

📂 Source (Old DB): mongodb://localhost:27017/careermaster2
📂 Destination (Main DB): mongodb://localhost:27017/careermaster
📋 Strategy: skip duplicates

🔄 Connecting to old database...
✅ Connected to old database: careermaster2
🔄 Connecting to main database...
✅ Connected to main database: careermaster

📚 Found 8 collection(s) to copy:
   - users
   - quizzes
   - quiz_attempts
   - batches
   - subjects
   - topics
   - cheatsheets
   - quiz_sets

📦 Copying collection: users...
   📊 Found 150 documents in old database
   📊 Found 50 existing documents in main database
   ✅ Completed: 100 copied, 50 skipped, 0 overwritten

...

📊 COPY SUMMARY
============================================================
✅ Total documents copied: 500
⏭️  Total documents skipped: 200
🔄 Total documents overwritten: 0
📦 Collections processed: 8
============================================================

✅ Database copy completed successfully!
```

## Troubleshooting

1. **Connection Error**: Make sure MongoDB is running locally
   ```bash
   # Check if MongoDB is running
   mongosh mongodb://localhost:27017
   ```

2. **Permission Error**: Make sure you have read access to old DB and write access to main DB

3. **Duplicate Key Errors**: These are handled automatically based on your strategy

4. **Large Databases**: The script processes in batches of 1000 documents for efficiency

