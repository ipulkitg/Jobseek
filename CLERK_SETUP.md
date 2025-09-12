# Clerk Authentication Setup Guide

## Quick Setup

### 1. Create Clerk Account
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your Keys
1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_`)

### 3. Update Environment Variables

#### Frontend (.env file)
```bash
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here

# Backend API
REACT_APP_API_URL=http://localhost:8000/api/v1
```

#### Backend (.env file)
```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here

# Database
DATABASE_URL=postgresql://localhost:5432/job_portal_dev
```

### 4. Restart Development Servers
```bash
# Frontend
cd fe
npm start

# Backend (in another terminal)
cd be
uv run python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Features Included
- ✅ User registration and login
- ✅ Google OAuth integration
- ✅ Role-based authentication (Job Seeker vs Employer)
- ✅ Profile management
- ✅ JWT token validation
- ✅ Protected routes

## Troubleshooting
- If you see "Missing Publishable Key" error, make sure your `.env` file has the correct key
- Make sure to restart the development server after updating environment variables
- Check that your Clerk application is properly configured in the dashboard

## Next Steps
Once authentication is working, you can:
1. Test the login/signup flow
2. Create user profiles
3. Access protected dashboards
4. Continue with job board features development


