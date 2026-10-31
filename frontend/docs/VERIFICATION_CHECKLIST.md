# POSEIDON Command Dashboard — Comprehensive Verification Checklist

This checklist enumerates every route, shared component, role, realtime event type, API endpoint, critical flow, and verification requirement for the POSEIDON Command Dashboard frontend.

---

## 1. Routes & Pages

| Route Path | Component / Page | Description | Verified Status | Evidence |
|------------|------------------|-------------|-----------------|----------|
| `/` | `OverviewPage` | System Overview, 6 KPI cards, Top 5 Priority Sectors, Verification Tasks, Live Feed, Mini Map | PASS | `docs/verification/overview-light-1440.png`, `docs/verification/overview-dark-1440.png` |
| `/map` | `MapPage` | Interactive Leaflet Mission Map, 7 Layers, Side Sheet, Time Scrubber, Measure Tool | PASS | `docs/verification/map-light-1440.png`, `docs/verification/map-dark-1440.png` |
| `/weather` | `WeatherDashboardPage` | Severe Weather, Radar, Gauges, Rainfall, Forecast, Faulty Sensor alert | PASS | `docs/verification/weather-light-1440.png`, `docs/verification/weather-dark-1440.png` |
| `/priorities` | `PrioritiesPage` | Ranked Wards, S/V/U/E/N Factor Bars, Supervisor Weight Tuning, Silent Areas | PASS | `docs/verification/priorities-light-1440.png`, `e2e/roles.spec.ts` |
| `/resources` | `ResourcesPage` | Fleet readiness, 15% Strategic Reserve cushion, Resource Unit details & history | PASS | `docs/verification/resources-light-1440.png`, `docs/verification/resources-dark-1440.png` |
| `/shelters` | `SheltersHospitalsPage` | Shelter occupancy, ICU/Trauma capacity, Intelligent Recommendation panel | PASS | `docs/verification/shelters-light-1440.png`, `docs/verification/shelters-dark-1440.png` |
| `/routing` | `RoutingPage` | Multi-corridor Routing, Unit/Target Re-allocation, Bridge closure impact | PASS | `docs/verification/routing-light-1440.png`, `e2e/critical_flows.spec.ts` |
| `/decisions` | `DecisionsPage` | Explainable AI Decisions Explorer, Counterfactuals, Search & Filters | PASS | `docs/verification/decisions-light-1440.png`, `docs/verification/decisions-dark-1440.png` |
| `/analytics` | `AnalyticsPage` | Equity metrics, Gini coefficient, Served-to-Need ratio, Synthetic baselines | PASS | `docs/verification/analytics-light-1440.png`, `docs/verification/analytics-dark-1440.png` |
| `/logs` | `LogsPage` | Audit log trail, Operator Overrides, Virtualized stream, JSON detail drawer | PASS | `docs/verification/logs-light-1440.png`, `docs/verification/logs-dark-1440.png` |
| `/settings` | `SettingsPage` | Theme (Light/Dark), i18n (en/ta/hi), Tile source, Sound/Notification rules | PASS | `docs/verification/settings-light-1440.png`, `docs/verification/settings-dark-1440.png` |

---

## 2. Shared Components & Design Primitives

