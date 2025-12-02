# Resend API Setup for Render (Works Without Domain!)

## ✅ Perfect Solution: Use Resend API with Gmail (No Domain Needed)

**Resend API works perfectly without a domain!** You can use Resend's test domain for now, and your Gmail address as the display name.

## Quick Setup (2 minutes)

### Step 1: Add Resend API Key to Render

1. Go to **Render Dashboard → Your Backend Service → Environment**
2. Add these environment variables:

```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <your-email@gmail.com>
```

**Important:**
- `EMAIL_FROM` must be `onboarding@resend.dev` (Resend's test domain - works without verification)
- `EMAIL_FROM_NAME` can include your Gmail address for display: `Career Master <your-email@gmail.com>`
- Recipients will see emails from "Career Master <your-email@gmail.com>" but sent via Resend

### Step 2: Remove SMTP Variables (Optional)

If you have these set, you can remove them (Resend API will be used instead):
```bash
# Remove or leave empty:
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### Step 3: Redeploy

1. Save environment variables in Render
2. Redeploy your service
3. Check logs - should see: `✅ Resend API initialized successfully`

### Step 3: Redeploy

1. Save environment variables in Render
2. Redeploy your service
3. Check logs - should see: `✅ Resend API initialized successfully`

### Step 4: Test

Visit: `https://career-master-ai.onrender.com/api/test-email`

Should show:
```json
{
  "success": true,
  "email": {
    "provider": "resend",
    "emailWorking": true
  }
}
```

## Why Resend?

✅ **No connection issues** - Uses HTTP API, not SMTP
✅ **Works perfectly on Render** - No firewall/network problems
✅ **Fast and reliable** - Modern email infrastructure
✅ **Free tier** - 3,000 emails/month free
✅ **Easy setup** - Just API key, no SMTP configuration needed
✅ **Better deliverability** - Professional email service

## Environment Variables for Production (No Domain Needed)

**Required for Render:**
```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <your-email@gmail.com>
```

**Example:**
```bash
RESEND_API_KEY=re_B6W9ECDE_6hdCVrDd9uEUW9gcMpTjySwa
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Career Master <careermaster@gmail.com>
```

**What recipients will see:**
- **From:** Career Master <careermaster@gmail.com>
- **Sent via:** Resend (reliable, no connection issues)

**Optional (for SMTP fallback - not needed with Resend):**
```bash
# Leave these empty or remove - Resend API is better
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

## Priority Order

The system will use:
1. **Resend API** (if `RESEND_API_KEY` is set) - ✅ Recommended
2. **SMTP** (if `SMTP_USER` and `SMTP_PASS` are set) - Fallback

## Testing Email

After setup, try:
1. Sign up a new user - OTP email should arrive
2. Check Resend dashboard for email logs
3. Visit `/api/test-email` to verify configuration

## Troubleshooting

### "Email service not configured"
- Check if `RESEND_API_KEY` is set in Render
- Make sure there are no extra spaces in the API key
- Redeploy after adding environment variables

### Emails not arriving
- Check Resend dashboard for delivery status: https://resend.com/emails
- Verify `EMAIL_FROM` is set to `onboarding@resend.dev` (for testing without domain)
- Check spam folder
- **For production later:** When you buy a domain, verify it in Resend and update `EMAIL_FROM`

### Using Your Own Domain Later (Future)

When you buy a domain:
1. Go to https://resend.com/domains
2. Add your domain (e.g., `careermaster.ai`)
3. Add DNS records (SPF, DKIM, DMARC) - Resend will show you exactly what to add
4. Once verified, update `EMAIL_FROM` to: `noreply@careermaster.ai`
5. Redeploy - that's it!

### Still using SMTP?
- Remove `SMTP_USER` and `SMTP_PASS` from Render
- Keep only `RESEND_API_KEY`
- Redeploy

## Resend Dashboard

Monitor emails at: https://resend.com/emails

You can see:
- Email delivery status
- Open rates
- Click rates
- Bounce/spam reports

## Cost

- **Free**: 3,000 emails/month
- **Pro**: $20/month for 50,000 emails
- **Business**: Custom pricing

Perfect for most applications!

