# Handoff Report — Spec Miner 3: Role Screens, Connectivity, Maps & Alerts (R1, R3, R4, R5)

## 1. Observation
- **Authoritative Source:** Directly inspected `/home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md`.
  * Lines 12-20: R1 requirements detailing Citizen, Rescue, Hospital, Police/Fire, NGO/Shelter screens, shared features (map, alerts inbox, sync status bar, language switch via ARB, low-literacy mode, settings), and strict UI honesty contracts ("Saved on phone", "Sent to server", "Received by control room"; never claim help is coming; Proposed vs Approved; server-assigned reliability tiers).
  * Lines 31-36: R3 requirements detailing active reachability probe (Normal, Data Saver, Offline), SOS fallback chain (HTTPS -> queued retry -> Android compact SMS -> D2D stretch), and Prepare mode (one-button download of district pack, road graph, shelters, hospitals, alerts with size indicator and Wi-Fi toggle).
  * Lines 38-44: R4 requirements detailing `flutter_map` offline configuration (locally stored vector/raster tiles, prohibit bulk downloading from OSM, bundled sample pack), 8 map layers, GPS foreground/background tracking with adaptive interval and battery saver, offline Dijkstra routing in a Dart isolate over cached road graph, closed road avoidance (Bridge R-14), dynamic recomputation, and stale data warning.
  * Lines 45-50: R5 requirements detailing notification channels (Critical with sound/vibration/lock-screen intent/ack sync, Warning, Info), offline geofencing via hazard polygon intersection detection, route & flow dispatch notifications, and FCM/local fallback.
  * Lines 70-84: Acceptance criteria verifying offline flight mode execution, Bridge R-14 road closure recalculation in isolate, hazard polygon geofence alert, UI honesty state transitions, and critical alert lock-screen intent with acknowledgement sync.
- **Environment & Workspace Checks:**
  * Tool check `which flutter dart` returned `code 127` (Flutter and Dart not in default PATH or yet to be wired in the environment by explorer_survey_1).
  * Workspace contains an existing dashboard directory (`frontend/` and `design/tokens.md`), while the target SAHAYA Field application is an offline-first Flutter application to be structured under `lib/`.
  * Confirmed that explorer_survey_1 is surveying the environment/tooling and explorer_survey_2 is surveying R2 (Data Layer & Sync), R6 (Mock Backend & API), and R7 (Security & Privacy).

## 2. Logic Chain
1. *From Observation of R1:* The application serves five distinct user roles with starkly different threat models, operational tempos, and information needs. The citizen role demands high-contrast, low-cognitive-load emergency interaction (1-tap SOS, honest status progression), while rescue, hospital, police, and NGO roles require operational data grids and delta-based inventory/bed management. The UI honesty contract is a safety-critical requirement: showing false hope ("Help is coming") or allowing field units to self-dispatch without control room authorization can cause panic or mission failure.
2. *From Observation of R3:* Connectivity in disaster zones oscillates unpredictably. Relying on passive OS connectivity checks produces false positives when routers lack upstream backhaul. Therefore, an active reachability probe testing HTTP latency/timeouts is necessary to switch modes (Normal, Data Saver, Offline). In total offline states, SOS must fall back to local outbox queuing, followed by compact GSM SMS (under 160 chars) on Android, and stretch D2D mesh forwarding. Prepare mode provides pre-emptive resilience by downloading tiles and graphs ahead of field deployment.
3. *From Observation of R4:* Public OSM tile servers enforce strict rate limits and ban mass tile scrapers. Maps must render 100% offline using pre-packaged or locally downloaded tile packs. Pathfinding cannot run on the Flutter UI thread without dropping frames during map interactions; thus, Dijkstra routing must execute inside an independent Dart Isolate over an adjacency list graph representation with dynamic obstacle penalties (such as Bridge R-14 flood closure).
4. *From Observation of R5:* Alerts in a disaster must break through silence and lock screens. Critical alerts require `fullScreenIntent` on Android with loud siren alarms and mandatory user acknowledgements synced back to control room. When air-gapped, offline geofencing via Ray-Casting (Point-in-Polygon) evaluated against cached GeoJSON hazard polygons ensures users receive evacuation alarms even with zero cellular signal.

## 3. Caveats
- No source code implementation has been written yet, adhering strictly to the spec mining read-only mandate.
- Bluetooth / Wi-Fi Direct Device-to-Device (D2D) mesh relay using Nearby Connections API is designated as an Android feature-flagged stretch goal in ORIGINAL_REQUEST.md line 35. Core fallback relies on HTTPS -> SQLite Outbox -> Android Compact SMS.
- iOS background SMS dispatch is strictly blocked by iOS sandboxing security rules; on iOS, the fallback opens the native `MFMessageComposeViewController` sheet requiring manual user tap on "Send".

## 4. Conclusion
Requirements R1, R3, R4, and R5 have been fully mined, cross-referenced, and specified in `/home/saran/projects/the one/.agents/teamwork/explorer_survey_3/survey_report.md`. The specification includes:
- 36 discovered features categorized with inputs, outputs, error behaviors, and discovery sources.
- 18 boundary edge cases with specified handling mechanisms.
- Comprehensive UI wireframe layouts and flowcharts for Citizen, Rescue, Hospital, Police/Fire, and NGO/Shelter roles.
- Strict UI Honesty contracts and server-assigned reliability tiers.
- Active reachability probe state machine and 58-character compact SMS encoding wire format.
- `flutter_map` offline local provider architecture and 8-tier visual layer stack.
- Dart Isolate Dijkstra graph routing request/response contracts and Bridge R-14 dynamic avoidance scenario.
- Offline Ray-Casting Point-in-Polygon geofencing algorithm with debounce buffering and high-priority Android notification channels with synced acknowledgements.
- Recommended clean-architecture directory layout for `lib/`.

## 5. Verification Method
1. Inspect the comprehensive specification document:
   `view_file` on `/home/saran/projects/the one/.agents/teamwork/explorer_survey_3/survey_report.md`.
2. Inspect the briefing and dispatch tracking:
   `view_file` on `/home/saran/projects/the one/.agents/teamwork/explorer_survey_3/BRIEFING.md` and `DISPATCH.md`.
3. Invalidation Conditions:
   - Any requirement in R1, R3, R4, R5 omitted from `survey_report.md`.
   - Any violation of the UI honesty contract (e.g. claiming "help is coming" or allowing unapproved self-dispatch).
   - Incomplete SMS encoding schema exceeding 160 characters.
   - Failure to isolate Dijkstra calculation from the Flutter UI thread.
