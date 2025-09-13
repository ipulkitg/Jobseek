from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from app.models.job import (
    JobPosting, JobPostingCreate, JobPostingUpdate,
    JobApplication, JobApplicationCreate, JobApplicationUpdate,
    JobCategory, USState
)
from app.core.database import prisma
from app.api.session_auth import get_current_user_from_session as get_current_user
from app.core.csrf import csrf_protect

router = APIRouter()


# Job Categories
@router.get("/categories", response_model=List[JobCategory])
async def get_job_categories():
    """Get all job categories"""
    try:
        categories = await prisma.jobcategory.find_many()
        return categories
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# US States
@router.get("/states", response_model=List[USState])
async def get_us_states():
    """Get all US states"""
    try:
        states = await prisma.usstate.find_many()
        return states
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Job Postings
@router.get("/", response_model=List[JobPosting])
async def get_job_postings(
    category_id: Optional[str] = Query(None),
    state_id: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    salary_min: Optional[int] = Query(None),
    salary_max: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0)
):
    """Get job postings with filters"""
    try:
        # Build where clause
        where_clause = {"isActive": True}
        
        if category_id:
            where_clause["categoryId"] = category_id
        if state_id:
            where_clause["locationState"] = state_id
        if city:
            where_clause["locationCity"] = {"contains": city, "mode": "insensitive"}
        if salary_min:
            where_clause["salaryMin"] = {"gte": salary_min}
        if salary_max:
            where_clause["salaryMax"] = {"lte": salary_max}
        if search:
            where_clause["OR"] = [
                {"title": {"contains": search, "mode": "insensitive"}},
                {"description": {"contains": search, "mode": "insensitive"}}
            ]
        
        job_postings = await prisma.jobposting.find_many(
            where=where_clause,
            include={
                "employer": True,
                "category": True,
                "locationStateRef": True
            }
        )
        # Manual pagination since take/skip might not be supported
        job_postings = job_postings[offset:offset + limit]
        return job_postings
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=JobPosting)
async def create_job_posting(
    job_data: JobPostingCreate,
    current_user = Depends(get_current_user),
    # _csrf = Depends(csrf_protect),  # Temporarily disabled for debugging
):
    """Create a new job posting"""
    try:
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )

        if not user_profile:
            raise HTTPException(status_code=404, detail="Please create an employer profile first to post jobs.")

        if user_profile.role != "employer":
            raise HTTPException(status_code=403, detail="Please create an employer profile first to post jobs.")

        job_posting = await prisma.jobposting.create(
            data={
                "employerId": user_profile.id,
                "title": job_data.title,
                "description": job_data.description,
                "requirements": job_data.requirements,
                "locationState": job_data.location_state,
                "locationCity": job_data.location_city,
                "salaryMin": job_data.salary_min,
                "salaryMax": job_data.salary_max,
                "categoryId": job_data.category_id,
            },
            include={
                "employer": True,
                "category": True,
                "locationStateRef": True
            }
        )
        return job_posting
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/employer", response_model=List[JobPosting])
async def get_employer_job_postings(current_user = Depends(get_current_user)):
    """Get job postings created by the current employer"""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")

        user_id = current_user.get("id") if isinstance(current_user, dict) else getattr(current_user, "id", None)

        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in authentication data")

        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": user_id}
        )

        if not user_profile:
            # Return empty array instead of error - user hasn't created profile yet
            return []

        if user_profile.role != "employer":
            # Return empty array instead of error - user might not have employer role yet
            return []
        
        job_postings = await prisma.jobposting.find_many(
            where={"employerId": user_profile.id},
            include={
                "employer": True,
                "category": True,
                "locationStateRef": True
            }
        )
        # Sort results manually since orderBy is not supported in this Prisma version
        job_postings.sort(key=lambda x: x.createdAt, reverse=True)
        
        # Manually get application counts for each job posting since _count is not supported
        for job_posting in job_postings:
            application_count = await prisma.jobapplication.count(
                where={"jobPostingId": job_posting.id}
            )
            # Add the count as a dictionary to match the frontend expectation
            job_posting._count = {"jobApplications": application_count}

        return job_postings
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Job Applications - moved before /{job_id} to prevent route conflicts
@router.get("/applications")
async def get_user_applications(current_user = Depends(get_current_user)):
    """Get current user's job applications"""
    try:
        # Ensure current_user has the right structure
        user_id = current_user.get("id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
        if not user_id:
            return []

        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": user_id}
        )

        if not user_profile:
            return []

        if user_profile.role != "job_seeker":
            return []

        applications = await prisma.jobapplication.find_many(
            where={"jobSeekerId": user_profile.id},
            include={
                "jobPosting": {
                    "include": {
                        "employer": True,
                        "category": True,
                        "locationStateRef": True
                    }
                }
            }
        )

        return applications
    except HTTPException as e:
        # Don't re-raise, return empty array instead for this endpoint
        return []
    except Exception as e:
        return []

@router.get("/applied-jobs")
async def get_applied_job_ids(current_user = Depends(get_current_user)):
    """Get list of job IDs that the current user has applied to"""
    try:
        # Ensure current_user has the right structure
        user_id = current_user.get("id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
        if not user_id:
            return []

        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": user_id}
        )

        if not user_profile:
            return []

        if user_profile.role != "job_seeker":
            return []

        applications = await prisma.jobapplication.find_many(
            where={"jobSeekerId": user_profile.id},
            select={"jobPostingId": True}
        )

        applied_job_ids = [app.jobPostingId for app in applications]

        return applied_job_ids
    except HTTPException as e:
        # Don't re-raise, return empty array instead for this endpoint
        return []
    except Exception as e:
        return []

