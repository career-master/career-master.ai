# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Career Master application.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to **APIs & Services** > **Library**
   - Search for "Google+ API" or "Google Identity Services"
   - Click **Enable**

4. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - If prompted, configure the OAuth consent screen first:
     - Choose **External** (unless you have a Google Workspace)
     - Fill in the required information:
       - App name: "Career Master" (or your app name)
       - User support email: Your email
       - Developer contact: Your email
     - Add scopes: `email`, `profile`, `openid`
     - Add test users (if in testing mode)
     - Save and continue

5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Career Master Web Client" (or any name)
   - **Authorized JavaScript origins** (IMPORTANT - Add ALL origins where your app runs):
     - `http://localhost:3000` (for local development)
     - `http://localhost:3001` (if using different port)
     - `http://127.0.0.1:3000` (alternative localhost)
     - `https://your-production-domain.com` (for production - e.g., `https://career-master-ai.vercel.app`)
     - `https://your-production-domain.vercel.app` (if using Vercel)
     - **Note:** Do NOT include trailing slashes. Use exact format: `http://localhost:3000` not `http://localhost:3000/`
   - **Authorized redirect URIs** (Add these):
     - `http://localhost:3000` (for local development)
     - `https://your-production-domain.com` (for production)
   - Click **Create**
   - **Copy the Client ID** (you'll need this)

**⚠️ IMPORTANT:** If you get "no registered origin" error, you need to:
1. Go back to your OAuth Client ID settings
2. Click **Edit** on your OAuth client
3. Add the EXACT URL where your app is running to "Authorized JavaScript origins"
4. Save the changes
5. Wait 1-2 minutes for changes to propagate
6. Try again

## Step 2: Set Backend Environment Variables

Add the following to your `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## Step 3: Set Frontend Environment Variables

### For Local Development

Create or update `frontend/.env.local`:

```env
# Google OAuth Client ID (must match backend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Example:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### For Production

Set the environment variable in your hosting platform:

**Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - Key: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Value: `your-google-client-id-here.apps.googleusercontent.com`
   - Environment: Production, Preview, Development

**Render/Other Platforms:**
- Add the environment variable in your platform's environment variable settings
- Make sure it's prefixed with `NEXT_PUBLIC_` so it's available in the browser

## Step 4: Install Backend Dependencies

Make sure to install the Google Auth Library:

```bash
cd backend
npm install
```

This will install `google-auth-library` which was added to `package.json`.

## Step 5: Restart Your Servers

After setting environment variables:

1. **Backend:**
   ```bash
   cd backend
   npm run dev
   # or
   npm start
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   # or
   npm start
   ```

## Verification

1. Go to the signup page (`/signup`)
2. You should see a "Continue with Google" button at the top
3. Click it and you should be able to sign in with Google
4. After successful authentication, you should be redirected to `/dashboard`

## Troubleshooting

### Error: "Access blocked: Authorization Error - no registered origin" or "Error 401: invalid_client"

**This is the most common error!** It means your current URL is not in the authorized origins list.

**Fix Steps:**
1. **Identify your current URL:**
   - Check the browser address bar - what URL are you using?
   - Examples: `http://localhost:3000`, `https://your-app.vercel.app`, etc.

2. **Add the origin to Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID and click the **pencil icon** (Edit)
   - Scroll to **Authorized JavaScript origins**
   - Click **+ ADD URI**
   - Enter your EXACT URL (e.g., `http://localhost:3000` or `https://your-app.vercel.app`)
   - **Important:** 
     - Use `http://` for localhost, `https://` for production
     - Do NOT include trailing slashes (`/`)
     - Do NOT include paths (just domain and port)
     - Examples: ✅ `http://localhost:3000` ❌ `http://localhost:3000/` ❌ `http://localhost:3000/login`
   - Click **SAVE**

3. **Wait for propagation:**
   - Changes can take 1-5 minutes to propagate
   - Clear your browser cache or try incognito mode
   - Try again

4. **Verify Client ID:**
   - Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend matches the Client ID in Google Console
   - No extra spaces, quotes, or characters

**Common Origins to Add:**
- `http://localhost:3000` (Next.js default)
- `http://127.0.0.1:3000` (alternative localhost)
- `https://your-app.vercel.app` (Vercel preview)
- `https://your-production-domain.com` (production)

### Error: "Google Client ID is not configured"
- Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in your frontend `.env.local` file
- Restart your Next.js dev server after adding environment variables
- For production, ensure the environment variable is set in your hosting platform
- Check that the variable name is exactly `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (case-sensitive)

### Error: "Invalid Google token"
- Verify that `GOOGLE_CLIENT_ID` in backend matches `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend
- Make sure the Client ID is correct (no extra spaces or quotes)
- Check that the authorized JavaScript origins include your domain
- Ensure the Client ID format is correct: `xxxxx-xxxxx.apps.googleusercontent.com`

### Error: "Failed to load Google Identity Services"
- Check your internet connection
- Verify that the Google Identity Services script can be loaded
- Check browser console for any CORS or network errors
- Try disabling browser extensions that might block scripts

### Google Sign-in Button Not Appearing
- Check browser console for errors
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Make sure you've restarted the Next.js server after adding the environment variable
- Check that the Google Identity Services script is loading (check Network tab in DevTools)

## Important Notes

1. **Same Client ID**: The `GOOGLE_CLIENT_ID` in backend and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend must be the **same value**.

2. **Authorized Origins**: Make sure your production domain is added to authorized JavaScript origins in Google Cloud Console.

3. **OAuth Consent Screen**: If your app is in testing mode, only test users can sign in. To make it public, you need to submit your app for verification.

4. **Security**: Never commit `.env` files to version control. They should be in `.gitignore`.

## Environment File Examples

### Backend `.env` (full example)
```env
# Server
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=your-mongodb-uri

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Email Configuration
RESEND_API_KEY=your-resend-api-key
# OR
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Frontend `.env.local` (full example)
```env
# API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend logs for authentication errors
3. Verify all environment variables are set correctly
4. Ensure the Google OAuth credentials are properly configured in Google Cloud Console

