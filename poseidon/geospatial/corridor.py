from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import networkx as nx
from shapely.geometry import LineString, Point, Polygon


@dataclass
class BridgeCandidate:
    bridge_id: str
    name: str
    crosses_waterway: str
    latitude: float
    longitude: float
    osm_way_id: Optional[str]
    is_vulnerable_to_flood: bool
    status: str = "OPEN"  # OPEN, CLOSED


@dataclass
class ZoneDefinition:
    zone_code: str
    name: str
    description: str
    centroid_lat: float
    centroid_lon: float
    population: int
    vulnerability_index: float  # [0, 1]
    elevation_m: float
    polygon_coords: List[Tuple[float, float]]


# Real geographic coordinates in Coimbatore Noyyal Corridor & Lakes
COIMBATORE_ZONES: List[ZoneDefinition] = [
    ZoneDefinition(
        zone_code="ZONE_PERUR",
        name="Perur Noyyal Corridor",
        description="Upstream Noyyal river basin and historic settlement prone to flash inundation.",
        centroid_lat=10.9708,
        centroid_lon=76.9152,
        population=18500,
        vulnerability_index=0.72,
        elevation_m=420.0,
        polygon_coords=[
            (10.965, 76.905), (10.978, 76.908), (10.975, 76.925), (10.962, 76.920)
        ],
    ),
    ZoneDefinition(
        zone_code="ZONE_SELVAPURAM",
        name="Selvapuram Lake Cluster",
        description="High density urban zone between Selvampathy and Kumaraswamy lakes.",
        centroid_lat=10.9880,
        centroid_lon=76.9400,
        population=34000,
        vulnerability_index=0.68,
        elevation_m=415.0,
        polygon_coords=[
            (10.980, 76.932), (10.995, 76.935), (10.992, 76.948), (10.978, 76.945)
        ],
    ),
    ZoneDefinition(
        zone_code="ZONE_UKKADAM",
        name="Ukkadam Periyakulam Hub",
        description="Major lake wetland and public transport terminal vulnerable to urban runoff.",
        centroid_lat=10.9915,
        centroid_lon=76.9610,
        population=42000,
        vulnerability_index=0.82,
        elevation_m=411.0,
        polygon_coords=[
            (10.985, 76.952), (10.998, 76.955), (10.996, 76.970), (10.982, 76.968)
        ],
    ),
    ZoneDefinition(
        zone_code="ZONE_SINGANALLUR",
        name="Singanallur Lake Basin",
        description="Largest urban waterbody buffer in eastern Coimbatore with major arterial highway.",
        centroid_lat=10.9980,
        centroid_lon=77.0220,
        population=29000,
        vulnerability_index=0.65,
        elevation_m=408.0,
        polygon_coords=[
            (10.990, 77.010), (11.008, 77.015), (11.005, 77.035), (10.988, 77.030)
        ],
    ),
    ZoneDefinition(
        zone_code="ZONE_ONDIPUDUR",
        name="Ondipudur River Reach",
        description="Downstream Noyyal corridor confluence with flood plain settlements.",
        centroid_lat=10.9940,
        centroid_lon=77.0550,
        population=26500,
        vulnerability_index=0.76,
        elevation_m=402.0,
        polygon_coords=[
            (10.985, 77.042), (11.002, 77.045), (11.000, 77.068), (10.982, 77.065)
        ],
    ),
]

CANDIDATE_BRIDGES: List[BridgeCandidate] = [
    BridgeCandidate(
        bridge_id="BR-PERUR-01",
        name="Perur Noyyal Main Bridge",
        crosses_waterway="Noyyal River",
        latitude=10.9712,
        longitude=76.9180,
        osm_way_id="way/1048201",
        is_vulnerable_to_flood=True,
    ),
    BridgeCandidate(
        bridge_id="BR-SELVAPURAM-01",
        name="Siruvani Road Noyyal Bridge",
        crosses_waterway="Noyyal River",
        latitude=10.9875,
        longitude=76.9385,
        osm_way_id="way/2049102",
        is_vulnerable_to_flood=True,
    ),
    BridgeCandidate(
        bridge_id="BR-UKKADAM-01",
        name="Ukkadam-Sungam Bypass Bridge",
        crosses_waterway="Noyyal Overflow Channel",
        latitude=10.9930,
        longitude=76.9635,
        osm_way_id="way/3094812",
        is_vulnerable_to_flood=True,
    ),
    BridgeCandidate(
        bridge_id="BR-SINGANALLUR-01",
        name="Trichy Road Noyyal Crossing",
        crosses_waterway="Singanallur Surplus Channel",
        latitude=10.9972,
        longitude=77.0250,
        osm_way_id="way/4102941",
        is_vulnerable_to_flood=True,
    ),
]


