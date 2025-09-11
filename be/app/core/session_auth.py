from fastapi import HTTPException, Request
from app.core.database import prisma
from app.models.user import UserProfile
from typing import Optional
from datetime import datetime, timedelta, timezone

class SessionAuthService:
    def __init__(self):
        pass

    async def create_session(self, user_id: str, profile: Optional[UserProfile]) -> str:
        """Create a persistent session in Postgres and return its id"""
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=14)
        session = await prisma.session.create(
            data={
                "userId": user_id,
                "expiresAt": expires,
            }
        )
        return session.id

    async def get_session(self, session_id: str) -> Optional[dict]:
        """Get session from Postgres"""
        session = await prisma.session.find_unique(where={"id": session_id})
        if not session:
            return None
        # Expired?
        now = datetime.now(timezone.utc)
        if session.expiresAt and session.expiresAt < now:
            return None
        return {"id": session.id, "user_id": session.userId}

    async def get_user_profile_from_session(self, session_id: str) -> Optional[UserProfile]:
        """Get user profile from session"""
        session = await self.get_session(session_id)
        if not session:
            return None
        profile = await prisma.userprofile.find_unique(
            where={"userId": session["user_id"]}
        )
        return profile

    async def verify_session(self, session_id: str) -> dict:
        """Verify session token and return user data"""
        session = await self.get_session(session_id)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")

        profile = await prisma.userprofile.find_unique(
            where={"userId": session["user_id"]}
        )
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        return {"id": session["user_id"], "profile": profile, "role": profile.role}

# Global session service
session_auth = SessionAuthService()

async def get_current_user_from_session(request: Request):
    """Get current user from session cookie"""
    session_id = request.cookies.get("session")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await session_auth.verify_session(session_id)

async def get_session_user(request: Request):
    """Get minimal session user (no profile requirement)."""
    session_id = request.cookies.get("session")
    print(f"DEBUG: Session cookie: {session_id}")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await session_auth.get_session(session_id)
    print(f"DEBUG: Session from DB: {session}")
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    return {"id": session["user_id"]}

