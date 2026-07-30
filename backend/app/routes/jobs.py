from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.services.job_scout import search_all_sources
from app.services.resume_auditor import calculate_match_score
from app.utils import get_current_user

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/search")
async def search_jobs(
    query: str = Query(..., description="Job search query"),
    location: str = Query("", description="Job location"),
    min_salary: int = Query(0, description="Minimum salary filter"),
    max_results: int = Query(50, description="Max results"),
    user: User = Depends(get_current_user)
):
    jobs = await search_all_sources(query, location, min_salary, max_results)
    return {"jobs": jobs, "count": len(jobs)}


@router.post("/save-batch")
def save_jobs(
    jobs: list[dict],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = []
    for job_data in jobs:
        existing = db.query(Job).filter(
            Job.user_id == user.id,
            Job.title == job_data.get("title", ""),
            Job.company == job_data.get("company", "")
        ).first()
        if not existing:
            new_job = Job(
                user_id=user.id,
                title=job_data.get("title", "Unknown"),
                company=job_data.get("company", "Unknown"),
                location=job_data.get("location", ""),
                description=job_data.get("description", ""),
                url=job_data.get("url", ""),
                source=job_data.get("source", ""),
                salary_min=job_data.get("salary_min", 0),
                salary_max=job_data.get("salary_max", 0),
            )
            db.add(new_job)
            db.flush()
            saved.append({"id": new_job.id, "title": new_job.title, "company": new_job.company})
    
    db.commit()
    return {"saved": len(saved), "jobs": saved}


@router.get("/saved")
def list_saved(
    min_match: float = Query(0, description="Minimum match score"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.user_id == user.id)
    if min_match > 0:
        query = query.filter(Job.match_score >= min_match)
    jobs = query.order_by(Job.match_score.desc()).all()
    return [
        {
            "id": j.id, "title": j.title, "company": j.company,
            "location": j.location, "description": j.description[:200],
            "url": j.url, "source": j.source,
            "salary_min": j.salary_min, "salary_max": j.salary_max,
            "match_score": j.match_score, "is_applied": j.is_applied
        }
        for j in jobs
    ]


@router.post("/{job_id}/match")
async def match_job(
    job_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if not user.resume_text:
        raise HTTPException(status_code=400, detail="Upload resume first")
    
    result = await calculate_match_score(user.resume_text, job.description)
    job.match_score = result.get("match_score", 0)
    db.commit()
    
    return result


@router.put("/{job_id}/apply")
def mark_applied(job_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_applied = True
    db.commit()
    return {"message": "Marked as applied"}
