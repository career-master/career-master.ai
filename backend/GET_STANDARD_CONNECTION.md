# How to Get Standard Connection String from MongoDB Atlas

## Step-by-Step Instructions:

1. **Login to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Login with your credentials

2. **Navigate to Your Cluster**
   - Click on your project
   - Click on your cluster name

3. **Click "Connect" Button**
   - You'll see a modal with connection options

4. **Select "Connect your application" or "Drivers"**
   - Choose "Drivers" tab
   - Select "Node.js" as the driver
   - Select version "5.5 or later" (or latest)

5. **Look for Connection String Options**
   - You should see two options:
     - **"SRV connection string"** (this is what's failing)
     - **"Standard connection string"** (this is what we need)

6. **Copy the Standard Connection String**
   - It will look like:
   ```
   mongodb://careermasterforyou_db_user:2025@cluster0-shard-00-00.hjokhqk.mongodb.net:27017,cluster0-shard-00-01.hjokhqk.mongodb.net:27017,cluster0-shard-00-02.hjokhqk.mongodb.net:27017/careermaster?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0
   ```

7. **Use in MongoDB Compass**
   - Open MongoDB Compass
   - Paste the **standard connection string** (not the SRV one)
   - Click "Connect"

## Alternative: If Standard String Not Available

If you only see SRV connection string, you can manually construct it:

1. Get the replica set members from Atlas cluster details
2. Format:
   ```
   mongodb://username:password@host1:27017,host2:27017,host3:27017/dbname?ssl=true&replicaSet=replica-set-name&authSource=admin&retryWrites=true&w=majority
   ```

## Test Connection

After getting the standard connection string, test it:
```bash
mongosh "mongodb://careermasterforyou_db_user:2025@cluster0-shard-00-00.hjokhqk.mongodb.net:27017/careermaster?ssl=true&authSource=admin"
```
