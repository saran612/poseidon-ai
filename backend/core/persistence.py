import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import AsyncSessionLocal
from backend.models.plan import Plan, PlanVersion, Assignment as DBAssignment, Acknowledgement as DBAck
from backend.models.audit import AuditEvent
from backend.models.route import RoadSegment


async def record_audit_event(
    entity_type: str,
    entity_id: str,
    action: str,
    actor: str = "SYSTEM",
    latency_ms: float = 0.0,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """Asynchronously record an immutable-style audit event to the database."""
    try:
        async with AsyncSessionLocal() as session:
            event = AuditEvent(
                entity_type=entity_type,
                entity_id=entity_id,
                action=action,
                actor=actor,
                latency_ms=latency_ms,
                details_json=json.dumps(details or {}),
            )
            session.add(event)
            await session.commit()
    except Exception as e:
        # In-memory logging fallback so failure to audit does not crash operational flow
        print(f"[AUDIT_LOG_ERROR] Could not commit audit event: {e}")


async def persist_plan_version(
    plan_id: str,
    version_record: Any,
    db_session: Optional[AsyncSession] = None,
) -> None:
    """Persist a plan version and its allocations to the database."""
    async def _do_persist(session: AsyncSession):
        # 1. Ensure Plan container exists
        res = await session.execute(select(Plan).where(Plan.plan_code == plan_id))
        db_plan = res.scalar_one_or_none()
        if not db_plan:
            db_plan = Plan(
                plan_code=plan_id,
                title=f"Coimbatore Flood Relief Plan ({plan_id})",
                status="ACTIVE",
                active_version_number=version_record.version_number,
            )
            session.add(db_plan)
            await session.flush()
        else:
            db_plan.active_version_number = version_record.version_number

        # 2. Add PlanVersion
        diff_data = None
        if hasattr(version_record, "diff") and version_record.diff:
            diff_data = {
                "old_v": version_record.diff.old_version_number,
                "new_v": version_record.diff.new_version_number,
                "summary": version_record.diff.explanation_summary,
                "unmet_delta": version_record.diff.unmet_demand_delta,
            }

        pv = PlanVersion(
            plan_id=db_plan.id,
            version_number=version_record.version_number,
            trigger_event=version_record.trigger_event,
            trigger_description=version_record.trigger_description,
            total_resources_allocated=version_record.summary.total_assigned if hasattr(version_record, "summary") else len(version_record.allocations),
            unmet_demand_count=version_record.summary.total_unmet if hasattr(version_record, "summary") else 0,
            status=version_record.status,
            approved_by=getattr(version_record, "approved_by", None),
            approved_at=getattr(version_record, "approved_at", None),
            diff_summary_json=json.dumps(diff_data) if diff_data else None,
        )
        session.add(pv)
        await session.flush()

        # 3. Add Assignments
        for alloc in version_record.allocations:
            db_asgn = DBAssignment(
                plan_version_id=pv.id,
                depot_id=alloc.depot_id,
                zone_id=alloc.zone_id,
                resource_type=alloc.resource_type,
                quantity_allocated=alloc.quantity,
                travel_time_min=alloc.travel_time_min,
                status="SCHEDULED",
            )
            session.add(db_asgn)

        await session.commit()

    try:
        if db_session:
            await _do_persist(db_session)
        else:
            async with AsyncSessionLocal() as session:
                await _do_persist(session)
    except Exception as e:
        print(f"[PERSISTENCE_WARNING] Plan version persistence error: {e}")


async def persist_road_closure(
    bridge_id: str,
    reason: str,
    is_closed: bool = True,
    actor: str = "SYSTEM",
) -> None:
    """Record road closure / reopening to database and audit log."""
    try:
        async with AsyncSessionLocal() as session:
            # Audit log
            event = AuditEvent(
                entity_type="ROAD_SEGMENT",
                entity_id=bridge_id,
                action="SEVERED" if is_closed else "REOPENED",
                actor=actor,
                details_json=json.dumps({"reason": reason, "is_closed": is_closed}),
            )
            session.add(event)
            await session.commit()
    except Exception as e:
        print(f"[PERSISTENCE_WARNING] Road closure persistence error: {e}")


async def load_state_from_db(state: Any) -> None:
    """Recover persisted road closures and audit state from DB upon startup."""
    try:
        async with AsyncSessionLocal() as session:
            # Query recent audit events for road closures
            stmt = select(AuditEvent).where(AuditEvent.entity_type == "ROAD_SEGMENT").order_by(AuditEvent.created_at.desc())
            res = await session.execute(stmt)
            events = res.scalars().all()
            for ev in reversed(events):
                details = json.loads(ev.details_json or "{}")
                if details.get("is_closed"):
                    state.road_closures[ev.entity_id] = details.get("reason", "Severed")
                    state.road_network.close_bridge_or_segment(ev.entity_id)
                else:
                    if ev.entity_id in state.road_closures:
                        del state.road_closures[ev.entity_id]
                    state.road_network.reopen_bridge_or_segment(ev.entity_id)
            print(f"[PERSISTENCE] Successfully restored {len(state.road_closures)} road closures from database.")
    except Exception as e:
        print(f"[PERSISTENCE_NOTICE] First run or database initializing: {e}")

