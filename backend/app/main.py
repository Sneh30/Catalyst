from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.models import *
from app.services.opencode_bridge import is_available, get_opencode_path

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import auth, resume, jobs, content, tracker
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(content.router)
app.include_router(tracker.router)


@app.on_event("startup")
async def startup():
    if is_available():
        print(f"✓ opencode found at: {get_opencode_path()}")
    else:
        print("⚠️  opencode not found. AI features (resume audit, content gen, etc.) will not work.")
        print("   Install: curl -fsSL https://opencode.ai/install | sh")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "opencode_available": is_available(),
        "opencode_path": get_opencode_path() if is_available() else None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