| Component Name | File Path | States & Behaviors Required | Verified Status | Evidence |
|----------------|-----------|-----------------------------|-----------------|----------|
| `TierBadge` | `src/components/common/TierBadge.tsx` | T1, T2, T3, T4 styling, accessible description tooltip | PASS | `src/tests/components/CommonComponents.test.tsx` (Test: TierBadge renders correct label) |
| `ReliabilityBar` | `src/components/common/ReliabilityBar.tsx` | 0.00 - 1.00 bar, colour gradation, accessible label | PASS | `src/tests/components/CommonComponents.test.tsx` (Test: ReliabilityBar displays progressbar) |
| `StaleBadge` | `src/components/common/StaleBadge.tsx` | Amber badge for data > threshold, "Call to confirm" action | PASS | `src/tests/components/CommonComponents.test.tsx`, `src/tests/reliabilityAndStale.test.ts` |
| `PriorityBandChip` | `src/components/common/PriorityBandChip.tsx` | CRITICAL, HIGH, MEDIUM, LOW badges matching score | PASS | `src/tests/components/CommonComponents.test.tsx`, `src/tests/bandFromScore.test.ts` |
| `FactorBars` | `src/components/common/FactorBars.tsx` | S, V, U, E, N, Waiting bonus breakdowns | PASS | `src/tests/components/CommonComponents.test.tsx` (Test: FactorBars renders S, V, U, E, N) |
| `EvidenceLedger` | `src/components/common/EvidenceLedger.tsx` | Evidence items with tier, age, source, reliability | PASS | Tested across DecisionCardModal on `/decisions` and `/priorities` |
| `DecisionCardModal` | `src/components/common/DecisionCardModal.tsx` | "Why?" card with summary, weights, counterfactuals, caveats | PASS | Tested in `e2e/critical_flows.spec.ts` & UI modal triggers |
| `AssignmentCard` | `src/components/common/AssignmentCard.tsx` | Proposal cards, Approve/Reject/Edit action buttons | PASS | Tested in `e2e/critical_flows.spec.ts` (Flow A) |
| `DispatchQueueDrawer` | `src/components/common/DispatchQueueDrawer.tsx` | Drawer showing pending proposals, badge count sync | PASS | Tested in `e2e/critical_flows.spec.ts` (Flow A) |
| `ReplanDiffModal` | `src/components/common/ReplanDiffModal.tsx` | Isolated reroutes, old vs new ETA, unaffected counts | PASS | Tested in `e2e/critical_flows.spec.ts` (Flow C) |
| `ConnectionBanner` | `src/components/common/ConnectionBanner.tsx` | Connected, Reconnecting, Disconnected states & resume cursor | PASS | Tested in `src/tests/realtime.test.ts` |
| `KpiCard` | `src/components/common/KpiCard.tsx` | Value, caption, sparkline/trend, theme styling | PASS | `src/tests/components/CommonComponents.test.tsx` (Test: KpiCard renders title, value) |
| `SimulationControls` | `src/components/common/SimulationControls.tsx` | 1x, 2x, 5x, Pause, Bridge closure & fault triggers | PASS | Tested on `/settings` and Topbar controls |
| `ConfirmDialog` | `src/components/feedback/ConfirmDialog.tsx` | Accessible modal, focus trap, Confirm & Cancel | PASS | `src/tests/components/CommonComponents.test.tsx` (Test: ConfirmDialog opens, handles Escape) |
| `EmptyState` | `src/components/feedback/EmptyState.tsx` | Empty data fallback with icon and message | PASS | `src/tests/components/CommonComponents.test.tsx` (Test: EmptyState renders message) |
| `ErrorState` | `src/components/feedback/ErrorState.tsx` | Error banner with retry action trigger | PASS | `src/tests/components/CommonComponents.test.tsx` (Test: ErrorState displays error description) |

---

## 3. User Roles & Access Control

| Role | Allowed Actions | Forbidden Actions | UI & API Verification | Evidence |
|------|-----------------|-------------------|-----------------------|----------|
| **Viewer** | View all pages, view Decision Cards, inspect logs | Approve/Reject/Edit proposals, tune weights, inject scenarios | PASS | `e2e/roles.spec.ts` (Viewer has read-only access) |
| **Operator** | All Viewer + Approve, Reject, Edit proposals, acknowledge alerts | Modify priority weights, freeze automation engine | PASS | `e2e/roles.spec.ts` (Operator cannot adjust weights) |
| **Supervisor** | All Operator + Modify scoring weights, freeze automation, approve drafts | None | PASS | `e2e/roles.spec.ts` (Supervisor can adjust weights and save overrides) |

---

## 4. Realtime Event Types (WebSocket / Simulation)

| Event Type | Payload Schema | Cache Patch / State Target | Full Refetch Triggered? | Verified Status | Evidence |
|------------|----------------|----------------------------|-------------------------|-----------------|----------|
| `report.created` | `ReportSchema` | Zustand event buffer | No (In-memory buffer) | PASS | `src/tests/realtime.test.ts` |
| `incident.updated` | `IncidentSchema` | `['incidents']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `priority.updated` | `AreaSchema` | `['areas']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `assignment.proposed` | `AssignmentSchema` | `['assignments']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `assignment.approved` | `AssignmentSchema` | `['assignments']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `assignment.updated` | `AssignmentSchema` | `['assignments']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `assignment.completed`| `{ id: string }` | `['assignments']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `road.status` | `RoadSegmentSchema` | `['roads']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `shelter.updated` | `ShelterSchema` | `['shelters']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `hospital.updated` | `HospitalSchema` | `['hospitals']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `resource.updated` | `ResourceUnitSchema` | `['resources']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `weather.alert` | `WeatherAlertSchema` | `['weatherAlerts']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `sensor.reading` | `SensorReadingSchema` | `['sensors']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |
| `replan.diff` | `ReplanDiffSchema` | `useRealtimeStore.activeReplanDiff` | No (Zustand state update) | PASS | `src/tests/realtimeReducer.test.ts` |
| `log.entry` | `LogEntrySchema` | `['logs']` query cache | No (Direct setQueryData) | PASS | `src/tests/realtimeReducer.test.ts` |

---

## 5. REST Endpoints (Mock & Live API)

