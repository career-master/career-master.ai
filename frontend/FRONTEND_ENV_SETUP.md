# Frontend Environment Configuration

## API URL Configuration

Your frontend needs to know where the backend API is located.

### Development
Create `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Production
For production deployment (Vercel, Netlify, etc.), set:

```env
NEXT_PUBLIC_API_URL=https://career-master-ai.onrender.com/api
```

## Setting Up Environment Variables

### For Local Development

1. Create `.env.local` in `frontend/` directory:
   ```bash
   cd frontend
   touch .env.local
   ```

2. Add the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

3. Restart your Next.js dev server

### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://career-master-ai.onrender.com/api`
   - **Environment:** Production, Preview, Development
4. Redeploy your application

### For Production (Netlify)

1. Go to Site settings → Environment variables
2. Add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://career-master-ai.onrender.com/api`
3. Redeploy your site

## Current API Configuration

The frontend uses this configuration in `lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

**Note:** The default fallback is incorrect. Make sure to set `NEXT_PUBLIC_API_URL` in your environment.

## Testing

After setting the environment variable:

1. **Development:** 
   - Backend: `http://localhost:4000`
   - Frontend: `http://localhost:3000`
   - API URL: `http://localhost:4000/api`

2. **Production:**
   - Backend: `https://career-master-ai.onrender.com`
   - Frontend: Your frontend URL
   - API URL: `https://career-master-ai.onrender.com/api`

## CORS Configuration

Make sure your backend CORS_ORIGIN includes your frontend URL:

**Backend (.env or Render Environment):**
```env
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000,https://career-master-ai.onrender.com
```

This allows:
- Your production frontend to make API calls
- Local development to work
- Backend-to-backend communication if needed

