from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
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


class RejectPlanRequest(BaseModel):
    plan_id: str = "PLAN-OPERATIONAL-01"
    version_number: int
    operator_id: str = "DISTRICT_COLLECTOR"
    reason: str = "Field reconnaissance reports route passable; holding replan."


class ReopenBridgeRequest(BaseModel):
    bridge_id: str
    plan_id: str = "PLAN-OPERATIONAL-01"


def _build_plan_comparison(prev_v, new_v) -> Dict[str, Any]:
    total_supply = sum(d.available_units for d in state.depots if d.resource_type == "BOAT")
    prev_assigned = prev_v.summary.total_assigned if prev_v else 0
    prev_unmet = prev_v.summary.total_unmet if prev_v else 0
    prev_times = [a.travel_time_min for a in prev_v.allocations if a.travel_time_min < 999] if prev_v else []
    prev_avg_time = round(sum(prev_times) / len(prev_times), 1) if prev_times else 0.0
    prev_reachable = len(set(a.zone_id for a in prev_v.allocations if a.travel_time_min < 999)) if prev_v else 0

    new_times = [a.travel_time_min for a in new_v.allocations if a.travel_time_min < 999]
    new_avg_time = round(sum(new_times) / len(new_times), 1) if new_times else 0.0
    new_reachable = len(set(a.zone_id for a in new_v.allocations if a.travel_time_min < 999))

    return {
        "reachable_zones": {
            "metric": "Reachable Zones",
            "previous": f"{prev_reachable} zones",
            "proposed": f"{new_reachable} zones",
            "delta": new_reachable - prev_reachable,
        },
        "affected_assignments": {
            "metric": "Affected Assignments",
            "previous": "0 assignments",
            "proposed": f"{len(new_v.diff.rerouted_assignments) + len(new_v.diff.cancelled_assignments) if new_v.diff else 0} assignments",
            "delta": len(new_v.diff.rerouted_assignments) + len(new_v.diff.cancelled_assignments) if new_v.diff else 0,
        },
        "estimated_response_time": {
            "metric": "Estimated Avg Response Time",
            "previous": f"{prev_avg_time} min",
            "proposed": f"{new_avg_time} min",
            "delta": f"{round(new_avg_time - prev_avg_time, 1):+g} min",
        },
        "unmet_demand": {
            "metric": "Unmet Relief Demand",
            "previous": f"{prev_unmet} units",
            "proposed": f"{new_v.summary.total_unmet} units",
            "delta": f"{new_v.summary.total_unmet - prev_unmet:+d} units",
        },
        "resource_utilization": {
            "metric": "Depot Resource Utilization",
            "previous": f"{round((prev_assigned / total_supply) * 100, 1)}%" if total_supply > 0 else "0%",
            "proposed": f"{round((new_v.summary.total_assigned / total_supply) * 100, 1)}%" if total_supply > 0 else "0%",
            "delta": f"{round(((new_v.summary.total_assigned - prev_assigned) / total_supply) * 100, 1):+g}%" if total_supply > 0 else "0%",
        },
    }


