from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import jwt
from app.core.config import settings
from app.api.session_auth import get_current_user_from_session

router = APIRouter()

@router.post("/token")
async def mint_interview_token(
    room_id: str,
    role: str = "participant",
    current_user = Depends(get_current_user_from_session)
):
    """Mint a short-lived JWT for interview rooms (RTC/WebSocket).
    Claims include room, user, role, and a short expiration.
    """
    try:
        if role not in ["participant", "interviewer", "observer"]:
            raise HTTPException(status_code=400, detail="Invalid role")

        now = datetime.utcnow()
        payload = {
            "sub": current_user["id"],
            "room": room_id,
            "role": role,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=5)).timestamp()),
        }
        token = jwt.encode(payload, settings.interview_token_secret, algorithm="HS256")
        return {"token": token}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

