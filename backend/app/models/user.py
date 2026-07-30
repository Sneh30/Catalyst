from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    headline = Column(String, default="")
    about = Column(Text, default="")
    skills = Column(Text, default="")
    resume_text = Column(Text, default="")
    github_username = Column(String, default="")
    linkedin_url = Column(String, default="")
    portfolio_url = Column(String, default="")
    min_salary_expectation = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
