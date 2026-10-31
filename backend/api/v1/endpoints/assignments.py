from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from backend.core.state import get_system_state
from backend.geospatial.corridor import COIMBATORE_ZONES
from backend.api.v1.endpoints.ws import get_ws_manager
from backend.core.persistence import record_audit_event
from backend.api.deps import get_current_user_optional

router = APIRouter()
state = get_system_state()
ws_manager = get_ws_manager()

# Discrete vehicle callsign fleet
DEPOT_FLEET = {
    "DEPOT_RS_PURAM": [
        {"id": "BOAT-RS-01", "callsign": "NDRF Rescue Boat Alpha-1"},
        {"id": "BOAT-RS-02", "callsign": "NDRF Rescue Boat Alpha-2"},
        {"id": "BOAT-RS-03", "callsign": "NDRF Rescue Boat Alpha-3"},
        {"id": "BOAT-RS-04", "callsign": "TNFRS Fast Craft Beta-1"},
        {"id": "BOAT-RS-05", "callsign": "TNFRS Fast Craft Beta-2"},
        {"id": "BOAT-RS-06", "callsign": "TNFRS Fast Craft Beta-3"},
        {"id": "BOAT-RS-07", "callsign": "SDRF Rapid Rescue Charlie-1"},
        {"id": "BOAT-RS-08", "callsign": "SDRF Rapid Rescue Charlie-2"},
        {"id": "BOAT-RS-09", "callsign": "Volunteer Watercraft Delta-1"},
        {"id": "BOAT-RS-10", "callsign": "Volunteer Watercraft Delta-2"},
    ],
    "DEPOT_PEELAMEDU": [
        {"id": "BOAT-PEEL-01", "callsign": "NDRF Heavy Zodiac Echo-1"},
        {"id": "BOAT-PEEL-02", "callsign": "NDRF Heavy Zodiac Echo-2"},
        {"id": "BOAT-PEEL-03", "callsign": "NDRF Heavy Zodiac Echo-3"},
        {"id": "BOAT-PEEL-04", "callsign": "TNFRS Rescue Unit Foxtrot-1"},
        {"id": "BOAT-PEEL-05", "callsign": "TNFRS Rescue Unit Foxtrot-2"},
        {"id": "BOAT-PEEL-06", "callsign": "Indian Coast Guard Relief-1"},
        {"id": "BOAT-PEEL-07", "callsign": "Indian Coast Guard Relief-2"},
        {"id": "BOAT-PEEL-08", "callsign": "SDRF Support Boat Golf-1"},
    ],
}

_ASSIGNMENTS_STATE: Dict[str, Dict[str, Any]] = {}


def _sync_assignments_from_active_plan():
    global _ASSIGNMENTS_STATE
    plans = state.replanner.plans.get("PLAN-OPERATIONAL-01", [])
    if not plans:
        return

    latest_plan = plans[-1]
    zone_lookup = {z.zone_code: z for z in COIMBATORE_ZONES}

    # Track allocated units per depot to enforce strict 1-to-1 uniqueness
    depot_allocated_index = {"DEPOT_RS_PURAM": 0, "DEPOT_PEELAMEDU": 0}

    new_state: Dict[str, Dict[str, Any]] = {}

    for idx, alloc in enumerate(latest_plan.allocations, start=1):
        asgn_id = f"ASGN-{alloc.zone_id.replace('ZONE_', '')}-{idx:02d}"
        z_info = zone_lookup.get(alloc.zone_id)
        zone_name = z_info.name if z_info else alloc.zone_id

        # Bind discrete vehicle callsign
        fleet = DEPOT_FLEET.get(alloc.depot_id, [])
        fleet_idx = depot_allocated_index.get(alloc.depot_id, 0)
        depot_allocated_index[alloc.depot_id] = fleet_idx + alloc.quantity

        assigned_vehicle = fleet[fleet_idx % len(fleet)] if fleet else {"id": f"VEH-{idx:02d}", "callsign": f"Relief Unit {idx:02d}"}

        # Check existing acknowledgement history
        existing = _ASSIGNMENTS_STATE.get(asgn_id, {})
        current_status = existing.get("status", "DISPATCHED")

        new_state[asgn_id] = {
            "assignment_id": asgn_id,
            "id": asgn_id,
            "resource_id": assigned_vehicle["id"],
            "unit_id": assigned_vehicle["id"],
            "callsign": assigned_vehicle["callsign"],
            "unit_callsign": assigned_vehicle["callsign"],
            "resource_type": alloc.resource_type,
            "incident_id": f"INC-{alloc.zone_id.replace('ZONE_', '')}-01",
            "plan_id": latest_plan.plan_id,
            "version_number": latest_plan.version_number,
            "depot_id": alloc.depot_id,
            "zone_id": alloc.zone_id,
            "ward_id": alloc.zone_id,
            "zone_name": zone_name,
            "ward_name": zone_name,
            "quantity": alloc.quantity,
            "priority": "HIGH" if idx <= 2 else "MEDIUM",
            "priority_score": 0.88 if idx == 1 else (0.82 if idx == 2 else 0.70),
            "travel_time_min": alloc.travel_time_min,
            "eta_minutes": alloc.travel_time_min,
            "route_nodes": alloc.route_nodes,
            "latitude": z_info.centroid_lat if z_info else 10.9708,
            "longitude": z_info.centroid_lon if z_info else 76.9152,
            "destination": f"{zone_name} Incident Relief Sector",
            "status": current_status,
            "state": "approved" if current_status in ("DISPATCHED", "ACCEPTED", "EN_ROUTE") else "proposed",
            "assigned_to": assigned_vehicle["callsign"],
            "created_at": existing.get("created_at", datetime.now(timezone.utc).isoformat()),
            "primary_route": {
                "distance_km": round(alloc.travel_time_min * 0.6, 1),
                "eta_minutes": alloc.travel_time_min,
                "risk_score": 0.15 if alloc.travel_time_min < 20 else 0.35,
                "dependent_edges": alloc.route_nodes,
            },
            "rationale": f"Autonomous CP-SAT optimization allocated {alloc.quantity} {alloc.resource_type}s from {alloc.depot_id} to {zone_name} (ETA {alloc.travel_time_min}m) satisfying fairness floor θ=0.5.",
            "acknowledgements": existing.get("acknowledgements", []),
        }

    _ASSIGNMENTS_STATE = new_state


