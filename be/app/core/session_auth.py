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
        print(f"🔐 SessionAuth: Looking up session ID: {session_id}")
        session = await prisma.session.find_unique(where={"id": session_id})
        print(f"🔐 SessionAuth: Session found: {session}")
        if not session:
            print(f"❌ SessionAuth: No session found for ID: {session_id}")
            return None
        # Expired?
        now = datetime.now(timezone.utc)
        if session.expiresAt and session.expiresAt < now:
            print(f"❌ SessionAuth: Session expired: {session.expiresAt} < {now}")
            return None
        print(f"✅ SessionAuth: Valid session found for user: {session.userId}")
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
        print(f"🔍 SessionAuth.verify_session: Starting verification for session: {session_id}")
        session = await self.get_session(session_id)
        if not session:
            print(f"❌ SessionAuth.verify_session: Invalid session: {session_id}")
            raise HTTPException(status_code=401, detail="Invalid session")

        print(f"🔍 SessionAuth.verify_session: Valid session, looking up profile for user: {session['user_id']}")
        profile = await prisma.userprofile.find_unique(
            where={"userId": session["user_id"]}
        )
        print(f"🔍 SessionAuth.verify_session: Profile lookup result: {profile}")
        if not profile:
            print(f"❌ SessionAuth.verify_session: No profile found for user: {session['user_id']}")
            raise HTTPException(status_code=404, detail="User profile not found")

        print(f"✅ SessionAuth.verify_session: Successfully verified session for user: {session['user_id']}, role: {profile.role}")
        return {"id": session["user_id"], "profile": profile, "role": profile.role}

# Global session service
session_auth = SessionAuthService()

async def get_current_user_from_session(request: Request):
    """Get current user from session cookie"""
    print(f"🍪 get_current_user_from_session: Extracting session from cookies")
    session_id = request.cookies.get("session")
    print(f"🍪 get_current_user_from_session: Session ID: {session_id}")
    if not session_id:
        print(f"❌ get_current_user_from_session: No session cookie found")
        raise HTTPException(status_code=401, detail="Not authenticated")
    print(f"🍪 get_current_user_from_session: Verifying session...")
    result = await session_auth.verify_session(session_id)
    print(f"✅ get_current_user_from_session: Session verified successfully: {result}")
    return result

async def get_session_user(request: Request):
    """Get minimal session user (no profile requirement)."""
    print(f"👤 get_session_user: Extracting session from cookies")
    session_id = request.cookies.get("session")
    print(f"👤 get_session_user: Session cookie: {session_id}")
    if not session_id:
        print(f"❌ get_session_user: No session cookie found")
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await session_auth.get_session(session_id)
    print(f"👤 get_session_user: Session from DB: {session}")
    if not session:
        print(f"❌ get_session_user: Invalid or expired session")
        raise HTTPException(status_code=401, detail="Invalid session")
    print(f"✅ get_session_user: Successfully retrieved user ID: {session['user_id']}")
    return {"id": session["user_id"]}


