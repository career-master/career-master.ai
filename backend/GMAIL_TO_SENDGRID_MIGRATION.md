# Migrate from Gmail to SendGrid (Recommended for Render)

## Problem
Gmail SMTP often blocks connections from cloud providers like Render due to:
- IP reputation issues
- "Less secure app" restrictions
- Network firewall policies
- Rate limiting

## Solution: Use SendGrid (Free Tier Available)

SendGrid is designed for cloud applications and works reliably on Render.

### Step 1: Sign Up for SendGrid

1. Go to https://sendgrid.com/
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### Step 2: Create API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: "Career Master Render"
4. Select **Full Access** (or **Mail Send** permissions)
5. Click **Create & View**
6. **Copy the API key immediately** (you won't see it again!)

### Step 3: Update Render Environment Variables

Go to **Render Dashboard → Your Service → Environment** and update:

**Remove/Update these:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key-here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Career Master
```

**Important:**
- `SMTP_USER` must be exactly `apikey` (not your SendGrid username)
- `SMTP_PASS` is your SendGrid API key (starts with `SG.`)
- `EMAIL_FROM` should be a verified sender in SendGrid

### Step 4: Verify Sender in SendGrid

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details
4. Verify the email sent to your address
5. Use this verified email as `EMAIL_FROM`

### Step 5: Redeploy

1. Save environment variables in Render
2. Redeploy your service
3. Check logs - should see: `✅ SMTP server is ready to send emails`

### Alternative: Mailgun

If you prefer Mailgun:

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Career Master
```

### Alternative: AWS SES

For AWS SES:

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Career Master
```

## Why SendGrid?

✅ **Designed for cloud** - Works reliably on Render, Vercel, etc.
✅ **Free tier** - 100 emails/day free
✅ **Better deliverability** - Professional email infrastructure
✅ **No IP blocking** - Unlike Gmail
✅ **Easy setup** - Just API key, no app passwords needed
✅ **Analytics** - Track email delivery and opens

## Testing

After switching to SendGrid:

1. Visit: `https://career-master-ai.onrender.com/api/test-smtp`
2. Should show: `"smtpWorking": true`
3. Try signing up - OTP email should arrive

## Cost Comparison

- **Gmail**: Free but unreliable on cloud
- **SendGrid**: Free (100/day), $15/month (40k emails)
- **Mailgun**: Free (5k/month), $35/month (50k emails)
- **AWS SES**: $0.10 per 1,000 emails

For production, SendGrid is the best balance of cost and reliability.

