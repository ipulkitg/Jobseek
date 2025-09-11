from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database Configuration
    database_url: str = "postgresql://localhost:5432/job_portal_dev"
    
    # Clerk Configuration (for auth)
    clerk_secret_key: str = "your-clerk-secret-key"
    clerk_publishable_key: str = "your-clerk-publishable-key"
    
    # CORS Configuration
    cors_origins: str = "http://localhost:3000"
    
    # Environment
    environment: str = "development"

    # Interview token secret (for RTC room JWTs)
    interview_token_secret: str = "dev-interview-secret"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra environment variables

# Create settings instance
settings = Settings()
