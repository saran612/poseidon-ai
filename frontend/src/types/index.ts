import { z } from 'zod';

// ==========================================
// PROVENANCE & RELIABILITY
// ==========================================
export const ReliabilityTierSchema = z.enum(['T1', 'T2', 'T3', 'T4']);
export type ReliabilityTier = z.infer<typeof ReliabilityTierSchema>;

export const TierDescription: Record<ReliabilityTier, { label: string; desc: string; badgeClass: string }> = {
  T1: { label: 'T1 Govt/Field', desc: 'Direct government official or trained rescue team dispatch', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700' },
  T2: { label: 'T2 Sensor IoT', desc: 'Automated telemetry, river gauges & hydrological sensors', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700' },
  T3: { label: 'T3 Verified Public', desc: 'Cross-validated citizen reports with multi-source consensus', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700' },
  T4: { label: 'T4 Unverified', desc: 'Single-source social signal or unconfirmed public call', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700' },
};

// ==========================================
// USER & AUTH
// ==========================================
export const UserRoleSchema = z.enum([
  'Viewer',
  'Operator',
  'Supervisor',
  'Public',
  'NGO',
  'Police',
  'Hospital',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  agency: z.string(),
  token: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

// ==========================================
// REPORTS & VERIFICATION
// ==========================================
export const ReportSourceSchema = z.enum(['hotline', 'sensor', 'field_unit', 'citizen_app', 'social_media', 'official_bulletin']);
export type ReportSource = z.infer<typeof ReportSourceSchema>;

export const ReportSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  wardId: z.string(),
  wardName: z.string(),
  tier: ReliabilityTierSchema,
  reliability: z.number().min(0).max(1),
  source: ReportSourceSchema,
  text: z.string(),
  lat: z.number(),
  lng: z.number(),
  category: z.enum(['flood', 'structural', 'medical', 'stranded', 'road_blocked', 'sensor_alert']),
  verified: z.boolean(),
  isRumour: z.boolean().default(false),
  duplicateOf: z.string().nullable().optional(),
  mediaUrl: z.string().optional(),
});
export type Report = z.infer<typeof ReportSchema>;

export const VerificationTaskSchema = z.object({
  id: z.string(),
  reportId: z.string(),
  wardId: z.string(),
  wardName: z.string(),
  taskType: z.enum(['phone_checkin', 'drone_recon', 'field_scout', 'sensor_crosscheck']),
  assignedTo: z.string(),
  status: z.enum(['pending', 'in_progress', 'verified', 'flagged_rumour', 'dismissed']),
  urgency: z.enum(['critical', 'high', 'medium', 'low']),
  createdAt: z.string(),
  notes: z.string().optional(),
});
export type VerificationTask = z.infer<typeof VerificationTaskSchema>;

// ==========================================
// PRIORITY BANDS & AREAS (WARDS)
// ==========================================
export const PriorityBandSchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
export type PriorityBand = z.infer<typeof PriorityBandSchema>;

export const NeedClassSchema = z.enum(['Rescue', 'Medical', 'Evacuation', 'Supplies', 'Infrastructure']);
export type NeedClass = z.infer<typeof NeedClassSchema>;

export const FactorBreakdownSchema = z.object({
  severity: z.number().min(0).max(1), // S
  vulnerability: z.number().min(0).max(1), // V
  urgency: z.number().min(0).max(1), // U
  exposure: z.number().min(0).max(1), // E
  needCoverage: z.number().min(0).max(1), // N (unmet need)
  waitingBonus: z.number().min(0).max(0.5), // Waiting time bonus
});
export type FactorBreakdown = z.infer<typeof FactorBreakdownSchema>;

export const AreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  rank: z.number(),
  band: PriorityBandSchema,
  scoreP: z.number().min(0).max(100),
  confidenceC: z.number().min(0).max(1),
  peopleAtRisk: z.number(),
  vulnerableShare: z.number().min(0).max(1), // percentage
  assignedUnits: z.number(),
  waitingTimeMinutes: z.number(),
  tier: ReliabilityTierSchema,
  reliability: z.number().min(0).max(1),
  lastUpdated: z.string(),
  isSilent: z.boolean().default(false), // No incoming telemetry
  precautionaryEscalation: z.boolean().default(false),
  factors: FactorBreakdownSchema,
  primaryNeed: NeedClassSchema,
  coordinates: z.tuple([z.number(), z.number()]),
  polygon: z.array(z.tuple([z.number(), z.number()])).optional(),
});
export type Area = z.infer<typeof AreaSchema>;

export const PriorityWeightsSchema = z.object({
  severityWeight: z.number().min(0).max(1),
  vulnerabilityWeight: z.number().min(0).max(1),
  urgencyWeight: z.number().min(0).max(1),
  exposureWeight: z.number().min(0).max(1),
  needWeight: z.number().min(0).max(1),
  waitingTimeMultiplier: z.number().min(0).max(2),
  lastUpdated: z.string(),
  updatedBy: z.string(),
});
export type PriorityWeights = z.infer<typeof PriorityWeightsSchema>;

// ==========================================
// INCIDENTS
// ==========================================
export const IncidentStatusSchema = z.enum(['unverified', 'probable', 'confirmed', 'resolved']);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  wardId: z.string(),
  wardName: z.string(),
  lat: z.number(),
  lng: z.number(),
  priorityBand: PriorityBandSchema,
  status: IncidentStatusSchema,
  tier: ReliabilityTierSchema,
  reliability: z.number().min(0).max(1),
  affectedCount: z.number(),
  needClass: NeedClassSchema,
  description: z.string(),
  reportedAt: z.string(),
  updatedAt: z.string(),
  assignedUnitIds: z.array(z.string()),
  evidenceCount: z.number(),
});
export type Incident = z.infer<typeof IncidentSchema>;

