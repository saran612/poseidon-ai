from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.core.state import get_system_state
from backend.geospatial.corridor import COIMBATORE_ZONES

router = APIRouter()
state = get_system_state()

# In-memory assignment state storage
_ASSIGNMENTS_STATE: Dict[str, Dict[str, Any]] = {}


def _ensure_assignments_initialized():
    global _ASSIGNMENTS_STATE
    if _ASSIGNMENTS_STATE:
        return

    # Check plans
    plans = state.replanner.plans.get("PLAN-OPERATIONAL-01", [])
    if not plans:
        return

    latest_plan = plans[-1]
    zone_lookup = {z.zone_code: z for z in COIMBATORE_ZONES}

    for idx, alloc in enumerate(latest_plan.allocations, start=1):
        asgn_id = f"ASGN-{alloc.zone_id.replace('ZONE_', '')}-{idx:02d}"
        z_info = zone_lookup.get(alloc.zone_id)
        _ASSIGNMENTS_STATE[asgn_id] = {
            "assignment_id": asgn_id,
            "plan_id": latest_plan.plan_id,
            "version_number": latest_plan.version_number,
            "depot_id": alloc.depot_id,
            "zone_id": alloc.zone_id,
            "zone_name": z_info.name if z_info else alloc.zone_id,
            "resource_type": alloc.resource_type,
            "quantity": alloc.quantity,
            "priority": "HIGH" if idx <= 2 else "MEDIUM",
            "priority_score": 0.88 if idx == 1 else (0.82 if idx == 2 else 0.70),
            "travel_time_min": alloc.travel_time_min,
            "route_nodes": alloc.route_nodes,
            "latitude": z_info.centroid_lat if z_info else 10.9708,
            "longitude": z_info.centroid_lon if z_info else 76.9152,
            "destination": f"{z_info.name if z_info else alloc.zone_id} Incident Relief Sector",
            "status": "DISPATCHED",
            "assigned_to": "Field Unit Alpha",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "acknowledgements": [],
        }


class AcknowledgeRequest(BaseModel):
    device_id: Optional[str] = "DEV-OFFICER-PERUR"
    status: str = "RECEIVED"  # RECEIVED, ACCEPTED, EN_ROUTE, DELIVERED, CANCELLED
    transport: str = "WIFI"   # WIFI, SMS, LORA
    notes: Optional[str] = None


@router.get("/assignments")
async def list_assignments():
    """List all active operational rescue and relief assignments."""
    _ensure_assignments_initialized()
    return {
        "assignments_count": len(_ASSIGNMENTS_STATE),
        "assignments": list(_ASSIGNMENTS_STATE.values()),
    }


@router.get("/assignments/{assignment_id}")
async def get_assignment(assignment_id: str):
    """Retrieve details for a specific rescue assignment."""
    _ensure_assignments_initialized()
    if assignment_id not in _ASSIGNMENTS_STATE:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return _ASSIGNMENTS_STATE[assignment_id]


@router.post("/assignments/{assignment_id}/acknowledge")
async def acknowledge_assignment(assignment_id: str, req: AcknowledgeRequest):
    """Acknowledge or update status of an assignment from a field responder device."""
    _ensure_assignments_initialized()
    if assignment_id not in _ASSIGNMENTS_STATE:
        raise HTTPException(status_code=404, detail="Assignment not found")

    asgn = _ASSIGNMENTS_STATE[assignment_id]
    now_str = datetime.now(timezone.utc).isoformat()

    valid_statuses = {"RECEIVED", "ACCEPTED", "EN_ROUTE", "DELIVERED", "CANCELLED"}
    new_status = req.status.upper().strip()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    asgn["status"] = new_status
    ack_entry = {
        "device_id": req.device_id,
        "status": new_status,
        "transport": req.transport,
        "notes": req.notes,
        "acknowledged_at": now_str,
    }
    asgn["acknowledgements"].append(ack_entry)

    return {
        "status": "ACKNOWLEDGED",
        "assignment_id": assignment_id,
        "current_status": new_status,
        "server_received_at": now_str,
        "acknowledgement": ack_entry,
    }
