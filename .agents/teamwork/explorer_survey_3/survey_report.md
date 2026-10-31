# SAHAYA Field — Comprehensive Specification Report
## Subsystem Focus: R1 (Role-Based Screens & Shared UI), R3 (Connectivity & Fallbacks), R4 (Maps, GPS & Offline Routing), R5 (Alerts, Notifications & Geofencing)

**Author:** Spec Miner 3 (Agent Conv ID: `b91ed4f2-4d72-4373-83e1-c00c63c0d667`)  
**Date:** 2026-10-31  
**Project Workspace:** `/home/saran/projects/the one`  
**Target Architecture:** Flutter (Android First, iOS Compatible), Offline-First with Drift/SQLCipher, Local Vector/Raster Maps, Dart Isolate Dijkstra Routing  

---

## 1. Executive Summary & Architectural Overview

SAHAYA Field is an emergency disaster management application designed to operate reliably under extreme infrastructure degradation, zero-connectivity states, power-constrained environments, and active disaster hazards (e.g. urban flooding, cyclones, earthquakes).

Unlike conventional mobile apps that assume constant cloud reachability, SAHAYA Field operates on an **Offline-First, Zero-Trust UI Honesty** paradigm:
1. **Local Primacy:** All state transitions, reports, route calculations, and geofence evaluations occur locally on the device first.
2. **UI Honesty Contracts:** The app strictly differentiates between *Saved on phone*, *Sent to server*, and *Received by control room*. It guarantees that users are never given false reassurance ("Help is on the way!"). Tasks display "Proposed" until authenticated dispatchers approve them.
3. **Resilient Communication Pipelines:** Communication gracefully degrades from High-bandwidth HTTPS -> Low-bandwidth Data Saver -> Queued Outbox Retries -> Android Compact Encoded SMS -> Device-to-Device (D2D) Bluetooth/Wi-Fi Direct mesh relays.
4. **Air-Gapped Navigation & Safety:** Map rendering relies entirely on bundled/pre-downloaded local tile packs. Real-time pathfinding executes in a dedicated Dart Isolate running a Dijkstra graph solver over a locally stored topological road graph with dynamic obstacle penalties (e.g., Bridge R-14 closure).
5. **Life-Critical Geofencing & Alerts:** Device-local ray-casting algorithms monitor proximity to dynamic hazard polygons and trigger lock-screen-breaching high-priority alarms with mandatory synced user acknowledgements.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R1 Citizen | One-Tap SOS | Immediate panic button with 1-tap dispatch, optional people count and need triage. | Single tap; optional counter (1-50+); need enum (medical, flood, trapped, fire, food). | P0 outbox entry, UI state progression tracker, audio feedback. | If GPS disabled, warns user and dispatches with last known fix or cell info. | ORIGINAL_REQUEST.md §R1 |
| 2 | R1 Citizen | Incident Reporting | Field reporting tool allowing citizens to report hazards with category, text, photo, and auto-location. | Incident type enum, text description (max 500 chars), camera/gallery photo, device GPS coords. | P2 outbox entry, local thumbnail display, auto-geotagged submission. | Camera permission denied: allows text+location only; GPS timeout: falls back to last cached fix. | ORIGINAL_REQUEST.md §R1 |
| 3 | R1 Citizen | Safe Routes & Shelters | Lists nearest open emergency shelters with capacity indicators and computes safe route avoiding flood zones. | User GPS location, shelter database, local road graph. | Ranked list of shelters (distance, capacity, stale badge), polyline route on map, ETA. | If all roads flooded, indicates "No verified safe route available. Seek immediate high ground." | ORIGINAL_REQUEST.md §R1, R4 |
| 4 | R1 Citizen | Alerts Inbox | Inbox displaying local and synced disaster alerts filtered by severity. | Severity filter (All, Critical, Warning, Info), language locale. | Paginated alert list, unread badge, localized alert text, evacuation instruction modal. | If empty, displays "No active alerts for your sector". | ORIGINAL_REQUEST.md §R1, R5 |
| 5 | R1 Citizen | "My Reports" Tracker | Transparent status view of all incidents and SOS beacons submitted from the device. | Device ID, local SQLite reports table. | Chronological card list with 3-state honest status badge and sync timestamp. | Displays offline warning if outbox items pending retry. | ORIGINAL_REQUEST.md §R1 |
| 6 | R1 Rescue | Assigned Tasks Manager | Operational task dashboard displaying rescue dispatches in strict state progression (Proposed -> Approved -> En Route -> Done). | Remote sync pull / local database tasks. | Task list cards with priority color-coding, victim count, location coordinates, status chip. | Blocks user from advancing "Proposed" task to "En Route" until control room marks "Approved". | ORIGINAL_REQUEST.md §R1 |
| 7 | R1 Rescue | Mission Routing & ETA | Automated Dijkstra navigation from rescue unit's GPS to assigned task target avoiding closed segments. | Task coordinates, unit GPS, local road graph with obstacle weights. | Blue route polyline, distance in km, dynamic ETA in minutes, turn cues. | If road dynamically closes (e.g. R-14), triggers route recalculation and alert. | ORIGINAL_REQUEST.md §R1, R4 |
| 8 | R1 Rescue | Field Status Updater | One-touch operational status broadcaster for rescue crews (En Route, At Scene, Evacuating, Task Complete). | Status selection button, optional note/victim count. | P1 outbox item, immediate local UI update, unit marker status update. | Network offline: queues in outbox and displays "Saved on phone (pending sync)". | ORIGINAL_REQUEST.md §R1 |
| 9 | R1 Rescue | Field Verification Task | Specialized workflow directing units to verify reports (e.g. "Check Bridge R-14", "Verify building collapse"). | Verification task ID, inspection result (Verified True, False Alarm, Inconclusive), photo, note. | P1 outbox item, updates local road/incident reliability tier. | If photo file unreadable, permits text-only verification submission. | ORIGINAL_REQUEST.md §R1 |
| 10 | R1 Rescue | High-Trust Field Report | Incident report created by authenticated rescue personnel tagged with Tier 1/2 field reliability. | Hazard type, description, photo with EXIF geotag, device accuracy, authenticated role. | P1 outbox item; server assigns high reliability tier upon sync. | Validates GPS accuracy; warns if accuracy > 50m. | ORIGINAL_REQUEST.md §R1 |
| 11 | R1 Hospital | Bed Capacity Delta Sync | Live capacity manager for standard beds, ICU beds, and trauma units syncing via relative deltas. | Delta adjustments (+/- 1, +/- 5, +/- 10) for Free, ICU, Trauma beds. | P1 delta outbox records, immediate local capacity view, last updated timestamp. | Negative balance prevention; warns if count drops below 0. | ORIGINAL_REQUEST.md §R1, R2 |
| 12 | R1 Hospital | Ambulance Diversion Toggle | Critical toggle declaring hospital diversion status when emergency department is overwhelmed. | Diversion boolean switch (Active/Inactive), optional reason (No ICU capacity, flooding). | P0 outbox entry (jumps queue), alerts control room, updates map pin to red. | Confirms with two-step dialog before broadcast due to system-wide impact. | ORIGINAL_REQUEST.md §R1, R2 |
| 13 | R1 Hospital | Incoming Patient Queue | Triage queue displaying inbound ambulances/rescue transports with ETAs and triage codes. | Sync pull / WebSocket push from active rescue unit assignments. | Chronological card list ordered by ETA with triage color (Red/Yellow/Green), transferring unit ID. | Shows stale data badge if no sync in > 10 minutes. | ORIGINAL_REQUEST.md §R1 |
| 14 | R1 Police/Fire | Official Road Closure/Reopen | Authoritative interface for police/fire officers to close or reopen road segments and bridges. | Road segment ID (e.g. Bridge R-14), status (Closed, Passable, Hazard), closure reason, flood depth. | P0 outbox item, updates local road graph immediately, triggers dynamic Dijkstra re-route. | Requires confirmed officer role; validates segment ID exists in local graph. | ORIGINAL_REQUEST.md §R1, R4 |
| 15 | R1 Police/Fire | Unit Status Broadcast | Dispatch readiness status for police and fire units (Available, Dispatched, On Scene, Out of Service). | Status enum selector, current sector/ward. | P1 outbox entry, updates local unit marker on shared map. | Offline queuing in SQLite outbox. | ORIGINAL_REQUEST.md §R1 |
| 16 | R1 NGO/Shelter | Shelter Occupancy Deltas | Real-time intake and release logging for evacuees tracking total capacity vs occupancy via deltas. | Arrival count (+N), Departure count (-N), sub-demographics (children, elderly, medical). | P1 delta outbox records, local occupancy bar graph, remaining capacity badge. | Prevents total occupancy from exceeding physical shelter limit by > 20% without warning. | ORIGINAL_REQUEST.md §R1, R2 |
| 17 | R1 NGO/Shelter | Inventory Stockpile Tracker | Inventory levels for life-sustaining supplies (food rations, potable water liters, medical kits, blankets). | Stock categories, current balance or +/- adjustments, unit types. | P2 outbox entries, low-stock threshold badges (< 20% highlighted yellow/red). | Highlights expired or critically depleted items. | ORIGINAL_REQUEST.md §R1 |
| 18 | R1 NGO/Shelter | Resource Request Dispatch | Official requisition tool for shelters to request supplies or personnel from central depot. | Item category, quantity needed, priority level (Critical/Urgent/Routine), target delivery date. | P1 outbox entry, status tracker (Requested -> Approved -> Dispatched -> Fulfilled). | Disallows submission with 0 quantity. | ORIGINAL_REQUEST.md §R1 |
| 19 | R1 Shared | Interactive Offline Map | Full-screen vector/raster map rendered via `flutter_map` backed by local tile storage and layered data. | Gesture navigation (pan, pinch-zoom), layer toggle buttons, filter criteria. | Visual map canvas with 8 layered datasets, location puck, heading indicator. | Missing tile renders subtle placeholder grid without crashing or querying OSM servers. | ORIGINAL_REQUEST.md §R1, R4 |
| 20 | R1 Shared | Sync Status Bar | Persistent header/footer bar showing live connectivity mode, outbox backlog, and last sync timestamp. | Network reachability state, Drift outbox count, SQLite sync cursor timestamp. | Visual status chip (Online/Offline/Weak/Data Saver), pending badge, "Sync Now" button. | "Sync Now" button disabled if in confirmed airplane mode with zero interfaces. | ORIGINAL_REQUEST.md §R1, R2 |
| 21 | R1 Shared | Multi-Language ARB Switcher | Instant dynamic localization for English, Tamil (தமிழ்), and Hindi (हिन्दी) without app restart. | Language selection modal (English, தமிழ், हिन्दी). | Updates all UI strings, ARB localized formatting, pluralization. | Falls back to English if target ARB key is missing. | ORIGINAL_REQUEST.md §R1 |
| 22 | R1 Shared | Low-Literacy / Large-Button Mode | High-contrast UI theme featuring 64-80dp touch targets, simplified icons, and high-visibility colors. | User settings toggle or auto-prompt on citizen entry. | Simplified home screen with 3 giant action cards (SOS, Find Shelter, View Alerts). | Persists selection across app restarts in secure storage. | ORIGINAL_REQUEST.md §R1 |
| 23 | R1 Shared | System Settings & Optimization | User preference manager for Data Saver, Battery Saver, SMS Gateway number, and cache management. | Toggle switches, numeric SMS input field, clear cache button. | Modifies runtime service parameters (polling rates, GPS intervals, tile fetching). | SMS gateway validates E.164 phone number format. | ORIGINAL_REQUEST.md §R1, R3 |
| 24 | R3 Connect | Active Reachability Prober | Probing daemon classifying network state into Normal, Data Saver, and Offline. | Connectivity_plus network callbacks, active HTTP HEAD/GET health check, RTT latency probe. | Reachability state stream emitted to app state managers. | If HTTP health check times out (> 2500ms), marks connection as "Weak / Offline". | ORIGINAL_REQUEST.md §R3 |
| 25 | R3 Connect | SOS Fallback Chain | Multi-tiered emergency message routing: HTTPS -> Outbox retry -> Android SMS -> D2D Mesh. | SOS action trigger, user consent for SMS fallback. | Dispatched payload via best available transport; updates status tracker. | On iOS, SMS cannot be sent silently; opens system compose sheet. | ORIGINAL_REQUEST.md §R3 |
| 26 | R3 Connect | Compact SMS Encoder | Bit-efficient text formatter packing critical SOS data into a single 160-character GSM SMS. | SOS struct: lat, lon, acc, people, need, timestamp, device_id. | Formatted SMS payload string under 140 bytes. | Truncates decimal coordinates to 4 decimal places (~11m precision) to fit single SMS. | ORIGINAL_REQUEST.md §R3 |
| 27 | R3 Connect | Prepare Mode Pack Downloader | Single-tap disaster preparation wizard downloading map tiles, road graph, and facilities while online. | Target district selection, Wi-Fi only toggle switch. | Downloaded PMTiles/archive, road_graph.json, shelters.json, hospitals.json to app storage. | If storage space insufficient (< 100MB), aborts with user warning. | ORIGINAL_REQUEST.md §R3 |
| 28 | R4 Maps | flutter_map Local Provider | Configured Flutter map provider reading directly from device storage or asset bundle. | Local file path / asset URI, coordinate tile requests (z, x, y). | Rendered image tile canvas on screen. | Throws no network requests to public OpenStreetMap servers. | ORIGINAL_REQUEST.md §R4 |
| 29 | R4 Maps | Adaptive GPS Tracker | Location tracking engine with dynamic polling intervals based on velocity, role, and battery profile. | GPS stream from geolocator, current velocity, role profile, battery mode. | Location fix stream, batched P1 outbox breadcrumbs, map coordinate updates. | Low GPS accuracy (> 100m) flagged in payload; does not spam outbox when stationary. | ORIGINAL_REQUEST.md §R4 |
| 30 | R4 Maps | Dart Isolate Dijkstra Solver | Background-threaded routing engine computing optimal paths over road graph avoiding obstacles. | Graph JSON, start point, target point, vehicle constraints, blocked edge IDs. | Isolate response: ordered coordinate list, distance (m), ETA (sec), road segments, stale flag. | Returns empty route with explicit error if destination is completely unreachable. | ORIGINAL_REQUEST.md §R4 |
| 31 | R4 Maps | Dynamic Obstacle Avoidance | Automated route recalculation when a road segment on the active path is marked impassable. | Road closure event (e.g. Bridge R-14 closed), active navigation route. | Recomputed route avoiding closed segment, audible warning alert, HUD notice. | Informs user if recomputation significantly extends ETA (> 50% increase). | ORIGINAL_REQUEST.md §R4 |
| 32 | R5 Alerts | Critical Notification Channel | Android high-importance notification channel with siren sound, vibration, and lock screen intent. | Critical alert payload (evacuation order, dam breach, severe flood surge). | Heads-up modal over lock screen, siren tone, persistent status icon, required Ack action. | Bypasses system Do Not Disturb (DND) where platform privileges allow. | ORIGINAL_REQUEST.md §R5 |
| 33 | R5 Alerts | Warning & Info Channels | Tiered notification channels for non-life-threatening advisories and informational notices. | Warning/Info alert payload (weather watch, relief supply arrival, traffic notice). | Standard notification drawer banner, short chime, expandable text. | Suppressed in silent mode according to OS settings. | ORIGINAL_REQUEST.md §R5 |
| 34 | R5 Alerts | Offline Geofence Engine | Background spatial evaluation detecting when device GPS coordinates enter a hazard polygon. | Periodic GPS location fixes, cached GeoJSON hazard polygons in SQLite. | Enters/Exits event triggers, launches Critical/Warning local notification. | Ray-casting point-in-polygon; uses bounding-box short-circuiting to minimize CPU load. | ORIGINAL_REQUEST.md §R5 |
| 35 | R5 Alerts | Alert Acknowledgment Sync | Mandatory read-receipt tracker for critical emergency directives syncing receipt back to control room. | User tap on "Acknowledge" button in alert modal / notification action. | P0 outbox entry containing alert_id, user_id, device_id, timestamp, location. | Persists acknowledgment locally even if offline; transmits immediately on reconnection. | ORIGINAL_REQUEST.md §R5 |
| 36 | R5 Alerts | Flow & Route Dispatch Alerts | Targeted contextual notifications alerting rescue/shelter/hospital units of incoming changes. | Sync updates on assignments, road closures, incoming patient triage, incoming evacuees. | Contextual in-app banners, push alerts, chime sound. | Filtered strictly by active user role. | ORIGINAL_REQUEST.md §R5 |

