from fastapi import Request, HTTPException, status
from .config import settings


async def csrf_protect(request: Request):
    """Simple CSRF protection using double-submit cookie pattern.

    - Enforced only in production to avoid breaking local dev.
    - Requires `X-CSRF-Token` header to match `csrf` cookie.
    - Safe methods are skipped.
    """
    # Skip in non-production environments
    if settings.environment.lower() != "production":
        return

    # Skip safe methods
    if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
        return

    header_token = request.headers.get("x-csrf-token")
    cookie_token = request.cookies.get("csrf")
    if not header_token or not cookie_token or header_token != cookie_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token invalid or missing",
        )

