# Quick Fix: "no registered origin" Error

## The Problem
You're seeing: **"Access blocked: Authorization Error - no registered origin"** or **"Error 401: invalid_client"**

This means the URL where your app is running is not in Google's authorized origins list.

## Quick Fix (5 minutes)

### Step 1: Find Your Current URL
Look at your browser address bar. What URL are you using?
- `http://localhost:3000` (local development)
- `https://your-app.vercel.app` (Vercel)
- `https://your-domain.com` (custom domain)

### Step 2: Add It to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials

2. Find your **OAuth 2.0 Client ID** (the one you're using)

3. Click the **pencil icon** (Edit) next to it

4. Scroll down to **"Authorized JavaScript origins"**

5. Click **"+ ADD URI"**

6. Enter your URL exactly as shown in your browser:
   - ✅ `http://localhost:3000`
   - ✅ `https://your-app.vercel.app`
   - ❌ `http://localhost:3000/` (no trailing slash!)
   - ❌ `http://localhost:3000/login` (no paths!)

7. Click **SAVE**

8. **Wait 1-2 minutes** for changes to take effect

9. **Clear browser cache** or use **Incognito mode**

10. **Try again!**

## Common URLs to Add

### Local Development
```
http://localhost:3000
http://127.0.0.1:3000
```

### Vercel
```
https://your-app.vercel.app
https://your-app-git-main.vercel.app
https://your-production-domain.com
```

### Other Platforms
```
https://your-app.onrender.com
https://your-custom-domain.com
```

## Still Not Working?

1. **Double-check the Client ID:**
   - Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your `.env.local` matches the Client ID in Google Console
   - No extra spaces or quotes

2. **Check the format:**
   - Should look like: `123456789-abcdefg.apps.googleusercontent.com`
   - No `https://` or `http://` prefix
   - No trailing slashes

3. **Verify environment variable:**
   ```bash
   # In frontend directory, check if it's set:
   echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID
   ```
   Or check your `.env.local` file

4. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

5. **Check browser console:**
   - Open DevTools (F12)
   - Look for any errors in the Console tab
   - Check Network tab to see if Google scripts are loading

## Example: Adding localhost

If you're running on `http://localhost:3000`:

1. Go to Google Cloud Console > Credentials
2. Edit your OAuth Client ID
3. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   ```
4. Save
5. Wait 1-2 minutes
6. Try again

## Need More Help?

See the full guide: `GOOGLE_OAUTH_SETUP.md`

