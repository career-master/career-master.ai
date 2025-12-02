# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in the Career Master application.

## What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- Image upload and storage
- Automatic image optimization
- Image transformations (resize, crop, format conversion)
- CDN delivery for fast image loading
- Free tier with generous limits

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up"** (it's free!)
3. Fill in your details:
   - Email address
   - Password
   - Company/Project name (optional)
4. Verify your email address

## Step 2: Get Your Credentials

After signing up, you'll be taken to your Dashboard. Here's what you need:

### Finding Your Credentials:

1. **Cloud Name**: 
   - Located at the top of your dashboard
   - Example: `dxyz12345`
   - Format: Usually starts with a letter followed by numbers

2. **API Key**:
   - Found in the "Account Details" section
   - Example: `123456789012345`
   - Format: Long numeric string

3. **API Secret**:
   - Found in the "Account Details" section
   - Click "Reveal" to show it (keep this secret!)
   - Example: `abcdefghijklmnopqrstuvwxyz123456`
   - Format: Long alphanumeric string

### Dashboard Location:
- Go to: [https://cloudinary.com/console](https://cloudinary.com/console)
- Your credentials are displayed in the "Account Details" section

## Step 3: Add Credentials to .env File

1. Open or create `.env` file in the `backend` directory
2. Add the following lines with your actual values:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

### Example (DO NOT use these - get your own!):

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dxyz12345
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 4: Verify Setup

1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the upload functionality:
   - Go to Admin → Create Quiz
   - Add an "Image Based" question
   - Try uploading an image
   - If successful, you'll see the image URL from Cloudinary

## Environment Variable Format

### Cloud Name
- **Format**: Alphanumeric string
- **Example**: `dxyz12345`, `my-cloud-name`
- **Length**: Usually 8-15 characters
- **No spaces or special characters**

### API Key
- **Format**: Numeric string
- **Example**: `123456789012345`
- **Length**: Usually 15-20 digits
- **Numbers only**

### API Secret
- **Format**: Alphanumeric string
- **Example**: `abcdefghijklmnopqrstuvwxyz123456`
- **Length**: Usually 30-40 characters
- **Mix of letters and numbers**
- **Keep this SECRET!**

## Complete .env Example

Here's a complete example of how your `.env` file should look:

```env
# Server
NODE_ENV=development
PORT=4000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/career-master

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=dxyz12345
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## Security Best Practices

1. **Never commit `.env` to Git**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Use different credentials for development and production**
   - Development: Your personal Cloudinary account
   - Production: Separate Cloudinary account or sub-account

3. **Keep API Secret secure**
   - Never share it publicly
   - Don't log it in console
   - Rotate it if compromised

4. **Set up upload restrictions in Cloudinary**
   - Go to Settings → Security
   - Enable signed uploads for production
   - Set upload presets with size/format limits

## Troubleshooting

### Error: "Cloudinary configuration is missing"
- **Solution**: Make sure all three Cloudinary variables are set in `.env`
- **Check**: Restart the server after adding variables

### Error: "Invalid API key or secret"
- **Solution**: Double-check your credentials from Cloudinary dashboard
- **Check**: Make sure there are no extra spaces in the values

### Images not uploading
- **Check**: Cloudinary credentials are correct
- **Check**: Internet connection
- **Check**: File size (max 10MB)
- **Check**: File format (JPG, PNG, GIF, WebP supported)

### Images not displaying
- **Check**: Image URL is correct (should start with `https://res.cloudinary.com/`)
- **Check**: CORS settings in Cloudinary (if needed)
- **Check**: Browser console for errors

## Free Tier Limits

Cloudinary's free tier includes:
- **25 GB storage**
- **25 GB monthly bandwidth**
- **25,000 monthly transformations**
- **Unlimited uploads**

This is usually sufficient for development and small to medium applications.

## Production Setup

For production environments (Render, Vercel, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Never hardcode credentials in code

## Support

- Cloudinary Documentation: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- Cloudinary Support: [https://support.cloudinary.com](https://support.cloudinary.com)
- Cloudinary Dashboard: [https://cloudinary.com/console](https://cloudinary.com/console)

## Quick Reference

```env
# Format in .env file:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Where to get them:
# https://cloudinary.com/console → Account Details

# Example values (format only):
CLOUDINARY_CLOUD_NAME=dxyz12345
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