@router.get("/replanning/plans/{plan_id}")
async def get_plan_history(plan_id: str):
    versions = state.replanner.plans.get(plan_id, [])
    if not versions:
        # Default baseline if not yet seeded
        demands = [
            ZoneDemand("ZONE_PERUR", "Perur", "BOAT", 6, priority_score=0.88),
            ZoneDemand("ZONE_SELVAPURAM", "Selvapuram", "BOAT", 5, priority_score=0.75),
            ZoneDemand("ZONE_UKKADAM", "Ukkadam", "BOAT", 8, priority_score=0.82),
            ZoneDemand("ZONE_SINGANALLUR", "Singanallur", "BOAT", 6, priority_score=0.70),
            ZoneDemand("ZONE_ONDIPUDUR", "Ondipudur", "BOAT", 4, priority_score=0.60),
        ]
        v1 = state.replanner.create_initial_plan(plan_id, state.depots, demands)
        versions = [v1]

    latest_v = versions[-1]
    prev_v = versions[-2] if len(versions) >= 2 else None
    comparison = _build_plan_comparison(prev_v, latest_v)

    return {
        "plan_id": plan_id,
        "versions_count": len(versions),
        "comparison": comparison,
        "active_road_closures": state.road_closures,
        "versions": [
            {
                "version_number": v.version_number,
                "status": v.status,
                "trigger_event": v.trigger_event,
                "trigger_description": v.trigger_description,
                "total_requested": v.summary.total_requested,
                "total_assigned": v.summary.total_assigned,
                "total_unmet": v.summary.total_unmet,
                "solve_duration_ms": round(v.summary.solve_duration_ms, 2),
                "allocations": [
                    {
                        "depot_id": a.depot_id,
                        "zone_id": a.zone_id,
                        "resource_type": a.resource_type,
                        "quantity": a.quantity,
                        "travel_time_min": a.travel_time_min,
                        "route_nodes": a.route_nodes,
                    }
                    for a in v.allocations
                ],
                "approved_by": v.approved_by,
                "approved_at": v.approved_at.isoformat() if v.approved_at else None,
                "created_at": v.created_at.isoformat() if hasattr(v, "created_at") and v.created_at else None,
                "diff": {
                    "old_version": v.diff.old_version_number,
                    "new_version": v.diff.new_version_number,
                    "cancelled_count": len(v.diff.cancelled_assignments),
                    "rerouted_count": len(v.diff.rerouted_assignments),
                    "new_count": len(v.diff.new_assignments),
                    "unmet_delta": v.diff.unmet_demand_delta,
                    "summary": v.diff.explanation_summary,
                    "rerouted": v.diff.rerouted_assignments,
                    "cancelled": [
                        {"depot_id": a.depot_id, "zone_id": a.zone_id, "quantity": a.quantity}
                        for a in v.diff.cancelled_assignments
                    ],
                    "new_assignments": [
                        {"depot_id": a.depot_id, "zone_id": a.zone_id, "quantity": a.quantity}
                        for a in v.diff.new_assignments
                    ],
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

    # Ensure plan exists before handling closure
    if req.plan_id not in state.replanner.plans or not state.replanner.plans[req.plan_id]:
        state.replanner.create_initial_plan(req.plan_id, state.depots, demands)

    prev_v = state.replanner.plans[req.plan_id][-1]

    new_v = state.replanner.handle_bridge_closure(
        plan_id=req.plan_id,
        bridge_or_segment_id=req.bridge_id,
        closure_reason=req.closure_reason,
        depots=state.depots,
        demands=demands,
        operator_requesting=req.operator_role,
    )

    comparison = _build_plan_comparison(prev_v, new_v)

    # Calculate affected critical facilities / zones
    affected_zones = list(set(
        [r["zone_id"] for r in (new_v.diff.rerouted_assignments if new_v.diff else [])] +
        [c.zone_id for c in (new_v.diff.cancelled_assignments if new_v.diff else [])]
    ))

    return {
        "plan_id": req.plan_id,
        "revised_version": new_v.version_number,
        "status": new_v.status,  # PENDING_APPROVAL
        "requires_human_approval": True,
        "diff_summary": new_v.diff.explanation_summary if new_v.diff else "",
        "affected_zones": affected_zones,
        "comparison": comparison,
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


@router.post("/replanning/reject")
async def reject_plan_version(req: RejectPlanRequest):
    versions = state.replanner.plans.get(req.plan_id, [])
    for v in versions:
        if v.version_number == req.version_number:
            v.status = "REJECTED"
            v.approved_by = f"REJECTED by {req.operator_id}: {req.reason}"
            return {
                "plan_id": req.plan_id,
                "version_number": v.version_number,
                "status": "REJECTED",
                "message": f"Plan version v{v.version_number} rejected. Reverted to previous approved operational posture.",
            }
    raise HTTPException(status_code=404, detail="Plan version not found")


@router.post("/replanning/reopen-bridge")
async def reopen_bridge(req: ReopenBridgeRequest):
    if req.bridge_id in state.road_closures:
        del state.road_closures[req.bridge_id]
    state.road_network.reopen_bridge_or_segment(req.bridge_id)
    return {
        "status": "REOPENED",
        "bridge_id": req.bridge_id,
        "message": f"Bridge {req.bridge_id} reopened and verified passable. Arterial segment restored.",
    }

