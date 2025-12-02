# Resend API Setup for Render (Production)

## ❌ Error: "Email service is not configured"

This error means `RESEND_API_KEY` is not set in your Render environment variables.

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Render Dashboard

1. Go to https://dashboard.render.com
2. Click on your **Backend Service** (career-master-ai)
3. Go to **Environment** tab (left sidebar)

### Step 2: Add Environment Variables

Click **"Add Environment Variable"** and add these **3 variables**:

```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <careermaster@gmail.com>
```

**Important:**
- Replace `careermaster@gmail.com` with your actual Gmail address
- Make sure there are **NO spaces** before or after the `=` sign
- The API key should start with `re_`

### Step 3: Save and Redeploy

1. Click **"Save Changes"**
2. Render will automatically redeploy
3. Wait for deployment to complete (2-3 minutes)

### Step 4: Verify

1. Check Render logs - you should see:
   ```
   📧 Initializing Resend API...
   ✅ Resend API initialized successfully
   ```

2. Test the email endpoint:
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
     }
   }
   ```

## 🔍 Troubleshooting

### Still getting "Email service is not configured"?

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for: `❌ RESEND_API_KEY is not set` or `❌ Invalid Resend API key format`
   - This will tell you exactly what's wrong

2. **Verify Environment Variables:**
   - Go to Render Dashboard → Your Service → Environment
   - Make sure `RESEND_API_KEY` is listed
   - Make sure it starts with `re_`
   - Make sure there are no extra spaces

3. **Check API Key:**
   - Your API key: `re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa`
   - Make sure you copied it completely
   - Make sure there are no line breaks

4. **Redeploy:**
   - After adding environment variables, Render should auto-redeploy
   - If not, click **"Manual Deploy"** → **"Deploy latest commit"**

### Test Endpoint

Visit: `https://career-master-ai.onrender.com/api/test-email`

This will show you:
- ✅ If Resend is initialized
- ✅ If API key is set
- ✅ If API key format is valid
- ✅ If email service is working

## 📋 Required Environment Variables

**Minimum required (for email to work):**
```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <your-email@gmail.com>
```

**Optional (but recommended):**
```bash
EMAIL_FROM=onboarding@resend.dev  # Default if not set
EMAIL_FROM_NAME=Career Master     # Default if not set
```

## ✅ Success Indicators

After setup, you should see in Render logs:
```
📧 Initializing Resend API...
   API Key: re_B6W9EC...
   From: onboarding@resend.dev
   From Name: Career Master <careermaster@gmail.com>
✅ Resend API initialized successfully
```

## 🚀 Next Steps

Once email is working:
1. Test forgot password flow
2. Test user signup flow
3. Check Resend dashboard: https://resend.com/emails (to see sent emails)

## 📞 Still Having Issues?

1. Check Render logs for detailed error messages
2. Visit `/api/test-email` endpoint for diagnostics
3. Verify API key is correct in Resend dashboard: https://resend.com/api-keys

