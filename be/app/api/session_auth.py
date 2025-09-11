from fastapi import APIRouter, HTTPException, Depends, Response, Request
from app.core.clerk_auth import clerk_auth
from app.core.session_auth import session_auth, get_current_user_from_session, get_session_user
from app.core.csrf import csrf_protect
from app.core.database import prisma
from app.models.user import UserProfileCreate, UserProfile, UserProfileUpdate
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    clerk_token: str

class LoginResponse(BaseModel):
    session_token: str
    user_profile: Optional[UserProfile] = None
    needs_profile: bool = False

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response):
    """Login with Clerk token and create session"""
    try:
        print(f"🔐 LOGIN: Received token, length: {len(request.clerk_token)}")
        # Verify the Clerk JWT token
        payload = clerk_auth.verify_token(request.clerk_token)
        print(f"🔐 LOGIN: Token verified, payload: {payload}")
        
        user_id = payload.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
        
        print(f"🔐 LOGIN: User ID: {user_id}")
        
        # Check if user has a profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": user_id}
        )
        print(f"🔐 LOGIN: Existing profile: {user_profile}")
        
        # Create session with or without profile
        session_token = await session_auth.create_session(user_id, user_profile)
        print(f"🔐 LOGIN: Session created: {session_token}")

        # Set secure HttpOnly cookie for session
        secure_cookie = settings.environment.lower() == "production"
        same_site = "none" if secure_cookie else "lax"
        response.set_cookie(
            key="session",
            value=session_token,
            httponly=True,
            secure=secure_cookie,
            samesite=same_site,
            path="/",
        )

        # Set CSRF token cookie (readable by JS for double-submit header)
        import uuid
        csrf_token = uuid.uuid4().hex
        response.set_cookie(
            key="csrf",
            value=csrf_token,
            httponly=False,
            secure=secure_cookie,
            samesite="lax",
            path="/",
        )

        return LoginResponse(
            session_token=session_token,
            user_profile=user_profile,
            needs_profile=not bool(user_profile)
        )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

@router.post("/profile", response_model=UserProfile)
async def create_user_profile(
    profile_data: UserProfileCreate,
    current_user = Depends(get_session_user),
    # _csrf = Depends(csrf_protect),  # Temporarily disabled for debugging
):
    """Create user profile after authentication"""
    try:
        print(f"📋 CREATE PROFILE: User from session: {current_user}")
        print(f"📋 CREATE PROFILE: Profile data: {profile_data}")
        
        # Check if profile already exists
        existing_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )
        print(f"📋 CREATE PROFILE: Existing profile check: {existing_profile}")
        if existing_profile:
            print(f"📋 CREATE PROFILE: Profile already exists, updating instead of creating new one")
            # Update existing profile instead of creating new one
            profile_dict = profile_data.model_dump(by_alias=True)
            user_profile = await prisma.userprofile.update(
                where={"userId": current_user["id"]},
                data={
                    "role": profile_data.role.value,
                    "name": profile_data.name,
                    "email": profile_data.email,
                    "phone": profile_data.phone,
                    "locationState": profile_dict.get("locationState"),
                    "locationCity": profile_dict.get("locationCity"),
                    "skills": profile_data.skills or [],
                    "resumeUrl": profile_dict.get("resumeUrl"),
                    "companyName": profile_dict.get("companyName"),
                    "companyDescription": profile_dict.get("companyDescription"),
                },
                include={"locationStateRef": True}
            )
            
            # Convert to dict and add state name
            profile_dict = user_profile.model_dump(by_alias=True)
            if user_profile.locationStateRef:
                profile_dict['locationStateName'] = user_profile.locationStateRef.name
            
            # Update session with new profile
            await session_auth.create_session(current_user["id"], user_profile)
            
            return UserProfile(**profile_dict)
        
        # Create user profile in database
        profile_dict = profile_data.model_dump(by_alias=True)
        user_profile = await prisma.userprofile.create(
            data={
                "userId": current_user["id"],
                "role": profile_data.role.value,
                "name": profile_data.name,
                "email": profile_data.email,
                "phone": profile_data.phone,
                "locationState": profile_dict.get("locationState"),
                "locationCity": profile_dict.get("locationCity"),
                "skills": profile_data.skills or [],
                "resumeUrl": profile_dict.get("resumeUrl"),
                "companyName": profile_dict.get("companyName"),
                "companyDescription": profile_dict.get("companyDescription"),
            },
            include={"locationStateRef": True}
        )
        
        # Convert to dict and add state name
        profile_dict = user_profile.model_dump(by_alias=True)
        if user_profile.locationStateRef:
            profile_dict['locationStateName'] = user_profile.locationStateRef.name
        
        # Update session with new profile
        await session_auth.create_session(current_user["id"], user_profile)
        
        return UserProfile(**profile_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user = Depends(get_session_user)):
    """Get current user's profile"""
    print(f"📋 GET PROFILE: Called with user: {current_user}")
    try:
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]},
            include={"locationStateRef": True}
        )
        print(f"📋 GET PROFILE: Profile query result: {user_profile}")
        if not user_profile:
            print(f"📋 GET PROFILE: No profile found for user {current_user['id']}")
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Convert to dict and add state name
        profile_dict = user_profile.model_dump(by_alias=True)
        if user_profile.locationStateRef:
            profile_dict['locationStateName'] = user_profile.locationStateRef.name
        
        return UserProfile(**profile_dict)
    except HTTPException:
        raise
    except Exception as e:
        print(f"📋 GET PROFILE: Exception: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user = Depends(get_session_user),
    # _csrf = Depends(csrf_protect),  # Temporarily disabled for debugging
):
    """Update current user's profile"""
    print(f"📝 UPDATE PROFILE: User: {current_user}")
    print(f"📝 UPDATE PROFILE: Data received: {profile_data}")
    try:
        # Convert Pydantic model to dict with proper field names using aliases
        profile_dict = profile_data.model_dump(by_alias=True, exclude_unset=True)
        update_data = {k: v for k, v in profile_dict.items() if v is not None}
            
        print(f"📝 UPDATE PROFILE: Data to update: {update_data}")
        
        user_profile = await prisma.userprofile.update(
            where={"userId": current_user["id"]},
            data=update_data,
            include={"locationStateRef": True}
        )
        print(f"📝 UPDATE PROFILE: Updated profile: {user_profile}")
        
        # Convert to dict and add state name
        profile_dict = user_profile.model_dump(by_alias=True)
        if user_profile.locationStateRef:
            profile_dict['locationStateName'] = user_profile.locationStateRef.name
        
        # Update session with new profile
        await session_auth.create_session(current_user["id"], user_profile)
        
        return UserProfile(**profile_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout(request: Request, response: Response, current_user = Depends(get_current_user_from_session)):
    """Logout and invalidate session"""
    try:
        # Clear session cookie and delete session record
        session_id = request.cookies.get("session")
        if session_id:
            try:
                await prisma.session.delete(where={"id": session_id})
            except Exception:
                pass
        response.delete_cookie("session", path="/")
        response.delete_cookie("csrf", path="/")
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

