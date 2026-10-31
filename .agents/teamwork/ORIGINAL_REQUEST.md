# Original User Request

## Approved Task Prompt — 2026-10-31T05:07:15Z

Build "SAHAYA Field", an offline-first Flutter application (Android first, iOS compatible) for disaster response, targeted for production deployment as the field companion to a cloud coordination backend (FastAPI, REST + WebSocket) that verifies reports, prioritizes areas, allocates resources, and routes units. The team works autonomously: plan first, then build phase by phase, commit after each phase, and run `flutter analyze` and `flutter test` before every commit; make reasonable choices and record them in `DECISIONS.md`. The frontend of the mobile app must work fully offline and with mock backend endpoints providing mock data until real-time data is collected and generated.

Working directory: /home/saran/projects/the one
Integrity mode: development

## Requirements

### R1. Users and Role-Based Screens
Deliver functional screens customized by role selected at login, along with common shared utilities:
- Citizen: One-tap SOS (with optional people count and need type), incident reporting (type, text, photo, auto location), nearby shelters and safe routes, alerts, and "my reports" with honest status.
- Rescue team: Assigned tasks (Proposed/Approved/En route/Done), route and ETA, status updates, field incident reports with photo, GPS auto-tracking, and verification tasks ("check this bridge").
- Hospital: Live updates for free beds, ICU, trauma, and diversion status; incoming patient list.
- Police and fire service: Official road closures and reopenings, incident notes, assigned tasks, and unit status.
- NGO / shelter manager: Shelter occupancy tracking (arrivals/departures), inventory stocks (food, water, medicine), resource requests, and resource inventory list.
- Shared features across all roles: Interactive map, alerts inbox, sync status bar, language switch (English, Tamil, Hindi via arb files), large-button low-literacy mode, and settings (data saver, battery saver).
- UI honesty: Distinct states for SOS and reports ("Saved on phone", "Sent to server", "Received by control room"); never claim help is coming. Assignments show "Proposed" until the control room approves; users cannot self-dispatch. Source trust: server decides reliability tier from authenticated role (government/field = verified, citizen = public); app sends role, device id, GPS accuracy, timestamp, and photo geotag, and never labels anything "verified" itself.

### R2. Data Layer, Local Database, and Sync Engine
Implement offline-first persistence and priority sync:
- Local database: Drift (SQLite) with SQLCipher encryption covering reports, assignments, shelters, hospitals, road_segments, alerts, resources, verification_tasks, outbox, sync_cursors, and map_packs.
- Outbox: Every local write creates an outbox row with client-generated UUID (idempotency key), priority (0: life-critical, 1: status, 2: normal, 3: media), payload, attempts count, and next_retry timestamp. Server deduplicates on UUID.
- Push engine: Priority order sync; life-critical items (SOS, official road closure, hospital diversion) jump the sync queue. Batch small items into gzip requests with exponential backoff and jitter. Resumes after app kill. Media uploads last, chunked and resumable, only on allowed networks.
- Pull engine: Per-collection delta sync using `since` cursors; server returns changed rows and tombstones. WebSocket for live pushes when online, with polling fallback.
- Conflict rules: Server timestamp wins for status fields. Capacity counts (shelter occupancy, beds) sync as relative deltas (+/- N arrivals/departures/beds) rather than absolute values to avoid lost updates. Every record displays last updated timestamp and a stale badge past a per-type threshold.
- Sync status bar: Displays connection state (online/offline/weak), pending outbox count, timestamp of last sync, and manual "Sync now" action.

### R3. Connectivity Modes, Fallback Chains, and Prepare Mode
Support operation across fluctuating network environments:
- Active reachability probe detecting Normal, Data Saver (text only, no photo upload, small payloads, no map tile fetch), and Offline modes.
- SOS fallback chain: HTTPS, then queued retry, then (Android) SMS to a configurable control-room gateway number using a compact encoded message (type, lat/lon, people count, timestamp, device id), with user confirmation. Document that iOS cannot send SMS silently.
- Stretch (Android feature-flagged): Nearby device-to-device relay with Nearby Connections API so a phone with signal forwards signed, end-to-end encrypted outbox items from phones without signal.
- "Prepare mode": Single button while online downloads district map pack, road graph, shelters, hospitals, and latest alerts, displaying storage size and offering a Wi-Fi-only option.

### R4. Maps, GPS Tracking, and Offline Routing
Provide mapping and navigation without external public tile servers:
- flutter_map using locally stored vector or raster tiles for the district. Prohibit bulk downloading from tile.openstreetmap.org; load tiles from configurable self-hosted/PMTiles file, bundling a sample pack for development.
- Layers: Incidents (colored by priority, outline by status), units, shelters, hospitals, roads colored by status (dashed when low reliability), my location, and hazard polygons.
- GPS: Foreground always; background tracking for rescue/police/fire roles with adaptive interval (faster when moving, slower in battery saver), batched into outbox with accuracy shown, clear permission rationale, and a visible user toggle.
- Offline routing: Dijkstra algorithm running in a Dart isolate over the cached road graph (JSON nodes/edges with status and reliability). Closed roads are removed; unknown roads carry heavy penalty. Display route, ETA, and stale road data warning. Recompute dynamically when road statuses change. Shelter and hospital pickers use cached free-capacity data with stale badges.

