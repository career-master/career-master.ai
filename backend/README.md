# Career Master Backend - Complete Auth Module

A production-ready, scalable authentication module built with Node.js, Express, MongoDB, and JWT.

## 🚀 Features

- ✅ Email + Password Signup
- ✅ Email OTP Verification
- ✅ Login with Email + Password
- ✅ JWT Access Token (15 minutes)
- ✅ JWT Refresh Token (7 days)
- ✅ Session Management
- ✅ Forgot Password via Email OTP
- ✅ Reset Password
- ✅ Change Password (Authenticated)
- ✅ Logout (Single Device)
- ✅ Logout All Devices
- ✅ Role-Based Access Control (RBAC)
- ✅ Secure Password Hashing (bcrypt)
- ✅ Input Validation (Zod)
- ✅ Clean Modular Architecture

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.js      # HTTP request/response handlers
│   │   ├── auth.service.js          # Business logic
│   │   ├── auth.repository.js       # Database operations
│   │   ├── auth.routes.js           # API routes
│   │   └── auth.validation.js       # Zod validation schemas
│   ├── user/
│   │   └── users.model.js           # User MongoDB model
│   ├── roles/
│   │   ├── roles.model.js           # Roles MongoDB model
│   │   └── roles.service.js         # Roles business logic
│   ├── sessions/
│   │   └── sessions.model.js        # Sessions MongoDB model
│   ├── otp/
│   │   └── otp_logs.model.js        # OTP logs MongoDB model
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT authentication
│   │   ├── rbac.middleware.js       # Role-based access control
│   │   └── errorHandler.js          # Global error handling
│   ├── utils/
│   │   ├── token.js                 # JWT token utilities
│   │   ├── crypto.js                # Password hashing utilities
│   │   └── email.js                 # Email sending utilities
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── env.js                   # Environment configuration
│   └── app.js                       # Express app setup
├── server.js                        # Server entry point
├── package.json
├── .env.example
└── README.md
```

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   - Set MongoDB connection string
   - Set JWT secrets (use strong random strings in production)
   - Configure SMTP email settings

4. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Start the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Public Endpoints

#### 1. Signup (Send OTP)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email successfully",
  "expiresIn": 600
}
```

#### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "name": "John Doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["student"],
    "verification": {
      "emailVerified": true
    }
  }
}
```

#### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["student"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

#### 4. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
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

#### 5. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, an OTP has been sent",
  "expiresIn": 600
}
```

#### 6. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Protected Endpoints (Require Authentication)

All protected endpoints require the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

#### 7. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 8. Logout (Single Device)
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 9. Logout All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully",
  "devicesLoggedOut": 3
}
```

#### 10. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["student"],
      "status": "active"
    }
  }
}
```

## 🔐 Roles

The system supports the following roles:

- `super_admin` - Full system access
- `technical_admin` - Technical operations
- `content_admin` - Content management
- `institution_admin` - Institution management
- `partner` - Partner access
- `parent` - Parent access
- `subscriber` - Subscriber access
- `student` - Default role for new signups

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Session management
- ✅ OTP expiration (10 minutes)
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ Error handling without information leakage

## 🗄️ Database Collections

### users
- Stores user accounts
- Email unique index
- Status and role indexes

### roles
- Stores role definitions and permissions
- Name unique index

### sessions
- Stores refresh tokens
- TTL index for automatic cleanup

### otp_logs
- Stores OTP generation logs
- TTL index for automatic cleanup

## 🧪 Testing

Example curl commands:

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🤝 Contributing

This is a production-ready auth module. Follow the existing architecture when extending functionality.

## 📄 License

ISC

---

Built with ❤️ using Node.js, Express, MongoDB, and JWT