@router.get("/{job_id}", response_model=JobPosting)
async def get_job_posting(job_id: str):
    """Get a specific job posting"""
    try:
        job_posting = await prisma.jobposting.find_unique(
            where={"id": job_id},
            include={
                "employer": True,
                "category": True,
                "locationStateRef": True
            }
        )
        if not job_posting:
            raise HTTPException(status_code=404, detail="Job posting not found")
        return job_posting
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{job_id}", response_model=JobPosting)
async def update_job_posting(
    job_id: str,
    job_data: JobPostingUpdate,
    current_user = Depends(get_current_user),
    # _csrf = Depends(csrf_protect),  # Temporarily disabled for debugging
):
    """Update a job posting"""
    try:
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )
        if not user_profile or user_profile.role != "employer":
            raise HTTPException(status_code=403, detail="Only employers can update job postings")
        
        # Check if job posting exists and belongs to user
        job_posting = await prisma.jobposting.find_unique(
            where={"id": job_id}
        )
        if not job_posting or job_posting.employerId != user_profile.id:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        # Update job posting
        updated_job = await prisma.jobposting.update(
            where={"id": job_id},
            data={
                "title": job_data.title or job_posting.title,
                "description": job_data.description or job_posting.description,
                "requirements": job_data.requirements or job_posting.requirements,
                "locationState": job_data.location_state,
                "locationCity": job_data.location_city,
                "salaryMin": job_data.salary_min,
                "salaryMax": job_data.salary_max,
                "categoryId": job_data.category_id,
                "isActive": job_data.is_active if job_data.is_active is not None else job_posting.isActive,
            }
        )
        return updated_job
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{job_id}")
async def delete_job_posting(
    job_id: str,
    current_user = Depends(get_current_user),
    _csrf = Depends(csrf_protect),
):
    """Delete a job posting"""
    try:
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )
        if not user_profile or user_profile.role != "employer":
            raise HTTPException(status_code=403, detail="Only employers can delete job postings")
        
        # Check if job posting exists and belongs to user
        job_posting = await prisma.jobposting.find_unique(
            where={"id": job_id}
        )
        if not job_posting or job_posting.employerId != user_profile.id:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        # Delete job posting
        await prisma.jobposting.delete(where={"id": job_id})
        return {"message": "Job posting deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Job Applications
@router.post("/{job_id}/apply", response_model=JobApplication)
async def apply_to_job(
    job_id: str,
    application_data: JobApplicationCreate,
    current_user = Depends(get_current_user),
    # _csrf = Depends(csrf_protect),  # Temporarily disabled for debugging
):
    """Apply to a job"""
    try:
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )

        if not user_profile or user_profile.role != "job_seeker":
            raise HTTPException(status_code=403, detail="Only job seekers can apply to jobs")

        # Check if job posting exists
        job_posting = await prisma.jobposting.find_unique(
            where={"id": job_id}
        )

        if not job_posting:
            raise HTTPException(status_code=404, detail="Job posting not found")

        # Check if already applied - Use a simpler query approach
        existing_applications = await prisma.jobapplication.find_many(
            where={
                "jobPostingId": job_id,
                "jobSeekerId": user_profile.id
            }
        )

        if existing_applications:
            raise HTTPException(status_code=400, detail="You have already applied to this job posting")

        # Create application
        application = await prisma.jobapplication.create(
            data={
                "jobPostingId": job_id,
                "jobSeekerId": user_profile.id,
                "coverLetter": application_data.cover_letter,
            }
        )
        return application

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/applications/employer", response_model=List[JobApplication])
async def get_employer_applications(current_user = Depends(get_current_user)):
    """Get applications for employer's job postings"""
    try:
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )
        if not user_profile or user_profile.role != "employer":
            raise HTTPException(status_code=403, detail="Only employers can view their applications")
        
        # Get all job postings by this employer  
        job_postings = await prisma.jobposting.find_many(
            where={"employerId": user_profile.id}
        )
        job_posting_ids = [job.id for job in job_postings]
        
        # Get applications for these job postings
        applications = await prisma.jobapplication.find_many(
            where={"jobPostingId": {"in": job_posting_ids}},
            include={
                "jobSeeker": True,
                "jobPosting": {
                    "include": {
                        "category": True,
                        "locationStateRef": True
                    }
                }
            },
        )
        return applications
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/applications/{application_id}", response_model=JobApplication)
async def update_application_status(
    application_id: str,
    application_data: JobApplicationUpdate,
    current_user = Depends(get_current_user),
    _csrf = Depends(csrf_protect),
):
    """Update application status (employers only)"""
    try:
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )
        if not user_profile or user_profile.role != "employer":
            raise HTTPException(status_code=403, detail="Only employers can update application status")
        
        # Check if application exists and belongs to user's job posting
        application = await prisma.jobapplication.find_unique(
            where={"id": application_id},
            include={"jobPosting": True}
        )
        if not application or application.jobPosting.employerId != user_profile.id:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Update application
        updated_application = await prisma.jobapplication.update(
            where={"id": application_id},
            data={
                "status": application_data.status.value if application_data.status else application.status,
                "coverLetter": application_data.cover_letter if application_data.cover_letter else application.coverLetter,
            }
        )
        return updated_application
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
