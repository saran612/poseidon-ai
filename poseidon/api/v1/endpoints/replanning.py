from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from poseidon.core.state import get_system_state
from poseidon.optimization.allocator import ZoneDemand

router = APIRouter()
state = get_system_state()


class BridgeClosureRequest(BaseModel):
    plan_id: str = "PLAN-OPERATIONAL-01"
    bridge_id: str  # e.g. "BR-UKKADAM-01" or "BR-PERUR-01"
    closure_reason: str = "Flood water overtopping roadway by 0.9m"
    operator_role: str = "FIELD_COMMANDER"


class ApprovePlanRequest(BaseModel):
    plan_id: str = "PLAN-OPERATIONAL-01"
    version_number: int
    operator_id: str = "DISTRICT_COLLECTOR"


@router.get("/replanning/plans/{plan_id}")
async def get_plan_history(plan_id: str):
    versions = state.replanner.plans.get(plan_id, [])
    if not versions:
        raise HTTPException(status_code=404, detail="Plan not found")

    return {
        "plan_id": plan_id,
        "versions_count": len(versions),
        "versions": [
            {
                "version_number": v.version_number,
                "status": v.status,
                "trigger_event": v.trigger_event,
                "trigger_description": v.trigger_description,
                "total_assigned": v.summary.total_assigned,
                "total_unmet": v.summary.total_unmet,
                "approved_by": v.approved_by,
                "approved_at": v.approved_at.isoformat() if v.approved_at else None,
                "diff": {
                    "old_version": v.diff.old_version_number,
                    "new_version": v.diff.new_version_number,
                    "cancelled_count": len(v.diff.cancelled_assignments),
                    "rerouted_count": len(v.diff.rerouted_assignments),
                    "new_count": len(v.diff.new_assignments),
                    "unmet_delta": v.diff.unmet_demand_delta,
                    "summary": v.diff.explanation_summary,
                } if v.diff else None,
            }
            for v in versions
        ],
    }


@router.post("/replanning/close-bridge")
async def close_bridge_and_replan(req: BridgeClosureRequest):
    # Track closure state
    state.road_closures[req.bridge_id] = req.closure_reason

    # Default operational demands
    demands = [
        ZoneDemand("ZONE_PERUR", "Perur", "BOAT", 6, priority_score=0.88),
        ZoneDemand("ZONE_SELVAPURAM", "Selvapuram", "BOAT", 5, priority_score=0.75),
        ZoneDemand("ZONE_UKKADAM", "Ukkadam", "BOAT", 8, priority_score=0.82),
        ZoneDemand("ZONE_SINGANALLUR", "Singanallur", "BOAT", 6, priority_score=0.70),
        ZoneDemand("ZONE_ONDIPUDUR", "Ondipudur", "BOAT", 4, priority_score=0.60),
    ]

    new_v = state.replanner.handle_bridge_closure(
        plan_id=req.plan_id,
        bridge_or_segment_id=req.bridge_id,
        closure_reason=req.closure_reason,
        depots=state.depots,
        demands=demands,
        operator_requesting=req.operator_role,
    )

    return {
        "plan_id": req.plan_id,
        "revised_version": new_v.version_number,
        "status": new_v.status,  # PENDING_APPROVAL
        "requires_human_approval": True,
        "diff_summary": new_v.diff.explanation_summary if new_v.diff else "",
        "rerouted_assignments": new_v.diff.rerouted_assignments if new_v.diff else [],
        "cancelled_assignments": [
            {"depot_id": a.depot_id, "zone_id": a.zone_id, "quantity": a.quantity}
            for a in (new_v.diff.cancelled_assignments if new_v.diff else [])
        ],
        "new_assignments": [
            {"depot_id": a.depot_id, "zone_id": a.zone_id, "quantity": a.quantity}
            for a in (new_v.diff.new_assignments if new_v.diff else [])
        ],
    }


@router.post("/replanning/approve")
async def approve_plan_version(req: ApprovePlanRequest):
    try:
        approved = state.replanner.approve_revised_plan(
            plan_id=req.plan_id,
            version_number=req.version_number,
            operator_id=req.operator_id,
        )
        return {
            "plan_id": approved.plan_id,
            "version_number": approved.version_number,
            "status": approved.status,  # APPROVED
            "approved_by": approved.approved_by,
            "approved_at": approved.approved_at.isoformat() if approved.approved_at else None,
            "message": "Revised plan authorized for operational field dispatch.",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

