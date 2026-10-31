from fastapi import APIRouter
from backend.api.v1.endpoints import (
    health,
    devices,
    evidence,
    situation,
    relief,
    replanning,
    simulation,
    auth,
    assignments,
    ws,
    external,
    map as map_endpoints,
    ml,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(ml.router, prefix="/ml", tags=["SAHAYA Machine Learning Intelligence"])
api_router.include_router(auth.router, tags=["Authentication & Session"])
api_router.include_router(map_endpoints.router, tags=["Geographic & Spatial Intelligence"])
api_router.include_router(devices.router, tags=["Devices"])
api_router.include_router(evidence.router, tags=["Evidence & Ingestion"])
api_router.include_router(situation.router, tags=["Situation & Prioritization"])
api_router.include_router(relief.router, tags=["Relief Optimization"])
api_router.include_router(replanning.router, tags=["Cascading Replanning"])
api_router.include_router(simulation.router, tags=["Demonstration & Simulation"])
api_router.include_router(assignments.router, tags=["Rescue Assignments"])
api_router.include_router(external.router, tags=["External Disaster Feeds & Facilities"])
api_router.include_router(ws.router, tags=["WebSockets Real-Time"])
