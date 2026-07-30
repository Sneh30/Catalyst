from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import get_settings
from app.database import engine, Base
from app.models import *
from app.services.opencode_bridge import is_available, get_opencode_path
from pathlib import Path
import os

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
        print("⚠️  opencode not found. AI features will not work.")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "opencode_available": is_available(),
        "opencode_path": get_opencode_path() if is_available() else None,
    }


# Serve frontend static files in production
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Not found"}, status_code=404)
        index = frontend_dist / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return JSONResponse({"detail": "Frontend not built. Run: cd frontend && npm run build"}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