// ==========================================
// RESOURCES & UNITS
// ==========================================
export const ResourceTypeSchema = z.enum([
  'boat',
  'land_rescue',
  'ambulance',
  'medical_team',
  'relief_truck',
  'engineering',
]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const ResourceStatusSchema = z.enum(['available', 'dispatched', 'en_route', 'on_scene', 'returning', 'maintenance']);
export type ResourceStatus = z.infer<typeof ResourceStatusSchema>;

export const ResourceUnitSchema = z.object({
  id: z.string(),
  callsign: z.string(),
  type: ResourceTypeSchema,
  status: ResourceStatusSchema,
  lat: z.number(),
  lng: z.number(),
  capacity: z.number(),
  currentLoad: z.number(),
  fuelPercent: z.number(),
  currentAssignmentId: z.string().nullable(),
  targetWardId: z.string().nullable(),
  idleTimeMinutes: z.number(),
  isReserve: z.boolean(), // 15% reserve protocol
  assignedBase: z.string(),
  lastUpdated: z.string(),
  history: z.array(z.object({
    time: z.string(),
    action: z.string(),
    location: z.string(),
  })),
});
export type ResourceUnit = z.infer<typeof ResourceUnitSchema>;

// ==========================================
// ROADS & NETWORK
// ==========================================
export const RoadStatusSchema = z.enum(['open', 'slow', 'critical', 'closed', 'unknown']);
export type RoadStatus = z.infer<typeof RoadStatusSchema>;

export const RoadSegmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  startCoord: z.tuple([z.number(), z.number()]),
  endCoord: z.tuple([z.number(), z.number()]),
  polyline: z.array(z.tuple([z.number(), z.number()])),
  status: RoadStatusSchema,
  waterDepthCm: z.number(),
  tier: ReliabilityTierSchema,
  reliability: z.number().min(0).max(1),
  lastVerified: z.string(),
  closureReason: z.string().optional(),
  alternativeRouteId: z.string().optional(),
  isBridge: z.boolean().default(false),
});
export type RoadSegment = z.infer<typeof RoadSegmentSchema>;

// ==========================================
// SHELTERS & HOSPITALS
// ==========================================
export const ShelterSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  capacity: z.number(),
  currentOccupancy: z.number(),
  foodKitsAvailable: z.number(),
  waterLitersAvailable: z.number(),
  isAccessible: z.boolean(),
  powerBackup: z.boolean(),
  tier: ReliabilityTierSchema,
  reliability: z.number().min(0).max(1),
  lastUpdated: z.string(),
  contactPhone: z.string(),
});
export type Shelter = z.infer<typeof ShelterSchema>;