---

## 3. Edge Cases & Boundary Conditions

| # | Feature | Input / Trigger Condition | Observed & Specified System Behavior |
|---|---------|---------------------------|--------------------------------------|
| 1 | One-Tap SOS | User taps SOS in airplane mode with GPS hardware cold-starting (no satellite fix yet). | Immediately creates P0 outbox entry with `location_status: "pending_fix"`. Displays "Saved on phone". Launches 15s GPS acquisition timer. As soon as fix resolves, updates outbox record with coordinates. Never blocks UI. |
| 2 | One-Tap SOS | User taps SOS repeatedly 10 times in panic within 5 seconds. | Debounces rapid taps: first tap registers SOS UUID. Subsequent taps within 30 seconds update the existing outbox record (e.g. updating people count or urgency) rather than generating duplicate P0 outbox entries. |
| 3 | UI Honesty | Citizen views SOS status while offline after successful local save. | UI displays yellow status card: "Saved on phone (Offline - queued for transmission)". Text explicitly states: "Control room has NOT yet received this beacon. Keep phone on." Never claims "Help is coming". |
| 4 | UI Honesty | Rescue unit assigned task has status `Proposed` on backend. | Rescue screen renders task card with gray "Proposed" badge and disabled "Start Mission" button. Helper text explains: "Awaiting Control Room official approval. Self-dispatch is prohibited." |
| 5 | Dijkstra Routing | Control room broadcasts closure of Bridge R-14 while rescue unit is navigating across it. | Local road graph edge `R-14` weight updated to $\infty$. Active navigation listener detects active route contains `R-14`. Dart isolate recomputes alternate path immediately. Displays loud prompt: "Route blocked ahead at Bridge R-14. Recalculating detour." |
| 6 | Dijkstra Routing | All roads connecting origin to destination are impassable / submerged. | Dijkstra algorithm exhaustively traverses reachable component and finds no path to destination node. Isolate returns `RouteStatus.unreachable`. UI renders red warning banner: "Destination unreachable by road. Advise control room of total isolation." |
| 7 | Dijkstra Routing | Road graph cached on device is 48 hours old without network sync. | Route calculation proceeds using cached graph, but navigation header displays persistent amber badge: "⚠️ Road data 48h stale. Submerged or blocked roads may not appear." |
| 8 | Offline Geofencing | Device GPS reports a momentary 500-meter multipath spike placing device inside a flood polygon for 1 second. | Geofence engine enforces 2-sample debouncing or accuracy filtering: fixes with `accuracy > 65m` are rejected for geofence entry triggers. Requires 2 consecutive valid fixes inside polygon before triggering alarm. |
| 9 | Offline Geofencing | Device is powered off or app is force-closed while inside a hazard polygon. | On next boot / app launch, foreground location service immediately evaluates current GPS against cached hazard polygons. If inside, fires alert within 3 seconds of fix acquisition. |
| 10 | SMS Fallback | Android device has zero data signal (no 4G/3G/EDGE), but cellular voice/SMS signal is active. | HTTPS POST fails immediately; app prompts user: "No data connection. Send emergency SOS via SMS to Disaster Control Room Gateway (+91-XXXXX)?" User confirms -> sends compact single-segment SMS payload. |
| 11 | SMS Fallback | Device running on iOS triggers SOS in zero-data environment. | App detects iOS platform (`Platform.isIOS`). iOS prohibits silent background SMS dispatch. App presents an explicit SMS action button opening `MFMessageComposeViewController` pre-populated with gateway number and compact SOS payload, requiring user tap "Send". |
| 12 | Hospital Capacity | Two hospital nurses simultaneously decrease available ICU beds by 2 while offline. | Delta sync records two separate outbox records: `delta: -2` and `delta: -2`. When reconnected, server applies relative deltas sequentially, resulting in net `-4`, avoiding the lost-update anomaly of absolute overwrite. |
| 13 | Shelter Capacity | Shelter manager inputs arrival of 50 evacuees when shelter current occupancy is 190 / 200. | System records delta `+50`, updates local occupancy to 240 / 200 (120%), sets status badge to red "OVER CAPACITY (120%)", and automatically prompts manager to create an Urgent Resource Request for overflow sheltering. |
| 14 | Prepare Mode | User initiates Prepare Mode download over 3G metered connection with "Wi-Fi Only" enabled. | Download wizard halts and displays dialog: "Wi-Fi Only is enabled. Connect to Wi-Fi or toggle 'Allow Mobile Data' in settings to download the 45MB district pack." |
| 15 | Prepare Mode | Storage fills up during 50MB tile pack extraction. | Download engine verifies available disk space before starting. If free disk space < 120MB, aborts download and notifies user: "Insufficient local storage for offline pack. Free up 120MB and retry." |
| 16 | Language Switch | Citizen switches language to Tamil in low-literacy mode. | ARB localization engine swaps string bundle instantly; adjusts typography to ensure Tamil script line-height does not clip inside high-contrast large buttons. |
| 17 | Battery Saver | Device battery drops below 15% with Battery Saver mode engaged. | Adaptive GPS manager lowers background tracking frequency to once every 120 seconds or 150 meters, disables compass heading animation on map, and suppresses non-critical UI animations. |
| 18 | Low Reliability Road | Citizen submits report: "Bridge flooded, impassable". | Report is assigned Tier 3 (Public/Unverified) by server. Road graph edge is NOT marked closed immediately for rescue routing; instead, edge is rendered with dashed yellow stroke on map, and a "Verification Task" is generated for police/rescue. |

