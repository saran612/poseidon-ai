from dataclasses import dataclass, field
import math
from typing import Dict, List, Optional, Set, Tuple
from ortools.sat.python import cp_model


@dataclass(frozen=True)
class DepotSupply:
    depot_id: str
    name: str
    resource_type: str
    available_units: int


@dataclass(frozen=True)
class ZoneDemand:
    zone_id: str
    name: str
    resource_type: str
    requested_units: int
    priority_score: float  # [0, 1]


@dataclass
class AllocationResult:
    depot_id: str
    zone_id: str
    resource_type: str
    quantity: int
    travel_time_min: float
    route_nodes: List[str]


@dataclass
class UnderservedDetail:
    zone_id: str
    resource_type: str
    requested: int
    assigned: int
    unmet: int
    reason_code: str  # supply_exhausted, no_feasible_route, deadline_infeasible, capacity_limit


@dataclass
class OptimizationPlanSummary:
    total_requested: int
    total_assigned: int
    total_unmet: int
    allocations: List[AllocationResult]
    underserved_zones: List[UnderservedDetail]
    solver_status: str
    solve_duration_ms: float
    fairness_theta: float


class ReliefResourceOptimizer:
    """Deterministic Google OR-Tools CP-SAT resource allocation solver with fairness floors and route feasibility."""

    def __init__(self, fairness_theta: float = 0.5, deadline_min: float = 45.0, seed: int = 42):
        self.fairness_theta = fairness_theta
        self.deadline_min = deadline_min
        self.seed = seed

    def solve(
        self,
        depots: List[DepotSupply],
        demands: List[ZoneDemand],
        travel_matrix: Dict[Tuple[str, str], Tuple[Optional[List[str]], float, float]],
        # travel_matrix key: (depot_id, zone_id) -> (path, dist_km, time_min) or None
    ) -> OptimizationPlanSummary:
        """Solve fairness-aware CP-SAT model deterministically."""
        import time
        start_t = time.perf_counter()

        # Sort inputs to guarantee absolute determinism
        sorted_depots = sorted(depots, key=lambda d: (d.resource_type, d.depot_id))
        sorted_demands = sorted(demands, key=lambda z: (z.resource_type, -z.priority_score, z.zone_id))

        model = cp_model.CpModel()

        # Group by resource type (e.g. BOATS, MEDICAL_KITS, RATION_PACKS)
        resource_types = sorted(list(set(d.resource_type for d in sorted_demands)))

        x_vars: Dict[Tuple[str, str], cp_model.IntVar] = {}
        unmet_vars: Dict[str, cp_model.IntVar] = {}
        slack_vars: Dict[str, cp_model.IntVar] = {}

        total_requested = sum(d.requested_units for d in sorted_demands)
        underserved_details: List[UnderservedDetail] = []
        feasible_routes: Set[Tuple[str, str]] = set()

        for r_type in resource_types:
            r_depots = [d for d in sorted_depots if d.resource_type == r_type]
            r_demands = [z for z in sorted_demands if z.resource_type == r_type]

            total_supply = sum(d.available_units for d in r_depots)
            total_demand = sum(z.requested_units for z in r_demands)
            supply_demand_ratio = min(1.0, float(total_supply) / float(total_demand)) if total_demand > 0 else 1.0

            # 1. Decision Variables x[j, z]
            for dep in r_depots:
                for req in r_demands:
                    route_info = travel_matrix.get((dep.depot_id, req.zone_id))
                    # Route feasibility constraint
                    if route_info is not None:
                        path, dist_km, time_min = route_info
                        if path is not None and time_min <= self.deadline_min:
                            # Route is feasible
                            feasible_routes.add((dep.depot_id, req.zone_id))
                            upper_b = min(dep.available_units, req.requested_units)
                            x_vars[(dep.depot_id, req.zone_id)] = model.NewIntVar(
                                0, upper_b, f"x_{dep.depot_id}_{req.zone_id}"
                            )

            # 2. Depot Supply Constraints: sum_z x[j, z] <= supply[j]
            for dep in r_depots:
                dep_vars = [
                    x_vars[(dep.depot_id, req.zone_id)]
                    for req in r_demands
                    if (dep.depot_id, req.zone_id) in x_vars
                ]
                if dep_vars:
                    model.Add(sum(dep_vars) <= dep.available_units)

            # 3. Zone Demand, Unmet, and Fairness Floor Constraints
            for req in r_demands:
                incoming_vars = [
                    x_vars[(dep.depot_id, req.zone_id)]
                    for dep in r_depots
                    if (dep.depot_id, req.zone_id) in x_vars
                ]

                # Unmet variable
                unmet = model.NewIntVar(0, req.requested_units, f"unmet_{req.zone_id}")
                unmet_vars[req.zone_id] = unmet

                if incoming_vars:
                    # sum_j x[j, z] <= demand[z]
                    model.Add(sum(incoming_vars) <= req.requested_units)
                    # unmet[z] = demand[z] - sum_j x[j, z]
                    model.Add(unmet == req.requested_units - sum(incoming_vars))

                    # Fairness Floor: floor = floor(theta * demand * min(1, S/D))
                    floor_val = int(math.floor(self.fairness_theta * req.requested_units * supply_demand_ratio))
                    slack = model.NewIntVar(0, req.requested_units, f"slack_{req.zone_id}")
                    slack_vars[req.zone_id] = slack
                    model.Add(sum(incoming_vars) + slack >= floor_val)
                else:
                    # No feasible route to this zone!
                    model.Add(unmet == req.requested_units)

        # 4. Objective Formulation
        # Minimize:
        # - Priority-weighted unmet demand (scale = 1000)
        # - Travel penalty (scale = 10)
        # - Fairness slack penalty (scale = 500)
        objective_terms = []
        for req in sorted_demands:
            unmet = unmet_vars[req.zone_id]
            weight_int = int(round(req.priority_score * 1000))
            objective_terms.append(unmet * weight_int)

            if req.zone_id in slack_vars:
                objective_terms.append(slack_vars[req.zone_id] * 500)

        for (dep_id, zone_id), x_var in x_vars.items():
            _, _, time_min = travel_matrix[(dep_id, zone_id)]
            travel_cost = int(round(time_min * 10))
            objective_terms.append(x_var * travel_cost)

        model.Minimize(sum(objective_terms))

        # Solver Setup
        solver = cp_model.CpSolver()
        solver.parameters.random_seed = self.seed
        solver.parameters.max_time_in_seconds = 10.0
        solver.parameters.num_workers = 1  # 1 worker for deterministic execution

        status = solver.Solve(model)
        status_name = solver.StatusName(status)

        allocations: List[AllocationResult] = []
        total_assigned = 0

        for (dep_id, zone_id), x_var in x_vars.items():
            qty = solver.Value(x_var)
            if qty > 0:
                path, dist, t_min = travel_matrix[(dep_id, zone_id)]
                # Find matching depot resource
                dep_info = next(d for d in sorted_depots if d.depot_id == dep_id)
                allocations.append(
                    AllocationResult(
                        depot_id=dep_id,
                        zone_id=zone_id,
                        resource_type=dep_info.resource_type,
                        quantity=qty,
                        travel_time_min=round(t_min, 1),
                        route_nodes=path or [],
                    )
                )
                total_assigned += qty

        # Determine Underserved Zones & Explain Why
        for req in sorted_demands:
            unmet_qty = solver.Value(unmet_vars[req.zone_id])
            assigned_qty = req.requested_units - unmet_qty
            if unmet_qty > 0:
                # Check reason
                routes_to_zone = [
                    (dep.depot_id, travel_matrix.get((dep.depot_id, req.zone_id)))
                    for dep in sorted_depots
                    if dep.resource_type == req.resource_type
                ]
                has_any_path = any(
                    r[1] is not None and r[1][0] is not None for r in routes_to_zone
                )
                within_deadline = any(
                    r[1] is not None and r[1][0] is not None and r[1][2] <= self.deadline_min
                    for r in routes_to_zone
                )
                depot_supply_total = sum(
                    dep.available_units for dep in sorted_depots if dep.resource_type == req.resource_type
                )

                if not has_any_path:
                    reason = "no_feasible_route"
                elif not within_deadline:
                    reason = "deadline_infeasible"
                elif depot_supply_total < total_requested:
                    reason = "supply_exhausted"
                else:
                    reason = "capacity_limit"

                underserved_details.append(
                    UnderservedDetail(
                        zone_id=req.zone_id,
                        resource_type=req.resource_type,
                        requested=req.requested_units,
                        assigned=assigned_qty,
                        unmet=unmet_qty,
                        reason_code=reason,
                    )
                )

        solve_duration_ms = (time.perf_counter() - start_t) * 1000.0

        return OptimizationPlanSummary(
            total_requested=total_requested,
            total_assigned=total_assigned,
            total_unmet=total_requested - total_assigned,
            allocations=allocations,
            underserved_zones=underserved_details,
            solver_status=status_name,
            solve_duration_ms=round(solve_duration_ms, 2),
            fairness_theta=self.fairness_theta,
        )

