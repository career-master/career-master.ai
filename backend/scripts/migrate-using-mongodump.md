# Migrate Data from MongoDB Atlas to Local MongoDB

Since direct connection has DNS issues, here are alternative methods:

## Method 1: Using MongoDB Compass (Easiest - GUI)

### Step 1: Download MongoDB Compass
- Download from: https://www.mongodb.com/try/download/compass
- Install and open MongoDB Compass

### Step 2: Connect to MongoDB Atlas
1. Open MongoDB Compass
2. Paste connection string:
   ```
   mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0
   ```
3. Click "Connect"
4. If connection fails, try from a different network or use VPN

### Step 3: Export Data
1. Select the `careermaster` database
2. For each collection:
   - Click on the collection name
   - Click "Export Collection" (top right)
   - Choose format: JSON or CSV
   - Save to a folder (e.g., `./backup/`)

### Step 4: Import to Local MongoDB
1. In MongoDB Compass, connect to:
   ```
   mongodb://localhost:27017/careermaster2
   ```
2. For each exported file:
   - Click "Add Data" → "Import File"
   - Select the exported JSON/CSV file
   - Choose collection name
   - Click "Import"

---

## Method 2: Using mongodump/mongorestore (Command Line)

### Step 1: Install MongoDB Database Tools
```bash
# macOS
brew install mongodb-database-tools

# Or download from:
# https://www.mongodb.com/try/download/database-tools
```

### Step 2: Dump from MongoDB Atlas
```bash
mongodump \
  --uri="mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0" \
  --out=./backup/atlas-dump
```

### Step 3: Restore to Local MongoDB
```bash
mongorestore \
  --uri="mongodb://localhost:27017/careermaster2" \
  ./backup/atlas-dump/careermaster
```

---

## Method 3: Using MongoDB Atlas Export (If Available)

1. Go to MongoDB Atlas Dashboard
2. Navigate to your cluster
3. Click "..." → "Export" (if available)
4. Download the export
5. Import to local MongoDB using mongorestore

---

## Method 4: Manual Script (If You Can Access from Another Machine)

If you have access to another machine/network that can reach MongoDB Atlas:

1. Run the migration script from that machine:
   ```bash
   node scripts/migrate-atlas-to-local.js
   ```

2. Or use mongodump from that machine, then transfer files and restore locally

---

## Quick Test After Migration

After migrating, test the connection:

```bash
cd backend

# Update .env file
echo "MONGODB_URI=mongodb://localhost:27017/careermaster2" >> .env

# Test connection
node scripts/test-db-connection.js
```

---

## Collections to Migrate

Make sure to migrate these collections:
- `users`
- `quizzes`
- `quiz_attempts`
- `quiz_sets`
- `subjects`
- `topics`
- `cheatsheets`
- `batches`
- `batch_requests`
- `roles`
- `sessions`
- `otp_logs`
- `topic_progress`
- `enrollments`

