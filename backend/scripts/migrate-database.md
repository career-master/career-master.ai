# Database Migration Guide

## ✅ Connection Status
Your MongoDB Atlas connection has been successfully configured!

**New Database:** `careermaster`  
**Connection:** `mongodb+srv://careermasterforyou_db_user:****@cluster0.hjokhqk.mongodb.net/careermaster`

## 📋 Migration Options

### Option 1: Fresh Start (Recommended if starting new)
If you're starting fresh, simply start your server:
```bash
cd backend
npm start
```

The server will automatically:
- Create all collections
- Seed default roles and permissions
- Create admin user (from .env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)

### Option 2: Migrate Existing Data

If you have data in an old database, use MongoDB's native tools:

#### Step 1: Export from Old Database
```bash
# Export all collections
mongodump --uri="OLD_CONNECTION_STRING" --out=./backup

# Or export specific collections
mongodump --uri="OLD_CONNECTION_STRING" --db=old_db_name --collection=users --out=./backup
mongodump --uri="OLD_CONNECTION_STRING" --db=old_db_name --collection=quizzes --out=./backup
mongodump --uri="OLD_CONNECTION_STRING" --db=old_db_name --collection=quiz_attempts --out=./backup
mongodump --uri="OLD_CONNECTION_STRING" --db=old_db_name --collection=batches --out=./backup
mongodump --uri="OLD_CONNECTION_STRING" --db=old_db_name --collection=roles --out=./backup
```

#### Step 2: Import to New Database
```bash
# Import all collections
mongorestore --uri="mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0" ./backup/old_db_name

# Or import specific collections
mongorestore --uri="mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0" --collection=users ./backup/old_db_name/users.bson
mongorestore --uri="mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0" --collection=quizzes ./backup/old_db_name/quizzes.bson
mongorestore --uri="mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0" --collection=quiz_attempts ./backup/old_db_name/quiz_attempts.bson
mongorestore --uri="mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0" --collection=batches ./backup/old_db_name/batches.bson
mongorestore --uri="mongodb+srv://careermasterforyou_db_user:2025@cluster0.hjokhqk.mongodb.net/careermaster?appName=Cluster0" --collection=roles ./backup/old_db_name/roles.bson
```

### Option 3: Use MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect to your old database
3. Export collections as JSON or BSON
4. Connect to new database
5. Import the exported files

## 🔒 Security Notes

1. **IP Whitelist**: Make sure your MongoDB Atlas cluster allows connections from:
   - Your server's IP address
   - `0.0.0.0/0` (for development only - not recommended for production)

2. **Database User**: The user `careermasterforyou_db_user` should have read/write permissions

3. **Connection String**: Keep your `.env` file secure and never commit it to Git

## 🧪 Test Connection

Test your connection anytime:
```bash
cd backend
node scripts/test-db-connection.js
```

## 📊 Collections That Will Be Created

When you start the server, these collections will be created automatically:
- `users` - User accounts
- `quizzes` - Quiz data
- `quiz_attempts` - User quiz attempts
- `batches` - Student batches
- `roles` - RBAC roles
- `sessions` - User sessions
- `otp_logs` - OTP verification logs

## 🚀 Next Steps

1. **Start the server** to create collections and seed initial data:
   ```bash
   cd backend
   npm start
   ```

2. **Verify data** by checking MongoDB Atlas dashboard or running:
   ```bash
   node scripts/test-db-connection.js
   ```

3. **Test the application** to ensure everything works correctly

