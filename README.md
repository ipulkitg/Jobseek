# Job Portal Platform

A minimal job board platform connecting blue-collar and white-collar workers with employers in the United States.

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk (frontend) + Cookie sessions (backend, Postgres)
- **Package Manager**: UV (Python), npm (Node.js)

## Quick Start

### Backend
```bash
cd be
uv sync
uv run python seed.py  # Seed initial data
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd fe
npm install
npm start
```

## API Endpoints

- `GET /api/v1/jobs/categories` - Get job categories
- `GET /api/v1/jobs/states` - Get US states
- `GET /api/v1/jobs/` - Get job postings (with filters)
- `POST /api/v1/jobs/` - Create job posting (cookie auth + CSRF in prod)
- `PUT /api/v1/jobs/{job_id}` - Update job posting (cookie auth + CSRF in prod)
- `DELETE /api/v1/jobs/{job_id}` - Delete job posting (cookie auth + CSRF in prod)
- `POST /api/v1/jobs/{job_id}/apply` - Apply to a job (cookie auth + CSRF in prod)
- `GET /api/v1/auth/profile` - Get current user's profile (cookie auth)
- `POST /api/v1/auth/profile` - Create profile (cookie auth + CSRF in prod)
- `PUT /api/v1/auth/profile` - Update profile (cookie auth + CSRF in prod)
- `POST /api/v1/auth/login` - Establish cookie session from Clerk JWT
- `POST /api/v1/auth/logout` - Logout and clear session
- `POST /api/v1/interviews/token` - Mint short-lived JWT for interview rooms

## Features

- User authentication (job seekers & employers)
- Job posting and application management
- Search and filtering by location, category, salary
- US-focused geographic filtering
- Mobile-responsive design

## Environment & Auth

- Frontend uses Clerk hosted components and obtains a Clerk JWT after sign-in.
- Frontend posts that JWT to `/api/v1/auth/login` once to establish a backend `HttpOnly` session cookie.
- Axios is configured with `withCredentials: true` so the cookie is sent automatically.
- Production enables CSRF protection on mutating endpoints via a double-submit cookie.
  - Backend sets a readable `csrf` cookie on login.
  - Frontend must send `X-CSRF-Token: <csrf_cookie_value>` on POST/PUT/DELETE.

### Environment Variables

Create `.env` file in `be/` directory:
```
DATABASE_URL=postgresql://...
environment=development
# For production, set a strong secret used to sign RTC tokens
# INTERVIEW_TOKEN_SECRET=your-strong-secret
```

Notes:
- Set `environment=production` to enforce CSRF and set cookies to `Secure` + `SameSite=None`.
- Frontend requires `REACT_APP_CLERK_PUBLISHABLE_KEY` set in `fe/.env`.
