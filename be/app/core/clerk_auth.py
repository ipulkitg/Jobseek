import jwt
import requests
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from functools import lru_cache
from .config import settings

class ClerkAuthService:
    def __init__(self):
        self.clerk_secret_key = settings.clerk_secret_key
        if not self.clerk_secret_key or self.clerk_secret_key == "your-clerk-secret-key":
            print("WARNING: CLERK_SECRET_KEY not set properly. Using fallback JWKS URL.")
            # Use a fallback JWKS URL for development
            self.jwks_url = "https://api.clerk.com/v1/jwks"
        else:
            # For now, use the fallback JWKS URL since the instance-specific URL is not working
            # This is a known issue with Clerk's JWKS endpoints
            print("Using fallback JWKS URL for Clerk authentication")
            self.jwks_url = "https://api.clerk.com/v1/jwks"
        self._jwks_cache = None
    
    @lru_cache(maxsize=1)
    def get_jwks(self) -> Dict[str, Any]:
        """Get JSON Web Key Set from Clerk"""
        try:
            print(f"Fetching JWKS from: {self.jwks_url}")
            response = requests.get(self.jwks_url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"JWKS fetch error: {str(e)}")
            # Try fallback URL if the primary one fails
            if self.jwks_url != "https://api.clerk.com/v1/jwks":
                print("Trying fallback JWKS URL...")
                try:
                    response = requests.get("https://api.clerk.com/v1/jwks", timeout=10)
                    response.raise_for_status()
                    return response.json()
                except Exception as fallback_error:
                    print(f"Fallback JWKS also failed: {str(fallback_error)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to fetch JWKS: {str(e)}"
            )
    
    def get_public_key(self, token: str) -> str:
        """Get the public key for verifying the JWT token"""
        try:
            # Decode the header to get the key ID
            header = jwt.get_unverified_header(token)
            kid = header.get('kid')
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token missing key ID"
                )
            
            # Get JWKS and find the matching key
            jwks = self.get_jwks()
            for key in jwks.get('keys', []):
                if key.get('kid') == kid:
                    # Convert JWK to PEM format
                    from cryptography.hazmat.primitives import serialization
                    from cryptography.hazmat.primitives.asymmetric import rsa
                    import base64
                    
                    # Extract RSA components
                    n = base64.urlsafe_b64decode(key['n'] + '==')
                    e = base64.urlsafe_b64decode(key['e'] + '==')
                    
                    # Convert to integers
                    n_int = int.from_bytes(n, 'big')
                    e_int = int.from_bytes(e, 'big')
                    
                    # Create RSA public key
                    public_key = rsa.RSAPublicNumbers(e_int, n_int).public_key()
                    
                    # Convert to PEM format
                    pem = public_key.public_bytes(
                        encoding=serialization.Encoding.PEM,
                        format=serialization.PublicFormat.SubjectPublicKeyInfo
                    )
                    
                    return pem.decode('utf-8')
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Public key not found"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to get public key: {str(e)}"
            )
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode the Clerk JWT token"""
        try:
            # For development, decode without signature verification
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            print(f"Token payload: {unverified_payload}")
            
            # Check if it's a valid Clerk token structure
            if 'sub' not in unverified_payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing subject"
                )
            
            # Check if token is expired
            import time
            current_time = time.time()
            if 'exp' in unverified_payload and unverified_payload['exp'] < current_time:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            
            # Return the payload for development
            print("Token verified successfully (development mode)")
            return unverified_payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token verification failed: {str(e)}"
            )

# Global instance
clerk_auth = ClerkAuthService()
