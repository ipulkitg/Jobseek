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

# Debug endpoint
@router.get("/debug/user")
async def debug_user_info(current_user = Depends(get_current_user)):
    """Debug endpoint to check user authentication"""
    try:
        print(f"🔍 DEBUG: Current user: {current_user}")
        return {"user": current_user, "status": "authenticated"}
    except Exception as e:
        print(f"❌ DEBUG: Error: {str(e)}")
        return {"error": str(e), "status": "error"}

# Test endpoint without auth
@router.get("/debug/test")
async def debug_test():
    """Debug endpoint without authentication"""
    try:
        print(f"🔍 DEBUG: Test endpoint called")
        applications = await prisma.jobapplication.find_many()
        print(f"🔍 DEBUG: Found {len(applications)} total applications in database")
        return {"total_applications": len(applications), "status": "ok"}
    except Exception as e:
        print(f"❌ DEBUG: Test error: {str(e)}")
        return {"error": str(e), "status": "error"}

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
        print(f"🔍 create_job_posting: Starting job creation for user: {current_user}")
        print(f"🔍 create_job_posting: Job data received: {job_data}")
        
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )
        print(f"🔍 create_job_posting: Found user profile: {user_profile}")
        
        if not user_profile:
            print(f"❌ create_job_posting: No user profile found for user ID: {current_user['id']}")
            raise HTTPException(status_code=404, detail="Please create an employer profile first to post jobs.")
            
        if user_profile.role != "employer":
            print(f"❌ create_job_posting: User role is '{user_profile.role}', not 'employer'")
            raise HTTPException(status_code=403, detail="Please create an employer profile first to post jobs.")
        
        print(f"✅ create_job_posting: User profile validation passed, creating job posting...")
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
        print(f"✅ create_job_posting: Job posting created successfully: {job_posting.id}")
        return job_posting
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ create_job_posting: Unexpected error: {str(e)}")
        print(f"❌ create_job_posting: Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/employer", response_model=List[JobPosting])
