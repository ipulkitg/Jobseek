# Technical Context

## Technology Stack
- **Frontend:** React with mobile-responsive design
- **Backend:** Python with FastAPI
- **Database & Auth:** Clerk + PostgreSQL
- **Architecture:** Separate frontend and backend services

## Development Environment
- **OS:** macOS (darwin 24.5.0)
- **Shell:** /bin/zsh
- **Workspace:** /Users/pulkitgarg/second/job_port

## Dependencies
### Backend
- **FastAPI**: Web framework with automatic API documentation
- **Prisma**: Type-safe database ORM with migrations
- **Clerk**: Authentication service with JWT tokens
- **Pydantic**: Data validation and serialization
- **UV**: Python package manager

### Frontend
- **React**: UI library with TypeScript
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **Clerk React**: Authentication integration

## Development Setup
- **Backend**: `cd be && uv run python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- **Frontend**: `cd fe && npm start`
- **Database**: Prisma migrations and seeding configured
- **Environment**: `.env` files for both frontend and backend

## Technical Constraints
- US-focused geographic filtering only
- Mobile-responsive design required
- Separate user experiences for job seekers vs employers
- Minimum viable product approach
- No job bookmarking/saving in initial version

## Deployment Strategy
*To be defined as deployment requirements are clarified*

## Notes
Technology stack is fully implemented with React frontend, FastAPI backend, and Clerk for authentication. Database operations use Prisma ORM. Focus on clean separation of concerns, mobile responsiveness, and production-ready code quality.
