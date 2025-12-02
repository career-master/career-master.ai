# Using Resend API with Gmail (No Domain Required)

## ✅ Perfect Solution for Production Without Domain

**Yes, Resend API works perfectly without a domain!** You can use Resend's test domain and show your Gmail address as the sender name.

## How It Works

- **Sending:** Via Resend API (reliable, no SMTP connection issues)
- **Display Name:** Your Gmail address (what recipients see)
- **From Address:** Resend's test domain (works without verification)
- **Result:** Emails appear to come from your Gmail, sent reliably via Resend

## Setup for Render (2 minutes)

### Step 1: Add Environment Variables in Render

Go to **Render Dashboard → Your Service → Environment** and add:

```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <your-email@gmail.com>
```

**Replace `your-email@gmail.com` with your actual Gmail address.**

**Example:**
```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <careermaster@gmail.com>
```

### Step 2: Remove SMTP Variables (Optional)

If you have Gmail SMTP variables set, you can remove them:
```bash
# Remove these - not needed with Resend API
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### Step 3: Redeploy

1. Save environment variables
2. Redeploy your service
3. Check logs - should see: `✅ Resend API initialized successfully`

## What Recipients Will See

When users receive emails:
- **From:** Career Master <careermaster@gmail.com>
- **Reply-To:** (will use the from address)
- **Sent via:** Resend (reliable infrastructure)

## Benefits

✅ **No domain needed** - Use Resend's test domain  
✅ **No SMTP issues** - HTTP API, works perfectly on Render  
✅ **Shows your Gmail** - Recipients see your Gmail address  
✅ **Production ready** - Works reliably in production  
✅ **Free tier** - 3,000 emails/month free  

## Testing

1. **Test endpoint:** Visit `https://career-master-ai.onrender.com/api/test-email`
   - Should show: `"provider": "resend"` and `"emailWorking": true`

2. **Send test email:** Try signing up a new user
   - OTP email should arrive immediately
   - Check Resend dashboard: https://resend.com/emails

## When You Buy a Domain Later

When you get your domain (e.g., `careermaster.ai`):

1. **Verify domain in Resend:**
   - Go to https://resend.com/domains
   - Add your domain
   - Add DNS records (Resend shows you exactly what to add)

2. **Update environment variable:**
   ```bash
   EMAIL_FROM=noreply@careermaster.ai
   EMAIL_FROM_NAME=Career Master
   ```

3. **Redeploy** - That's it!

## Current Setup (No Domain)

**For now, use:**
```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <your-email@gmail.com>
```

This works perfectly in production! No domain needed.

## Troubleshooting

### "Email service not configured"
- Check if `RESEND_API_KEY` is set correctly in Render
- No extra spaces in the API key
- Redeploy after adding variables

### Emails not arriving
- Check Resend dashboard: https://resend.com/emails
- Look for delivery status
- Check spam folder
- Verify `EMAIL_FROM` is `onboarding@resend.dev`

### Still seeing SMTP errors?
- Make sure `RESEND_API_KEY` is set
- Remove `SMTP_USER` and `SMTP_PASS` from Render
- Redeploy

## Summary

**Resend API + Gmail Display Name = Perfect Solution**

- ✅ Works without domain
- ✅ No SMTP connection issues
- ✅ Shows your Gmail address
- ✅ Production ready
- ✅ Free tier available

Just set the 3 environment variables and you're done!

