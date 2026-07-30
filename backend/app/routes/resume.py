from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, GeneratedResume
from app.models.job import Job
from app.schemas.resume import ResumeUpload, GenerateResumeRequest
from app.services.resume_auditor import audit_resume, optimize_for_ats, calculate_match_score
from app.services.resume_generator import generate_ats_resume
from app.utils import get_current_user

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/audit")
async def audit(
    req: ResumeUpload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_text = req.content or user.resume_text
    if not resume_text:
        raise HTTPException(status_code=400, detail="No resume content")
    
    audit_result = await audit_resume(resume_text)
    
    resume = Resume(
        user_id=user.id, title=req.title, content=resume_text,
        ats_score=audit_result.get("score", 0),
        audit_data=audit_result
    )
    db.add(resume)
    db.commit()
    
    return {"audit": audit_result, "resume_id": resume.id}


@router.post("/optimize")
async def optimize(
    req: ResumeUpload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_text = req.content or user.resume_text
    if not resume_text:
        raise HTTPException(status_code=400, detail="No resume content")
    
    # Use user's resume as target job description for standalone optimization
    optimized = await optimize_for_ats(resume_text, "")
    return {"optimized": optimized}


@router.post("/match")
async def match_resume_to_job(
    job_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    resume_text = user.resume_text
    if not resume_text:
        raise HTTPException(status_code=400, detail="No resume saved. Upload one first.")
    
    match_result = await calculate_match_score(resume_text, job.description)
    return match_result


@router.post("/generate")
async def generate(
    req: GenerateResumeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user.resume_text:
        raise HTTPException(status_code=400, detail="No resume saved")
    
    result = await generate_ats_resume(user.resume_text, req.job_title, req.company, req.job_description)
    
    generated = GeneratedResume(
        user_id=user.id, job_id=req.job_id,
        content=result.get("resume", ""),
        job_title=req.job_title, company=req.company,
        match_explanation=result.get("match_explanation", ""),
        ats_score=result.get("ats_score", 0)
    )
    db.add(generated)
    db.commit()
    db.refresh(generated)
    
    return {
        "id": generated.id,
        "resume": generated.content,
        "match_explanation": generated.match_explanation,
        "ats_score": generated.ats_score
    }


@router.get("/generated")
def list_generated(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(GeneratedResume).filter(
        GeneratedResume.user_id == user.id
    ).order_by(GeneratedResume.created_at.desc()).all()
    return [
        {
            "id": r.id, "job_title": r.job_title, "company": r.company,
            "ats_score": r.ats_score, "created_at": r.created_at.isoformat(),
            "is_accepted": r.is_accepted
        }
        for r in resumes
    ]


@router.get("/generated/{resume_id}")
def get_generated(resume_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(GeneratedResume).filter(
        GeneratedResume.id == resume_id, GeneratedResume.user_id == user.id
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": r.id, "content": r.content, "job_title": r.job_title,
        "company": r.company, "match_explanation": r.match_explanation,
        "ats_score": r.ats_score, "is_accepted": r.is_accepted
    }


@router.put("/generated/{resume_id}/accept")
def accept_resume(resume_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(GeneratedResume).filter(
        GeneratedResume.id == resume_id, GeneratedResume.user_id == user.id
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    r.is_accepted = True
    db.commit()
    return {"message": "Accepted"}


@router.get("/history")
def list_resumes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).all()
    return [
        {"id": r.id, "title": r.title, "ats_score": r.ats_score, "created_at": r.created_at.isoformat()}
        for r in resumes
    ]
