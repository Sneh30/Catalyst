from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserUpdate(BaseModel):
    name: str | None = None
    headline: str | None = None
    about: str | None = None
    skills: str | None = None
    resume_text: str | None = None
    github_username: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    min_salary_expectation: int | None = None