class CoimbatoreRoadNetwork:
    """Offline topological road graph representation with bridge and road cut support."""

    def __init__(self):
        self.graph = nx.Graph()
        self.closed_segments: set[str] = set()
        self._build_network()

    def _build_network(self) -> None:
        """Construct offline arterial network connecting Coimbatore depots, zones, and bridges."""
        # Nodes: Depots, Zones, Bridges, Intersections
        # Central Depots:
        # DEPOT_RS_PURAM: Western dispatch base
        # DEPOT_PEELAMEDU: Eastern dispatch base
        nodes = [
            ("DEPOT_RS_PURAM", 11.0080, 76.9480),
            ("DEPOT_PEELAMEDU", 11.0250, 77.0120),
            ("SHELTER_VOC_PARK", 11.0020, 76.9710),
            ("SHELTER_SINGANALLUR", 11.0010, 77.0260),
            ("ZONE_PERUR", 10.9708, 76.9152),
            ("ZONE_SELVAPURAM", 10.9880, 76.9400),
            ("ZONE_UKKADAM", 10.9915, 76.9610),
            ("ZONE_SINGANALLUR", 10.9980, 77.0220),
            ("ZONE_ONDIPUDUR", 10.9940, 77.0550),
        ]
        for nid, lat, lon in nodes:
            self.graph.add_node(nid, lat=lat, lon=lon)

        # Arterial Edges: (u, v, distance_km, base_time_min, bridge_id)
        edges = [
            # RS Puram to Selvapuram & Perur
            ("DEPOT_RS_PURAM", "ZONE_SELVAPURAM", 3.2, 8.0, "BR-SELVAPURAM-01"),
            ("ZONE_SELVAPURAM", "ZONE_PERUR", 4.1, 10.0, "BR-PERUR-01"),
            # RS Puram to Ukkadam via Town Hall
            ("DEPOT_RS_PURAM", "ZONE_UKKADAM", 3.8, 9.0, None),
            # Ukkadam to VOC Park & Selvapuram
            ("ZONE_UKKADAM", "SHELTER_VOC_PARK", 2.2, 5.0, None),
            ("ZONE_SELVAPURAM", "ZONE_UKKADAM", 2.8, 7.0, None),
            # Ukkadam to Singanallur via Sungam Bypass Bridge
            ("ZONE_UKKADAM", "ZONE_SINGANALLUR", 6.8, 15.0, "BR-UKKADAM-01"),
            # Peelamedu Depot to Singanallur & VOC Park
            ("DEPOT_PEELAMEDU", "ZONE_SINGANALLUR", 4.2, 10.0, None),
            ("DEPOT_PEELAMEDU", "SHELTER_VOC_PARK", 4.8, 11.0, None),
            # Singanallur to Shelter & Ondipudur
            ("ZONE_SINGANALLUR", "SHELTER_SINGANALLUR", 1.2, 3.0, None),
            ("ZONE_SINGANALLUR", "ZONE_ONDIPUDUR", 3.9, 9.0, "BR-SINGANALLUR-01"),
            # Alternate bypass route: Peelamedu to Ondipudur directly via L&T Bypass
            ("DEPOT_PEELAMEDU", "ZONE_ONDIPUDUR", 7.5, 16.0, None),
        ]

        for u, v, dist, time_m, bridge in edges:
            edge_id = f"{u}--{v}"
            self.graph.add_edge(
                u, v,
                edge_id=edge_id,
                distance_km=dist,
                duration_min=time_m,
                bridge_id=bridge,
                is_open=True,
            )

    def close_bridge_or_segment(self, bridge_or_edge_id: str) -> List[str]:
        """Close an edge or bridge across the network and mark impacted edges."""
        closed_edges = []
        for u, v, data in self.graph.edges(data=True):
            if data.get("bridge_id") == bridge_or_edge_id or data.get("edge_id") == bridge_or_edge_id:
                data["is_open"] = False
                closed_edges.append(data.get("edge_id"))
                self.closed_segments.add(data.get("edge_id"))
        return closed_edges

    def reopen_bridge_or_segment(self, bridge_or_edge_id: str) -> None:
        for u, v, data in self.graph.edges(data=True):
            if data.get("bridge_id") == bridge_or_edge_id or data.get("edge_id") == bridge_or_edge_id:
                data["is_open"] = True
                self.closed_segments.discard(data.get("edge_id"))

    def get_shortest_route(self, origin: str, destination: str) -> Optional[Tuple[List[str], float, float]]:
        """Calculate shortest feasible path considering only currently open segments.
        
        Returns:
            (path_nodes, total_distance_km, total_time_min) or None if disconnected.
        """
        # Create view with only open edges
        def open_filter(u, v):
            return self.graph[u][v].get("is_open", True)

        subgraph = nx.subgraph_view(self.graph, filter_edge=open_filter)
        try:
            path = nx.shortest_path(subgraph, source=origin, target=destination, weight="duration_min")
            dist = sum(subgraph[path[i]][path[i+1]]["distance_km"] for i in range(len(path)-1))
            duration = sum(subgraph[path[i]][path[i+1]]["duration_min"] for i in range(len(path)-1))
            return path, dist, duration
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

