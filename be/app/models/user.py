from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    JOB_SEEKER = "job_seeker"
    EMPLOYER = "employer"

class UserProfileBase(BaseModel):
    role: UserRole
    name: str
    email: str
    phone: Optional[str] = None
    location_state: Optional[str] = Field(None, alias="locationState")
    location_city: Optional[str] = Field(None, alias="locationCity")
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = Field(None, alias="resumeUrl")
    company_name: Optional[str] = Field(None, alias="companyName")
    company_description: Optional[str] = Field(None, alias="companyDescription")

    class Config:
        populate_by_name = True

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location_state: Optional[str] = Field(None, alias="locationState")
    location_city: Optional[str] = Field(None, alias="locationCity")
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = Field(None, alias="resumeUrl")
    company_name: Optional[str] = Field(None, alias="companyName")
    company_description: Optional[str] = Field(None, alias="companyDescription")

    class Config:
        populate_by_name = True

class UserProfile(UserProfileBase):
    id: str
    user_id: str = Field(alias="userId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    location_state_name: Optional[str] = Field(None, alias="locationStateName")

    class Config:
        from_attributes = True
        populate_by_name = True

