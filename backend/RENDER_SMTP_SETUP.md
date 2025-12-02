# SMTP Configuration for Render

## Problem
SMTP connection timeout error on Render deployment. This happens when:
- SMTP credentials are not set in Render environment variables
- SMTP server is not accessible from Render's network
- Connection timeout settings are too short

## Solution: Configure SMTP in Render

### Step 1: Go to Render Dashboard
1. Navigate to your backend service on Render
2. Click on **Environment** tab
3. Add the following environment variables:

### Step 2: Add SMTP Environment Variables

Add these variables in Render:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Career Master
```

### Step 3: For Gmail Users

If using Gmail, you need to:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Career Master" as the name
   - Copy the 16-character password
   - Use this as `SMTP_PASS` (not your regular Gmail password)

3. **Gmail SMTP Settings**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

### Step 4: Alternative Email Services

#### Option 1: SendGrid (Recommended for Production)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Career Master
```

#### Option 2: Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Career Master
```

#### Option 3: AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Career Master
```

### Step 5: Test Configuration

After adding environment variables:

1. **Redeploy** your service on Render
2. Check the logs - you should see:
   - `✅ SMTP server is ready to send emails` (if working)
   - `⚠️  SMTP verification failed` (if not working, but server continues)

### Step 6: Disable Email (Temporary)

If you don't need email functionality right now, you can:

1. Leave `SMTP_USER` and `SMTP_PASS` empty
2. The server will log a warning but continue running
3. Email features will be disabled until SMTP is configured

## Current Status

The code has been updated to:
- ✅ Not block server startup if SMTP fails
- ✅ Show warnings instead of errors
- ✅ Continue running even if email is unavailable
- ✅ Add connection timeout settings

## Important Notes

- **Gmail**: Requires App Password (not regular password)
- **Production**: Use a dedicated email service (SendGrid, Mailgun, AWS SES)
- **Security**: Never commit SMTP credentials to git
- **Testing**: Email verification will fail if SMTP is not configured, but other features work

## Troubleshooting

### Connection Timeout
- Check if SMTP host/port is correct
- Verify firewall allows outbound connections
- Try different SMTP port (587 vs 465)

### Authentication Failed
- Verify SMTP_USER and SMTP_PASS are correct
- For Gmail, ensure you're using App Password
- Check if account has 2FA enabled (required for Gmail)

### Still Not Working?
1. Check Render logs for detailed error messages
2. Verify all environment variables are set correctly
3. Try testing with a different email service
4. Contact support if using a custom SMTP server

