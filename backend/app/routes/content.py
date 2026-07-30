from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.content import Content
from app.schemas.content import ContentGenerateRequest
from app.services.content_engine import generate_content
from app.utils import get_current_user

router = APIRouter(prefix="/api/content", tags=["content"])


@router.post("/generate")
async def generate(
    req: ContentGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    body = await generate_content(req.content_type, req.source_project, req.topic, req.tone)
    
    content = Content(
        user_id=user.id, content_type=req.content_type,
        title=req.topic or f"{req.content_type} about {req.source_project}",
        body=body, status="draft", source_project=req.source_project
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    
    return {"id": content.id, "content": body, "type": req.content_type}


@router.get("/history")
def list_content(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Content).filter(
        Content.user_id == user.id
    ).order_by(Content.created_at.desc()).limit(50).all()
    return [
        {
            "id": c.id, "type": c.content_type, "title": c.title,
            "status": c.status, "source_project": c.source_project,
            "body_preview": c.body[:150] if c.body else "",
            "created_at": c.created_at.isoformat()
        }
        for c in items
    ]


@router.get("/{content_id}")
def get_content(content_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Content).filter(
        Content.id == content_id, Content.user_id == user.id
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": c.id, "type": c.content_type, "title": c.title,
        "body": c.body, "status": c.status, "source_project": c.source_project,
        "created_at": c.created_at.isoformat()
    }


@router.put("/{content_id}/status")
def update_status(content_id: int, status: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Content).filter(
        Content.id == content_id, Content.user_id == user.id
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    c.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}
