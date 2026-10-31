from fastapi import APIRouter
from poseidon.core.state import get_system_state
from poseidon.geospatial.corridor import CANDIDATE_BRIDGES, COIMBATORE_ZONES

router = APIRouter()
state = get_system_state()


@router.get("/situation/zones")
async def get_zones_priorities():
    priorities = state.prioritization_engine.calculate_priorities(
        clusters=state.active_clusters,
        road_closures_by_zone={
            "ZONE_PERUR": 1 if "BR-PERUR-01" in state.road_closures else 0,
            "ZONE_UKKADAM": 1 if "BR-UKKADAM-01" in state.road_closures else 0,
            "ZONE_SINGANALLUR": 1 if "BR-SINGANALLUR-01" in state.road_closures else 0,
        },
    )
    return {
        "zones_count": len(priorities),
        "zones": [
            {
                "zone_id": z.zone_id,
                "name": z.zone_name,
                "rank": z.rank,
                "tier": z.tier,
                "score_expected": z.score_expected,
                "score_upper": z.score_upper,
                "confidence": z.confidence,
                "factor_breakdown": z.factor_breakdown,
                "evidence_ids": z.evidence_ids,
                "evidence_summary": z.evidence_summary,
                "flags": z.flags,
                "what_would_change_this": z.what_would_change_this,
                "data_freshness_min": z.data_freshness_min,
                "verify_next": z.verify_next,
                "is_synthetic": True,
            }
            for z in priorities
        ],
    }


@router.get("/situation/bridges")
async def get_candidate_bridges():
    return {
        "bridges": [
            {
                "bridge_id": b.bridge_id,
                "name": b.name,
                "crosses_waterway": b.crosses_waterway,
                "latitude": b.latitude,
                "longitude": b.longitude,
                "osm_way_id": b.osm_way_id,
                "status": "CLOSED" if b.bridge_id in state.road_closures else "OPEN",
                "closure_reason": state.road_closures.get(b.bridge_id),
            }
            for b in CANDIDATE_BRIDGES
        ]
    }