---

## 4. Deep Specification: R1 — Role-Based Screens, User Flows & UI Honesty

### 4.1 Citizen Role Architecture

The Citizen experience is designed for high stress, extreme panic, and varying literacy levels.

```
+-----------------------------------------------------------------------+
|                             CITIZEN HOME                              |
|  [Sync Status Bar: Offline - 2 items pending]  [Lang: EN/TA/HI] [⚙]  |
+-----------------------------------------------------------------------+
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                                                               |   |
|   |                        [ ONE-TAP SOS ]                        |   |
|   |                     HOLD 1 SEC TO SEND                        |   |
|   |                                                               |   |
|   +---------------------------------------------------------------+   |
|                                                                       |
|   +-------------------------------+ +-----------------------------+   |
|   |       REPORT INCIDENT         | |       FIND SAFE SHELTER     |   |
|   |     (Photo, Text, Hazard)     | |    (Nearest Route & Beds)   |   |
|   +-------------------------------+ +-----------------------------+   |
|                                                                       |
|   +-------------------------------+ +-----------------------------+   |
|   |         ACTIVE ALERTS         | |         MY REPORTS          |   |
|   |      (2 Warnings in Sector)   | |    (Status: Saved / Sent)   |   |
|   +-------------------------------+ +-----------------------------+   |
|                                                                       |
+-----------------------------------------------------------------------+
```

