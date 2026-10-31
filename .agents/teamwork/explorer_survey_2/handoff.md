# Handoff Report: Spec Miner 2 (R2, R6, R7 Requirements Mining)

**Agent Name**: `explorer_survey_2` (Spec Miner 2)  
**Parent Agent**: `orchestrator` (`fa43b5d3-da89-446b-aee5-e61a8b1c7057`)  
**Timestamp**: `2026-10-31T05:18:00Z`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

1. **Authoritative Mandate**:
   - Inspected `/home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md`.
   - Lines 22–30: Defines Requirement R2 for Data Layer, Drift (SQLite) with SQLCipher encryption across 11 tables (`reports`, `assignments`, `shelters`, `hospitals`, `road_segments`, `alerts`, `resources`, `verification_tasks`, `outbox`, `sync_cursors`, `map_packs`), priority outbox (0: life-critical, 1: status, 2: normal, 3: media), client UUID idempotency, push priority jumping, gzip batching, exponential backoff with jitter, resumable media upload, cursor-based delta pull with tombstones, WebSocket live push + polling fallback, relative delta conflict resolution (+/- N), staleness badges, and sync status bar.
   - Lines 52–58: Defines Requirement R6 for API Contract (OpenAPI covering `/auth/login`, `/sync/push`, `/sync/pull`, `/packs/{district}`, `/media`, `/live`), Retrofit/Dio client with retry interceptors, `MockBackend` seeded flood scenario (12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports), and "Simulate" debug menu (close R-14, fill shelter capacity, push critical alert, toggle offline).
   - Lines 59–67: Defines Requirement R7 for Security, Privacy and Safety (SQLCipher key management, secure token storage via `flutter_secure_storage`, RBAC, minimal data collection, citizen location privacy, zero analytics SDKs, secure wipe on logout, text sanitization, and persistent emergency disclaimer).
   - Lines 68–90: Defines Acceptance Criteria for offline operation, mock backend, conflict resolution, navigation rerouting, and code quality.

2. **Workspace & Environment State**:
   - `list_dir /home/saran/projects/the one` shows preexisting frontend artifacts (`frontend/`, `components.json`, `package.json`, `tailwind.config.js`, `DECISIONS.md`).
   - Terminal command `flutter --version || which flutter` returned exit code 1 (`flutter: command not found`). The environment survey agent (`explorer_survey_1`) is surveying Flutter/Dart SDK installation, tooling, and clean architecture directory structure.

3. **Subagent Task Allocation**:
   - Checked `explorer_survey_1/DISPATCH.md` (environment & tooling survey).
   - Checked `explorer_survey_3/DISPATCH.md` (role screens R1, connectivity/fallback R3, map layers/routing R4, and alerts/geofencing R5).
   - Our designated domain: R2 (Data Layer, Outbox, Sync), R6 (OpenAPI, Retrofit/Dio, MockBackend Chennai Flood Scenario), and R7 (Security, Privacy, SQLCipher).

4. **Generated Deliverable**:
   - Authored comprehensive specification in `/home/saran/projects/the one/.agents/teamwork/explorer_survey_2/survey_report.md` (Total 6 sections, 25 discovered features, 12 detailed edge cases, full SQL schemas for all 11 tables, complete OpenAPI 3.1 YAML, exact mock scenario seed matrices, and security protocols).

---

## 2. Logic Chain