export const HospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  totalBeds: z.number(),
  freeBeds: z.number(),
  freeIcuBeds: z.number(),
  traumaCenterLevel: z.enum(['Level 1', 'Level 2', 'Level 3', 'None']),
  oxygenAvailableDays: z.number(),
  generatorOperational: z.boolean(),
  tier: ReliabilityTierSchema,
  reliability: z.number().min(0).max(1),
  lastUpdated: z.string(),
  acceptedPatientTypes: z.array(z.string()),
});
export type Hospital = z.infer<typeof HospitalSchema>;

// ==========================================
// ASSIGNMENTS & REPLAN DIFF (HUMAN IN THE LOOP)
// ==========================================
export const AssignmentStateSchema = z.enum(['proposed', 'approved', 'active', 'rejected', 'completed']);
export type AssignmentState = z.infer<typeof AssignmentStateSchema>;

export const RoutePathSchema = z.object({
  id: z.string(),
  etaMinutes: z.number(),
  distanceKm: z.number(),
  riskScore: z.number().min(0).max(1), // flood water crossings
  dependentEdges: z.array(z.string()),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
});
export type RoutePath = z.infer<typeof RoutePathSchema>;

export const AssignmentSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  unitCallsign: z.string(),
  incidentId: z.string(),
  wardId: z.string(),
  wardName: z.string(),
  taskType: NeedClassSchema,
  state: AssignmentStateSchema,
  proposedAt: z.string(),
  approvedAt: z.string().nullable().optional(),
  approvedBy: z.string().nullable().optional(),
  primaryRoute: RoutePathSchema,
  alternativeRoute: RoutePathSchema.optional(),
  rationale: z.string(),
  urgencyScore: z.number(),
  requiresSupervisor: z.boolean().default(false),
});
export type Assignment = z.infer<typeof AssignmentSchema>;

export const ReplanReasonSchema = z.enum(['Rerouted', 'Re-targeted', 'Re-allocated', 'Escalated']);
export type ReplanReason = z.infer<typeof ReplanReasonSchema>;

export const ReplanDiffItemSchema = z.object({
  assignmentId: z.string(),
  unitCallsign: z.string(),
  wardName: z.string(),
  reason: ReplanReasonSchema,
  oldEtaMinutes: z.number(),
  newEtaMinutes: z.number(),
  oldTarget: z.string(),
  newTarget: z.string(),
  explanation: z.string(),
  affectedEdge: z.string().optional(),
  approved: z.boolean().default(false),
});
export type ReplanDiffItem = z.infer<typeof ReplanDiffItemSchema>;

export const ReplanDiffSchema = z.object({
  id: z.string(),
  triggerEvent: z.string(),
  timestamp: z.string(),
  totalAssignmentsCount: z.number(),
  unaffectedAssignmentsCount: z.number(),
  affectedItems: z.array(ReplanDiffItemSchema),
  status: z.enum(['pending_review', 'partially_approved', 'all_approved', 'dismissed']),
});
export type ReplanDiff = z.infer<typeof ReplanDiffSchema>;

// ==========================================
// EXPLAINABLE DECISIONS (DECISION CARDS)
// ==========================================
export const DecisionAlternativeSchema = z.object({
  label: z.string(),
  score: z.number(),
  rejectedReason: z.string(),
});
export type DecisionAlternative = z.infer<typeof DecisionAlternativeSchema>;

