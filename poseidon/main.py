from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from poseidon.core.config import get_settings
from poseidon.core.database import init_db
from poseidon.api.v1.router import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is ready
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Predictive, Offline-First Disaster Intelligence & Autonomous Relief Coordination Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/api/info")
async def api_info():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "We don't just detect disasters. We coordinate the response when everything changes.",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }


# Serve Frontend static assets if built
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
legacy_ui_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ui", "dist")
static_dist = frontend_dist if os.path.exists(frontend_dist) else legacy_ui_dist

if os.path.exists(static_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dist, "assets")), name="assets")

    @app.get("/")
    async def serve_frontend_root(request: Request):
        # If client explicitly asks for JSON, return JSON info
        accept = request.headers.get("accept", "")
        if "application/json" in accept and "text/html" not in accept:
            return await api_info()
        return FileResponse(os.path.join(static_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa_fallback(full_path: str):
        file_path = os.path.join(static_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dist, "index.html"))
else:
    @app.get("/")
    async def root():
        return await api_info()