### R5. Alerts, Notifications, and Geofencing
Deliver real-time and offline safety notifications:
- Channels: Critical (sound, vibrate, full-screen over lock screen, requiring acknowledgement synced back to server), Warning, and Info.
- Offline geofencing: Cache hazard polygons and trigger a local alert when device enters a hazard zone.
- Route & flow dispatch notifications: Notify rescue/police/fire on new or changed assignments and road closures affecting active routes; notify hospitals and shelters on incoming flow changes.
- Delivery: FCM push when online (behind an interface so app runs without Firebase configured), local notifications generated on sync, background fetch when possible, and offline alerts inbox with severity filtering and translation.

### R6. API Contract and Mock Backend Simulation
Define API standards and provide an autonomous simulation environment:
- OpenAPI contract: Generate `openapi.yaml` covering POST /auth/login (cache long-lived token offline), POST /sync/push (batch outbox), GET /sync/pull?since=&collections=, GET /packs/{district} (map pack and graph manifest), POST /media (resumable), WS /live.
- Retrofit-style client with Dio and retry interceptors.
- Complete `MockBackend` repository implementation seeded with a flood scenario (12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports) allowing the entire app to run and be demonstrable offline with zero external servers, toggled via a single config flag.
- "Simulate" debug menu: Close road R-14, fill shelter capacity, push a critical alert, and toggle offline state.

### R7. Security, Privacy, and Safety
Ensure security and privacy standards:
- SQLCipher encrypted local database and secure token storage (`flutter_secure_storage`).
- Role-based access control enforced on backend and mirrored in UI.
- Minimal personal data collection; location sharing requires explicit consent, and citizen GPS is sent strictly with an SOS or report. No analytics SDKs.
- Secure data wipe on logout.
- Untrusted server text sanitization (no HTML rendering).
- Persistent visible disclaimer: "This app supports emergency services; call your local emergency number for immediate danger."

## Acceptance Criteria

### Offline Operation and Mock Backend
- [ ] Application launches and runs fully in airplane mode using `MockBackend` seeded with the flood scenario across all roles (Citizen, Rescue, Hospital, Police/Fire, NGO).
- [ ] Actions recorded offline (SOS, reports, status changes, capacity updates) persist in the local outbox across app restarts.
- [ ] Actions made offline synchronize automatically within seconds of reconnecting without duplicate records or dropped data.
- [ ] Life-critical items (SOS, official road closure, hospital diversion) jump the outbox queue ahead of normal priority items.
- [ ] Capacity metrics (shelter occupancy, hospital beds) synchronize as deltas (+/- N), correctly updating without overwriting concurrent updates.
- [ ] Sync status bar displays accurate connection state (online/offline/weak), pending outbox count, timestamp of last sync, and manual "Sync now" button triggers a sync attempt.

### Navigation, Routing, and Alerts Simulation
- [ ] Map renders bundled offline tile pack without connecting to public tile servers.
- [ ] Simulating road closure on bridge R-14 via the debug menu updates the map, recalculates the active task route in a Dart isolate to avoid R-14, and triggers a route obstruction alert.
- [ ] Entering a cached hazard polygon triggers a local geofence alert notification.
- [ ] SOS flow displays distinct states ("Saved on phone", "Sent to server", "Received by control room") without falsely indicating help is en route.
- [ ] Critical alerts trigger audible/vibration notifications, full-screen lock screen intent, and require user acknowledgement that syncs back to the backend.

### Code Quality and Verification
- [ ] `flutter analyze` passes with zero errors and zero warnings.
- [ ] Automated test suite (`flutter test`) passes, with unit tests covering sync engine (offline write, reconnect, retry, idempotency, priority order, delta pull, tombstones), offline Dijkstra routing, and conflict resolution rules.
- [ ] README document details setup, architecture, mock vs real backend configuration switch, known platform limitations (iOS SMS and background location constraints, tile licensing), and an explicit list of anything stubbed.
- [ ] Decisions made during development are documented in `DECISIONS.md`.


## Follow-up — 2026-10-31T05:21:04Z

The user has requested a change: rename the project to "poseidon" instead of "SAHAYA Field". Please update all project references, app title, branding, package name / identifiers where appropriate, and documentation accordingly.


## Follow-up — 2026-10-31T05:23:51Z

The user requested: Build the Flutter app specifically in `/home/saran/projects/the one/app/` (or relative path `./app/` within the workspace `/home/saran/projects/the one`). Please ensure the Flutter project and its codebase are initialized and built inside `/home/saran/projects/the one/app/`.