async def get_employer_job_postings(current_user = Depends(get_current_user)):
    """Get job postings created by the current employer"""
    try:
        print(f"🔍 get_employer_job_postings: Starting request")
        print(f"🔍 get_employer_job_postings: Current user: {current_user}")
        print(f"🔍 get_employer_job_postings: User type: {type(current_user)}")
        
        if not current_user:
            print(f"❌ get_employer_job_postings: No current user found")
            raise HTTPException(status_code=401, detail="Authentication required")
            
        user_id = current_user.get("id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
        print(f"🔍 get_employer_job_postings: Extracted user ID: {user_id}")
        
        if not user_id:
            print(f"❌ get_employer_job_postings: No user ID found in current_user object")
            raise HTTPException(status_code=401, detail="User ID not found in authentication data")
        
        # Get current user profile
        print(f"🔍 get_employer_job_postings: Looking for user profile with userId: {user_id}")
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": user_id}
        )
        print(f"🔍 get_employer_job_postings: User profile query result: {user_profile}")
        
        if not user_profile:
            print(f"🔍 get_employer_job_postings: No user profile found for user ID: {user_id} - returning empty array")
            # Return empty array instead of error - user hasn't created profile yet
            return []
        
        print(f"🔍 get_employer_job_postings: User profile found - Role: {user_profile.role}, Name: {user_profile.name}")
        
        if user_profile.role != "employer":
            print(f"🔍 get_employer_job_postings: User role is '{user_profile.role}', not 'employer' - returning empty array")
            # Return empty array instead of error - user might not have employer role yet
            return []
        
        print(f"✅ get_employer_job_postings: User validation passed, fetching job postings for profile ID: {user_profile.id}")
        print(f"🔧 DEBUG: About to call prisma.jobposting.find_many (removed orderBy and _count parameters)")
        
        job_postings = await prisma.jobposting.find_many(
            where={"employerId": user_profile.id},
            include={
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
        print(f"✅ get_employer_job_postings: Found {len(job_postings)} job postings")
        for i, job in enumerate(job_postings[:3]):  # Log first 3 jobs for debugging
            print(f"🔍 get_employer_job_postings: Job {i+1}: ID={job.id}, Title='{job.title}', Active={job.isActive}")
            print(f"🔍 get_employer_job_postings: Job {i+1} category: {job.category}")
            print(f"🔍 get_employer_job_postings: Job {i+1} locationStateRef: {job.locationStateRef}")
            print(f"🔍 get_employer_job_postings: Job {i+1} _count: {getattr(job, '_count', 'NOT_SET')}")
        
        return job_postings
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ get_employer_job_postings: Unexpected error: {str(e)}")
        print(f"❌ get_employer_job_postings: Error type: {type(e).__name__}")
        import traceback
        print(f"❌ get_employer_job_postings: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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
        print(f"🔍 apply_to_job: Starting application for job_id: {job_id}")
        print(f"🔍 apply_to_job: Current user: {current_user}")
        print(f"🔍 apply_to_job: Application data: {application_data}")
        
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": current_user["id"]}
        )
        print(f"🔍 apply_to_job: User profile: {user_profile}")
        
        if not user_profile or user_profile.role != "job_seeker":
            print(f"❌ apply_to_job: Invalid user profile or role. Profile: {user_profile}")
            raise HTTPException(status_code=403, detail="Only job seekers can apply to jobs")
        
        # Check if job posting exists
        job_posting = await prisma.jobposting.find_unique(
            where={"id": job_id}
        )
        print(f"🔍 apply_to_job: Job posting: {job_posting}")
        
        if not job_posting:
            print(f"❌ apply_to_job: Job posting not found for ID: {job_id}")
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        # Check if already applied - Use a simpler query approach
        print(f"🔍 apply_to_job: Checking for existing application...")
        existing_applications = await prisma.jobapplication.find_many(
            where={
                "jobPostingId": job_id,
                "jobSeekerId": user_profile.id
            }
        )
        print(f"🔍 apply_to_job: Found existing applications: {len(existing_applications)}")
        
        if existing_applications:
            print(f"❌ apply_to_job: User has already applied to this job")
            raise HTTPException(status_code=400, detail="You have already applied to this job posting")
        
        # Create application
        print(f"✅ apply_to_job: Creating new application...")
        application = await prisma.jobapplication.create(
            data={
                "jobPostingId": job_id,
                "jobSeekerId": user_profile.id,
                "coverLetter": application_data.cover_letter,
            }
        )
        print(f"✅ apply_to_job: Application created successfully: {application.id}")
        return application
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"❌ apply_to_job: Unexpected error: {str(e)}")
        print(f"❌ apply_to_job: Error type: {type(e).__name__}")
        import traceback
        print(f"❌ apply_to_job: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/applications")
async def get_user_applications(current_user = Depends(get_current_user)):
    """Get current user's job applications"""
    try:
        print(f"🔍 get_user_applications: Starting for user: {current_user}")
        
        # Ensure current_user has the right structure
        user_id = current_user.get("id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
        if not user_id:
            print(f"❌ get_user_applications: No user ID found")
            return []
        
        print(f"🔍 get_user_applications: Looking for profile for user_id: {user_id}")
        
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": user_id}
        )
        
        print(f"🔍 get_user_applications: Profile result: {user_profile}")
        
        if not user_profile:
            print(f"🔍 get_user_applications: No profile found, returning empty array")
            return []
        
        if user_profile.role != "job_seeker":
            print(f"🔍 get_user_applications: User role is {user_profile.role}, not job_seeker, returning empty array")
            return []
        
        print(f"🔍 get_user_applications: Fetching applications for job_seeker: {user_profile.id}")
        
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
        
        print(f"✅ get_user_applications: Found {len(applications)} applications")
        return applications
    except HTTPException as e:
        print(f"❌ get_user_applications: HTTPException: {e.detail}")
        # Don't re-raise, return empty array instead for this endpoint
        return []
    except Exception as e:
        print(f"❌ get_user_applications: Unexpected error: {str(e)}")
        print(f"❌ get_user_applications: Error type: {type(e).__name__}")
        import traceback
        print(f"❌ get_user_applications: Traceback: {traceback.format_exc()}")
        return []

@router.get("/applied-jobs")
async def get_applied_job_ids(current_user = Depends(get_current_user)):
    """Get list of job IDs that the current user has applied to"""
    try:
        print(f"🔍 get_applied_job_ids: Starting for user: {current_user}")
        print(f"🔍 get_applied_job_ids: User type: {type(current_user)}")
        
        # Ensure current_user has the right structure
        user_id = current_user.get("id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
        if not user_id:
            print(f"❌ get_applied_job_ids: No user ID found")
            return []
        
        print(f"🔍 get_applied_job_ids: Looking for profile for user_id: {user_id}")
        
        # Get current user profile
        user_profile = await prisma.userprofile.find_unique(
            where={"userId": user_id}
        )
        
        print(f"🔍 get_applied_job_ids: Profile result: {user_profile}")
        
        if not user_profile:
            print(f"🔍 get_applied_job_ids: No profile found, returning empty array")
            return []
        
        if user_profile.role != "job_seeker":
            print(f"🔍 get_applied_job_ids: User role is {user_profile.role}, not job_seeker, returning empty array")
            return []
        
        print(f"🔍 get_applied_job_ids: Fetching applications for job_seeker: {user_profile.id}")
        
        applications = await prisma.jobapplication.find_many(
            where={"jobSeekerId": user_profile.id},
            select={"jobPostingId": True}
        )
        
        applied_job_ids = [app.jobPostingId for app in applications]
        print(f"✅ get_applied_job_ids: Found {len(applied_job_ids)} applied jobs: {applied_job_ids}")
        
        return applied_job_ids
    except HTTPException as e:
        print(f"❌ get_applied_job_ids: HTTPException: {e.detail}")
        # Don't re-raise, return empty array instead for this endpoint
        return []
    except Exception as e:
        print(f"❌ get_applied_job_ids: Unexpected error: {str(e)}")
        print(f"❌ get_applied_job_ids: Error type: {type(e).__name__}")
        import traceback
        print(f"❌ get_applied_job_ids: Traceback: {traceback.format_exc()}")
        return []



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