1. **Premise 1 (Offline Resilience)**: Because disaster field teams operate in zones with intermittent or zero cellular connectivity, all state modifications must write locally first to SQLite before touching any network transport.
2. **Premise 2 (Schema Completeness)**: To prevent schema drift during subsequent coding milestones, every table must have explicitly typed columns, nullability constraints, primary keys, and indexing specified in advance. Drift requires exact SQLite-to-Dart mappings.
3. **Premise 3 (Deterministic Outbox & Priority Inversion Avoidance)**: If life-critical items (SOS, road closures, hospital diversion) are appended to a FIFO queue behind hundreds of low-priority status updates or large image uploads, lives are endangered. Therefore, an explicit `priority` column (0, 1, 2, 3) with an indexed sort order `ORDER BY priority ASC, created_at ASC` and an active queue-jumping event is architecturally mandatory.
4. **Premise 4 (Conflict-Free Concurrency)**: Because multiple relief workers concurrently update shelter occupancies and hospital beds while disconnected, absolute overwrites (`capacity = 50`) will erase concurrent updates. Syncing relative deltas (`delta_occupied = +10`) allows the server to apply commutative arithmetic operations that guarantee convergent state upon reconciliation.
5. **Premise 5 (Zero-Server Testability)**: Acceptance Criteria demand that the app run fully in airplane mode with all 5 roles. A fully articulated `MockBackend` seeded scenario (Chennai Flood Zone: 12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports) provides immediate, reproducible test fixtures for the implementation track and the dual-track testing orchestrator.

---

## 3. Caveats

1. **Hardware Keystore Platform Variance**: On physical Android devices, `FlutterSecureStorage` uses Android Keystore with AES-GCM; on iOS, it uses Keychain. On Linux desktop or simulator environments during headless CI runs, `FlutterSecureStorage` may fall back to libsecret or in-memory key storage. The implementation team should ensure mock secure storage fallback is available for desktop unit testing.
2. **SQLCipher Binary Dependencies**: SQLCipher requires native binaries compiled with OpenSSL. In environments where Flutter runs on desktop Linux, `sqlite3_flutter_libs` / `sqflite_common_ffi` may require `libsqlite3-dev` or `sqlcipher` shared libraries.
3. **Media Upload Bandwidth**: In extreme edge conditions where cellular network throughput is under 5 kbps, 256 KB chunk sizes may experience timeout. The Dio client should allow adaptive chunk sizes (e.g. dropping to 64 KB on weak networks).

---

## 4. Conclusion

The specification mining for R2 (Data Layer, Local Database, Sync Engine), R6 (API Contract & Mock Backend Simulation), and R7 (Security, Privacy, and Safety) is complete, comprehensive, and ready for milestone decomposition.

Key deliverables completed:
- Complete Drift + SQLCipher schema for all 11 tables with types, constraints, and indexes.
- Push and pull sync protocols, priority queue mechanics, idempotency rules, and exponential backoff with full jitter.
- Commutative relative delta sync rules and visual staleness thresholds.
- OpenAPI 3.1 spec covering `/auth/login`, `/sync/push`, `/sync/pull`, `/packs/{district}`, `/media`, `/live`.
- Full seed dataset for the Chennai Flood Zone (12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports).
- 4 interactive debug simulation actions for automated and manual verification.
- Security and privacy specifications covering 256-bit AES SQLCipher key storage, token lifecycles, RBAC, zero analytics, secure wipe, and text sanitization.

All specifications are documented in `/home/saran/projects/the one/.agents/teamwork/explorer_survey_2/survey_report.md`.

---

## 5. Verification Method

1. **Schema & Specification Inspection**:
   - Inspect `/home/saran/projects/the one/.agents/teamwork/explorer_survey_2/survey_report.md` § 1.1 to verify all 11 tables are defined with exact columns, types, and constraints.
   - Inspect § 2.1 to verify OpenAPI YAML validity and coverage of all required routes.
   - Inspect § 2.3 to verify all 12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, and 20 reports have exact IDs, coordinates, and statuses.
   - Inspect § 3.1–3.7 to verify SQLCipher pragma, token storage, RBAC, wipe, and safety disclaimer requirements.
2. **Feature Inventory Invalidation Conditions**:
   - If any of the 11 tables (`reports`, `assignments`, `shelters`, `hospitals`, `road_segments`, `alerts`, `resources`, `verification_tasks`, `outbox`, `sync_cursors`, `map_packs`) is missing from the database definition, the data layer specification is invalid.
   - If the outbox priority levels do not match 0: life-critical, 1: status, 2: normal, 3: media, the outbox specification is invalid.
   - If the mock backend scenario does not include the exact counts (12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports), the mock backend specification is invalid.
