# Career Master AI

A comprehensive learning management system with authentication, quizzes, and user management.

## Features

- ✅ User authentication and authorization (Signup, Login, OTP verification)
- ✅ Role-based access control (RBAC) with permissions
- ✅ Quiz management system with Excel upload
- ✅ Batch management for students
- ✅ User dashboard with performance analytics
- ✅ Admin panel for managing quizzes, batches, and users
- ✅ Quiz attempts tracking with scoring
- ✅ Dynamic dashboard with real-time statistics

## Tech Stack

### Backend
- **Runtime:** Node.js, Express
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (Access & Refresh tokens)
- **Validation:** Zod
- **Email:** Nodemailer (Gmail SMTP)
- **File Upload:** Multer
- **Excel Parsing:** XLSX

### Frontend
- **Framework:** Next.js 16, React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Chart.js, react-chartjs-2
- **Notifications:** react-hot-toast

## Deployment

- **Backend:** [Render](https://career-master-ai.onrender.com)
- **Frontend:** [Vercel](https://career-master-ai.vercel.app)
- **Database:** MongoDB Atlas

## Project Structure

```
career-master/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── roles/         # RBAC module
│   │   ├── quiz/          # Quiz management
│   │   ├── batches/       # Batch management
│   │   ├── user/          # User management
│   │   ├── dashboard/     # Dashboard statistics
│   │   └── ...
│   └── server.js          # Entry point
└── frontend/
    ├── app/               # Next.js app router
    ├── components/        # React components
    ├── contexts/          # React contexts
    └── lib/               # Utilities
```

## Getting Started

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Set NEXT_PUBLIC_API_URL
npm run dev
```

## Environment Variables

See documentation in:
- `backend/CORS_CONFIG.md` - CORS configuration
- `RENDER_ENV_VARS.md` - Render deployment variables
- `VERCEL_DEPLOYMENT.md` - Vercel deployment guide

\

- `/api/auth` - Authentication endpoints
- `/api/roles` - Role management
- `/api/quizzes` - Quiz CRUD operations
- `/api/batches` - Batch management
- `/api/users` - User management
- `/api/dashboard` - Dashboard statistics

## License

ISC

