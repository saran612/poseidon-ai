import pytest

from backend.geospatial.corridor import CoimbatoreRoadNetwork
from backend.optimization.allocator import (
    DepotSupply,
    ReliefResourceOptimizer,
    ZoneDemand,
)
from backend.replanning.replanner import CascadingReplanningEngine


def test_supply_shortage_enforces_fairness_floor_and_records_violations():
    """Mandatory test 9: Supply shortage applies fairness constraints and records shortfall reasons."""
    optimizer = ReliefResourceOptimizer(fairness_theta=0.5)

    # 30 boats requested across 3 zones, but only 12 available at depot (severe shortage)
    depots = [
        DepotSupply("DEPOT_RS_PURAM", "RS Puram", "BOAT", 12),
    ]
    demands = [
        ZoneDemand("ZONE_PERUR", "Perur", "BOAT", 10, priority_score=0.90),
        ZoneDemand("ZONE_SELVAPURAM", "Selvapuram", "BOAT", 10, priority_score=0.75),
        ZoneDemand("ZONE_UKKADAM", "Ukkadam", "BOAT", 10, priority_score=0.60),
    ]

    travel_matrix = {
        ("DEPOT_RS_PURAM", "ZONE_PERUR"): (["DEPOT_RS_PURAM", "ZONE_PERUR"], 5.0, 12.0),
        ("DEPOT_RS_PURAM", "ZONE_SELVAPURAM"): (["DEPOT_RS_PURAM", "ZONE_SELVAPURAM"], 3.0, 8.0),
        ("DEPOT_RS_PURAM", "ZONE_UKKADAM"): (["DEPOT_RS_PURAM", "ZONE_UKKADAM"], 4.0, 10.0),
    }

    plan = optimizer.solve(depots, demands, travel_matrix)

    assert plan.total_requested == 30
    assert plan.total_assigned == 12
    assert plan.total_unmet == 18

    # Fairness check: each zone receives resources rather than starving lower-priority zones
    assigned_zones = set(a.zone_id for a in plan.allocations)
    assert len(assigned_zones) >= 2  # Resources spread across zones due to fairness floor

    # Underserved details recorded
    assert len(plan.underserved_zones) > 0
    reasons = [u.reason_code for u in plan.underserved_zones]
    assert "supply_exhausted" in reasons


def test_zone_with_no_feasible_route_marked_unserved():
    """Mandatory test 10: A zone with no feasible route is correctly marked unserved."""
    optimizer = ReliefResourceOptimizer()

    depots = [
        DepotSupply("DEPOT_PEELAMEDU", "Peelamedu", "MEDICAL_KIT", 50),
    ]
    demands = [
        ZoneDemand("ZONE_SINGANALLUR", "Singanallur", "MEDICAL_KIT", 20, priority_score=0.80),
        ZoneDemand("ZONE_ISOLATED_VALLEY", "Isolated Valley", "MEDICAL_KIT", 20, priority_score=0.95),
    ]

    travel_matrix = {
        ("DEPOT_PEELAMEDU", "ZONE_SINGANALLUR"): (["DEPOT_PEELAMEDU", "ZONE_SINGANALLUR"], 4.0, 10.0),
        # Isolated Valley has no path (None)
        ("DEPOT_PEELAMEDU", "ZONE_ISOLATED_VALLEY"): (None, 999.0, 999.0),
    }

    plan = optimizer.solve(depots, demands, travel_matrix)

    # Isolated valley must have 0 assigned
    valley_alloc = [a for a in plan.allocations if a.zone_id == "ZONE_ISOLATED_VALLEY"]
    assert len(valley_alloc) == 0

    # Reason code must be "no_feasible_route"
    valley_underserved = next(u for u in plan.underserved_zones if u.zone_id == "ZONE_ISOLATED_VALLEY")
    assert valley_underserved.reason_code == "no_feasible_route"
    assert valley_underserved.unmet == 20