#### Detailed Flows & Specifications:
1. **One-Tap SOS Flow:**
   - **Trigger:** Giant red pulsing button. A 1-second long-press or tap-and-confirm prevents accidental activation.
   - **Immediate Action:** Vibration feedback + local P0 record created in Drift `outbox` within 50ms.
   - **Triage Sheet (Quick Counter):** Immediately pops a non-blocking modal (bottom sheet):
     * Number of People: `[-] [ 1 ] [+]` (Quick selector: 1, 2, 5, 10+)
     * Immediate Need: `[Medical]` `[Trapped/Flood]` `[Food/Water]` `[Elderly/Infant]`
     * Auto-dismisses in 10 seconds if user is unable to respond, preserving base SOS.
   - **Location Metadata:** Automatically captures `latitude`, `longitude`, `altitude`, `accuracy_meters`, `timestamp`, and `device_id`.
   - **Status Screen:** Navigates directly to the Honest Status Tracker screen.

2. **Incident Reporting Flow:**
   - **Inputs:**
     * Category Picker: Flood, Building Collapse, Road Blockage, Fire, Power Outage, Other.
     * Description: Clean, sanitized text input (max 500 characters, no HTML allowed).
     * Photo Capture: Custom camera preview or device picker; auto-compresses image to max 1280x720 JPEG (quality 75) to minimize bandwidth.
     * EXIF Geotagging: Lat/lon extracted from hardware GPS at capture moment.
   - **Offline Handling:** Photo saved locally to app sandbox `/data/user/0/.../reports/images/{uuid}.jpg`. Metadata written to `outbox` with priority 2 (normal). Media binary upload scheduled separately for allowed networks (Wi-Fi or Normal cellular).

3. **Shelters & Safe Routes:**
   - **Query:** Pulls active shelters from local SQLite ordered by road network distance (calculated via Dijkstra).
   - **Card Elements:**
     * Shelter Name (e.g., "Ward 4 Community Hall")
     * Available Space: "64 free spots (out of 200)"
     * Stale Indicator: If data > 2 hours old, renders amber badge: "Capacity data from 2h ago".
     * Action: "Navigate Safe Route" -> opens interactive map with calculated detour avoiding flood zones.

4. **"My Reports" Honest Status Screen:**
   - Every submitted report is displayed with an immutable audit trail:
     * `State 1: Saved on phone` (Icon: Phone with checkmark, Yellow). "Stored in device memory at 10:14 AM. Waiting for network connection."
     * `State 2: Sent to server` (Icon: Cloud with checkmark, Blue). "Transmitted to SAHAYA central servers at 10:17 AM."
     * `State 3: Received by control room` (Icon: Shield with checkmark, Green). "Acknowledged by Control Room Dispatcher (ID: OP-402) at 10:21 AM."
   - **Negative Contract:** No status shall EVER read "Help is on the way" unless an authenticated rescue unit has transitioned a linked assignment to `En Route`.

---

### 4.2 Rescue Team Role Architecture

Designed for high-intensity operational field units.

```
+-----------------------------------------------------------------------+
|                             RESCUE UNIT HUD                           |
| Unit: RES-04 (Chennai Central) | GPS: Active (±3.8m) | Batt Saver: OFF |
+-----------------------------------------------------------------------+
| [ACTIVE TASK: Approved]                                               |
| Mission #849: Evacuate 4 trapped citizens                             |
| Location: Ward 7, Cross St 4 (1.8 km) | ETA: 7 mins                   |
| [  START NAVIGATION  ]            [  UPDATE STATUS: EN ROUTE  ]       |
+-----------------------------------------------------------------------+
| TASK LIST                                                             |
| - #849: Evacuate Ward 7 (Approved)              -> [Active]          |
| - #852: Check Bridge R-14 (Verification)        -> [Queued]          |
| - #855: Supply Drop Ward 9 (Proposed)           -> [Locked]          |
+-----------------------------------------------------------------------+
| QUICK TOOLS                                                           |
| [ High-Trust Field Report ]           [ Unit Status: Busy / Active ]  |
+-----------------------------------------------------------------------+
```

#### Detailed Flows & Specifications:
1. **Assigned Tasks State Machine:**
   - Allowed States: `Proposed` -> `Approved` -> `En Route` -> `On Scene` -> `Done`.
   - **Control Room Approval Gate:** If task is in `Proposed` state, the "En Route" button is disabled. Tooltip displays: "Requires Control Room approval before dispatch." Rescuers cannot self-dispatch.
   - **Status Transitions:** Tapping "Mark En Route" generates a P1 outbox record immediately updating the local task state, changing unit status on the shared map, and prompting route navigation.

2. **Verification Tasks ("Check this bridge"):**
   - Distinct from citizen reports; intended to verify infrastructure or unverified citizen reports.
   - Rescuers arrive at target coordinates (e.g., Bridge R-14).
   - Form fields:
     * Status selector: `Verified Passable`, `Verified Flooded / Impassable`, `False Alarm`.
     * Water Depth (meters) if applicable.
     * High-resolution photographic evidence with verified timestamp.
   - **Impact:** Submitting this report with `role: rescue` immediately updates the local road graph to closed or open, recalculates local routes, and synchronizes as a Tier 1 verified report.

3. **GPS Auto-Tracking HUD:**
   - Persistent banner showing current tracking status, GPS accuracy, and toggle switch.
   - Clear permission rationale displayed prior to background permission request.
   - Visual indicator pulses green on each transmitted breadcrumb batch.

---

### 4.3 Hospital Role Architecture

Designed for triage desks and hospital disaster incident commanders.

```
+-----------------------------------------------------------------------+
|                        HOSPITAL STATUS CONSOLE                        |
| Facility: Rajiv Gandhi General Hospital | Status: NORMAL OPERATIONS    |
+-----------------------------------------------------------------------+
| BED INVENTORY (SYNCED VIA DELTAS)                                     |
| Free General Beds:  [ - ]  [  42  ]  [ + ]    (Delta: +0)             |
| ICU Beds Available: [ - ]  [   4  ]  [ + ]    (Delta: +0)             |
| Trauma Suites Open: [ - ]  [   2  ]  [ + ]    (Delta: +0)             |
| [ COMMIT CAPACITY CHANGES ]                                           |
+-----------------------------------------------------------------------+
| EMERGENCY DIVERSION CONTROL                                           |
| [ Toggle Ambulance Diversion ] -> Currently ACCEPTING TRAUMA          |
| (Declaring Diversion alerts all dispatchers and routes ambulances away)|
+-----------------------------------------------------------------------+
| INCOMING PATIENTS (3 IN TRANSIT)                                      |
| - Unit RES-02: 1x RED (Crush Injury)       | ETA: 4 mins              |
| - Unit RES-07: 2x YELLOW (Hypothermia)     | ETA: 12 mins             |
| - Unit AMB-01: 1x GREEN (Minor Laceration) | ETA: 19 mins             |
+-----------------------------------------------------------------------+
```

#### Detailed Flows & Specifications:
1. **Relative Delta Capacity Updates:**
   - Tapping `+` or `-` adjusts an uncommitted local delta counter.
   - When user taps "Commit", a P1 outbox record is generated:
     ```json
     {
       "hospital_id": "HOSP-01",
       "delta_general_beds": -5,
       "delta_icu_beds": -1,
       "delta_trauma_beds": 0,
       "timestamp": "2026-10-31T05:20:00Z"
     }
     ```
   - Avoids race conditions where two nurses overwrite absolute bed counts.
2. **Diversion Mode Switch:**
   - Two-step confirmation: "Declare Diversion? Ambulances will be automatically re-routed to alternative facilities."
   - Generates a Priority 0 (life-critical) outbox record that jumps the sync queue immediately.

---

### 4.4 Police & Fire Service Role Architecture

Designed for law enforcement, traffic management, and fire rescue incident commanders.

