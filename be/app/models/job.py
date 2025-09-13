from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum

from .user import UserProfile

class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    REVIEWED = "reviewed"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    HIRED = "hired"

class JobPostingBase(BaseModel):
    title: str
    description: str
    requirements: str
    location_state: Optional[str] = Field(None, alias="locationState")
    location_city: Optional[str] = Field(None, alias="locationCity")
    salary_min: Optional[int] = Field(None, alias="salaryMin")
    salary_max: Optional[int] = Field(None, alias="salaryMax")
    category_id: Optional[str] = Field(None, alias="categoryId")

    class Config:
        populate_by_name = True

class JobPostingCreate(JobPostingBase):
    pass

class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location_state: Optional[str] = Field(None, alias="locationState")
    location_city: Optional[str] = Field(None, alias="locationCity")
    salary_min: Optional[int] = Field(None, alias="salaryMin")
    salary_max: Optional[int] = Field(None, alias="salaryMax")
    category_id: Optional[str] = Field(None, alias="categoryId")
    is_active: Optional[bool] = Field(None, alias="isActive")

    class Config:
        populate_by_name = True

class JobPosting(JobPostingBase):
    id: str
    employerId: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    employer: Optional[UserProfile] = None
    category: Optional['JobCategory'] = None
    locationStateRef: Optional['USState'] = None
    _count: Optional[dict] = None

    class Config:
        from_attributes = True

class JobApplicationBase(BaseModel):
    job_posting_id: str
    cover_letter: Optional[str] = None

class JobApplicationCreate(BaseModel):
    cover_letter: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    cover_letter: Optional[str] = None

class JobApplication(BaseModel):
    id: str
    jobPostingId: str
    jobSeekerId: str  
    status: ApplicationStatus
    coverLetter: Optional[str] = None
    appliedAt: datetime
    updatedAt: datetime
    jobPosting: Optional[Any] = None
    jobSeeker: Optional[Any] = None

    class Config:
        from_attributes = True

class JobCategory(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

class USState(BaseModel):
    id: str
    name: str
    abbreviation: str
    createdAt: datetime

    class Config:
        from_attributes = True
