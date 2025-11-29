# Render Backend Fix - 404 Error on /api

## Problem
Getting 404 error for `/api` route on Render deployment.

## Issues Found

1. **Missing `/api` route handler** - The app has routes like `/api/auth`, `/api/roles`, but no handler for just `/api`
2. **Root Directory might be wrong** - Error path shows `/opt/render/project/src/backend/` which suggests incorrect root directory

## Solutions

### Fix 1: Added `/api` Route Handler ✅
I've added a route handler for `/api` that returns API information. This is now in the code.

### Fix 2: Verify Render Root Directory

**Check your Render settings:**

1. Go to Render dashboard → Your backend service → Settings
2. Check **Root Directory** field:
   - Should be: `backend` (NOT `src/backend` or `backend/src`)
   - If it's wrong, change it to: `backend`

3. **Build Command:**
   ```
   npm install
   ```
   (If Root Directory is set to `backend`)

   OR
   ```
   cd backend && npm install
   ```
   (If Root Directory is NOT set)

4. **Start Command:**
   ```
   node server.js
   ```
   (If Root Directory is set to `backend`)

   OR
   ```
   cd backend && node server.js
   ```
   (If Root Directory is NOT set)

### Fix 3: Verify File Structure

Your backend structure should be:
```
backend/
  ├── server.js          ← Entry point
  ├── package.json
  ├── src/
  │   ├── app.js         ← Express app
  │   └── ...
  └── ...
```

**NOT:**
```
src/
  └── backend/
      └── ...
```

## Testing

After fixing, test these endpoints:

1. **Root:** `https://career-master-ai.onrender.com/`
   - Should return API info

2. **API Root:** `https://career-master-ai.onrender.com/api`
   - Should return API info (now fixed)

3. **Health:** `https://career-master-ai.onrender.com/health`
   - Should return health status

4. **Auth:** `https://career-master-ai.onrender.com/api/auth/login`
   - Should work (POST request)

## Current Status

✅ Added `/api` route handler
⚠️ Need to verify Root Directory in Render
⚠️ Need to redeploy after fixing

## Next Steps

1. **Commit and push the code change** (added `/api` route)
2. **Verify Root Directory** in Render settings
3. **Redeploy** the service
4. **Test** the endpoints above

## Quick Test Commands

```bash
# Test root
curl https://career-master-ai.onrender.com/

# Test /api
curl https://career-master-ai.onrender.com/api

# Test health
curl https://career-master-ai.onrender.com/health
```