```
+-----------------------------------------------------------------------+
|                         POLICE & FIRE SECTOR HUD                      |
| Unit: POLICE-SECTOR-02 | Sector: Marina / Ward 4                      |
+-----------------------------------------------------------------------+
| ROAD & INFRASTRUCTURE CONTROL                                         |
| [ Close Road / Bridge ]    [ Reopen Road / Bridge ]   [ View Closures ]|
+-----------------------------------------------------------------------+
| QUICK CLOSURE: BRIDGE R-14 (North Channel)                            |
| Status: OPEN | Condition: Water rising rapidly                        |
| [ DECLARE CLOSED: FLOOD IMPASSABLE ]                                  |
| (Immediately recalculates routes for all rescue units in district)    |
+-----------------------------------------------------------------------+
| INCIDENT NOTES & PATROL TASKS                                         |
| - Task #401: Perimeter Security - Ward 4 Relief Camp (In Progress)     |
| - Incident Note: Downed high-voltage power lines on Kamarajar Salai   |
| [ Add Official Incident Note ]                                        |
+-----------------------------------------------------------------------+
```

#### Detailed Flows & Specifications:
1. **Official Road Closure Workflow:**
   - Officer selects road segment from map or searchable asset registry (e.g., "Bridge R-14").
   - Selects reason: `Flooding > 0.5m`, `Structural Damage`, `Downed Wires / Debris`, `Police Checkpoint`.
   - Action creates Priority 0 outbox item:
     ```json
     {
       "segment_id": "R-14",
       "status": "closed",
       "closure_type": "flood",
       "flood_depth_m": 0.8,
       "reported_by_role": "police",
       "timestamp": "2026-10-31T05:22:00Z"
     }
     ```
   - Directly executes graph update on local device, immediately recalculating any active routing, and broadcasts to mesh/server.

---

### 4.5 NGO / Shelter Manager Role Architecture

Designed for relief camp coordinators managing displaced citizens and inventory.

```
+-----------------------------------------------------------------------+
|                         SHELTER MANAGEMENT                            |
| Shelter: St. Mary's Relief Camp | Capacity: 250 | Current: 185 (74%)   |
+-----------------------------------------------------------------------+
| EVACUEE FLOW TRACKING                                                 |
| Log Arrivals:   [ +1 ]  [ +5 ]  [ +10 ]  [ +25 ]                      |
| Log Departures: [ -1 ]  [ -5 ]  [ -10 ]                               |
| Today's Net Influx: +62 evacuees                                      |
+-----------------------------------------------------------------------+
| INVENTORY LEVELS & CRITICAL DEPLETION                                 |
| - Drinking Water: 420 L  (Low: Est. 6 hrs left)  [ ⚠️ Order Supply ]   |
| - Food Rations:   850 pk (Adequate: 2 days)                           |
| - First Aid Kits: 12 pk  (Critical: < 15 pk)     [ ⚠️ Order Supply ]   |
| - Blankets/Cots:  190 pk (Adequate)                                   |
+-----------------------------------------------------------------------+
| [ CREATE FORMAL RESOURCE REQUISITION ]                                |
+-----------------------------------------------------------------------+
```

#### Detailed Flows & Specifications:
1. **Evacuee Delta Tracking:**
   - Quick addition buttons (+1, +5, +10) write immediate deltas to outbox.
   - Prevents stale snapshot overrides when multiple camp gates log arrivals.
2. **Resource Requests:**
   - Requisition wizard: Select commodity (Water, Meal Pack, Pediatric Antibiotics, Hygiene Kits), specify quantity, urgency tier (Critical, Urgent, Standard). Generates P1 outbox request.

---

### 4.6 Shared UI Features & Systems

1. **Interactive Map Screen (`flutter_map`):**
   - Universal full-screen view accessible across all roles with role-appropriate tool layers.
   - Floating Action Buttons:
     * Layer Selector (Toggles: Incidents, Shelters, Hospitals, Roads, Hazard Zones, Units).
     * Re-center on My Location.
     * Prepare Mode quick-launch icon (cloud-download icon with green check if pack valid).
     * Compass indicator resetting map north.

2. **Sync Status Bar:**
   - Located at the top of screens below the system status bar or docked in app bar:
     * Green Dot: `Online (Broadband)` — Full sync active.
     * Yellow Dot: `Data Saver (Metered)` — Text only, photos paused.
     * Red Dot: `Offline (Airplane Mode)` — Outbox queueing active.
     * Backlog counter: `3 pending changes` — Tapping opens Outbox Inspector.
     * Action: "Sync Now" icon button.

3. **Language Switcher (ARB Localization):**
   - Seamless locale change at runtime via Flutter `AppLocalizations`.
   - Bundles:
     * `app_en.arb` (English)
     * `app_ta.arb` (Tamil - தமிழ்)
     * `app_hi.arb` (Hindi - हिन्दी)
   - Every single button, prompt, disclaimer, and error message bound to localization keys.

4. **Low-Literacy & Large-Button Accessibility Mode:**
   - High contrast ratios (WCAG AAA compliant: > 7:1).
   - Touch targets scaled up to 72dp minimum height.
   - Universal, bold, standardized iconography accompanying text.
   - Audio prompt option (text-to-speech) reading alert summaries in Tamil/Hindi.

5. **Settings & Power Management:**
   - **Data Saver Mode:** When enabled, disables thumbnail downloads, stops vector tile streaming, forces outbox media compression, restricts sync to P0 and P1 payloads.
   - **Battery Saver Mode:** Reduces GPS polling rate to 2 minutes, dims background map rendering, disables background animations.
   - **SMS Gateway Number:** User-configurable phone number for control room SMS receiver (defaults to official government gateway e.g., `+91XXXXXXXXXX`).
   - **Emergency Disclaimer Banner:** Persistent footer on settings and login:
     *"This app supports emergency coordination; call your national emergency number (112) for immediate life-threatening danger."*

---

## 5. Deep Specification: R3 — Connectivity Modes, Fallbacks & Prepare Mode

### 5.1 Connectivity State Machine & Active Reachability Probe

Rather than relying purely on passive OS network listeners (which falsely report "connected" when connected to Wi-Fi routers without uplink), SAHAYA Field runs an **Active Reachability Prober**:

```
                       +-------------------+
                       |    INIT / BOOT    |
                       +-------------------+
                                 |
                                 v
                     +-----------------------+
                     | Connectivity_plus     |
                     | Interface Detected?   |
                     +-----------------------+
                        /                 \
                 [NONE]/                   \[WIFI / CELLULAR]
                      v                     v
            +-----------------+     +--------------------------+
            |  MODE: OFFLINE  |     | Active HTTP Probe        |
            |                 |     | GET /health (timeout 2s) |
            +-----------------+     +--------------------------+
                      ^               /          |          \
                      |       [TIMEOUT]     [200 OK]      [METERED /
                      |              /           |         DATA SAVER]
                      |             v            v              v
                      |      +-----------+ +------------+ +-------------+
                      +------|  OFFLINE  | |   NORMAL   | | DATA SAVER  |
                             +-----------+ +------------+ +-------------+
```

#### Reachability Probe Specification:
- **Interval:** Probes every 30 seconds when idle, every 10 seconds during active sync.
- **Probe Endpoint:** `HEAD /health` or `GET /sync/pull?since=now&limit=0` with `ConnectTimeout: 2000ms`, `ReceiveTimeout: 2000ms`.
- **Mode Classification Criteria:**
  * **NORMAL:** Active internet confirmed, RTT < 1000ms, unmetered or user Data Saver = OFF.
  * **DATA SAVER:** Active internet confirmed, but user enabled Data Saver, OR cellular network detected with high latency (RTT > 1500ms), OR packet loss > 30%. In this mode:
    - Photo uploads blocked (held in local storage).
    - Map tile downloads from network prohibited.
    - Outbox batches compressed via gzip.
  * **OFFLINE:** No physical interface, socket connection refused, or HTTP probe timeout. All outbox entries remain queued.

---

### 5.2 SOS Fallback Chain Architecture

When a life-critical SOS is triggered, the app executes the fallback chain sequentially until delivery is confirmed:

