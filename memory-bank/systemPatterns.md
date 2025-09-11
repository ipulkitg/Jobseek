# System Patterns

## Architecture Overview
- **Frontend**: React SPA with TypeScript
- **Backend**: FastAPI with async/await patterns
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk Auth with JWT tokens
- **API**: RESTful API with JSON responses

## Key Technical Decisions
- **Prisma ORM**: Chosen over raw SQL for type safety and migrations
- **FastAPI**: Selected for automatic API documentation and async support
- **Clerk**: Used for authentication only, not database operations
- **UV Package Manager**: Python dependency management
- **React Router**: Client-side routing for SPA

## Design Patterns
- **Repository Pattern**: Prisma client abstracts database operations
- **Dependency Injection**: Settings and database client injected into routes
- **Pydantic Models**: Request/response validation and serialization
- **CORS Middleware**: Handles cross-origin requests from frontend
- **Unified Components**: Single ProfileSetup component handles both user roles
- **Role-Based UI**: Conditional rendering based on user role
- **Local Storage**: Temporary role storage for authentication flow

## Component Relationships
```
Frontend (React) 
    ↓ HTTP Requests
Backend (FastAPI)
    ↓ Prisma Client
Database (PostgreSQL)
    ↑ Clerk Auth
Authentication Service
```

## Data Flow
1. **User Registration**: Frontend → Clerk Auth → Backend API → Database
2. **Job Search**: Frontend → Backend API → Prisma → Database
3. **Job Application**: Frontend → Backend API → Prisma → Database
4. **Profile Creation**: Frontend → Backend API → Prisma → Database
5. **Authentication**: JWT tokens validated on each API request
6. **Role-Based Flow**: LocalStorage → Clerk Auth → Profile Setup → Dashboard

## Notes
Clean separation between authentication (Clerk) and data operations (Prisma). API follows RESTful conventions with proper HTTP status codes and error handling. Frontend and backend are fully integrated with working authentication flow and role-based access control. The profile workflow now supports both job seekers and employers with unified components and role-specific UI patterns.
