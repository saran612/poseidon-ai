from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from backend.api.deps import get_db
from backend.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "unhealthy"
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "operational" if db_status == "healthy" else "degraded",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "status": db_status,
            "engine": settings.DATABASE_URL.split("://")[0],
        },
        "mode": "offline-first",
        "geospatial_bounds": {
            "min_lat": settings.GEO_MIN_LAT,
            "max_lat": settings.GEO_MAX_LAT,
            "min_lon": settings.GEO_MIN_LON,
            "max_lon": settings.GEO_MAX_LON,
            "region": "Coimbatore Noyyal Corridor",
        },
    }

