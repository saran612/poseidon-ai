from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import uuid

from poseidon.geospatial.corridor import CoimbatoreRoadNetwork
from poseidon.optimization.allocator import (
    AllocationResult,
    DepotSupply,
    OptimizationPlanSummary,
    ReliefResourceOptimizer,
    ZoneDemand,
)


@dataclass
class PlanDiff:
    old_version_number: int
    new_version_number: int
    cancelled_assignments: List[AllocationResult]
    rerouted_assignments: List[Dict[str, any]]
    new_assignments: List[AllocationResult]
    unmet_demand_delta: int
    explanation_summary: str


@dataclass
class PlanVersionRecord:
    plan_id: str
    version_number: int
    status: str  # PENDING_APPROVAL, APPROVED, REJECTED
    trigger_event: str
    trigger_description: str
    allocations: List[AllocationResult]
    summary: OptimizationPlanSummary
    diff: Optional[PlanDiff] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None


class CascadingReplanningEngine:
    """Cascading Impact Replanning Engine managing bridge cut cascading, route invalidation, and versioned diffs."""

    def __init__(self, road_network: CoimbatoreRoadNetwork, optimizer: ReliefResourceOptimizer):
        self.road_network = road_network
        self.optimizer = optimizer
        self.plans: Dict[str, List[PlanVersionRecord]] = {}

    def create_initial_plan(
        self,
        plan_id: str,
        depots: List[DepotSupply],
        demands: List[ZoneDemand],
    ) -> PlanVersionRecord:
        """Generate Version 1 baseline operational plan."""
        # Build travel matrix from open network
        travel_matrix = self._compute_travel_matrix(depots, demands)
        summary = self.optimizer.solve(depots, demands, travel_matrix)

        v1 = PlanVersionRecord(
            plan_id=plan_id,
            version_number=1,
            status="APPROVED",  # Baseline approved by default or pending
            trigger_event="INITIAL_OPTIMIZATION",
            trigger_description="Initial multi-zone resource optimization",
            allocations=summary.allocations,
            summary=summary,
            diff=None,
            approved_by="COMMAND_CHIEF",
            approved_at=datetime.now(timezone.utc),
        )
        self.plans[plan_id] = [v1]
        return v1

    def handle_bridge_closure(
        self,
        plan_id: str,
        bridge_or_segment_id: str,
        closure_reason: str,
        depots: List[DepotSupply],
        demands: List[ZoneDemand],
        operator_requesting: str = "SYSTEM_REPLANNER",
    ) -> PlanVersionRecord:
        """Cascade consequence of road/bridge closure: invalidate routes, re-solve, diff, and request human approval."""
        current_versions = self.plans.get(plan_id, [])
        if not current_versions:
            raise ValueError(f"Plan {plan_id} not found")

        last_v = current_versions[-1]
        new_version_num = last_v.version_number + 1

        # 1. Sever the segment in the road graph
        closed_edges = self.road_network.close_bridge_or_segment(bridge_or_segment_id)

        # 2. Recompute travel matrix on damaged graph
        new_travel_matrix = self._compute_travel_matrix(depots, demands)

        # 3. Re-solve resource allocation with OR-Tools
        new_summary = self.optimizer.solve(depots, demands, new_travel_matrix)

        # 4. Compare Old vs New Allocations (Structural Diff)
        old_map = {(a.depot_id, a.zone_id, a.resource_type): a for a in last_v.allocations}
        new_map = {(a.depot_id, a.zone_id, a.resource_type): a for a in new_summary.allocations}

        cancelled: List[AllocationResult] = []
        rerouted: List[Dict[str, any]] = []
        brand_new: List[AllocationResult] = []

        for key, old_alloc in old_map.items():
            if key not in new_map:
                cancelled.append(old_alloc)
            else:
                new_alloc = new_map[key]
                if new_alloc.route_nodes != old_alloc.route_nodes or new_alloc.travel_time_min != old_alloc.travel_time_min:
                    rerouted.append({
                        "depot_id": old_alloc.depot_id,
                        "zone_id": old_alloc.zone_id,
                        "resource_type": old_alloc.resource_type,
                        "quantity": new_alloc.quantity,
                        "old_travel_time": old_alloc.travel_time_min,
                        "new_travel_time": new_alloc.travel_time_min,
                        "old_path": old_alloc.route_nodes,
                        "new_path": new_alloc.route_nodes,
                    })

        for key, new_alloc in new_map.items():
            if key not in old_map:
                brand_new.append(new_alloc)

        diff = PlanDiff(
            old_version_number=last_v.version_number,
            new_version_number=new_version_num,
            cancelled_assignments=cancelled,
            rerouted_assignments=rerouted,
            new_assignments=brand_new,
            unmet_demand_delta=new_summary.total_unmet - last_v.summary.total_unmet,
            explanation_summary=(
                f"Closure of {bridge_or_segment_id} ({closure_reason}) impacted {len(closed_edges)} arterial edges. "
                f"{len(rerouted)} assignments rerouted, {len(cancelled)} cancelled, {len(brand_new)} alternate dispatches. "
                f"Net unmet demand delta: {new_summary.total_unmet - last_v.summary.total_unmet:+d} units."
            ),
        )

        # 5. Create new version strictly in PENDING_APPROVAL status (Human-In-The-Loop)
        new_v = PlanVersionRecord(
            plan_id=plan_id,
            version_number=new_version_num,
            status="PENDING_APPROVAL",
            trigger_event="BRIDGE_CLOSURE_REPLAN",
            trigger_description=f"Closure of bridge {bridge_or_segment_id}: {closure_reason}",
            allocations=new_summary.allocations,
            summary=new_summary,
            diff=diff,
        )
        current_versions.append(new_v)
        return new_v

    def approve_revised_plan(self, plan_id: str, version_number: int, operator_id: str) -> PlanVersionRecord:
        """Human operator signs off on the revised plan version for field deployment."""
        versions = self.plans.get(plan_id, [])
        for v in versions:
            if v.version_number == version_number:
                v.status = "APPROVED"
                v.approved_by = operator_id
                v.approved_at = datetime.now(timezone.utc)
                return v
        raise ValueError(f"Plan version {plan_id} v{version_number} not found")

    def _compute_travel_matrix(
        self,
        depots: List[DepotSupply],
        demands: List[ZoneDemand],
    ) -> Dict[Tuple[str, str], Tuple[Optional[List[str]], float, float]]:
        matrix = {}
        depot_ids = sorted(list(set(d.depot_id for d in depots)))
        zone_ids = sorted(list(set(z.zone_id for z in demands)))

        for dep_id in depot_ids:
            for z_id in zone_ids:
                route = self.road_network.get_shortest_route(dep_id, z_id)
                if route is not None:
                    path, dist, t_min = route
                    matrix[(dep_id, z_id)] = (path, dist, t_min)
                else:
                    matrix[(dep_id, z_id)] = (None, 999.0, 999.0)
        return matrix

