# Local MongoDB Setup Guide

## Quick Setup

### 1. Install MongoDB Locally

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service

### 2. Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or check service status
brew services list  # macOS
sudo systemctl status mongod  # Linux
```

### 3. Connection String

Use this connection string in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/careermaster
```

**Alternative formats:**
```env
# With authentication (if you set up a user)
MONGODB_URI=mongodb://username:password@localhost:27017/careermaster?authSource=admin

# With custom port
MONGODB_URI=mongodb://localhost:27018/careermaster

# With replica set (if configured)
MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/careermaster?replicaSet=rs0
```

### 4. Update .env File

1. Open `backend/.env` file
2. Add or update this line:
   ```env
   MONGODB_URI=mongodb://localhost:27017/careermaster
   ```
3. Save the file

### 5. Test Connection

```bash
cd backend
node scripts/test-db-connection.js
```

### 6. Start Server

```bash
cd backend
npm start
```

## Default Connection String

**For local development:**
```
mongodb://localhost:27017/careermaster
```

**Components:**
- `mongodb://` - Protocol
- `localhost` - Host (use `127.0.0.1` if localhost doesn't work)
- `27017` - Default MongoDB port
- `careermaster` - Database name

## Troubleshooting

### MongoDB not running
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Check status
mongosh --eval "db.version()"
```

### Connection refused
- Make sure MongoDB is running
- Check if port 27017 is available: `lsof -i :27017`
- Try using `127.0.0.1` instead of `localhost`

### Permission denied
- Make sure MongoDB data directory has correct permissions
- On macOS/Linux, you might need to create the data directory:
  ```bash
  sudo mkdir -p /data/db
  sudo chown -R $(whoami) /data/db
  ```

## MongoDB Compass (GUI)

Download MongoDB Compass to view your database:
- https://www.mongodb.com/try/download/compass
- Connect using: `mongodb://localhost:27017`

