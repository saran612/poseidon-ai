# POSEIDON AI — Technical Implementation Roadmap

**Auditor:** Technical Jury & Principal Architecture Team  
**Evaluation Scope:** Codebase Enhancement to Reach 100/100 Competition Readiness  
**Date:** October 31, 2026  

---

## 1. Roadmap Overview & Priority Tiers

| Tier | Focus Area | Impact on Jury Evaluation | Target Timeline |
|---|---|---|---|
| **P0** | **Essential for Challenge Compliance** | Eliminates frontend-backend disconnect and demonstrates turnkey live operation | Immediate (1–2 days) |
| **P1** | **Core Prototype Hardening** | Persistent database transactions, live WebSocket push, RBAC enforcement | Short Term (3–5 days) |
| **P2** | **Advanced Intelligence & Data Feeds** | External IMD weather intake, OSM micro-street graph, dynamic shelter tracking | Medium Term (1–2 weeks) |
| **P3** | **Production & Enterprise Deployment** | Real LoRa hardware serial daemon, cloud PostGIS migration, vault KMS | Long Term (2–4 weeks) |

---

## 2. P0: Essential for Challenge Compliance

### Task P0-1: Wire Web Dashboard Directly to FastAPI Live Endpoints
- **Feature**: Live API Client Integration
- **Reason**: Eliminates the `mockApi` bypass in `frontend/src/lib/api.ts` so that browser interactions trigger actual backend requests and display authoritative state.
- **Required Changes**:
  1. Replace `mockApi` methods with `fetch()` calls to `http://localhost:8000/api/v1`.
  2. Implement TypeScript adapters converting backend JSON schemas (`ZoneExplanation`, `OptimizationPlanSummary`) into frontend view models (`Area`, `ResourceUnit`).
  3. Ensure Vite proxy in `frontend/vite.config.ts` routes `/api` to port 8000.
- **Relevant Files**:
  - `frontend/src/lib/api.ts`
  - `frontend/src/pages/OverviewPage.tsx`
  - `frontend/src/pages/PrioritiesPage.tsx`
  - `frontend/src/pages/RoutingPage.tsx`
- **Dependencies**: Running FastAPI backend on port 8000.
- **Acceptance Criteria**:
  - Clicking "Recalculate Priorities" sends a GET request to `/api/v1/situation/zones`.
  - Network tab in Chrome DevTools confirms HTTP 200 responses from port 8000.

### Task P0-2: Connect Dynamic Replanning UI directly to Backend Bridge Closure Endpoint
- **Feature**: Turnkey Human-in-the-Loop Replan UI
- **Reason**: The jury requires demonstrating live cascading replanning when a road cut occurs.
- **Required Changes**:
  1. In `frontend/src/components/ReplannerPanel.tsx`, wire the "Sever Bridge" button to `POST /api/v1/replanning/close-bridge`.
  2. Display the received structural diff (`diff_summary`, `rerouted_assignments`, `cancelled_assignments`).
  3. Wire the "Approve Replan" button to `POST /api/v1/replanning/approve`.
- **Relevant Files**:
  - `frontend/src/components/ReplannerPanel.tsx`
  - `frontend/src/pages/RoutingPage.tsx`
  - `backend/api/v1/endpoints/replanning.py`
- **Dependencies**: Task P0-1.
- **Acceptance Criteria**:
  - Clicking "Simulate Bridge Cut" cuts `BR-PERUR-01`, displays red severed polyline on map, and displays `PENDING_APPROVAL` status banner within 500ms.
  - Clicking "Approve Replan" shifts status to `APPROVED` and updates active field dispatches.

---

## 3. P1: Essential for a Strong Working Prototype

### Task P1-1: Database Persistence for Ingestion & Replanning State
- **Feature**: Durable SQLite/PostgreSQL Session Storage
- **Reason**: Prevents system memory wipe when backend restarts.
- **Required Changes**:
  1. Inject `db: Session = Depends(get_db)` into `endpoints/evidence.py` and `endpoints/replanning.py`.
  2. Persist `PlanVersionRecord` into `backend/models/plan.py:PlanVersion` table.
  3. Persist incoming packets into `backend/models/message.py:RawMessage` table.
- **Relevant Files**:
  - `backend/core/state.py`
  - `backend/api/v1/endpoints/replanning.py`
  - `backend/api/v1/endpoints/evidence.py`
  - `backend/models/plan.py`
- **Dependencies**: SQLAlchemy database engine (`backend/core/database.py`).
- **Acceptance Criteria**:
  - Server process restarted; querying `/api/v1/replanning/plans/PLAN-OPERATIONAL-01` preserves previous version history and diffs.

