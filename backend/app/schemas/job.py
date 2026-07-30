from pydantic import BaseModel


class JobSearchRequest(BaseModel):
    query: str
    location: str = ""
    min_salary: int = 0
    sources: list[str] = ["indeed", "linkedin", "google"]
    max_results: int = 50


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    description: str
    url: str
    source: str
    salary_min: float
    salary_max: float
    match_score: float
