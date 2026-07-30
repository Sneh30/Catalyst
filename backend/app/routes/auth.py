from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserUpdate
from app.utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=req.email, password_hash=hash_password(req.password), name=req.name)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name}
    )


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "headline": user.headline}
    )


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id, "email": user.email, "name": user.name,
        "headline": user.headline, "about": user.about, "skills": user.skills,
        "github_username": user.github_username, "linkedin_url": user.linkedin_url,
        "portfolio_url": user.portfolio_url, "resume_text": user.resume_text,
        "min_salary_expectation": user.min_salary_expectation,
    }


@router.put("/me")
def update_me(req: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    return {"message": "Updated"}