def test_identical_input_produces_identical_output_determinism():
    """Mandatory test 11: Identical optimizer input produces identical output."""
    optimizer = ReliefResourceOptimizer(seed=42)

    depots = [
        DepotSupply("DEPOT_RS_PURAM", "RS Puram", "BOAT", 10),
        DepotSupply("DEPOT_PEELAMEDU", "Peelamedu", "BOAT", 10),
    ]
    demands = [
        ZoneDemand("ZONE_PERUR", "Perur", "BOAT", 8, priority_score=0.85),
        ZoneDemand("ZONE_UKKADAM", "Ukkadam", "BOAT", 6, priority_score=0.70),
        ZoneDemand("ZONE_SINGANALLUR", "Singanallur", "BOAT", 7, priority_score=0.65),
    ]
    travel_matrix = {
        ("DEPOT_RS_PURAM", "ZONE_PERUR"): (["R1"], 5.0, 10.0),
        ("DEPOT_RS_PURAM", "ZONE_UKKADAM"): (["R2"], 4.0, 8.0),
        ("DEPOT_RS_PURAM", "ZONE_SINGANALLUR"): (["R3"], 8.0, 18.0),
        ("DEPOT_PEELAMEDU", "ZONE_PERUR"): (["R4"], 12.0, 25.0),
        ("DEPOT_PEELAMEDU", "ZONE_UKKADAM"): (["R5"], 9.0, 20.0),
        ("DEPOT_PEELAMEDU", "ZONE_SINGANALLUR"): (["R6"], 4.0, 10.0),
    }

    run1 = optimizer.solve(depots, demands, travel_matrix)
    run2 = optimizer.solve(depots, demands, travel_matrix)

    assert run1.total_assigned == run2.total_assigned
    assert run1.total_unmet == run2.total_unmet
    assert len(run1.allocations) == len(run2.allocations)
    for a1, a2 in zip(run1.allocations, run2.allocations):
        assert a1.depot_id == a2.depot_id
        assert a1.zone_id == a2.zone_id
        assert a1.quantity == a2.quantity


def test_bridge_closure_triggers_affected_route_analysis_and_revision_diff():
    """Mandatory test 19: A bridge closure triggers affected-route analysis and revised plan with human sign-off."""
    road_network = CoimbatoreRoadNetwork()
    optimizer = ReliefResourceOptimizer()
    replanner = CascadingReplanningEngine(road_network, optimizer)

    depots = [
        DepotSupply("DEPOT_RS_PURAM", "RS Puram", "BOAT", 10),
        DepotSupply("DEPOT_PEELAMEDU", "Peelamedu", "BOAT", 10),
    ]
    demands = [
        ZoneDemand("ZONE_SELVAPURAM", "Selvapuram", "BOAT", 5, priority_score=0.85),
        ZoneDemand("ZONE_PERUR", "Perur", "BOAT", 5, priority_score=0.90),
    ]

    # 1. Create Initial Plan v1
    v1 = replanner.create_initial_plan("PLAN-FLOOD-2026", depots, demands)
    assert v1.version_number == 1
    assert v1.status == "APPROVED"
    assert len(v1.allocations) == 2

    # 2. Trigger Bridge Closure: Perur bridge ("BR-PERUR-01") impassable due to river surge
    v2 = replanner.handle_bridge_closure(
        plan_id="PLAN-FLOOD-2026",
        bridge_or_segment_id="BR-PERUR-01",
        closure_reason="River surge overflow 1.2m above bridge deck",
        depots=depots,
        demands=demands,
    )

    # v2 must be created in PENDING_APPROVAL
    assert v2.version_number == 2
    assert v2.status == "PENDING_APPROVAL"
    assert v2.diff is not None
    assert len(v2.diff.cancelled_assignments) > 0 or len(v2.diff.rerouted_assignments) > 0

    # 3. Operator approves v2
    approved_v2 = replanner.approve_revised_plan("PLAN-FLOOD-2026", 2, operator_id="DISTRICT_COLLECTOR")
    assert approved_v2.status == "APPROVED"
    assert approved_v2.approved_by == "DISTRICT_COLLECTOR"

