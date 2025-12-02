# Deploy Latest Code to Render - Fix Email Service

## 🚨 Current Issue

Your Render deployment is running **old code** that:
- ❌ Doesn't have the `/api/test-email` endpoint
- ❌ Has old SMTP error messages
- ❌ Missing `RESEND_API_KEY` environment variable

## ✅ Solution: Deploy Latest Code + Set Environment Variables

### Step 1: Commit and Push Your Latest Code

```bash
cd /Users/raghuveer/Desktop/career-master
git add .
git commit -m "Add Resend API email service and test-email endpoint"
git push origin raghuveer
```

**Or if you're on main/master:**
```bash
git push origin main
# or
git push origin master
```

### Step 2: Set Environment Variables in Render

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your **Backend Service** (career-master-ai)
3. Go to **Environment** tab (left sidebar)
4. Click **"Add Environment Variable"** for each:

#### Required Variables:

```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <careermaster@gmail.com>
```

**Important:**
- Replace `careermaster@gmail.com` with your actual Gmail
- No spaces around `=` sign
- API key must start with `re_`

### Step 3: Trigger Deployment

**Option A: Auto-Deploy (if connected to GitHub)**
- Render will auto-deploy when you push to GitHub
- Wait 2-3 minutes for deployment

**Option B: Manual Deploy**
1. Go to Render Dashboard → Your Service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

### Step 4: Verify Deployment

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for:
     ```
     📧 Initializing Resend API...
     ✅ Resend API initialized successfully
     ```

2. **Test the Endpoint:**
   ```
   https://career-master-ai.onrender.com/api/test-email
   ```
   
   Should return:
   ```json
   {
     "success": true,
     "email": {
       "provider": "resend",
       "resendInitialized": true,
       "resendApiKey": "Set (re_B6W9EC...)",
       "emailWorking": true
     },
     "message": "Email service (resend) is configured and working"
   }
   ```

3. **Test Forgot Password:**
   - Try the forgot password flow
   - Should send email successfully

## 🔍 Troubleshooting

### Still seeing "Route /api/test-email not found"?

- **Check:** Did you push the latest code to GitHub?
- **Check:** Is Render connected to the correct branch (raghuveer)?
- **Fix:** Go to Render → Settings → check "Branch" is set to `raghuveer`

### Still seeing "Email service is not configured"?

- **Check:** Are environment variables set in Render?
- **Check:** Did you save the environment variables?
- **Check:** Did Render redeploy after adding variables?
- **Fix:** Go to Render → Environment → verify all 3 variables are there

### Still seeing old error messages?

- **Check:** Render logs should show new initialization messages
- **Fix:** Force a new deployment: Manual Deploy → Deploy latest commit

## 📋 Checklist

Before deployment:
- [ ] Code is committed and pushed to GitHub
- [ ] Render is connected to correct GitHub branch
- [ ] `RESEND_API_KEY` is set in Render environment variables
- [ ] `EMAIL_FROM` is set to `onboarding@resend.dev`
- [ ] `EMAIL_FROM_NAME` is set with your Gmail address

After deployment:
- [ ] Render logs show "✅ Resend API initialized successfully"
- [ ] `/api/test-email` endpoint returns success
- [ ] Forgot password flow sends emails

## 🎯 Expected Result

After completing these steps:
- ✅ Email service will work
- ✅ `/api/test-email` endpoint will be available
- ✅ All email functions (signup, forgot password) will work
- ✅ No more "Email service is not configured" errors