### Task P1-2: Real-time WebSocket Reconnection & Push Hooks in Web UI
- **Feature**: Live Telemetry Push Hook
- **Reason**: Updates web command center immediately when new field reports arrive without manual browser refresh.
- **Required Changes**:
  1. Connect `frontend/src/lib/realtime.ts` to `ws://localhost:8000/api/v1/ws/updates`.
  2. Add TanStack Query invalidation triggers on incoming WebSocket events (`incident.new`, `bridge.cut`, `replan.proposed`).
- **Relevant Files**:
  - `frontend/src/lib/realtime.ts`
  - `backend/api/v1/endpoints/ws.py`
- **Dependencies**: Task P0-1.
- **Acceptance Criteria**:
  - Ingesting a report via mobile app causes web dashboard active incident count to increment in real time.

### Task P1-3: Role-Based Authorization Guards on Critical Mutations
- **Feature**: JWT RBAC Security Enforcement
- **Reason**: Enforces human governance rules requiring verified incident commander identity before deploying emergency relief plans.
- **Required Changes**:
  1. Add FastAPI security dependency `require_role(["COMMANDER", "DISTRICT_COLLECTOR"])`.
  2. Enforce token validation on `/replanning/approve` and `/relief/optimize`.
- **Relevant Files**:
  - `backend/api/deps.py`
  - `backend/api/v1/endpoints/replanning.py`
  - `backend/api/v1/endpoints/relief.py`
- **Dependencies**: `python-jose`, `passlib`.
- **Acceptance Criteria**:
  - Unauthenticated requests to `/replanning/approve` receive HTTP 401 Unauthorized.

---

## 4. P2: Advanced Intelligence and Reliability

### Task P2-1: External Public Weather / Disaster API Connector
- **Feature**: Automated External Ingestion Worker
- **Reason**: Demonstrates ingestion from real-world authorities (IMD / Open-Meteo).
- **Required Changes**:
  1. Implement background async task in `backend/ingestion/` querying Open-Meteo API for Coimbatore coordinates every 10 minutes.
  2. Ingest rainfall precipitation exceeding 50mm/hr as T2 hydrological telemetry.
- **Relevant Files**:
  - `backend/ingestion/transports/weather_poller.py`
  - `backend/main.py`
- **Dependencies**: `httpx`.
- **Acceptance Criteria**:
  - Severe rainfall warning automatically triggers priority recalculation in downstream flood zones.

### Task P2-2: Full OpenStreetMap Micro-Street Network Integration
- **Feature**: High-Fidelity Street Vector Routing
- **Reason**: Extends routing beyond arterial corridors to individual street blocks and relief shelter gates.
- **Required Changes**:
  1. Ingest OSM bounding box extract for Coimbatore urban district via `osmnx`.
  2. Build NetworkX multi-di-graph with turn impedances and vehicle width constraints.
- **Relevant Files**:
  - `backend/geospatial/corridor.py`
  - `backend/api/v1/endpoints/map.py`
- **Dependencies**: `networkx`, `shapely`.
- **Acceptance Criteria**:
  - Dijkstra routing navigates local streets while successfully circumnavigating inundated causeways.

---

## 5. P3: Additional Improvements

### Task P3-1: Physical LoRa Serial Daemon
- **Feature**: Hardware Serial Gateway Integration
- **Reason**: Physical demonstration of Sub-GHz wireless mesh receiving reports without internet.
- **Required Changes**:
  1. Add `pyserial` daemon reading from USB COM port (`/dev/ttyUSB0` or `COM3`).
  2. Forward 31-byte binary frames directly into `message_router.py`.
- **Relevant Files**:
  - `backend/ingestion/transports/lora_serial_daemon.py`
- **Dependencies**: SX1262 LoRa USB Dongle, `pyserial`.
- **Acceptance Criteria**:
  - Handheld mobile device transmits LoRa packet; backend receives and parses within 50ms.

---

## 6. Suggested Implementation Order

```
[Day 1]  P0-1: Wire Web Dashboard to FastAPI Live Endpoints
[Day 2]  P0-2: Connect Dynamic Replanning UI directly to Bridge Closure Endpoint
[Day 3]  P1-1: Database Persistence for Ingestion & Replanning State
[Day 4]  P1-2: Real-time WebSocket Reconnection & Push Hooks
[Day 5]  P1-3: Role-Based Authorization Guards on Critical Mutations
[Day 6]  P2-1: External Weather API Polling Worker
[Day 7]  P2-2: OSM Micro-Street Graph Expansion
```
Following this 7-day schedule guarantees a 100/100 score during technical jury inspection.

