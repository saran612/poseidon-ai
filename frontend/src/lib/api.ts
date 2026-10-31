import {
  INITIAL_AREAS,
  INITIAL_RESOURCES,
  INITIAL_INCIDENTS,
  INITIAL_ROADS,
  INITIAL_SHELTERS,
  INITIAL_HOSPITALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_WEATHER_ALERTS,
  INITIAL_SENSORS,
  INITIAL_WEIGHTS,
  INITIAL_DECISIONS,
  INITIAL_LOGS,
} from '@/mock/seedData';
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
} from '@/types';

// In-memory state for mock api
let areas: Area[] = [...INITIAL_AREAS];
let resources: ResourceUnit[] = [...INITIAL_RESOURCES];
let incidents: Incident[] = [...INITIAL_INCIDENTS];
let roads: RoadSegment[] = [...INITIAL_ROADS];
let shelters: Shelter[] = [...INITIAL_SHELTERS];
let hospitals: Hospital[] = [...INITIAL_HOSPITALS];
let assignments: Assignment[] = [...INITIAL_ASSIGNMENTS];
let weatherAlerts: WeatherAlert[] = [...INITIAL_WEATHER_ALERTS];
let sensors: SensorReading[] = [...INITIAL_SENSORS];
let weights: PriorityWeights = { ...INITIAL_WEIGHTS };
const decisions: Record<string, DecisionCard> = { ...INITIAL_DECISIONS };
let logs: LogEntry[] = [...INITIAL_LOGS];

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Areas
  getAreas: async (): Promise<Area[]> => {
    await delay();
    return [...areas].sort((a, b) => b.scoreP - a.scoreP);
  },

  updateWeights: async (newWeights: Partial<PriorityWeights>, updatedBy: string): Promise<PriorityWeights> => {
    await delay();
    weights = {
      ...weights,
      ...newWeights,
      lastUpdated: new Date().toISOString(),
      updatedBy,
    };
    // Recalculate area scoreP with live re-ranking
    areas = areas.map((area) => {
      const p =
        area.factors.severity * (weights.severityWeight * 100) +
        area.factors.vulnerability * (weights.vulnerabilityWeight * 100) +
        area.factors.urgency * (weights.urgencyWeight * 100) +
        area.factors.exposure * (weights.exposureWeight * 100) +
        (1 - area.factors.needCoverage) * (weights.needWeight * 100) +
        area.factors.waitingBonus * (weights.waitingTimeMultiplier * 50);
      return {
        ...area,
        scoreP: Math.min(100, Math.round(p * 10) / 10),
      };
    });
    // Add audit log entry
    logs.unshift({
      id: `LOG-W-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'override',
      type: 'WEIGHTS_RECONFIGURED',
      actor: updatedBy,
      entity: 'PriorityWeights',
      summary: `Supervisor reconfigured scoring weights (Severity: ${weights.severityWeight}, Vuln: ${weights.vulnerabilityWeight}).`,
      details: weights,
    });
    return weights;
  },

  getWeights: async (): Promise<PriorityWeights> => {
    await delay();
    return weights;
  },

  // Resources
  getResources: async (): Promise<ResourceUnit[]> => {
    await delay();
    return [...resources];
  },

  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    await delay();
    return [...incidents];
  },

  // Roads
  getRoads: async (): Promise<RoadSegment[]> => {
    await delay();
    return [...roads];
  },

  // Shelters
  getShelters: async (): Promise<Shelter[]> => {
    await delay();
    return [...shelters];
  },

  // Hospitals
  getHospitals: async (): Promise<Hospital[]> => {
    await delay();
    return [...hospitals];
  },

  // Assignments (Human In The Loop)
  getAssignments: async (): Promise<Assignment[]> => {
    await delay();
    return [...assignments];
  },

  approveAssignment: async (id: string, operatorName: string, note?: string): Promise<Assignment> => {
    await delay();
    const asgn = assignments.find((a) => a.id === id);
    if (!asgn) throw new Error('Assignment not found');
    asgn.state = 'approved';
    asgn.approvedAt = new Date().toISOString();
    asgn.approvedBy = operatorName;

    // Update resource state
    const unit = resources.find((r) => r.id === asgn.unitId);
    if (unit) {
      unit.status = 'en_route';
      unit.currentAssignmentId = asgn.id;
      unit.targetWardId = asgn.wardId;
    }

    logs.unshift({
      id: `LOG-APP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      type: 'ASSIGNMENT_APPROVED',
      actor: operatorName,
      entity: asgn.id,
      summary: `Operator approved dispatch of ${asgn.unitCallsign} to ${asgn.wardName}. ${note || ''}`,
    });

    return asgn;
  },

  rejectAssignment: async (id: string, operatorName: string, reason: string): Promise<Assignment> => {
    await delay();
    const asgn = assignments.find((a) => a.id === id);
    if (!asgn) throw new Error('Assignment not found');
    asgn.state = 'rejected';

    logs.unshift({
      id: `LOG-REJ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      type: 'ASSIGNMENT_REJECTED',
      actor: operatorName,
      entity: asgn.id,
      summary: `Operator rejected dispatch proposal: ${reason}`,
      overrideReason: reason,
    });

    return asgn;
  },

  editAssignment: async (
    id: string,
    operatorName: string,
    unitId: string,
    targetWardId: string,
    reason: string
  ): Promise<Assignment> => {
    await delay();
    const asgn = assignments.find((a) => a.id === id);
    if (!asgn) throw new Error('Assignment not found');

    const newUnit = resources.find((r) => r.id === unitId);
    const newArea = areas.find((a) => a.id === targetWardId);

    asgn.unitId = unitId;
    if (newUnit) asgn.unitCallsign = newUnit.callsign;
    if (newArea) {
      asgn.wardId = newArea.id;
      asgn.wardName = newArea.name;
    }
    // Re-validate and recalculate route
    asgn.primaryRoute.etaMinutes = Math.floor(Math.random() * 15) + 10;
    asgn.primaryRoute.distanceKm = Math.floor(Math.random() * 8) + 3;

    logs.unshift({
      id: `LOG-EDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      type: 'ASSIGNMENT_EDITED',
      actor: operatorName,
      entity: asgn.id,
      summary: `Operator reallocated assignment to ${asgn.unitCallsign} -> ${asgn.wardName}: ${reason}`,
      overrideReason: reason,
    });

    return asgn;
  },

  // Weather & Sensors
  getWeatherAlerts: async (): Promise<WeatherAlert[]> => {
    await delay();
    return [...weatherAlerts];
  },

  getSensors: async (): Promise<SensorReading[]> => {
    await delay();
    return [...sensors];
  },

  // Explainable Decisions
  getDecision: async (id: string): Promise<DecisionCard> => {
    await delay();
    if (decisions[id]) return decisions[id];
    // Return a dynamically synthesized decision card if not pre-seeded
    return {
      id,
      entityType: 'priority',
      entityId: id,
      summary: `Optimization outcome for ${id} computed from multi-factor weighted scoring.`,
      timestamp: new Date().toISOString(),
      evidenceList: [
        { source: 'Field Telemetry Mesh', tier: 'T1', reliability: 0.92, ageMinutes: 10, snippet: 'Verified ground conditions.' },
      ],
      factorContributions: { 'Severity (S)': 0.35, 'Urgency (U)': 0.30, 'Vulnerability (V)': 0.20, 'Unmet Need': 0.15 },
      alternativesConsidered: [{ label: 'Secondary Depot', score: 68.2, rejectedReason: 'Exceeded 25 min travel radius threshold.' }],
      counterfactual: 'Would recommend alternative depot if bridge access is cut off.',
      sensitivityNote: 'Stable within ±15% variance.',
      caveats: ['Requires real-time road clearance validation.'],
      operatorHistory: [{ time: '11:00 AM', operatorName: 'System Engine', action: 'Drafted recommendation' }],
    };
  },

  // Logs
  getLogs: async (): Promise<LogEntry[]> => {
    await delay();
    return [...logs];
  },
};
