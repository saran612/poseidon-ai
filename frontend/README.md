# POSEIDON AI — Command Dashboard

POSEIDON Command Dashboard is an enterprise-grade real-time web application for disaster-response coordinators and district emergency operations centers (EOC). It couples human-in-the-loop decision autonomy with algorithmic verification, multi-factor area prioritization, dynamic flood routing, and explainable AI attribution.

## 1. Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation & Launch
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To run tests and production build:
```bash
npm run test     # Runs Vitest unit & store tests
npm run build    # Typechecks and produces optimized production bundle
npm run lint     # Runs Oxlint code inspection
```

---

## 2. Mock vs Live Mode

The dashboard supports both completely standalone mock simulation and live FastAPI/WebSocket integration:

- **Mock Mode (Default)**:
  `VITE_API_MODE=mock` (or omitted).
  Runs with a fully seeded Coimbatore flood scenario. Simulates 3 hours of timeline events compressed into 10 minutes with playback controls (1x, 2x, 5x, Pause) and manual fault injectors (Bridge Closure, Shelter Overflow, Sensor Telemetry Failure).
- **Live Mode**:
  `VITE_API_MODE=live`
  Connects to FastAPI backend REST endpoints and WebSocket stream (`/ws/updates`) with automatic reconnect, exponential backoff, heartbeat, and `since` cursor resume.

---

## 3. Architecture & Key Features

### 3.1 "Humans Decide" Human-in-the-Loop Protocol
- No autonomous allocation or reroute is dispatched without explicit operator confirmation.
- Every proposed unit assignment shows **Approve / Edit / Reject** and triggers a confirmation dialog.
- The persistent **Dispatch Queue Drawer** (accessible from the top bar across all pages) aggregates pending proposals.

### 3.2 Dynamic Replanning & Isolation Diff
- When an arterial roadway or bridge closes (e.g. Perur Noyyal River Bridge), the system isolates **only the affected assignments** in a **Replan Diff** modal, leaving unaffected units untouched.
- Operators review previous vs rerouted paths, ETA deltas, and must explicitly authorize the reroutes.

### 3.3 Reliability & Multi-Tier Provenance
Every incident, road status, and sensor displays its 4-tier provenance badge:
- **T1 Govt/Field**: Official SDRF/NDRF/TNSDMA ground scouts
- **T2 IoT Sensors**: Telemetric river gauges, sluice flow meters, AWS pluviometers
- **T3 Verified Public**: Multi-source citizen verified reports
- **T4 Unverified**: Single-source citizen calls or social media claims
Accompanied by a 0.00 – 1.00 Reliability Bar and an automatic **Stale Data** indicator for records exceeding 15 minutes.

### 3.4 Explainable Decision Cards (`<DecisionCard>`)
Every entity has a "Why?" button opening an explainable card with:
- One-sentence decision summary
- Mathematical weight contribution breakdown ($S, V, U, E, N$)
- Underlying multi-source evidence ledger
- Counterfactual scenario ("What would change this decision?")
- Alternatives evaluated and reason for rejection
- Operator action audit trail

### 3.5 Pages Included
1. **Overview**: Key emergency metrics, Top 5 priority sectors, pending dispatches, live event feed.
2. **Interactive Mission Map**: Full-screen Leaflet with toggleable layers (incidents, units, shelters, roads, silent areas), status-coded lines, and time scrubber.
3. **Weather & Sensors**: Severe alert banners, river gauge & rainfall time-series charts with danger marks, and faulty sensor anomaly alerts.
4. **Prioritization**: Ranked affected ward table, expandable factor bars, and Supervisor weight tuning sliders with live preview.
5. **Resources**: Vehicle and vessel fleet readiness, 15% strategic reserve cushion monitor, fuel/idle meters, and deployment history.
6. **Routing & Replanning**: Primary vs alternate corridor comparisons, edit unit/target mode, and bridge closure demonstration.
7. **Shelters & Hospitals**: Real-time occupancy, free trauma & ICU beds, and intelligent load-balanced facility recommendations.
8. **Decisions Explorer**: Searchable index of all autonomous decisions with counterfactual summaries.
9. **Analytics**: Served-to-need equity bar chart, Gini coefficient monitor, duplicate/rumour suppression stats, and baseline comparisons.
10. **Audit Logs**: Filterable audit trail of operator confirmations, manual overrides with mandatory reasons, and decision links.
11. **Settings**: English / Tamil / Hindi language switcher, Light/Dark theme, tile URL configuration, and scenario injection controls.

---

## 4. Honesty & Stubbed Elements
- In Mock Mode, backend persistence is simulated in-memory; page reloads reset changes to initial seed state.
- Map tiles use CartoDB Voyager raster tiles by default; custom raster/vector tile URLs can be specified in Settings or via `VITE_MAP_TILE_URL`.
- SMS and LoRa field synchronization gateways are represented logically in assignment acknowledgement logs.
