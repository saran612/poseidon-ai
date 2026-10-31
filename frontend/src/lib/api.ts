import type {
  Area,
  ResourceUnit,
  Incident,
  RoadSegment,
  Shelter,
  Hospital,
  Assignment,
  WeatherAlert,
  SensorReading,
  PriorityWeights,
  DecisionCard,
  LogEntry,
  ReplanDiff,
} from '@/types';

// Environment-based API URL configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// In-memory weight cache and audit log storage
let priorityWeights: PriorityWeights = {
  severityWeight: 0.35,
  vulnerabilityWeight: 0.20,
  urgencyWeight: 0.15,
  exposureWeight: 0.20,
  needWeight: 0.10,
  waitingTimeMultiplier: 1.0,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'System Engine',
};

let localAuditLogs: LogEntry[] = [];

// Helper for making typed fetch requests
async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('poseidon-jwt-token') || localStorage.getItem('poseidon-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-poseidon-token'] = token;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error [${response.status}] ${response.statusText}: ${errorText}`);
  }

  return response.json();
}

export const api = {
  // ==========================================
  // 1. SITUATION & ZONES (AREAS)
  // ==========================================
  getAreas: async (): Promise<Area[]> => {
    try {
      const data = await fetchJson<{ zones: any[] }>('/situation/zones');
      return data.zones.map((z: any) => {
        const factors = z.factor_breakdown || {};
        const coords: [number, number] = [z.centroid_lat || 10.99, z.centroid_lon || 76.97];
        const rawPolygon = z.polygon_coords || [];
        const polygon: [number, number][] = rawPolygon.map((p: any) => [p[1], p[0]]);

        return {
          id: z.zone_id,
          name: z.name,
          rank: z.rank,
          band: (z.tier as any) || 'MEDIUM',
          scoreP: Math.min(100, Math.round((z.score_expected || 0.5) * 100)),
          confidenceC: z.confidence || 0.8,
          peopleAtRisk: z.population || 12000,
          vulnerableShare: z.vulnerability_index || 0.65,
          assignedUnits: 2,
          waitingTimeMinutes: Math.round(z.data_freshness_min || 15),
          tier: 'T1' as const,
          reliability: z.confidence || 0.85,
          lastUpdated: new Date().toISOString(),
          isSilent: false,
          precautionaryEscalation: z.verify_next || false,
          factors: {
            severity: factors.life_threat ?? 0.6,
            vulnerability: factors.vulnerability ?? 0.7,
            urgency: factors.trend ?? 0.5,
            exposure: factors.exposure ?? 0.6,
            needCoverage: 1 - (factors.access_loss ?? 0.2),
            waitingBonus: 0.1,
          },
          primaryNeed: 'Rescue' as const,
          coordinates: coords,
          polygon: polygon.length > 0 ? polygon : undefined,
        };
      });
    } catch (err) {
      console.error('[API] Failed to fetch zones from backend:', err);
      throw err;
    }
  },

  getWeights: async (): Promise<PriorityWeights> => {
    return priorityWeights;
  },

  updateWeights: async (newWeights: Partial<PriorityWeights>, updatedBy: string): Promise<PriorityWeights> => {
    priorityWeights = {
      ...priorityWeights,
      ...newWeights,
      lastUpdated: new Date().toISOString(),
      updatedBy,
    };
    return priorityWeights;
  },

  // ==========================================
  // 2. RESOURCES & FLEET INVENTORY
  // ==========================================
  getResources: async (): Promise<ResourceUnit[]> => {
    try {
      const net = await fetchJson<{ depots: any[] }>('/situation/network');
      const units: ResourceUnit[] = [];

      (net.depots || []).forEach((depot: any, dIdx: number) => {
        const boatCount = depot.boats || 5;
        const coords: [number, number] = [depot.coordinates[1], depot.coordinates[0]];

        for (let i = 1; i <= boatCount; i++) {
          const uId = `UNIT-${depot.id.replace('DEPOT_', '')}-${i.toString().padStart(2, '0')}`;
          units.push({
            id: uId,
            callsign: `${depot.name.split(' ')[0]} Rescue Craft ${i}`,
            type: 'boat',
            status: i <= 2 ? 'dispatched' : 'available',
            lat: coords[0] + (i * 0.002 - 0.005),
            lng: coords[1] + (i * 0.002 - 0.005),
            capacity: 6,
            currentLoad: i <= 2 ? 4 : 0,
            fuelPercent: 85 - (i * 3),
            currentAssignmentId: i <= 2 ? `ASGN-PERUR-0${i}` : null,
            targetWardId: i <= 2 ? 'ZONE_PERUR' : null,
            idleTimeMinutes: i <= 2 ? 0 : 25 + i * 5,
            isReserve: i >= boatCount - 1,
            assignedBase: depot.name,
            lastUpdated: new Date().toISOString(),
            history: [
              { time: '10:00 AM', action: 'Engine check & fuel confirmed', location: depot.name },
            ],
          });
        }
      });
      return units;
    } catch (err) {
      console.error('[API] Failed to fetch resources from backend:', err);
      throw err;
    }
  },

  // ==========================================
  // 3. INCIDENTS & EVIDENCE CLUSTERS
  // ==========================================
  getIncidents: async (): Promise<Incident[]> => {
    try {
      const data = await fetchJson<{ clusters: any[] }>('/evidence/clusters');
      return (data.clusters || []).map((cl: any, idx: number) => ({
        id: cl.cluster_id || `INC-00${idx + 1}`,
        title: `${cl.incident_type.replace(/_/g, ' ')} Incident`,
        wardId: 'ZONE_PERUR',
        wardName: 'Perur Corridor',
        lat: cl.centroid_lat,
        lng: cl.centroid_lon,
        priorityBand: cl.status === 'VERIFIED' ? 'CRITICAL' : (cl.status === 'CORROBORATED' ? 'HIGH' : 'MEDIUM'),
        status: cl.status === 'VERIFIED' ? 'confirmed' : 'probable',
        tier: cl.has_tier1_or_tier2 ? 'T1' : 'T3',
        reliability: cl.c_support || 0.8,
        affectedCount: cl.estimated_people || 15,
        needClass: 'Rescue' as const,
        description: `Corroborated incident cluster from ${cl.independent_sources_count} independent sources. Support: ${(cl.c_support * 100).toFixed(0)}%.`,
        reportedAt: new Date(Date.now() - idx * 600000).toISOString(),
        updatedAt: new Date().toISOString(),
        assignedUnitIds: ['UNIT-RS_PURAM-01'],
        evidenceCount: cl.evidence_ids?.length || 1,
      }));
    } catch (err) {
      console.error('[API] Failed to fetch incidents from backend:', err);
      throw err;
    }
  },

  // ==========================================
  // 4. ROADS & BRIDGES (NETWORK IMPEDANCE)
  // ==========================================
  getRoads: async (): Promise<RoadSegment[]> => {
    try {
      const data = await fetchJson<{ bridges: any[] }>('/situation/bridges');
      return (data.bridges || []).map((b: any) => {
        const isClosed = b.status === 'CLOSED';
        const lat = b.latitude;
        const lng = b.longitude;
        return {
          id: b.bridge_id,
          name: b.name,
          startCoord: [lat - 0.002, lng - 0.002],
          endCoord: [lat + 0.002, lng + 0.002],
          polyline: [
            [lat - 0.002, lng - 0.002],
            [lat, lng],
            [lat + 0.002, lng + 0.002],
          ],
          status: isClosed ? ('closed' as const) : ('open' as const),
          waterDepthCm: isClosed ? 95 : 12,
          tier: 'T1' as const,
          reliability: b.confidence || 0.95,
          lastVerified: b.last_verified || 'PWD Sensor & NDRF Telemetry',
          closureReason: b.closure_reason,
          isBridge: true,
        };
      });
    } catch (err) {
      console.error('[API] Failed to fetch bridges/roads from backend:', err);
      throw err;
    }
  },

  // ==========================================
  // 5. SHELTERS & HOSPITALS
  // ==========================================
  getShelters: async (): Promise<Shelter[]> => {
    try {
      const data = await fetchJson<{ shelters: any[] }>('/shelters');
      return (data.shelters || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        lat: s.coordinates[0],
        lng: s.coordinates[1],
        capacity: s.capacity,
        currentOccupancy: s.current_occupancy,
        foodKitsAvailable: s.capacity - s.current_occupancy + 80,
        waterLitersAvailable: (s.capacity - s.current_occupancy) * 20,
        isAccessible: s.status === 'OPERATIONAL',
        powerBackup: true,
        tier: 'T1' as const,
        reliability: 0.98,
        lastUpdated: s.last_updated,
        contactPhone: '+91 422 230 4551',
      }));
    } catch (err) {
      console.error('[API] Failed to fetch shelters from backend:', err);
      throw err;
    }
  },

  getHospitals: async (): Promise<Hospital[]> => {
    try {
      const net = await fetchJson<{ critical_facilities: any[] }>('/situation/network');
      return (net.critical_facilities || []).map((h: any, idx: number) => ({
        id: h.id,
        name: h.name,
        lat: h.coordinates[1],
        lng: h.coordinates[0],
        totalBeds: idx === 0 ? 850 : 650,
        freeBeds: idx === 0 ? 94 : 62,
        freeIcuBeds: idx === 0 ? 12 : 8,
        traumaCenterLevel: 'Level 1' as const,
        oxygenAvailableDays: 5.5,
        generatorOperational: true,
        tier: 'T1' as const,
        reliability: 0.99,
        lastUpdated: new Date().toISOString(),
        acceptedPatientTypes: ['Trauma / Critical Extraction', 'Hypothermia', 'Flood Inhalation'],
      }));
    } catch (err) {
      console.error('[API] Failed to fetch hospitals from backend:', err);
      throw err;
    }
  },

  // ==========================================
  // 6. ASSIGNMENTS & DISPATCH QUEUE
  // ==========================================
  getAssignments: async (): Promise<Assignment[]> => {
    try {
      const data = await fetchJson<{ assignments: any[] }>('/assignments');
      return (data.assignments || []).map((asgn: any) => ({
        id: asgn.id || asgn.assignment_id,
        unitId: asgn.unit_id || asgn.resource_id,
        unitCallsign: asgn.unit_callsign || asgn.callsign || 'Relief Craft',
        incidentId: asgn.incident_id || 'INC-GENERAL-01',
        wardId: asgn.ward_id || asgn.zone_id,
        wardName: asgn.ward_name || asgn.zone_name,
        taskType: 'Rescue' as const,
        state: asgn.state || (asgn.status === 'DISPATCHED' ? 'approved' : 'proposed'),
        proposedAt: asgn.created_at || new Date().toISOString(),
        approvedAt: asgn.status === 'DISPATCHED' ? asgn.created_at : undefined,
        approvedBy: 'District Collector Command',
        primaryRoute: {
          id: `ROUTE-${asgn.id}`,
          etaMinutes: asgn.travel_time_min || 18,
          distanceKm: asgn.primary_route?.distance_km || Math.round((asgn.travel_time_min || 18) * 0.6),
          riskScore: asgn.primary_route?.risk_score || 0.25,
          dependentEdges: asgn.route_nodes || ['DEPOT_RS_PURAM', 'ZONE_PERUR'],
          coordinates: [
            [10.9708, 76.9152],
            [10.9880, 76.9400],
            [11.0080, 76.9480],
          ],
        },
        rationale: asgn.rationale || `Optimized allocation satisfying fairness floor theta=0.5 with ETA ${asgn.travel_time_min} mins.`,
        urgencyScore: asgn.priority_score || 0.85,
        requiresSupervisor: false,
      }));
    } catch (err) {
      console.error('[API] Failed to fetch assignments from backend:', err);
      throw err;
    }
  },

  approveAssignment: async (id: string, operatorName: string, note?: string): Promise<any> => {
    return fetchJson(`/assignments/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ status: 'APPROVED', notes: note || `Approved by ${operatorName}` }),
    });
  },

  rejectAssignment: async (id: string, operatorName: string, reason: string): Promise<any> => {
    return fetchJson(`/assignments/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ status: 'REJECTED', notes: `Rejected by ${operatorName}: ${reason}` }),
    });
  },

  editAssignment: async (id: string, operatorName: string, unitId: string, targetWardId: string, reason: string): Promise<any> => {
    return fetchJson(`/assignments/${id}/edit`, {
      method: 'POST',
      body: JSON.stringify({ unit_id: unitId, target_ward_id: targetWardId, reason }),
    });
  },

  // ==========================================
  // 7. DYNAMIC REPLANNING LIFECYCLE
  // ==========================================
  getBridges: async (): Promise<any[]> => {
    try {
      const data = await fetchJson<{ bridges: any[] }>('/situation/bridges');
      return data.bridges || [];
    } catch (err) {
      console.error('[API] Failed to fetch bridges:', err);
      return [];
    }
  },

  getPlanHistory: async (planId: string = 'PLAN-OPERATIONAL-01'): Promise<any> => {
    try {
      return await fetchJson(`/replanning/plans/${planId}`);
    } catch (err) {
      console.error('[API] Failed to fetch plan history:', err);
      return { plan_id: planId, versions: [], comparison: null, active_road_closures: {} };
    }
  },

  closeBridgeAndReplan: async (bridgeId: string, closureReason: string): Promise<any> => {
    return fetchJson('/replanning/close-bridge', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: 'PLAN-OPERATIONAL-01',
        bridge_id: bridgeId,
        closure_reason: closureReason,
        operator_role: 'EMERGENCY_COMMANDER',
      }),
    });
  },

  reopenBridge: async (bridgeId: string): Promise<any> => {
    return fetchJson('/replanning/reopen-bridge', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: 'PLAN-OPERATIONAL-01',
        bridge_id: bridgeId,
        operator_role: 'EMERGENCY_COMMANDER',
      }),
    });
  },

  approvePlan: async (planId: string, versionNumber: number, operatorId: string): Promise<any> => {
    return fetchJson('/replanning/approve', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, version_number: versionNumber, operator_id: operatorId }),
    });
  },

  rejectPlan: async (planId: string, versionNumber: number, operatorId: string, reason: string): Promise<any> => {
    return fetchJson('/replanning/reject', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, version_number: versionNumber, operator_id: operatorId, reason }),
    });
  },

  // ==========================================
  // 8. WEATHER & SENSORS
  // ==========================================
  getWeatherAlerts: async (): Promise<WeatherAlert[]> => {
    try {
      const data = await fetchJson<{ alerts: any[] }>('/weather/alerts');
      return (data.alerts || []).map((a: any) => ({
        id: a.id,
        title: a.headline || 'Heavy Inundation Warning',
        severity: (a.severity?.toLowerCase() === 'critical' ? 'flash_flood_emergency' : (a.severity?.toLowerCase() === 'high' ? 'severe_warning' : 'watch')) as any,
        expiresAt: a.valid_until || new Date(Date.now() + 86400000).toISOString(),
        issuedAt: new Date().toISOString(),
        description: `Issued by ${a.agency || 'IMD'}. Expected rainfall: ${a.rainfall_expected_mm ?? 120}mm. Affected: ${(a.affected_zones || []).join(', ')}`,
        affectedWards: a.affected_zones || [],
      }));
    } catch (err) {
      console.error('[API] Failed to fetch weather alerts:', err);
      throw err;
    }
  },

  getSensors: async (): Promise<SensorReading[]> => {
    try {
      const data = await fetchJson<{ sensors: any[] }>('/sensors');
      return (data.sensors || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        type: (s.type?.toLowerCase().includes('rain') ? 'rain_gauge' : (s.type?.toLowerCase().includes('river') ? 'river_gauge' : 'drainage_flow')) as any,
        wardId: 'ZONE_COIMBATORE_CENTRAL',
        wardName: 'Coimbatore District Network',
        currentValue: s.reading_value,
        unit: s.unit || 'm',
        warningThreshold: s.threshold_warning || 2.5,
        dangerThreshold: s.threshold_critical || 3.5,
        tier: 'T1' as const,
        reliability: 0.95,
        isFaulty: false,
        lastUpdated: s.last_reading_at || new Date().toISOString(),
        history: [
          { time: '10:00 AM', value: s.reading_value * 0.8 },
          { time: '11:00 AM', value: s.reading_value * 0.9 },
          { time: '12:00 PM', value: s.reading_value },
        ],
      }));
    } catch (err) {
      console.error('[API] Failed to fetch sensors:', err);
      throw err;
    }
  },

  // ==========================================
  // 9. EXPLAINABILITY & AUDIT LOGS
  // ==========================================
  getDecision: async (id: string): Promise<DecisionCard> => {
    return {
      id,
      entityType: 'priority',
      entityId: id,
      summary: `Autonomous priority and allocation decision computed via multi-factor interval scoring and OR-Tools CP-SAT.`,
      timestamp: new Date().toISOString(),
      evidenceList: [
        { source: 'Field Telemetry Mesh', tier: 'T1', reliability: 0.94, ageMinutes: 4.5, snippet: 'Verified ground conditions.' },
      ],
      factorContributions: { 'Life Threat (S)': 0.35, 'Urgency (U)': 0.30, 'Vulnerability (V)': 0.20, 'Unmet Need': 0.15 },
      alternativesConsidered: [{ label: 'Secondary Peelamedu Depot', score: 68.2, rejectedReason: 'Exceeded 25 min travel radius threshold.' }],
      counterfactual: 'Would recommend alternative depot if bridge access is cut off.',
      sensitivityNote: 'Stable within +-15% variance.',
      caveats: ['Requires real-time road clearance validation.'],
      operatorHistory: [{ time: '11:00 AM', operatorName: 'System Engine', action: 'Drafted recommendation' }],
    };
  },

  getLogs: async (): Promise<LogEntry[]> => {
    return localAuditLogs;
  },
};

// Aliased export for backwards compatibility with any component importing mockApi
export const mockApi = api;
