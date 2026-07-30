from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.tracker import WeeklyProgress
from app.services.tracker import get_week_start, generate_weekly_review
from app.utils import get_current_user

router = APIRouter(prefix="/api/tracker", tags=["tracker"])


@router.post("/weekly")
async def create_weekly(
    metrics: dict = {},
    achievements: list = [],
    missed: list = [],
    next_priorities: list = [],
    notes: str = "",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    week_start = get_week_start()
    existing = db.query(WeeklyProgress).filter(
        WeeklyProgress.user_id == user.id,
        WeeklyProgress.week_start == week_start
    ).first()
    
    if existing:
        existing.metrics = metrics
        existing.achievements = achievements
        existing.missed_opportunities = missed
        existing.next_week_priorities = next_priorities
        existing.notes = notes
        db.commit()
        return {"id": existing.id, "message": "Updated"}
    
    wp = WeeklyProgress(
        user_id=user.id, week_start=week_start,
        metrics=metrics, achievements=achievements,
        missed_opportunities=missed, next_week_priorities=next_priorities,
        notes=notes
    )
    db.add(wp)
    db.commit()
    db.refresh(wp)
    return {"id": wp.id, "message": "Created"}


@router.get("/weekly")
def get_weekly(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(WeeklyProgress).filter(
        WeeklyProgress.user_id == user.id
    ).order_by(WeeklyProgress.week_start.desc()).limit(12).all()
    return [
        {
            "id": r.id, "week_start": r.week_start.isoformat(),
            "metrics": r.metrics, "achievements": r.achievements,
            "missed_opportunities": r.missed_opportunities,
            "next_week_priorities": r.next_week_priorities,
            "notes": r.notes, "created_at": r.created_at.isoformat()
        }
        for r in records
    ]


@router.get("/weekly/current")
def get_current_week(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    week_start = get_week_start()
    record = db.query(WeeklyProgress).filter(
        WeeklyProgress.user_id == user.id,
        WeeklyProgress.week_start == week_start
    ).first()
    if not record:
        return {"week_start": week_start.isoformat(), "metrics": {}, "achievements": [], "missed_opportunities": [], "next_week_priorities": [], "notes": ""}
    return {
        "id": record.id, "week_start": record.week_start.isoformat(),
        "metrics": record.metrics, "achievements": record.achievements,
        "missed_opportunities": record.missed_opportunities,
        "next_week_priorities": record.next_week_priorities,
        "notes": record.notes
    }


@router.post("/weekly/review")
async def generate_review(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    week_start = get_week_start()
    record = db.query(WeeklyProgress).filter(
        WeeklyProgress.user_id == user.id,
        WeeklyProgress.week_start == week_start
    ).first()
    
    metrics = record.metrics if record else {}
    achievements = record.achievements if record else []
    missed = record.missed_opportunities if record else []
    
    review = await generate_weekly_review(metrics, achievements, missed)
    return {"review": review}
