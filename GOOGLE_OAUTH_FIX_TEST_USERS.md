# Fix: "Access blocked" - Test Users Issue

## The Problem
Your Google OAuth consent screen is in **Testing** mode, which means only test users can sign in.

## Solution: Add Test Users

### Step 1: Go to OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Or navigate: **APIs & Services** > **OAuth consent screen**

### Step 2: Add Test Users
1. Scroll down to **"Test users"** section
2. Click **"+ ADD USERS"**
3. Add your email: `careermasterforyou@gmail.com`
4. Click **ADD**
5. Click **SAVE** at the bottom

### Step 3: Also Check Authorized Origins
While you're there, make sure your origins are added:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **Edit** (pencil icon) on your OAuth Client ID
3. Under **"Authorized JavaScript origins"**, make sure you have:
   - `http://localhost:3000` (if running locally)
   - `https://your-production-domain.com` (if deployed)
4. Click **SAVE**

### Step 4: Wait and Try Again
- Wait 1-2 minutes for changes to propagate
- Clear browser cache or use Incognito mode
- Try signing in again

## Alternative: Publish Your App (For Production)

If you want anyone to be able to sign in (not just test users):

1. Go to **OAuth consent screen**
2. Click **"PUBLISH APP"** button
3. Note: This requires Google verification if you're requesting sensitive scopes
4. For basic email/profile scopes, you can usually publish immediately

## Quick Checklist

✅ Client ID matches in `.env` and Google Console  
✅ Your email is added as a test user  
✅ Authorized JavaScript origins are added  
✅ Wait 1-2 minutes after making changes  
✅ Try again in Incognito mode  