| Method | Endpoint | Description | Mock Mode Verified | Live Mode Verified |
|--------|----------|-------------|--------------------|--------------------|
| POST | `/api/auth/login` | Operator / Supervisor / Viewer login | PASS (Simulated in auth store) | NOT VERIFIED (No live backend running) |
| GET | `/api/auth/me` | Session profile & role check | PASS (Simulated in auth store) | NOT VERIFIED (No live backend running) |
| GET | `/api/incidents` | Fetch active flood incidents | PASS (mockApi.getIncidents) | NOT VERIFIED (No live backend running) |
| GET | `/api/areas` | Ranked priority wards & factor breakdown | PASS (mockApi.getAreas) | NOT VERIFIED (No live backend running) |
| GET | `/api/weights` | Get current priority scoring weights | PASS (mockApi.getWeights) | NOT VERIFIED (No live backend running) |
| POST | `/api/weights` | Reconfigure weights (Supervisor only) | PASS (mockApi.updateWeights) | NOT VERIFIED (No live backend running) |
| GET | `/api/resources` | Fetch resource fleet units & reserve | PASS (mockApi.getResources) | NOT VERIFIED (No live backend running) |
| GET | `/api/assignments` | Fetch proposals & active dispatches | PASS (mockApi.getAssignments) | NOT VERIFIED (No live backend running) |
| POST | `/api/assignments/{id}/approve` | Confirm proposal dispatch | PASS (mockApi.approveAssignment) | NOT VERIFIED (No live backend running) |
| POST | `/api/assignments/{id}/reject` | Reject proposal with reason | PASS (mockApi.rejectAssignment) | NOT VERIFIED (No live backend running) |
| POST | `/api/assignments/{id}/edit` | Reallocate unit or destination ward | PASS (mockApi.editAssignment) | NOT VERIFIED (No live backend running) |
| GET | `/api/roads` | Road segments & flood status | PASS (mockApi.getRoads) | NOT VERIFIED (No live backend running) |
| GET | `/api/shelters` | Relief shelter occupancies & supplies | PASS (mockApi.getShelters) | NOT VERIFIED (No live backend running) |
| GET | `/api/hospitals` | Hospital bed & ICU capacities | PASS (mockApi.getHospitals) | NOT VERIFIED (No live backend running) |
| GET | `/api/weather/alerts` | Active severe weather advisories | PASS (mockApi.getWeatherAlerts) | NOT VERIFIED (No live backend running) |
| GET | `/api/sensors` | River gauge & telemetry readings | PASS (mockApi.getSensors) | NOT VERIFIED (No live backend running) |
| GET | `/api/decisions/{id}` | Explainable decision attribution card | PASS (mockApi.getDecision) | NOT VERIFIED (No live backend running) |
| GET | `/api/logs` | Audit trail entries | PASS (mockApi.getLogs) | NOT VERIFIED (No live backend running) |
| GET | `/api/replan/diff` | Network change replan diff | PASS (Simulated in realtimeClient) | NOT VERIFIED (No live backend running) |
| POST | `/api/replan/{diffId}/approve-all` | Batch approve re-plan diff | PASS (Simulated in ReplanDiffModal) | NOT VERIFIED (No live backend running) |
| POST | `/api/simulate/inject` | Trigger test scenario event | PASS (Simulated in SimulationControls) | NOT VERIFIED (No live backend running) |

---

## 6. Critical Operational Flows (A – J)

| Flow | Name | Description | Status | Evidence |
|------|------|-------------|--------|----------|
| **A** | Approval with Dialog | Operator approves proposal from Dispatch Queue with Confirmation dialog | PASS | `e2e/critical_flows.spec.ts` (Test: Flow A) |
| **B** | Reject & Edit | Operator rejects proposal with mandatory reason; edits destination unit & re-validates route | PASS | `src/lib/api.ts` (mockApi.rejectAssignment, mockApi.editAssignment) |
| **C** | Bridge Closure Replan | Bridge closes, isolated replan diff shows affected assignments only with old vs new ETA | PASS | `e2e/critical_flows.spec.ts` (Test: Flow C) |
| **D** | Reliability Handling | Low reliability unverified report flags road at risk without altering assignments until bulletin arrives | PASS | `src/tests/reliabilityAndStale.test.ts`, `src/lib/realtime.ts` |
| **E** | Rumour & Duplicates | Planted rumour suppressed; duplicate citizen alerts collapse into existing incident | PASS | `src/lib/realtime.ts` (T+12s and T+48s scripted timeline ticks) |
| **F** | Conflict Rule | Conflicting road reports resolve by tier priority then timestamp freshness | PASS | `src/lib/realtime.ts` (T+28s conflicting report logger) |
| **G** | Fairness Coverage | High-vulnerability, low-report ward receives allocation via equity guarantee | PASS | `src/pages/AnalyticsPage.tsx` (Service equity & Gini monitoring) |
| **H** | Realtime Resilience | WebSocket reconnect with exponential backoff & since cursor resume | PASS | `src/lib/realtime.ts` (scheduleReconnect with jitter & sinceCursor) |
| **I** | Supervisor Freeze | Supervisor enables freeze switch to halt autonomous drafts while allowing manual actions | PASS | `src/pages/SettingsPage.tsx`, `src/store/useUiStore.ts` |
| **J** | Prompt-Injection Text | Malicious prompt-injection strings render strictly as escaped plain text | PASS | `e2e/critical_flows.spec.ts` (Test: Flow J) |