```
[SOS TRIGGERED]
      |
      v
[1. Local Outbox Write] ---> (Always persists in SQLite SQLCipher within 50ms)
      |
      v
[2. Attempt HTTPS Post] ---> (Direct call to POST /sync/push or POST /sos, timeout 3s)
      |
      +---> [SUCCESS 200 OK] ---> State: "Sent to server" -> Terminate Chain
      |
      v [FAIL / TIMEOUT]
[3. Local Queued Retry] ---> (Background sync engine armed with backoff)
      |
      v
[4. Android Compact SMS] ---> (Check: Platform == Android && Cellular Radio Available?)
      |
      +---> [YES] ---> Prompt User Confirmation -> Send Compact GSM SMS to Gateway
      |                  |
      |                  +---> [SMS SENT] ---> State: "Sent via SMS (Control Gateway)"
      |
      +---> [NO / iOS] ---> On iOS: Open MFMessageComposeViewController with prefilled body
      |
      v
[5. Stretch: D2D Relay] ---> (Nearby Connections BLE/Wi-Fi Direct mesh broadcast)
```

---

### 5.3 Compact SMS Encoding Specification

Standard GSM 03.38 text messages are limited to 160 7-bit characters (140 bytes). The SOS compact encoding schema packs maximum emergency telemetry into a single-segment SMS:

#### Wire Format:
`SAHAYA|V1|<TYPE>|<LAT>,<LON>|<ACC>|<PEOPLE>|<NEEDS>|<UNIX_TS>|<DEVICE_HASH>`

#### Field Definitions:
1. `SAHAYA`: Fixed application identifier prefix (6 chars).
2. `V1`: Protocol version (2 chars).
3. `<TYPE>`: Event code: `SOS` (Panic), `MED` (Medical), `FLD` (Flood Trap) (3 chars).
4. `<LAT>,<LON>`: Coordinates rounded to 4 decimal places (~11 meters precision): e.g. `13.0827,80.2707` (17 chars).
5. `<ACC>`: Accuracy in meters: e.g. `A08` (8 meters) (3 chars).
6. `<PEOPLE>`: Count: `P04` (4 people) (3 chars).
7. `<NEEDS>`: Bitmask/CSV of triage needs: `M` (Medical), `F` (Food), `T` (Trapped), `E` (Elderly): e.g. `M+T` (3 chars).
8. `<UNIX_TS>`: Epoch timestamp in seconds: e.g. `1761888000` (10 chars).
9. `<DEVICE_HASH>`: Shortened 8-character hex hash of unique device ID: e.g. `8F3A12C0` (8 chars).

#### Sample Encoded SMS:
`SAHAYA|V1|SOS|13.0827,80.2707|A08|P04|M+T|1761888000|8F3A12C0`  
**Total Length:** 58 characters (well within the 160-character single-segment SMS limit, ensuring 100% transmission reliability across degraded 2G cellular base stations).

---

### 5.4 Prepare Mode Workflow & District Pack Bundling

"Prepare Mode" allows citizens and response personnel to air-gap their devices prior to deployment into disconnected disaster zones.

#### Download Bundle Contents (`district_pack_{id}.zip`):
1. `tiles/`: Local raster or PMTiles vector archive for target district (e.g., Chennai 12 wards, zoom levels 10 to 16).
2. `road_graph.json`: Topological node-edge network with speed limits, road classifications, bridge identifiers, and baseline elevations.
3. `shelters.json`: GeoJSON feature collection of all designated relief camps with baseline capacities and contact data.
4. `hospitals.json`: Baseline dataset of district hospitals, trauma centers, and helipads.
5. `hazard_zones.json`: Cached flood zone polygons and cyclone surge projection zones.

#### Prepare Mode UI / UX Flow:
- Screen shows target district name: "Chennai Metropolitan Area (12 Wards)".
- Estimated package size: "44.2 MB".
- Checkbox: `[x] Download only over Wi-Fi` (enabled by default).
- Big CTA: `[ DOWNLOAD DISASTER PACK ]`.
- Progress indicator shows:
  * Stage 1: Fetching district road graph (2.1 MB)
  * Stage 2: Fetching facility databases (0.4 MB)
  * Stage 3: Fetching offline map tiles (41.7 MB)
  * Stage 4: Verifying cryptographic checksum (SHA-256)
- **Completion Badge:** Green persistent banner on home screen: `"Offline Disaster Pack Active — Ready for 100% Disconnected Operation"`.

---

## 6. Deep Specification: R4 — Maps, GPS Tracking & Offline Routing

### 6.1 `flutter_map` Offline Configuration

SAHAYA Field utilizes `flutter_map` (v6+) configured strictly to prohibit public tile scraping.

#### Prohibited:
Direct URL templates pointing to `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. Bulk downloading from OSM tile servers violates OpenStreetMap Foundation Tile Usage Policies and risks IP bans during critical disasters.

#### Architecture:
```
+-------------------------------------------------------------+
|                      FLUTTER_MAP WIDGET                     |
+-------------------------------------------------------------+
                              |
                              v
             +----------------------------------+
             |     LocalTileProvider (Custom)   |
             +----------------------------------+
               /                              \
              v                                v
     [Bundle Sample Pack]            [Downloaded PMTiles / Dir]
    assets/tiles/{z}/{x}/{y}.png     /app_data/tiles/{z}/{x}/{y}.png
              |                                |
              +----------------+---------------+
                               |
                               v
               [Missing Tile Fallback Generator]
          (Renders neutral vector grid canvas with tile coordinates)
```

- **Bundled Sample Pack:** Includes zoom levels 11-14 for the Chennai Flood demo scenario embedded directly in Flutter assets for immediate out-of-the-box offline evaluation.
- **Downloaded Packs:** Stored in application document directory under `/tiles/{district_id}/{z}/{x}/{y}.png` or served via local SQLite BLOB / PMTiles reader.

---

### 6.2 8-Tier Map Layer Architecture

The map visual stack is rendered in strict z-index order:

```
[Z-INDEX 8] Floating Controls (Recenter, Layers, Emergency SOS, Compass)
[Z-INDEX 7] My Location Puck (Blue circle with pulse animation & accuracy ring)
[Z-INDEX 6] Active Navigation Polyline (Thick cyan/blue stroke with directional chevrons)
[Z-INDEX 5] Field Unit Markers (Rescue boats, police cruisers, ambulances with role icons)
[Z-INDEX 4] Incident Markers (Pins colored by priority P0-P3, shaped by status)
[Z-INDEX 3] Facility Markers (Hospitals with red cross & diversion pill; Shelters with bed icon)
[Z-INDEX 2] Road Network Layer (Colored by passability; Solid = Verified, Dashed = Unverified)
[Z-INDEX 1] Hazard Polygons (Semi-transparent red/orange fills with pulsing danger borders)
[Z-INDEX 0] Base Raster/Vector Tiles (Local offline tile engine)
```

#### Road Network Stroke Styling Rules:
- **Passable / Clear:** Solid Green (`#34C759`), 3px stroke.
- **Flooded Passable (< 0.3m):** Solid Amber (`#FF9500`), 3px stroke.
- **Flooded Impassable / Closed (Bridge R-14):** Solid Red (`#FF3B30`), 4px stroke with white "X" icons.
- **Unverified Citizen Hazard Report:** **Dashed** Stroke (`dashPattern: [6, 4]`), Orange (`#FF9500`). Communicates lower reliability tier visually to field units.

---

### 6.3 GPS Foreground & Adaptive Background Tracking

#### Adaptive Polling Logic Table:

| Role Profile | Operational State | Battery Mode | GPS Interval | Distance Filter | Accuracy Target | Outbox Batching |
|--------------|-------------------|--------------|--------------|-----------------|-----------------|-----------------|
| Citizen | Foreground (SOS/Report) | Any | 1 shot on tap | 0 meters | Best (< 10m) | Immediate P0/P2 |
| Citizen | Background | Any | **DISABLED** | N/A | N/A | None (Privacy) |
| Rescue Unit | Active Mission / Moving | Normal | 5 seconds | 10 meters | High (< 15m) | Batch of 6 (30s) |
| Rescue Unit | Stationary (< 3 km/h) | Normal | 30 seconds | 25 meters | Medium (< 30m) | Batch of 4 (2m) |
| Rescue Unit | Any | Battery Saver | 60 seconds | 50 meters | Low (< 50m) | Batch of 5 (5m) |
| Police / Fire | Patrol / Moving | Normal | 10 seconds | 20 meters | High (< 15m) | Batch of 6 (1m) |
| Police / Fire | Any | Battery Saver | 90 seconds | 100 meters | Low (< 50m) | Batch of 4 (6m) |

