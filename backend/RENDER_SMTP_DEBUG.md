# SMTP Debugging Guide for Render

## Issue: SMTP Works Locally but Not on Render

### Common Causes

1. **Environment Variables Not Set in Render**
2. **SMTP_SECURE Value Issue** (string vs boolean)
3. **Network/Firewall Restrictions**
4. **Timeout Issues**

## Step-by-Step Debugging

### 1. Verify Environment Variables in Render

Go to **Render Dashboard → Your Service → Environment** and verify these are set:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Career Master
```

**Important Notes:**
- `SMTP_SECURE` must be exactly `false` (not `"false"` or `False`)
- `SMTP_PORT` should be `587` for Gmail (or `465` if using secure)
- For Gmail, `SMTP_PASS` must be an **App Password**, not your regular password

### 2. Check Render Logs

After deploying, check the logs for:

**Good signs:**
```
📧 Initializing SMTP transporter...
   Host: smtp.gmail.com
   Port: 587
   Secure: false
   User: your-email@gmail.com
   From: your-email@gmail.com
🔄 Verifying SMTP connection...
✅ SMTP server is ready to send emails
```

**Bad signs:**
```
⚠️  SMTP credentials not configured
   SMTP_USER: NOT SET
   SMTP_PASS: NOT SET
```

Or:
```
❌ SMTP verification failed: Connection timeout
   Code: ETIMEDOUT
```

### 3. Common Issues and Fixes

#### Issue 1: Environment Variables Not Loading

**Symptom:** Logs show "SMTP_USER: NOT SET"

**Fix:**
1. Go to Render Dashboard → Environment
2. Make sure variables are set (not just in `.env` file)
3. **Redeploy** after adding variables
4. Variables in `.env` file are NOT used on Render - only Environment tab

#### Issue 2: SMTP_SECURE Value

**Symptom:** Connection fails even with correct credentials

**Fix:**
- In Render, set `SMTP_SECURE=false` (lowercase, no quotes)
- For port 465, use `SMTP_SECURE=true`
- For port 587, use `SMTP_SECURE=false`

#### Issue 3: Gmail App Password

**Symptom:** Authentication fails

**Fix:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate new App Password for "Mail"
3. Copy the 16-character password (no spaces)
4. Use this as `SMTP_PASS` in Render
5. Make sure 2FA is enabled on your Google account

#### Issue 4: Connection Timeout

**Symptom:** `ETIMEDOUT` error

**Possible Causes:**
- Render's network blocking SMTP
- Wrong SMTP host/port
- Firewall restrictions

**Fixes:**
1. Try different SMTP port:
   - Port 587 (TLS) - recommended
   - Port 465 (SSL) - requires `SMTP_SECURE=true`
   - Port 25 - often blocked

2. Try different SMTP service:
   - SendGrid (recommended for production)
   - Mailgun
   - AWS SES

3. Check if Gmail allows "Less secure app access" (deprecated, use App Password instead)

### 4. Test SMTP Configuration

Add this test endpoint to verify SMTP:

```javascript
// In your routes file
router.get('/test-email', async (req, res) => {
  try {
    const emailUtil = require('../utils/email');
    const isWorking = await emailUtil.testEmailConfig();
    res.json({ 
      smtpConfigured: !!emailUtil.transporter,
      smtpWorking: isWorking,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USER ? 'Set' : 'Not Set'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then visit: `https://career-master-ai.onrender.com/api/test-email`

### 5. Alternative: Use SendGrid (Recommended)

SendGrid is more reliable on Render:

1. **Sign up for SendGrid** (free tier available)
2. **Create API Key** in SendGrid dashboard
3. **Set in Render:**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key-here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Career Master
   ```

### 6. Quick Checklist

- [ ] Environment variables set in Render (not just `.env` file)
- [ ] `SMTP_SECURE=false` (lowercase, no quotes) for port 587
- [ ] `SMTP_SECURE=true` (lowercase, no quotes) for port 465
- [ ] Using Gmail App Password (not regular password)
- [ ] 2FA enabled on Google account
- [ ] Service redeployed after adding variables
- [ ] Checked Render logs for SMTP initialization messages
- [ ] No typos in environment variable names

### 7. Debug Logs Added

The code now logs:
- ✅ SMTP configuration on startup
- ✅ Connection verification status
- ✅ Detailed error messages with codes
- ✅ Email send attempts

Check Render logs to see exactly what's happening.

## Still Not Working?

1. **Check Render Logs** - Look for SMTP-related messages
2. **Verify Environment Variables** - Double-check spelling and values
3. **Try Different SMTP Service** - SendGrid, Mailgun, or AWS SES
4. **Test Locally First** - Make sure it works with same credentials locally
5. **Contact Support** - If using custom SMTP server, check firewall rules

