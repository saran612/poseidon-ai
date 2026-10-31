from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from backend.core.state import get_system_state
from backend.optimization.allocator import ZoneDemand

router = APIRouter()
state = get_system_state()


class CustomDemandItem(BaseModel):
    zone_id: str
    name: str
    resource_type: str  # BOAT, MEDICAL_KIT
    requested_units: int
    priority_score: float


class OptimizeRequest(BaseModel):
    fairness_theta: Optional[float] = 0.5
    custom_demands: Optional[List[CustomDemandItem]] = None


@router.post("/relief/optimize")
async def optimize_allocations(req: Optional[OptimizeRequest] = None):
    theta = req.fairness_theta if req and req.fairness_theta is not None else 0.5
    state.optimizer.fairness_theta = theta

    # Use custom demands or derive from current zone prioritization
    if req and req.custom_demands:
        demands = [
            ZoneDemand(
                zone_id=d.zone_id,
                name=d.name,
                resource_type=d.resource_type,
                requested_units=d.requested_units,
                priority_score=d.priority_score,
            )
            for d in req.custom_demands
        ]
    else:
        # Default demands based on Coimbatore zones
        demands = [
            ZoneDemand("ZONE_PERUR", "Perur", "BOAT", 6, priority_score=0.88),
            ZoneDemand("ZONE_SELVAPURAM", "Selvapuram", "BOAT", 5, priority_score=0.75),
            ZoneDemand("ZONE_UKKADAM", "Ukkadam", "BOAT", 8, priority_score=0.82),
            ZoneDemand("ZONE_SINGANALLUR", "Singanallur", "BOAT", 6, priority_score=0.70),
            ZoneDemand("ZONE_ONDIPUDUR", "Ondipudur", "BOAT", 4, priority_score=0.60),
        ]

    # Generate or retrieve baseline plan v1
    v1 = state.replanner.create_initial_plan(
        plan_id="PLAN-OPERATIONAL-01",
        depots=state.depots,
        demands=demands,
    )

    return {
        "plan_id": v1.plan_id,
        "version_number": v1.version_number,
        "status": v1.status,
        "summary": {
            "total_requested": v1.summary.total_requested,
            "total_assigned": v1.summary.total_assigned,
            "total_unmet": v1.summary.total_unmet,
            "solver_status": v1.summary.solver_status,
            "solve_duration_ms": v1.summary.solve_duration_ms,
            "fairness_theta": v1.summary.fairness_theta,
        },
        "allocations": [
            {
                "depot_id": a.depot_id,
                "zone_id": a.zone_id,
                "resource_type": a.resource_type,
                "quantity": a.quantity,
                "travel_time_min": a.travel_time_min,
                "route_nodes": a.route_nodes,
            }
            for a in v1.allocations
        ],
        "underserved_zones": [
            {
                "zone_id": u.zone_id,
                "resource_type": u.resource_type,
                "requested": u.requested,
                "assigned": u.assigned,
                "unmet": u.unmet,
                "reason_code": u.reason_code,
            }
            for u in v1.summary.underserved_zones
        ],
    }