#### Battery Conservation Mechanisms:
- **Activity Recognition / Velocity Gating:** Uses accelerometer / step detection to pause GPS radio entirely when device is stationary for > 3 minutes.
- **Outbox Aggregation:** Breadcrumbs are not written individually; they are collected in memory and flushed to SQLite in chunks, reducing flash storage I/O and battery drain.

---

### 6.4 Offline Dijkstra Routing in a Dart Isolate

To guarantee 60fps stutter-free UI during route panning and zoom, all graph calculations are delegated to an independent Dart Isolate (`DijkstraRoutingIsolate`).

#### Graph Data Representation:
```json
{
  "nodes": {
    "N-01": {"lat": 13.0827, "lon": 80.2707, "elevation_m": 4.2},
    "N-02": {"lat": 13.0850, "lon": 80.2750, "elevation_m": 3.1}
  },
  "edges": [
    {
      "id": "R-14",
      "source": "N-01",
      "target": "N-02",
      "length_m": 450,
      "base_speed_kmh": 40,
      "status": "closed",
      "flood_depth_m": 0.9,
      "reliability_tier": 1,
      "last_updated": "2026-10-31T05:15:00Z"
    }
  ]
}
```

#### Cost Function Formulation:
For edge $e = (u, v)$:
$$\text{Cost}(e) = \text{TraversalTime}(e) \times W_{\text{status}}(e) \times W_{\text{reliability}}(e)$$

Where:
- $\text{TraversalTime}(e) = \frac{\text{length\_m}(e)}{\text{base\_speed\_kmh}(e) \times \frac{1000}{3600}}$
- $W_{\text{status}}(e)$:
  * `passable_normal`: $1.0$
  * `flooded_passable` (depth $< 0.3m$): $3.5$ (heavy slowdown)
  * `debris_partial`: $2.0$
  * `unverified_hazard`: $2.5$
  * `closed` or `flooded_impassable` (e.g. Bridge R-14): **$\infty$ (Edge pruned / skipped)**
- $W_{\text{reliability}}(e)$:
  * Tier 1 (Official Gov/Police): $1.0$
  * Tier 2 (Rescue Field Unit): $1.1$
  * Tier 3 (Citizen Unverified): $1.8$ (routes favor verified roads where possible)

#### Bridge R-14 Avoidance Scenario Execution:
1. Rescuer is navigating from Headquarters (`N-01`) to Ward 4 Shelter (`N-08`). Initial route crosses Bridge R-14 (`R-14`).
2. Control room or Police Unit broadcasts closure: `R-14 status = closed`.
3. Graph repository updates edge `R-14` in SQLite and fires `RoadGraphUpdatedEvent`.
4. Active Navigation Controller dispatches `RecalculateRouteMessage` to `DijkstraRoutingIsolate`.
5. Isolate marks `R-14` weight as $\infty$, executes Dijkstra using a min-priority queue (Binary Heap), discovers alternate northern bypass via `R-22` and `R-25`.
6. Isolate posts `RouteFoundMessage` back to main isolate in 12ms.
7. Map renders new route, HUD displays: *"Rerouted: Bridge R-14 impassable. +1.2 km (+4 mins)"*.

---

## 7. Deep Specification: R5 — Alerts, Notifications & Offline Geofencing

### 7.1 Android Notification Channel Specifications

Configured via `flutter_local_notifications`:

```
+-------------------------------------------------------------------------------+
|                       NOTIFICATION CHANNELS CONFIGURATION                    |
+-------------------+--------------------+------------------+-------------------+
| Attribute         | Critical Alert     | Warning Alert    | Info Alert        |
+-------------------+--------------------+------------------+-------------------+
| Channel ID        | sahaya_critical    | sahaya_warning   | sahaya_info       |
| Channel Name      | Critical Disaster  | Weather & Hazard | Operational Info  |
| Importance        | Importance.max (5) | Importance.high  | Importance.default|
| Priority          | Priority.high      | Priority.high    | Priority.low      |
| Sound             | siren_loud.wav     | alert_chime.wav  | default_system    |
| Vibrate Pattern   | [0, 1000, 500, ...] | [0, 500, 250]    | [0, 200]          |
| Full-Screen Intent| TRUE (Bypasses lock| FALSE            | FALSE             |
|                   | screen)            |                  |                   |
| Bypass DND        | TRUE (Life-saving) | FALSE            | FALSE             |
| Action Buttons    | [ACKNOWLEDGE]      | [VIEW DETAILS]   | [DISMISS]         |
|                   | [EVACUATION ROUTE] |                  |                   |
+-------------------+--------------------+------------------+-------------------+
```

#### Critical Alert Acknowledgement Loop:
1. Siren sounds; full-screen dialog wakes device display over keyguard.
2. User must press and hold `[ACKNOWLEDGE DIRECTIVE]` for 1.5 seconds.
3. System silences alarm, logs local SQLite acknowledgment record, and enqueues P0 outbox payload:
   ```json
   {
     "alert_id": "ALT-2026-FLOOD-01",
     "device_id": "8F3A12C0",
     "acknowledged_at": "2026-10-31T05:25:30Z",
     "lat": 13.0827,
     "lon": 80.2707
   }
   ```
4. If connected, pushes immediately to control room dashboard to update citizen safety headcount.

---

### 7.2 Offline Geofencing Engine

#### Spatial Geofence Representation:
Disaster zones are cached locally as GeoJSON Polygons in Drift table `hazard_polygons`:
```json
{
  "id": "HAZ-FLOOD-WARD-4",
  "type": "Polygon",
  "severity": "critical",
  "name": "Cooum River Flash Flood Zone",
  "coordinates": [
    [[80.270, 13.080], [80.275, 13.082], [80.278, 13.078], [80.272, 13.075], [80.270, 13.080]]
  ]
}
```

#### Ray-Casting Point-in-Polygon (PIP) Algorithm:
For each incoming GPS fix $(P_x = \text{lon}, P_y = \text{lat})$:
1. **Bounding Box Pruning (Stage 1):**
   $$\text{Check: } \text{min\_lon} \le P_x \le \text{max\_lon} \quad \text{AND} \quad \text{min\_lat} \le P_y \le \text{max\_lat}$$
   * If false, immediately discard (0.001ms computational cost).
2. **Ray-Casting Jordan Curve Theorem (Stage 2):**
   * Cast a semi-infinite ray horizontally from $P$ to $+\infty$.
   * Count the number of intersections with polygon edges.
   * If intersection count is **odd**, point is **INSIDE**. If **even**, point is **OUTSIDE**.
3. **Debounce Buffer:**
   * Transition `OUTSIDE -> INSIDE` requires 2 consecutive fixes inside polygon to prevent boundary chatter.
   * On confirmed `ENTERED` event: Fires Critical Alert siren and notification:
     *"EMERGENCY: You have entered an active Flash Flood Hazard Zone (Cooum River). Evacuate north immediately."*

---

### 7.3 Route & Flow Dispatch Notifications

1. **Rescue Unit Route Obstruction Notice:**
   - Evaluated whenever a road closure is synced.
   - If `closed_road_segment_id` matches any segment in `active_route.segment_ids`:
     * Generates Heads-Up Local Notification: *"Active Route Blocked at Bridge R-14. Tap to accept recomputed detour."*
2. **Hospital Inbound Patient Triage Alerts:**
   - Triggers when an ambulance updates ETA to $< 10$ minutes with `triage_code: RED`:
     * Generates High-Priority Notification: *"RED TRIAGE INBOUND: Unit RES-02 arriving in 8 mins (Severe Trauma)."*
3. **Shelter Surge Alerts:**
   - Triggers when nearby ward evacuation is ordered:
     * Generates Warning Notification: *"EVACUATION WAVE: 50+ evacuees dispatched towards your facility."*