export const DecisionCardSchema = z.object({
  id: z.string(),
  entityType: z.enum(['priority', 'assignment', 'route', 'shelter', 'replan']),
  entityId: z.string(),
  summary: z.string(), // "one-sentence decision"
  timestamp: z.string(),
  evidenceList: z.array(z.object({
    source: z.string(),
    tier: ReliabilityTierSchema,
    reliability: z.number(),
    ageMinutes: z.number(),
    snippet: z.string(),
  })),
  factorContributions: z.record(z.string(), z.number()), // e.g. { S: 0.35, V: 0.25, U: 0.20, E: 0.10, N: 0.10 }
  alternativesConsidered: z.array(DecisionAlternativeSchema),
  counterfactual: z.string(), // "What would change this decision..."
  sensitivityNote: z.string(),
  caveats: z.array(z.string()),
  fairnessNote: z.string().optional(),
  operatorHistory: z.array(z.object({
    time: z.string(),
    operatorName: z.string(),
    action: z.string(),
    reason: z.string().optional(),
  })),
});
export type DecisionCard = z.infer<typeof DecisionCardSchema>;

// ==========================================
// WEATHER & SENSORS
// ==========================================
export const WeatherAlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(['flash_flood_emergency', 'severe_warning', 'watch', 'advisory']),
  expiresAt: z.string(),
  issuedAt: z.string(),
  description: z.string(),
  affectedWards: z.array(z.string()),
});
export type WeatherAlert = z.infer<typeof WeatherAlertSchema>;

export const SensorReadingSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['river_gauge', 'rain_gauge', 'tide_sensor', 'drainage_flow']),
  wardId: z.string(),
  wardName: z.string(),
  currentValue: z.number(),
  unit: z.string(),
  warningThreshold: z.number(),
  dangerThreshold: z.number(),
  tier: ReliabilityTierSchema,
  reliability: z.number().min(0).max(1),
  isFaulty: z.boolean().default(false),
  faultReason: z.string().optional(),
  lastUpdated: z.string(),
  history: z.array(z.object({
    time: z.string(),
    value: z.number(),
  })),
});
export type SensorReading = z.infer<typeof SensorReadingSchema>;

// ==========================================
// AUDIT LOGS
// ==========================================
export const LogSeveritySchema = z.enum(['info', 'warning', 'critical', 'override']);
export type LogSeverity = z.infer<typeof LogSeveritySchema>;

export const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  severity: LogSeveritySchema,
  type: z.string(),
  actor: z.string(), // "System", "Operator (K. Murugan)", etc.
  entity: z.string(),
  summary: z.string(),
  reliability: z.number().optional(),
  details: z.record(z.string(), z.any()).optional(),
  decisionId: z.string().optional(),
  overrideReason: z.string().optional(),
});
export type LogEntry = z.infer<typeof LogEntrySchema>;

// ==========================================
// WEBSOCKET REALTIME EVENTS
// ==========================================
export const RealtimeEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('report.created'), data: ReportSchema, timestamp: z.string() }),
  z.object({ type: z.literal('incident.updated'), data: IncidentSchema, timestamp: z.string() }),
  z.object({ type: z.literal('priority.updated'), data: AreaSchema, timestamp: z.string() }),
  z.object({ type: z.literal('assignment.proposed'), data: AssignmentSchema, timestamp: z.string() }),
  z.object({ type: z.literal('assignment.approved'), data: AssignmentSchema, timestamp: z.string() }),
  z.object({ type: z.literal('assignment.updated'), data: AssignmentSchema, timestamp: z.string() }),
  z.object({ type: z.literal('assignment.completed'), data: z.object({ id: z.string() }), timestamp: z.string() }),
  z.object({ type: z.literal('road.status'), data: RoadSegmentSchema, timestamp: z.string() }),
  z.object({ type: z.literal('shelter.updated'), data: ShelterSchema, timestamp: z.string() }),
  z.object({ type: z.literal('hospital.updated'), data: HospitalSchema, timestamp: z.string() }),
  z.object({ type: z.literal('resource.updated'), data: ResourceUnitSchema, timestamp: z.string() }),
  z.object({ type: z.literal('weather.alert'), data: WeatherAlertSchema, timestamp: z.string() }),
  z.object({ type: z.literal('sensor.reading'), data: SensorReadingSchema, timestamp: z.string() }),
  z.object({ type: z.literal('replan.diff'), data: ReplanDiffSchema, timestamp: z.string() }),
  z.object({ type: z.literal('log.entry'), data: LogEntrySchema, timestamp: z.string() }),
]);
export type RealtimeEvent = z.infer<typeof RealtimeEventSchema>;
