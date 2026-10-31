from fastapi import APIRouter
from poseidon.api.v1.endpoints import (
    health,
    devices,
    evidence,
    situation,
    relief,
    replanning,
    simulation,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(devices.router, tags=["Devices"])
api_router.include_router(evidence.router, tags=["Evidence & Ingestion"])
api_router.include_router(situation.router, tags=["Situation & Prioritization"])
api_router.include_router(relief.router, tags=["Relief Optimization"])
api_router.include_router(replanning.router, tags=["Cascading Replanning"])
api_router.include_router(simulation.router, tags=["Demonstration & Simulation"])
