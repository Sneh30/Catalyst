from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    content_type = Column(String, nullable=False)  # linkedin_post, blog, twitter_thread, architecture_post
    title = Column(String, default="")
    body = Column(Text, default="")
    platform = Column(String, default="")
    status = Column(String, default="draft")  # draft, posted, scheduled
    source_project = Column(String, default="")
    posted_url = Column(String, default="")
    extra_meta = Column("meta", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
