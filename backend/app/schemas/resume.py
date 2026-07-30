from pydantic import BaseModel


class ResumeUpload(BaseModel):
    content: str
    title: str = "Primary Resume"


class ResumeAuditResponse(BaseModel):
    score: float
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    ats_analysis: dict


class GenerateResumeRequest(BaseModel):
    job_id: int
    job_description: str
    job_title: str
    company: str
