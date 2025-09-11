from fastapi import APIRouter
from .session_auth import router as auth_router
from .jobs import router as jobs_router
from .interviews import router as interviews_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
api_router.include_router(interviews_router, prefix="/interviews", tags=["interviews"])
