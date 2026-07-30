from sqlalchemy import Column, Integer, String, DateTime, JSON, Date
from sqlalchemy.sql import func
from app.database import Base


class WeeklyProgress(Base):
    __tablename__ = "weekly_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    week_start = Column(Date, nullable=False)
    metrics = Column(JSON, default=dict)
    achievements = Column(JSON, default=list)
    missed_opportunities = Column(JSON, default=list)
    next_week_priorities = Column(JSON, default=list)
    notes = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
