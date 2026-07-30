from pydantic import BaseModel


class ContentGenerateRequest(BaseModel):
    content_type: str  # linkedin_post, blog, twitter_thread, architecture_post
    source_project: str = ""
    topic: str = ""
    tone: str = "professional"
