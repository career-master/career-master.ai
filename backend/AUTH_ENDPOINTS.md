# Authentication API Endpoints

Base URL: `/api/auth`

All endpoints return JSON responses.

---

## 🔓 Public Endpoints (No Authentication Required)

### 1. Signup (Send OTP)
**POST** `/api/auth/signup`

Send OTP to email for account verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to email successfully",
  "expiresIn": 600
}
```

---

### 2. Verify OTP (Create Account)
**POST** `/api/auth/verify-otp`

Verify OTP and create user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe",
  "password": "SecurePass123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "roles": ["student"],
    "verification": {
      "emailVerified": true
    },
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Login
**POST** `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "user@example.com",
      "roles": ["student"],
      "status": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Access Token Expiry:** 15 minutes  
**Refresh Token Expiry:** 7 days

---

### 4. Refresh Token
**POST** `/api/auth/refresh`

Regenerate access and refresh tokens using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tokens regenerated successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

---

### 5. Forgot Password (Send OTP)
**POST** `/api/auth/forgot-password`

Send OTP to email for password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If the email exists, an OTP has been sent",
  "expiresIn": 600
}
```

---

### 6. Reset Password
**POST** `/api/auth/reset-password`

Reset password after verifying OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 7. Logout (Single Device)
**POST** `/api/auth/logout`

Logout from current device using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔒 Protected Endpoints (Require Authentication)

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

### 8. Change Password
**POST** `/api/auth/change-password`

Change password for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 9. Logout All Devices
**POST** `/api/auth/logout-all`

Logout from all devices for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (empty object or omit)
```json
{}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully",
  "devicesLoggedOut": 3
}
```

---

### 10. Get Current User
**GET** `/api/auth/me`

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "user@example.com",
      "roles": ["student"],
      "status": "active",
      "verification": {
        "emailVerified": true
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 📝 Error Responses

All endpoints return consistent error responses:

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Authentication Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "message": "Access token is required"
  }
}
```

**Authorization Error (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "message": "Account is banned or inactive"
  }
}
```

**Not Found Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "User not found"
  }
}
```

**Conflict Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists"
  }
}
```

**Server Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "message": "Internal server error"
  }
}
```

---

## 🔑 Authentication Flow

1. **Signup Flow:**
   - POST `/api/auth/signup` → Receive OTP via email
   - POST `/api/auth/verify-otp` → Create account

2. **Login Flow:**
   - POST `/api/auth/login` → Receive access + refresh tokens
   - Use access token in `Authorization: Bearer <token>` header for protected routes

3. **Token Refresh:**
   - When access token expires (15 min), use POST `/api/auth/refresh` with refresh token
   - Receive new access + refresh tokens

4. **Password Reset Flow:**
   - POST `/api/auth/forgot-password` → Receive OTP via email
   - POST `/api/auth/reset-password` → Reset password with OTP

---

## 📋 Quick Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/signup` | ❌ | Send signup OTP |
| POST | `/verify-otp` | ❌ | Verify OTP & create account |
| POST | `/login` | ❌ | Login with email/password |
| POST | `/refresh` | ❌ | Refresh access token |
| POST | `/forgot-password` | ❌ | Send password reset OTP |
| POST | `/reset-password` | ❌ | Reset password with OTP |
| POST | `/logout` | ❌ | Logout single device |
| POST | `/change-password` | ✅ | Change password |
| POST | `/logout-all` | ✅ | Logout all devices |
| GET | `/me` | ✅ | Get current user |

---

## 🧪 Example cURL Commands

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456","name":"John Doe","password":"SecurePass123!"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

**Note:** Replace `http://localhost:3000` with your actual server URL.

