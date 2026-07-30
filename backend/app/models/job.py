from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, default="")
    description = Column(Text, default="")
    url = Column(String, default="")
    source = Column(String, default="")  # indeed, linkedin, google, etc.
    salary_min = Column(Float, default=0)
    salary_max = Column(Float, default=0)
    salary_currency = Column(String, default="USD")
    match_score = Column(Float, default=0)
    is_applied = Column(Boolean, default=False)
    raw_data = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
