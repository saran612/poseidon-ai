export interface Zone {
  zone_id: string;
  name: string;
  rank: number;
  tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE' | string;
  score_expected: number;
  score_upper: number;
  confidence: number;
  factor_breakdown: Record<string, number>;
  evidence_ids: string[];
  evidence_summary: string;
  flags: string[];
  what_would_change_this: string;
  data_freshness_min: number;
  verify_next: boolean;
  centroid_lat?: number;
  centroid_lon?: number;
  population?: number;
  elevation_m?: number;
  vulnerability_index?: number;
  polygon_coords?: [number, number][]; // [lon, lat]
  is_synthetic?: boolean;
}

export interface Bridge {
  bridge_id: string;
  name: string;
  crosses_waterway: string;
  latitude: number;
  longitude: number;
  osm_way_id?: string;
  status: 'OPEN' | 'CLOSED';
  closure_reason?: string;
  is_vulnerable_to_flood?: boolean;
  connected_zones?: string[];
  route_dependency?: string;
  last_verified?: string;
  confidence?: number;
}

export interface EvidenceItem {
  evidence_id: string;
  message_id: string;
  incident_type: string;
  source_tier: 'T1' | 'T2' | 'T3' | 'T4' | string;
  base_tier: number;
  reputation: number;
  freshness: number;
  specificity: number;
  confidence: number;
  status: 'VERIFIED' | 'CORROBORATED' | 'UNVERIFIED' | 'DISPUTED' | 'STALE' | 'REJECTED' | string;
  observed_at: string;
  age_minutes: number;
  latitude?: number;
  longitude?: number;
  people_affected: number;
  is_contradiction: boolean;
  details?: Record<string, any>;
}

export interface EvidenceCluster {
  cluster_id: string;
  incident_type: string;
  centroid_lat: number;
  centroid_lon: number;
  c_support: number;
  c_contra: number;
  status: 'VERIFIED' | 'CORROBORATED' | 'UNVERIFIED' | 'DISPUTED' | 'STALE' | 'REJECTED' | string;
  independent_sources_count: number;
  has_tier1_or_tier2: boolean;
  estimated_people: number;
  evidence_ids: string[];
}

export interface DepotInfo {
  id: string;
  name: string;
  coordinates: [number, number]; // [lon, lat]
  boats: number;
  medical_kits: number;
  status: string;
  coverage?: string;
}

export interface ShelterInfo {
  id: string;
  name: string;
  coordinates: [number, number]; // [lon, lat]
  capacity: number;
  current_occupancy?: number;
  status: string;
}

export interface RoadEdge {
  u: string;
  v: string;
  edge_id: string;
  bridge_id?: string;
  distance_km: number;
  duration_min: number;
  is_open: boolean;
  coordinates: [[number, number], [number, number]];
}

export interface CriticalFacility {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  status: string;
}

export interface NetworkGIS {
  depots: DepotInfo[];
  shelters: ShelterInfo[];
  edges: RoadEdge[];
  noyyal_river: [number, number][];
  critical_facilities: CriticalFacility[];
}

export interface Allocation {
  depot_id: string;
  zone_id: string;
  resource_type: string;
  quantity: number;
  travel_time_min: number;
  route_nodes: string[];
}

export interface UnderservedZone {
  zone_id: string;
  resource_type: string;
  requested: number;
  assigned: number;
  unmet: number;
  reason_code: 'supply_exhausted' | 'no_feasible_route' | 'deadline_infeasible' | 'capacity_limit' | string;
}

export interface ComparisonMetric {
  metric: string;
  previous: string | number;
  proposed: string | number;
  delta: string | number;
}

export interface PlanComparison {
  reachable_zones: ComparisonMetric;
  affected_assignments: ComparisonMetric;
  estimated_response_time: ComparisonMetric;
  unmet_demand: ComparisonMetric;
  resource_utilization: ComparisonMetric;
}

export interface PlanDiffData {
  old_version: number;
  new_version: number;
  cancelled_count: number;
  rerouted_count: number;
  new_count: number;
  unmet_delta: number;
  summary: string;
  rerouted?: any[];
  cancelled?: any[];
  new_assignments?: any[];
}

export interface PlanVersion {
  version_number: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  trigger_event: string;
  trigger_description: string;
  total_requested?: number;
  total_assigned: number;
  total_unmet: number;
  solve_duration_ms?: number;
  allocations?: Allocation[];
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  diff?: PlanDiffData | null;
}

export interface DemoStep {
  step: number;
  name: string;
  description?: string;
  tier?: string;
  confidence?: number;
  status?: string;
  receipts_logged?: number;
  version_number?: number;
  approved_by?: string;
  verdict?: string;
  diff_summary?: string;
  processing_metrics?: Record<string, number>;
}
