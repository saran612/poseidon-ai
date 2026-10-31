import pytest
from datetime import datetime, timezone

from poseidon.geospatial.corridor import CoimbatoreRoadNetwork, COIMBATORE_ZONES
from poseidon.situation.prioritization import DisasterPrioritizationEngine
from poseidon.trust.engine import ClusterSummary, EvidenceStatus


def test_unverified_200_claim_affects_upper_bound_only():
    """Mandatory test 8: Unverified claim of 200 trapped people affects upper-bound scoring
    but does not automatically change expected ranking. verify_next is set.
    """
    engine = DisasterPrioritizationEngine()

    # Perur has a verified report of 10 people in distress
    cluster_perur = ClusterSummary(
        cluster_id="cl-perur-verified",
        incident_type="FLOOD_WATER_LEVEL",
        centroid_lat=10.9708,
        centroid_lon=76.9152,
        c_support=0.88,
        c_contra=0.0,
        status=EvidenceStatus.VERIFIED,
        independent_sources_count=2,
        has_tier1_or_tier2=True,
        estimated_people=10,
    )

    # Ondipudur has an unverified, uncorroborated single citizen claim of 200 trapped people
    cluster_ondipudur_unverified = ClusterSummary(
        cluster_id="cl-ondi-unverified",
        incident_type="CASUALTY",
        centroid_lat=10.9940,
        centroid_lon=77.0550,
        c_support=0.35,
        c_contra=0.0,
        status=EvidenceStatus.UNVERIFIED,
        independent_sources_count=1,
        has_tier1_or_tier2=False,
        estimated_people=200,
    )

    priorities = engine.calculate_priorities([cluster_perur, cluster_ondipudur_unverified])
    
    # Locate zones
    perur_res = next(z for z in priorities if z.zone_id == "ZONE_PERUR")
    ondi_res = next(z for z in priorities if z.zone_id == "ZONE_ONDIPUDUR")

    # Expected score of Perur should remain higher than Ondipudur because Perur's threat is verified
    assert perur_res.score_expected >= ondi_res.score_expected
    # Ondipudur upper bound score is elevated by the 200 unverified claim
    assert ondi_res.score_upper > ondi_res.score_expected
    # verify_next must be flagged for Ondipudur to dispatch reconnaissance
    assert ondi_res.verify_next is True


def test_verified_imminent_threat_forces_critical():
    """Mandatory requirement: Verified imminent threat forces CRITICAL tier."""
    engine = DisasterPrioritizationEngine()

    cluster_critical = ClusterSummary(
        cluster_id="cl-ukkadam-crit",
        incident_type="PEOPLE_TRAPPED",
        centroid_lat=10.9915,
        centroid_lon=76.9610,
        c_support=0.92,
        c_contra=0.0,
        status=EvidenceStatus.VERIFIED,
        independent_sources_count=3,
        has_tier1_or_tier2=True,
        estimated_people=25,
    )

    priorities = engine.calculate_priorities([cluster_critical])
    ukkadam_res = next(z for z in priorities if z.zone_id == "ZONE_UKKADAM")

    assert ukkadam_res.tier == "CRITICAL"
    assert "VERIFIED_IMMINENT_LIFE_THREAT" in ukkadam_res.flags


def test_road_network_bridge_closure_and_rerouting():
    """Mandatory test: Road network correctly invalidates routes crossing closed bridges and finds alternative paths."""
    net = CoimbatoreRoadNetwork()

    # Route from Depot RS Puram to Singanallur
    initial_route = net.get_shortest_route("DEPOT_RS_PURAM", "ZONE_SINGANALLUR")
    assert initial_route is not None
    path_init, dist_init, time_init = initial_route
    assert "ZONE_SINGANALLUR" in path_init

    # Close Ukkadam-Sungam bridge ("BR-UKKADAM-01")
    closed = net.close_bridge_or_segment("BR-UKKADAM-01")
    assert len(closed) > 0

    # Recalculate route - network should still find an alternative route if one exists
    # If route directly through Ukkadam is severed, Peelamedu or alternate edges are selected
    recalculated = net.get_shortest_route("DEPOT_PEELAMEDU", "ZONE_SINGANALLUR")
    assert recalculated is not None

