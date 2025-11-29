# CORS Configuration

## Overview
Cross-Origin Resource Sharing (CORS) is configured to allow your frontend to communicate with the backend API securely.

## Current Configuration

### Allowed Origins
By default, the following origins are allowed:
- `http://localhost:3000` (Next.js default)
- `http://localhost:3001` (Alternative port)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `https://career-master-ai.onrender.com` (Production backend)

**Note:** For production, you should set `CORS_ORIGIN` environment variable with your frontend domain(s).

### Configuration Options

**Allowed Methods:**
- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS

**Allowed Headers:**
- Content-Type
- Authorization
- X-Requested-With
- Accept
- Origin

**Credentials:**
- Enabled (`credentials: true`) - Allows cookies and authorization headers

**Preflight Cache:**
- 24 hours (86400 seconds)

## Environment Configuration

### Development
In your `.env` file:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Production
For production, specify your actual frontend domain(s):
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://career-master-ai.onrender.com
```

**For Render Deployment:**
Set in Render's Environment Variables:
```env
CORS_ORIGIN=https://your-frontend-domain.com,http://localhost:3000
```

This allows:
- Your production frontend to access the API
- Local development to continue working

### Multiple Origins
You can specify multiple origins separated by commas:
```env
CORS_ORIGIN=http://localhost:3000,https://staging.example.com,https://example.com
```

## Testing CORS

### Test with curl
```bash
# Test preflight request
curl -X OPTIONS http://localhost:4000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test actual request
curl -X POST http://localhost:4000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v
```

### Test in Browser Console
```javascript
fetch('http://localhost:4000/api/health', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error('CORS Error:', err));
```

## Troubleshooting

### Common CORS Errors

1. **"No 'Access-Control-Allow-Origin' header"**
   - Check if your frontend origin is in the `CORS_ORIGIN` list
   - Verify the origin matches exactly (including protocol and port)

2. **"Credentials flag is true, but Access-Control-Allow-Credentials is not 'true'"**
   - This is already configured correctly in the code
   - Make sure you're sending `credentials: 'include'` in fetch requests

3. **"Preflight request doesn't pass"**
   - Check if the HTTP method is allowed
   - Verify custom headers are in the allowed headers list

### Debugging

Enable CORS logging by checking the server console for CORS-related errors.

## Security Notes

1. **Never use `*` in production** - Always specify exact origins
2. **Use HTTPS in production** - Always use secure origins
3. **Limit origins** - Only add origins you actually need
4. **Credentials** - Only enable when necessary (currently enabled for JWT tokens)

## Updating CORS Configuration

To update CORS settings:

1. Edit `.env` file:
   ```env
   CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
   ```

2. Restart the server:
   ```bash
   npm start
   ```

3. The changes will take effect immediately