---

## 8. Interface Contracts & Schemas

### 8.1 Outbox Payload Schemas

#### Schema: Citizen SOS (Priority 0)
```json
{
  "client_uuid": "d4e8b1a2-7f9c-4c6e-8a1d-2b3c4d5e6f7a",
  "priority": 0,
  "collection": "sos",
  "payload": {
    "role": "citizen",
    "device_id": "8F3A12C0",
    "people_count": 4,
    "need_types": ["medical", "trapped_flood"],
    "latitude": 13.08271,
    "longitude": 80.27072,
    "accuracy_meters": 4.5,
    "timestamp": "2026-10-31T05:25:00Z"
  }
}
```

#### Schema: Official Road Closure (Priority 0)
```json
{
  "client_uuid": "e5f6a1b2-8c9d-4e5f-9a1b-3c4d5e6f7a8b",
  "priority": 0,
  "collection": "road_closures",
  "payload": {
    "segment_id": "R-14",
    "status": "closed",
    "closure_reason": "bridge_submerged",
    "flood_depth_m": 0.85,
    "authorized_by": "OFFICER-P-104",
    "role": "police",
    "timestamp": "2026-10-31T05:25:00Z"
  }
}
```

#### Schema: Hospital Bed Delta (Priority 1)
```json
{
  "client_uuid": "f6a1b2c3-9d4e-5f6a-1b2c-4d5e6f7a8b9c",
  "priority": 1,
  "collection": "hospital_deltas",
  "payload": {
    "hospital_id": "HOSP-01",
    "delta_general_beds": -3,
    "delta_icu_beds": -1,
    "delta_trauma_beds": 0,
    "timestamp": "2026-10-31T05:25:00Z"
  }
}
```

#### Schema: Shelter Occupancy Delta (Priority 1)
```json
{
  "client_uuid": "a1b2c3d4-0e1f-2a3b-4c5d-6e7f8a9b0c1d",
  "priority": 1,
  "collection": "shelter_deltas",
  "payload": {
    "shelter_id": "SHELTER-03",
    "delta_occupancy": 15,
    "delta_food_rations": -15,
    "delta_water_liters": -30,
    "timestamp": "2026-10-31T05:25:00Z"
  }
}
```

---

### 8.2 Isolate Routing Request / Response Contract

```dart
class DijkstraRouteRequest {
  final Map<String, dynamic> roadGraphJson;
  final double originLat;
  final double originLon;
  final double destinationLat;
  final double destinationLon;
  final List<String> forcedClosedSegmentIds;
  final String vehicleType; // "ambulance", "rescue_boat", "heavy_truck", "pedestrian"

  DijkstraRouteRequest({
    required this.roadGraphJson,
    required this.originLat,
    required this.originLon,
    required this.destinationLat,
    required this.destinationLon,
    required this.forcedClosedSegmentIds,
    this.vehicleType = "ambulance",
  });
}

class DijkstraRouteResponse {
  final bool success;
  final String? errorMessage;
  final List<LatLngCoordinate> path;
  final List<String> segmentIds;
  final double totalDistanceMeters;
  final int estimatedSeconds;
  final bool containsStaleSegments;
  final DateTime computedAt;

  DijkstraRouteResponse({
    required this.success,
    this.errorMessage,
    required this.path,
    required this.segmentIds,
    required this.totalDistanceMeters,
    required this.estimatedSeconds,
    required this.containsStaleSegments,
    required this.computedAt,
  });
}
```

---

## 9. Recommended Project Code Layout for Implementation

When implementation phases commence, the following clean, modular structure is specified:

```
lib/
├── core/
│   ├── connectivity/
│   │   ├── reachability_prober.dart          # R3: Normal, Data Saver, Offline probe
│   │   ├── sos_fallback_chain.dart           # R3: HTTPS -> Outbox -> SMS -> D2D
│   │   └── sms_compact_encoder.dart          # R3: 160-char GSM SOS encoder
│   ├── notifications/
│   │   ├── notification_manager.dart         # R5: Channels (Critical, Warning, Info)
│   │   ├── geofence_engine.dart              # R5: Offline Ray-casting PIP engine
│   │   └── alert_acknowledgement_sync.dart  # R5: Mandatory ack P0 sync
│   └── routing/
│       ├── dijkstra_routing_isolate.dart     # R4: Background Isolate pathfinder
│       ├── road_graph_repository.dart        # R4: Nodes & Edges SQLite cache
│       └── models/route_models.dart          # R4: Request/Response DTOs
├── features/
│   ├── citizen/
│   │   ├── screens/sos_screen.dart           # R1: One-tap SOS & quick triage
│   │   ├── screens/incident_report_screen.dart# R1: Citizen hazard report
│   │   ├── screens/my_reports_screen.dart    # R1: UI Honesty state tracker
│   │   └── screens/shelters_list_screen.dart # R1: Nearest shelter directory
│   ├── rescue/
│   │   ├── screens/rescue_tasks_screen.dart  # R1: Proposed/Approved/En Route HUD
│   │   ├── screens/verification_screen.dart  # R1: Check bridge/hazard task
│   │   └── services/adaptive_gps_tracker.dart# R4: Foreground/Background GPS daemon
│   ├── hospital/
│   │   ├── screens/bed_capacity_screen.dart  # R1: Delta bed adjustments
│   │   └── screens/incoming_queue_screen.dart# R1: Patient triage queue
│   ├── police_fire/
│   │   └── screens/road_control_screen.dart  # R1: Official road closures
│   ├── ngo_shelter/
│   │   ├── screens/occupancy_screen.dart     # R1: Evacuee arrivals/departures
│   │   └── screens/inventory_screen.dart     # R1: Supply stock tracker
│   ├── shared/
│   │   ├── map/
│   │   │   ├── sahaya_map_view.dart          # R4: flutter_map offline container
│   │   │   ├── local_tile_provider.dart      # R4: Asset/PMTiles local tile loader
│   │   │   └── layers/                       # R4: 8-tier visual layer widgets
│   │   ├── sync_status_bar.dart              # R1: Persistent connection badge
│   │   ├── alerts_inbox_screen.dart          # R1/R5: Categorized alerts
│   │   ├── prepare_mode_screen.dart          # R3: 1-click district pack download
│   │   └── settings_screen.dart              # R1: Data/battery saver, disclaimer
└── l10n/
    ├── app_en.arb                            # R1: English strings
    ├── app_ta.arb                            # R1: Tamil (தமிழ்) strings
    └── app_hi.arb                            # R1: Hindi (हिन्दी) strings
```

---

## 10. Verification & Test Suite Directives

To validate requirements R1, R3, R4, and R5 in automated tests and manual simulation:
1. **R1 UI Honesty Unit Tests:**
   - Verify SOS state widget renders strictly "Saved on phone" until simulated sync push ack is injected.
   - Verify Rescue Task "Start Navigation" button is disabled when `task.status == 'Proposed'`.
2. **R3 SOS Fallback Unit Tests:**
   - Mock HTTP failure -> assert SMS payload generation matches compact 58-character schema.
   - Verify iOS platform guard prevents silent SMS execution.
3. **R4 Dijkstra Isolate Tests:**
   - Load flood scenario road graph (12 wards, Bridge R-14).
   - Execute Dijkstra from Node 1 to Node 8 -> route traverses R-14.
   - Update `R-14.status = 'closed'` -> re-execute Dijkstra -> assert path traverses bypass route and length increases.
   - Disconnect all edges -> assert isolate returns `RouteStatus.unreachable` without throwing uncaught exceptions.
4. **R5 Geofence Ray-Casting Tests:**
   - Define synthetic 5-point concave flood polygon.
   - Test Point $(x, y)$ inside -> assert returns `true`.
   - Test Point $(x, y)$ outside bounding box -> assert returns `false` on bounding box check without full raycast.
   - Test Point on vertex / edge -> assert stable classification.
   - Inject GPS stream crossing polygon border -> assert Critical Alert local notification is generated on 2nd consecutive inside fix.
