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
    zone_lookup = {z.zone_code: z for z in COIMBATORE_ZONES}
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
                "centroid_lat": zone_lookup[z.zone_id].centroid_lat if z.zone_id in zone_lookup else 0.0,
                "centroid_lon": zone_lookup[z.zone_id].centroid_lon if z.zone_id in zone_lookup else 0.0,
                "population": zone_lookup[z.zone_id].population if z.zone_id in zone_lookup else 0,
                "elevation_m": zone_lookup[z.zone_id].elevation_m if z.zone_id in zone_lookup else 0.0,
                "vulnerability_index": zone_lookup[z.zone_id].vulnerability_index if z.zone_id in zone_lookup else 0.0,
                "polygon_coords": [
                    [lon, lat] for lat, lon in (zone_lookup[z.zone_id].polygon_coords if z.zone_id in zone_lookup else [])
                ],
                "is_synthetic": True,
            }
            for z in priorities
        ],
    }


@router.get("/situation/bridges")
async def get_candidate_bridges():
    bridge_metadata = {
        "BR-PERUR-01": {
            "connected_zones": ["ZONE_PERUR", "ZONE_SELVAPURAM"],
            "route_dependency": "Primary upstream Noyyal crossing linking Perur flood plain to Selvapuram corridor.",
            "last_verified": "Verified Active by NDRF/SDMA",
            "confidence": 0.94,
        },
        "BR-SELVAPURAM-01": {
            "connected_zones": ["ZONE_SELVAPURAM"],
            "route_dependency": "Siruvani arterial connection between RS Puram base depot and Selvapuram Lake cluster.",
            "last_verified": "PWD Hydrology Monitored",
            "confidence": 0.91,
        },
        "BR-UKKADAM-01": {
            "connected_zones": ["ZONE_UKKADAM", "ZONE_SINGANALLUR"],
            "route_dependency": "Crucial bypass connecting Ukkadam transit hub and Periyakulam buffer to Singanallur.",
            "last_verified": "Sector Warden Telemetry",
            "confidence": 0.88,
        },
        "BR-SINGANALLUR-01": {
            "connected_zones": ["ZONE_SINGANALLUR", "ZONE_ONDIPUDUR"],
            "route_dependency": "Trichy Road highway corridor crossing connecting eastern lake basin to Ondipudur reach.",
            "last_verified": "Traffic Command In-Field",
            "confidence": 0.85,
        },
    }

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
                "is_vulnerable_to_flood": b.is_vulnerable_to_flood,
                "connected_zones": bridge_metadata.get(b.bridge_id, {}).get("connected_zones", []),
                "route_dependency": bridge_metadata.get(b.bridge_id, {}).get("route_dependency", "Corridor crossing"),
                "last_verified": bridge_metadata.get(b.bridge_id, {}).get("last_verified", "Live Monitor"),
                "confidence": bridge_metadata.get(b.bridge_id, {}).get("confidence", 0.85),
            }
            for b in CANDIDATE_BRIDGES
        ]
    }


@router.get("/situation/network")
async def get_road_network_and_infrastructure():
    """Return offline topological GIS infrastructure: nodes, depots, shelters, edges, and Noyyal river trajectory."""
    node_coords = {
        "DEPOT_RS_PURAM": [76.9480, 11.0080],
        "DEPOT_PEELAMEDU": [77.0120, 11.0250],
        "SHELTER_VOC_PARK": [76.9710, 11.0020],
        "SHELTER_SINGANALLUR": [77.0260, 11.0010],
        "ZONE_PERUR": [76.9152, 10.9708],
        "ZONE_SELVAPURAM": [76.9400, 10.9880],
        "ZONE_UKKADAM": [76.9610, 10.9915],
        "ZONE_SINGANALLUR": [77.0220, 10.9980],
        "ZONE_ONDIPUDUR": [77.0550, 10.9940],
    }

    edges_data = []
    for u, v, data in state.road_network.graph.edges(data=True):
        u_coord = node_coords.get(u)
        v_coord = node_coords.get(v)
        if u_coord and v_coord:
            edges_data.append({
                "u": u,
                "v": v,
                "edge_id": data.get("edge_id"),
                "bridge_id": data.get("bridge_id"),
                "distance_km": data.get("distance_km"),
                "duration_min": data.get("duration_min"),
                "is_open": data.get("is_open", True),
                "coordinates": [u_coord, v_coord],
            })

    # Realistic Noyyal river geometry tracing upstream Perur to downstream Ondipudur
    noyyal_river_coordinates = [
        [76.8850, 10.9650],  # Alandurai upstream approach
        [76.9050, 10.9700],  # Perur Western reach
        [76.9180, 10.9712],  # Perur Noyyal Main Bridge
        [76.9280, 10.9790],  # Selvampathy Lake channel
        [76.9385, 10.9875],  # Siruvani Road Bridge
        [76.9520, 10.9900],  # Ukkadam Periyakulam inlet
        [76.9635, 10.9930],  # Sungam Bypass Bridge
        [76.9850, 10.9945],  # Ramanathapuram canal
        [77.0150, 10.9960],  # Singanallur Lake inlet
        [77.0250, 10.9972],  # Trichy Road Crossing
        [77.0420, 10.9950],  # Ondipudur flood plain approach
        [77.0550, 10.9940],  # Ondipudur River confluence
        [77.0780, 10.9910],  # Downstream toward Irugur / Tiruppur
    ]

    return {
        "depots": [
            {
                "id": "DEPOT_RS_PURAM",
                "name": "RS Puram Emergency Operations Base",
                "coordinates": [76.9480, 11.0080],
                "boats": 10,
                "medical_kits": 150,
                "status": "OPERATIONAL",
                "coverage": "Western Sector & Upstream Catchment",
            },
            {
                "id": "DEPOT_PEELAMEDU",
                "name": "Peelamedu Central Logistics Depot",
                "coordinates": [77.0120, 11.0250],
                "boats": 8,
                "medical_kits": 200,
                "status": "OPERATIONAL",
                "coverage": "Eastern Arterial & Downstream Corridor",
            },
        ],
        "shelters": [
            {
                "id": "SHELTER_VOC_PARK",
                "name": "VOC Park Central Stadium Shelter",
                "coordinates": [76.9710, 11.0020],
                "capacity": 350,
                "current_occupancy": 120,
                "status": "ACTIVE",
            },
            {
                "id": "SHELTER_SINGANALLUR",
                "name": "Singanallur Community Relief Camp",
                "coordinates": [77.0260, 11.0010],
                "capacity": 250,
                "current_occupancy": 85,
                "status": "ACTIVE",
            },
        ],
        "edges": edges_data,
        "noyyal_river": noyyal_river_coordinates,
        "critical_facilities": [
            {
                "id": "HOSP_CMCH",
                "name": "Coimbatore Medical College Hospital (CMCH)",
                "type": "HOSPITAL",
                "coordinates": [76.9660, 11.0015],
                "status": "CRITICAL_FACILITY_ACTIVE",
            },
            {
                "id": "HOSP_PSG",
                "name": "PSG Institute of Medical Sciences",
                "type": "HOSPITAL",
                "coordinates": [77.0180, 11.0230],
                "status": "CRITICAL_FACILITY_ACTIVE",
            },
        ],
    }