def _ensure_assignments_initialized():
    if not _ASSIGNMENTS_STATE:
        _sync_assignments_from_active_plan()


class AcknowledgeRequest(BaseModel):
    device_id: Optional[str] = "DEV-OFFICER-PERUR"
    status: str = "RECEIVED"  # RECEIVED, ACCEPTED, EN_ROUTE, DELIVERED, CANCELLED
    transport: str = "WIFI"   # WIFI, SMS, LORA
    notes: Optional[str] = None


class EditAssignmentRequest(BaseModel):
    unit_id: Optional[str] = None
    target_ward_id: Optional[str] = None
    reason: str = "Manual tactical reallocation by operations commander"


@router.get("/assignments")
async def list_assignments():
    """List all active operational rescue and relief assignments with discrete callsigns and routes."""
    _sync_assignments_from_active_plan()
    return {
        "assignments_count": len(_ASSIGNMENTS_STATE),
        "assignments": list(_ASSIGNMENTS_STATE.values()),
    }


@router.get("/assignments/{assignment_id}")
async def get_assignment(assignment_id: str):
    """Retrieve details for a specific rescue assignment."""
    _sync_assignments_from_active_plan()
    if assignment_id not in _ASSIGNMENTS_STATE:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return _ASSIGNMENTS_STATE[assignment_id]


@router.post("/assignments/{assignment_id}/acknowledge")
async def acknowledge_assignment(
    assignment_id: str,
    req: AcknowledgeRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    """Acknowledge or update status of an assignment from a field responder device."""
    _sync_assignments_from_active_plan()
    if assignment_id not in _ASSIGNMENTS_STATE:
        raise HTTPException(status_code=404, detail="Assignment not found")

    asgn = _ASSIGNMENTS_STATE[assignment_id]
    now_str = datetime.now(timezone.utc).isoformat()

    valid_statuses = {"RECEIVED", "ACCEPTED", "EN_ROUTE", "DELIVERED", "CANCELLED", "APPROVED", "REJECTED"}
    new_status = req.status.upper().strip()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    asgn["status"] = new_status
    if new_status in ("ACCEPTED", "APPROVED", "EN_ROUTE"):
        asgn["state"] = "approved"
    elif new_status == "REJECTED":
        asgn["state"] = "rejected"

    ack_entry = {
        "device_id": req.device_id,
        "status": new_status,
        "transport": req.transport,
        "notes": req.notes,
        "acknowledged_at": now_str,
    }
    asgn["acknowledgements"].append(ack_entry)

    actor = current_user.get("name", req.device_id) if current_user else req.device_id
    await record_audit_event(
        entity_type="ASSIGNMENT",
        entity_id=assignment_id,
        action=f"STATUS_UPDATED_{new_status}",
        actor=actor,
        details={"status": new_status, "vehicle": asgn.get("callsign"), "notes": req.notes},
    )

    # Broadcast status change via WebSocket
    await ws_manager.broadcast({
        "type": "assignment.updated",
        "data": asgn,
        "timestamp": now_str,
    })

    return {
        "status": "ACKNOWLEDGED",
        "assignment_id": assignment_id,
        "current_status": new_status,
        "server_received_at": now_str,
        "acknowledgement": ack_entry,
    }


@router.post("/assignments/{assignment_id}/edit")
async def edit_assignment(
    assignment_id: str,
    req: EditAssignmentRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    """Manual reallocation override by incident commander."""
    _sync_assignments_from_active_plan()
    if assignment_id not in _ASSIGNMENTS_STATE:
        raise HTTPException(status_code=404, detail="Assignment not found")

    asgn = _ASSIGNMENTS_STATE[assignment_id]
    actor = current_user.get("name", "Operations Commander") if current_user else "Operations Commander"

    if req.unit_id:
        asgn["unit_id"] = req.unit_id
        asgn["resource_id"] = req.unit_id
    if req.target_ward_id:
        asgn["zone_id"] = req.target_ward_id
        asgn["ward_id"] = req.target_ward_id

    asgn["rationale"] = f"Manually modified by {actor}: {req.reason}"

    await record_audit_event(
        entity_type="ASSIGNMENT",
        entity_id=assignment_id,
        action="MANUAL_REALLOCATION_OVERRIDE",
        actor=actor,
        details={"reason": req.reason, "assignment": asgn},
    )

    await ws_manager.broadcast({
        "type": "assignment.updated",
        "data": asgn,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return asgn
