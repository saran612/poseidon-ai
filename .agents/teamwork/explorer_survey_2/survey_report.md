# SAHAYA Field — Specification Report: Data Layer, API Contract & Security (R2, R6, R7)

**Document Identifier**: `SPEC-SURVEY-R2-R6-R7`  
**Author**: Spec Miner 2 (`explorer_survey_2`)  
**Target Milestone**: M1 / Architecture & Data Layer Specification  
**Authoritative Source**: `/home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md`

---

## Executive Summary

This specification provides the exhaustive technical blueprint for three foundational subsystems of **SAHAYA Field**:
1. **R2: Offline-First Data Layer & Priority Sync Engine**: Drift (SQLite) schema with SQLCipher encryption across 11 core tables, Outbox priority queueing (priorities 0–3), exponential backoff with jitter, delta sync pull using cursors and tombstones, relative delta conflict resolution (+/- N), staleness thresholds, and sync status state machine.
2. **R6: API Contract & Mock Backend Simulation**: Complete OpenAPI 3.1 contract, Retrofit/Dio client configuration with retry and gzip interceptors, full specification of the seeded Chennai Flood Scenario (12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports), and the 4 interactive debug simulation actions.
3. **R7: Security, Privacy & Safety Architecture**: SQLCipher key management via hardware-backed Keystore/Keychain, secure token storage via `flutter_secure_storage`, strict role-based access control (RBAC), minimal data collection & citizen location privacy, secure wipe on logout, text sanitization, and persistent emergency disclaimers.

---

## 1. R2: Data Layer, Local Database, and Sync Engine

### 1.1 Drift (SQLite) + SQLCipher Database Schema

All database operations must be executed over an encrypted SQLite database managed via **Drift** (Dart persistence library) backed by **SQLCipher** (`sqflite_sqlcipher` / `drift/native.dart`).

#### Schema Design Principles:
- **Primary Keys**: RFC 4122 v4 UUID strings (`TEXT`) generated on the client for offline insertion.
- **Timestamps**: Integer epoch milliseconds (`INTEGER`), UTC-normalized.
- **Tombstones**: Soft delete via `is_deleted INTEGER NOT NULL DEFAULT 0` to preserve foreign key integrity and enable delta sync propagation.
- **Geometries**: GeoJSON formatted strings stored in `TEXT` columns with Dart Drift `TypeConverter`.

```
+----------------------------------------------------------------------------------------------------+
|                                      SAHAYA LOCAL DATABASE SCHEMA                                   |
+----------------------------------------------------------------------------------------------------+
|  [reports]             [assignments]          [shelters]            [hospitals]                    |
|  - id (UUID PK)        - id (UUID PK)         - id (UUID PK)        - id (UUID PK)                 |
|  - incident_type       - task_type            - name                - name                         |
|  - lat, lon, acc       - status               - lat, lon            - lat, lon                     |
|  - status              - assigned_unit_id     - cap_total           - beds_total, beds_free        |
|  - reporter_role       - route_geojson        - cap_occupied        - icu_total, icu_free          |
|  - reliability_tier    - priority             - cap_available       - diversion_status             |
+------------------------+----------------------+---------------------+------------------------------+
|  [road_segments]       [alerts]               [resources]           [verification_tasks]           |
|  - id (PK e.g. R-14)   - id (UUID PK)         - id (UUID PK)        - id (UUID PK)                 |
|  - status              - severity             - shelter_id (FK)     - target_type, target_id       |
|  - official_status     - hazard_polygon       - name, category      - verification_status          |
|  - penalty_weight      - requires_ack         - quantity_on_hand    - verifier_notes, photos       |
+------------------------+----------------------+---------------------+------------------------------+
|  [outbox]                                     [sync_cursors]        [map_packs]                    |
|  - id (UUID PK / Idempotency Key)             - collection_name PK  - district_id PK               |
|  - collection, record_id, action              - last_cursor_ts      - tile_pack_path               |
|  - priority (0: Critical -> 3: Media)         - last_sync_success   - road_graph_path              |
|  - payload_json, attempts, next_retry         - sync_status         - is_downloaded, size_bytes    |
+-----------------------------------------------+---------------------+------------------------------+
```

---

#### Table 1: `reports`
Captures citizen SOS reports, incident reports, and field observer updates.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | RFC 4122 v4 UUID generated offline |
| `incident_type` | `TEXT` | `String` | `NOT NULL` | 'flood', 'medical', 'structural', 'fire', 'sos', 'evacuation', 'hazard' |
| `title` | `TEXT` | `String` | `NOT NULL` | Short summary |
| `description` | `TEXT` | `String` | `NOT NULL` | Detailed description (sanitized text) |
| `latitude` | `REAL` | `double` | `NOT NULL` | WGS84 latitude |
| `longitude` | `REAL` | `double` | `NOT NULL` | WGS84 longitude |
| `accuracy` | `REAL` | `double` | `NULL` | GPS horizontal accuracy in meters |
| `people_count` | `INTEGER` | `int` | `NULL` | Number of affected people (SOS/evacuation) |
| `need_type` | `TEXT` | `String` | `NULL` | 'rescue', 'medical', 'food_water', 'shelter' |
| `photo_local_path` | `TEXT` | `String` | `NULL` | On-device file URI of captured photo |
| `photo_remote_url` | `TEXT` | `String` | `NULL` | Remote CDN URL post-sync |
| `photo_geotag` | `TEXT` | `String` | `NULL` | JSON string `{lat, lon, timestamp, altitude}` |
| `reporter_role` | `TEXT` | `String` | `NOT NULL` | 'citizen', 'rescue', 'police_fire', 'hospital', 'ngo' |
| `reporter_device_id` | `TEXT` | `String` | `NOT NULL` | Pseudonymous client device ID |
| `status` | `TEXT` | `String` | `NOT NULL` | 'saved_on_phone', 'sent_to_server', 'received_by_control_room', 'in_progress', 'resolved', 'rejected' |
| `reliability_tier` | `TEXT` | `String` | `NOT NULL` | 'public', 'field_reported', 'verified', 'official' |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Local client creation timestamp (epoch ms) |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Local last modified timestamp (epoch ms) |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Backend authoritative timestamp (epoch ms) |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone flag (0 = active, 1 = deleted) |

*Indexes*: `CREATE INDEX idx_reports_status ON reports(status);`, `CREATE INDEX idx_reports_created ON reports(created_at);`

---

#### Table 2: `assignments`
Operational assignments dispatched to rescue, police, and fire units.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Unique assignment UUID |
| `task_type` | `TEXT` | `String` | `NOT NULL` | 'rescue_operation', 'road_clearance', 'supply_delivery', 'verification', 'patient_transfer' |
| `title` | `TEXT` | `String` | `NOT NULL` | Brief operation title |
| `description` | `TEXT` | `String` | `NOT NULL` | Detailed briefing instructions |
| `priority` | `INTEGER` | `int` | `NOT NULL` | 0: Critical, 1: High, 2: Medium, 3: Low |
| `status` | `TEXT` | `String` | `NOT NULL` | 'proposed', 'approved', 'en_route', 'on_scene', 'completed', 'cancelled' |
| `assigned_unit_id` | `TEXT` | `String` | `NOT NULL` | ID of the designated field unit |
| `target_lat` | `REAL` | `double` | `NOT NULL` | Destination latitude |
| `target_lon` | `REAL` | `double` | `NOT NULL` | Destination longitude |
| `target_address` | `TEXT` | `String` | `NULL` | Human-readable address / landmark |
| `route_geojson` | `TEXT` | `String` | `NULL` | GeoJSON LineString of assigned routing path |
| `estimated_duration_sec`| `INTEGER` | `int` | `NULL` | Calculated ETA duration |
| `estimated_distance_m` | `REAL` | `double` | `NULL` | Calculated route distance in meters |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Creation timestamp |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Client update timestamp |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Server update timestamp (wins conflicts) |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone soft delete |

*Indexes*: `CREATE INDEX idx_assignments_unit ON assignments(assigned_unit_id, status);`

---

#### Table 3: `shelters`
Relief shelters tracking occupancy, capacity, and management authority.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Shelter UUID |
| `name` | `TEXT` | `String` | `NOT NULL` | Shelter name |
| `address` | `TEXT` | `String` | `NOT NULL` | Full address |
| `latitude` | `REAL` | `double` | `NOT NULL` | Shelter latitude |
| `longitude` | `REAL` | `double` | `NOT NULL` | Shelter longitude |
| `capacity_total` | `INTEGER` | `int` | `NOT NULL` | Maximum person capacity |
| `capacity_occupied`| `INTEGER` | `int` | `NOT NULL` | Currently checked-in occupants |
| `capacity_available`| `INTEGER` | `int` | `NOT NULL` | Remaining beds/spaces |
| `status` | `TEXT` | `String` | `NOT NULL` | 'open', 'full', 'evacuating', 'closed' |
| `contact_phone` | `TEXT` | `String` | `NULL` | Shelter phone line |
| `managed_by_ngo` | `TEXT` | `String` | `NOT NULL` | Responsible agency or NGO |
| `inventory_summary`| `TEXT` | `String` | `NULL` | JSON string `{food_days: 3, water_liters: 1200}` |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Creation timestamp |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Local update timestamp |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Server update timestamp |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone soft delete |

---

#### Table 4: `hospitals`
Emergency healthcare facilities with real-time bed, ICU, and diversion status.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Hospital UUID |
| `name` | `TEXT` | `String` | `NOT NULL` | Facility name |
| `address` | `TEXT` | `String` | `NOT NULL` | Facility address |
| `latitude` | `REAL` | `double` | `NOT NULL` | Hospital latitude |
| `longitude` | `REAL` | `double` | `NOT NULL` | Hospital longitude |
| `beds_total` | `INTEGER` | `int` | `NOT NULL` | Total general ward beds |
| `beds_free` | `INTEGER` | `int` | `NOT NULL` | Available general ward beds |
| `icu_total` | `INTEGER` | `int` | `NOT NULL` | Total ICU capacity |
| `icu_free` | `INTEGER` | `int` | `NOT NULL` | Available ICU beds |
| `trauma_level` | `INTEGER` | `int` | `NOT NULL` | Trauma designation (1: Comprehensive, 2: Major, 3: General) |
| `diversion_status`| `INTEGER` | `int` | `NOT NULL DEFAULT 0`| 0: Normal / Accepting, 1: On Diversion (No intake) |
| `contact_emergency`| `TEXT` | `String` | `NOT NULL` | Direct emergency hotline |
| `incoming_patients_count`| `INTEGER` | `int` | `NOT NULL DEFAULT 0`| Patients en route |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Creation timestamp |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Local update timestamp |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Server update timestamp |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone soft delete |

---

#### Table 5: `road_segments`
Road graph edges consumed by the in-memory Dijkstra routing isolate.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Road segment ID (e.g. 'R-14') |
| `name` | `TEXT` | `String` | `NOT NULL` | Street / bridge name |
| `start_node` | `TEXT` | `String` | `NOT NULL` | Graph node A ID |
| `end_node` | `TEXT` | `String` | `NOT NULL` | Graph node B ID |
| `start_lat` | `REAL` | `double` | `NOT NULL` | Start latitude |
| `start_lon` | `REAL` | `double` | `NOT NULL` | Start longitude |
| `end_lat` | `REAL` | `double` | `NOT NULL` | End latitude |
| `end_lon` | `REAL` | `double` | `NOT NULL` | End longitude |
| `coordinates_geojson`| `TEXT` | `String` | `NOT NULL` | GeoJSON LineString of intermediate polyline |
| `length_meters` | `REAL` | `double` | `NOT NULL` | Edge distance in meters |
| `status` | `TEXT` | `String` | `NOT NULL` | 'open', 'flooded', 'blocked', 'closed', 'caution' |
| `official_status` | `INTEGER` | `int` | `NOT NULL DEFAULT 0`| 1 = Official police/fire declaration, 0 = Unverified |
| `reliability_tier` | `TEXT` | `String` | `NOT NULL` | 'official', 'verified', 'public', 'unverified' |
| `speed_limit_kmh` | `REAL` | `double` | `NOT NULL DEFAULT 40.0`| Design traversal speed |
| `penalty_weight` | `REAL` | `double` | `NOT NULL DEFAULT 1.0` | Routing cost multiplier (1.0 = normal, 1e9 = closed) |
| `closure_reason` | `TEXT` | `String` | `NULL` | Reason for restriction/closure |
| `closed_by_role` | `TEXT` | `String` | `NULL` | Role declaring status ('police_fire', 'system') |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Creation timestamp |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Local update timestamp |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Server update timestamp |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone soft delete |

*Indexes*: `CREATE INDEX idx_road_nodes ON road_segments(start_node, end_node);`

---

#### Table 6: `alerts`
Emergency broadcast warnings and evacuation notices.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Alert UUID |
| `title` | `TEXT` | `String` | `NOT NULL` | Broadcast headline |
| `message` | `TEXT` | `String` | `NOT NULL` | Alert body |
| `severity` | `TEXT` | `String` | `NOT NULL` | 'critical', 'warning', 'info' |
| `hazard_type` | `TEXT` | `String` | `NOT NULL` | 'flood', 'dam_release', 'landslide', 'cyclone', 'road_closure' |
| `affected_polygon_geojson`| `TEXT`| `String` | `NULL` | GeoJSON Polygon / MultiPolygon for offline geofencing |
| `target_roles` | `TEXT` | `String` | `NOT NULL` | JSON array of role targets: `["all"]` or `["rescue"]` |
| `issued_at` | `INTEGER` | `int` | `NOT NULL` | Issuance timestamp (epoch ms) |
| `expires_at` | `INTEGER` | `int` | `NULL` | Expiration timestamp (epoch ms) |
| `requires_acknowledgement`| `INTEGER`| `int` | `NOT NULL DEFAULT 0`| 1 = User must dismiss with explicit tap |
| `acknowledged_at` | `INTEGER` | `int` | `NULL` | Timestamp of local acknowledgement |
| `acknowledgement_synced` | `INTEGER` | `int` | `NOT NULL DEFAULT 0`| 1 = Ack pushed to server |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Record creation timestamp |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Record update timestamp |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Server update timestamp |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone soft delete |

---

#### Table 7: `resources`
Warehouse and shelter inventory tracking (food, water, medicine, equipment).

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Resource UUID |
| `shelter_id` | `TEXT` | `String` | `NULL` | Associated shelter UUID |
| `name` | `TEXT` | `String` | `NOT NULL` | Item name ('drinking_water', 'food_packets', etc.) |
| `category` | `TEXT` | `String` | `NOT NULL` | 'water', 'food', 'medical', 'shelter', 'equipment' |
| `quantity_on_hand` | `INTEGER` | `int` | `NOT NULL` | Current stock count |
| `unit_of_measure` | `TEXT` | `String` | `NOT NULL` | 'liters', 'packets', 'kits', 'units', 'boxes' |
| `minimum_threshold`| `INTEGER` | `int` | `NOT NULL` | Threshold triggering critical shortage alert |
| `urgency_status` | `TEXT` | `String` | `NOT NULL` | 'adequate', 'low', 'critical_shortage', 'surplus' |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Creation timestamp |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Local update timestamp |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Server update timestamp |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone soft delete |

---

#### Table 8: `verification_tasks`
Field investigation tasks allocated to verify unconfirmed citizen reports or critical infrastructure.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Verification task UUID |
| `title` | `TEXT` | `String` | `NOT NULL` | Task objective (e.g. 'Check Bridge R-14 integrity') |
| `target_type` | `TEXT` | `String` | `NOT NULL` | 'road', 'bridge', 'shelter', 'hazard_zone', 'incident_report' |
| `target_id` | `TEXT` | `String` | `NOT NULL` | Target entity identifier |
| `latitude` | `REAL` | `double` | `NOT NULL` | Target inspection latitude |
| `longitude` | `REAL` | `double` | `NOT NULL` | Target inspection longitude |
| `prompt` | `TEXT` | `String` | `NOT NULL` | Field instruction questions |
| `assigned_role` | `TEXT` | `String` | `NOT NULL` | 'rescue', 'police_fire' |
| `verification_status`| `TEXT` | `String` | `NOT NULL` | 'pending', 'assigned', 'verified_pass', 'verified_fail', 'inconclusive' |
| `verifier_notes` | `TEXT` | `String` | `NULL` | Observations entered by field personnel |
| `verifier_photos` | `TEXT` | `String` | `NULL` | JSON array of local photo URIs |
| `verified_at` | `INTEGER` | `int` | `NULL` | Timestamp when verification was conducted |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Creation timestamp |
| `updated_at` | `INTEGER` | `int` | `NOT NULL` | Local update timestamp |
| `server_updated_at`| `INTEGER` | `int` | `NULL` | Server update timestamp |
| `is_deleted` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| Tombstone soft delete |

---

#### Table 9: `outbox`
The transactional offline write buffer powering the Priority Push Engine.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `id` | `TEXT` | `String` | `PRIMARY KEY` | Client-generated RFC 4122 v4 UUID (Idempotency Key) |
| `collection` | `TEXT` | `String` | `NOT NULL` | Target table: 'reports', 'assignments', 'shelters', etc. |
| `record_id` | `TEXT` | `String` | `NOT NULL` | Primary key of the modified local record |
| `action` | `TEXT` | `String` | `NOT NULL` | 'create', 'update', 'delta_capacity', 'delete' |
| `priority` | `INTEGER` | `int` | `NOT NULL` | 0: Life-critical, 1: Status, 2: Normal, 3: Media |
| `payload_json` | `TEXT` | `String` | `NOT NULL` | JSON serialized payload |
| `media_file_path` | `TEXT` | `String` | `NULL` | Disk path for Priority 3 chunked upload |
| `media_bytes_uploaded`| `INTEGER`| `int` | `NOT NULL DEFAULT 0`| Resumption byte offset for media |
| `media_bytes_total`| `INTEGER` | `int` | `NOT NULL DEFAULT 0`| Total file size in bytes |
| `attempts` | `INTEGER` | `int` | `NOT NULL DEFAULT 0`| Number of transmission retries attempted |
| `next_retry` | `INTEGER` | `int` | `NOT NULL DEFAULT 0`| Timestamp (epoch ms) before which retry is inhibited |
| `last_error` | `TEXT` | `String` | `NULL` | Error message string from last HTTP/network attempt |
| `locked_until` | `INTEGER` | `int` | `NOT NULL DEFAULT 0`| Lease lock (epoch ms) preventing concurrent worker sync |
| `created_at` | `INTEGER` | `int` | `NOT NULL` | Insertion timestamp (epoch ms) |

*Indexes*:  
`CREATE INDEX idx_outbox_queue ON outbox(priority ASC, created_at ASC);`  
`CREATE INDEX idx_outbox_retry ON outbox(next_retry ASC, locked_until ASC);`

---

#### Table 10: `sync_cursors`
Tracks per-collection pull state for delta replication.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `collection_name`| `TEXT` | `String` | `PRIMARY KEY` | Collection name (e.g. 'reports', 'shelters') |
| `last_cursor_timestamp`| `INTEGER`| `int` | `NOT NULL DEFAULT 0`| Authoritative server timestamp of latest pulled delta |
| `last_sync_success_at` | `INTEGER`| `int` | `NOT NULL DEFAULT 0`| Local timestamp of last successful pull completion |
| `sync_status` | `TEXT` | `String` | `NOT NULL DEFAULT 'idle'`| 'idle', 'in_progress', 'failed', 'paused' |
| `records_pulled_last_sync`| `INTEGER`| `int`| `NOT NULL DEFAULT 0`| Number of upsert/delete operations applied |

---

#### Table 11: `map_packs`
Manages downloaded offline district map packs and road graph manifests.

| Column Name | SQL Type | Drift Dart Type | Constraints | Description |
|---|---|---|---|---|
| `district_id` | `TEXT` | `String` | `PRIMARY KEY` | District key (e.g. 'chennai-flood-zone-1') |
| `district_name` | `TEXT` | `String` | `NOT NULL` | Human-readable title |
| `version` | `TEXT` | `String` | `NOT NULL` | Pack release version |
| `tile_pack_file_path` | `TEXT` | `String` | `NOT NULL` | Local absolute path to `.pmtiles` archive |
| `tile_pack_size_bytes`| `INTEGER` | `int` | `NOT NULL` | Total archive size |
| `road_graph_file_path`| `TEXT` | `String` | `NOT NULL` | Local path to road network JSON graph |
| `road_graph_size_bytes`| `INTEGER`| `int` | `NOT NULL` | Total graph size |
| `is_downloaded` | `INTEGER` | `bool` | `NOT NULL DEFAULT 0`| 1 = Complete and verified on disk |
| `download_progress` | `REAL` | `double` | `NOT NULL DEFAULT 0.0`| Progress ratio (0.0 to 1.0) |
| `downloaded_at` | `INTEGER` | `int` | `NULL` | Completion timestamp |
| `etag` | `TEXT` | `String` | `NULL` | HTTP ETag for update verification |

---

### 1.2 Outbox Specification & Priority Queueing

The Outbox is the single gateway for all write operations in SAHAYA Field. Every change made by a user or automated tracker (GPS, status change, capacity increment) writes atomically to its local domain table AND appends an entry to `outbox` within the **same SQLite transaction**.

#### Priority Enum Definitions:
- **Priority 0 (Life-Critical)**:
  - Incident reports with `incident_type == 'sos'`
  - Official road closures / reopenings (`police_fire` role updating `road_segments`)
  - Hospital emergency diversion toggle (`hospital` role updating `diversion_status = 1`)
  - Urgent critical alerts acknowledgement
- **Priority 1 (Status Updates)**:
  - Unit location breadcrumbs (batched GPS points from rescue/police/fire)
  - Task assignment status transitions (`proposed` -> `approved` -> `en_route` -> `on_scene` -> `completed`)
  - Verification task findings
- **Priority 2 (Normal Operations)**:
  - Standard citizen incident reports (non-SOS flood, fallen tree, relief requests)
  - Shelter occupancy relative capacity adjustments (`+/- N`)
  - Warehouse supply stock adjustments
  - Non-critical alert acknowledgements
- **Priority 3 (Media Uploads)**:
  - High-resolution incident photos and damage verification images
  - Uploaded strictly after all Priority 0, 1, and 2 items have cleared.

#### Queue Ordering & "Jump-the-Queue" Execution:
```sql
-- Query to fetch next push batch:
SELECT * FROM outbox
WHERE locked_until <= :current_time_ms
  AND next_retry <= :current_time_ms
ORDER BY priority ASC, created_at ASC
LIMIT :batch_limit;
```

**Queue Jump Event**:
Whenever any Priority 0 item is inserted into the outbox:
1. The `OutboxRepository` issues a direct trigger to `SyncCoordinator.notifyImmediateCriticalPush()`.
2. Any active backoff sleep or polling timer is immediately cancelled.
3. If an existing non-critical batch HTTP request is in-flight, the sync engine dispatches a parallel dedicated Priority 0 request over Dio without waiting for the batch request to complete.

#### Idempotency Protocol:
- Every outbox entry has a client-generated UUID (`idempotency_key`).
- The backend stores processed idempotency keys in a fast key-value cache (Redis / SQLite `processed_outbox_ids`) with a 72-hour TTL.
- If the network drops after the server successfully processes a write but before the client receives the HTTP response, the client will retransmit the item on next retry.
- The server responds to duplicates with HTTP 200:
  ```json
  {
    "idempotency_key": "c71a3964-b258-450e-8d2a-7f61c39d892a",
    "status": "duplicate_ignored",
    "server_timestamp": 1720435210000
  }
  ```
- The client receives `duplicate_ignored`, treats it as successful delivery, and deletes the row from `outbox`.

#### Exponential Backoff with Full Jitter:
When a push attempt fails due to network unreachability, timeout, or 5xx server error:
1. `attempts = attempts + 1`
2. Base delay $T_{base} = 1.0\text{s}$, Multiplier $M = 2.0$, Max delay $T_{max} = 60.0\text{s}$.
3. Computed backoff: $E = \min(T_{max}, T_{base} \times M^{attempts})$.
4. Full jitter formula:
   $$\text{delay\_ms} = \text{Random}() \times E \times 1000$$
5. `next_retry = System.currentTimeMillis() + delay_ms`
6. `locked_until = 0` (unlocking the row for the scheduled retry).

#### Crash-Resilient Resumption:
- Before transmitting a batch, the engine executes:
  `UPDATE outbox SET locked_until = :now + 30000 WHERE id IN (:batchIds);` (30-second lease lock).
- If the app process is killed by the OS low-memory killer during HTTP transmission:
  - On next app launch, the lease expires (`locked_until <= now`).
  - The items remain intact in the database and are picked up immediately on the next sync cycle.
  - No items are dropped or double-counted.

#### Network-Gated Chunked Resumable Media Upload (Priority 3):
- **Gating Rules**:
  - `Offline` mode: Uploads suspended.
  - `Data Saver` mode: Uploads suspended (UI displays "Photo queued — Data Saver is ON").
  - `Wi-Fi Only` setting: Uploads suspended if network transport is cellular.
- **Chunking Pipeline**:
  1. Chunk size: Fixed at $256\text{ KB}$ ($262,144\text{ bytes}$).
  2. Handshake `POST /media/init` with file size and hash -> receives `upload_id`.
  3. Loop: Read bytes from offset `media_bytes_uploaded` to `media_bytes_uploaded + 262144`.
  4. Send `PUT /media/chunk` with headers:
     - `X-Upload-Id: {upload_id}`
     - `Content-Range: bytes {start}-{end}/{total_bytes}`
  5. On 200 OK: Update `outbox SET media_bytes_uploaded = :end WHERE id = :outboxId`.
  6. If signal drops at 75%, next connection attempt resumes at byte 786,432 without re-transmitting previous chunks.
  7. On completion: `POST /media/complete` -> updates `photo_remote_url` in `reports` or `verification_tasks` table, then deletes outbox record.

---

### 1.3 Pull Engine Mechanics

Replication from server to client relies on per-collection timestamp cursors.

#### Delta Pull Protocol:
1. Client looks up current cursors:
   `SELECT collection_name, last_cursor_timestamp FROM sync_cursors;`
2. Dispatches `GET /sync/pull?since={min_cursor}&collections=reports,assignments,shelters,hospitals,road_segments,alerts,resources,verification_tasks`.
3. The server queries rows where `updated_at > :since` across each requested collection.
4. For soft-deleted entities, the server includes their IDs in a `deletes` array.
5. Client opens a single SQLite transaction:
   ```dart
   await db.transaction(() async {
     for (final collection in response.collections) {
       for (final upsert in collection.upserts) {
         await db.into(collection.table).insertOnConflictUpdate(upsert);
       }
       for (final id in collection.deletes) {
         await (db.update(collection.table)..where((t) => t.id.equals(id)))
             .write(TableCompanion(isDeleted: const Value(true)));
       }
       await (db.update(db.syncCursors)..where((t) => t.collectionName.equals(collection.name)))
           .write(SyncCursorsCompanion(
             lastCursorTimestamp: Value(response.cursor),
             lastSyncSuccessAt: Value(DateTime.now().millisecondsSinceEpoch),
             syncStatus: const Value('idle'),
           ));
     }
   });
   ```

#### WebSocket Live Push + Polling Fallback:
- When connection state is `online` or `weak`, client maintains a WebSocket stream to `/live?token={jwt}`.
- Server pushes live notification frames:
  ```json
  {
    "event": "entity_updated",
    "collection": "road_segments",
    "cursor": 1720435250000,
    "data": {
      "id": "R-14",
      "status": "closed",
      "official_status": 1,
      "reliability_tier": "official",
      "penalty_weight": 1000000000.0,
      "server_updated_at": 1720435250000
    }
  }
  ```
- **Fallback Polling**:
  - If WebSocket connection drops or emits an error, client switches to background timer polling:
    - Normal Mode: Poll every $15\text{ seconds}$.
    - Data Saver Mode: Poll every $60\text{ seconds}$.
  - Reconnection for WebSocket attempts continuously with exponential backoff ($2\text{s}, 4\text{s}, 8\text{s}, \dots, \max 60\text{s}$).

---

### 1.4 Conflict Resolution Rules

In an offline-first distributed emergency system, concurrent edits across disconnected nodes are guaranteed to occur. SAHAYA Field enforces three deterministic conflict resolution rules:

#### Rule 1: Server Timestamp Wins for Status Transitions
- Applies to: `assignments.status`, `reports.status`, `road_segments.status`, `road_segments.official_status`, `verification_tasks.verification_status`, `hospitals.diversion_status`.
- Logic:
  - Control room coordination decisions supersede stale field statuses.
  - If incoming `server_updated_at > local.server_updated_at`:
    - Remote value overwrites local value.
    - If there is an outstanding unpushed status change in the outbox for that entity, the client clears or marks that outbox entry superseded.

#### Rule 2: Relative Delta Sync (+/- N) for Capacity Counts
- Applies to:
  - `shelters.capacity_occupied` and `shelters.capacity_available`
  - `hospitals.beds_free` and `hospitals.icu_free`
  - `resources.quantity_on_hand`
- Rationale: Absolute updates cause lost updates. If Shelter A has 100 capacity, Device 1 offline records 10 arrivals (writes 90), Device 2 offline records 5 arrivals (writes 95). If absolute sync is used, one overwrites the other (either 90 or 95), losing either 5 or 10 occupants!
- Specification:
  - Local Outbox Payload:
    ```json
    {
      "action": "delta_capacity",
      "shelter_id": "shelter-1",
      "delta_occupied": +10,
      "delta_available": -10,
      "source_device_id": "device-uuid-1",
      "client_timestamp": 1720435200000
    }
    ```
  - Server Execution:
    `UPDATE shelters SET capacity_occupied = capacity_occupied + :delta_occupied, capacity_available = capacity_available + :delta_available, server_updated_at = :now WHERE id = :shelter_id;`
  - Client on delta pull receives the authoritative re-aggregated counts.

#### Rule 3: Staleness Badges & Visual Expiration Thresholds
Every record stores `server_updated_at` (or local `updated_at` if unpushed). The UI computes $\Delta t = \text{currentTime} - \text{recordTime}$ and enforces strict staleness thresholds:

| Entity Type | Staleness Threshold | UI Badge Presentation | Routing / Safety Action |
|---|---|---|---|
| `alerts` | **15 minutes** | Amber badge: `⚠️ Outdated (>15m)` | Alert kept in inbox but tagged unverified |
| `road_segments` | **30 minutes** | Yellow hazard badge: `⚠️ Stale Road Data (>30m)` | Dijkstra applies $+50\%$ penalty weight; route details display safety disclaimer |
| `hospitals` (Beds/Diversion) | **20 minutes** | Orange chip: `⚠️ Bed counts unverified (>20m)` | Hospital picker adds confirmation prompt before navigation |
| `shelters` (Occupancy) | **45 minutes** | Amber chip: `⚠️ Occupancy stale (>45m)` | Shelter picker displays range estimate |
| `assignments` | **15 minutes** | Warning icon: `Sync to confirm status` | User cannot self-dispatch if assignment is pending server approval |
| `reports` | **60 minutes** | Muted timestamp: `Reported >1h ago` | Normal sorting |

---

### 1.5 Sync Status Bar State Machine

The Sync Status Bar is a shared persistent widget displayed at the top or bottom of every screen.

```
       +---------------------------------------------+
       |                  [OFFLINE]                  |
       +---------------------------------------------+
          | (Interface Up & Reachability Probe OK)
          v
       +---------------------------------------------+
  +--->|                   [ONLINE]                  |<---+
  |    +---------------------------------------------+    |
  |       | (Latency > 800ms / 50% packet drop)          | (Probe OK)
  |       v                                               |
  |    +---------------------------------------------+    |
  +----|                    [WEAK]                   |----+
       +---------------------------------------------+
          |                                               ^
          | (No interface / Probe times out)              |
          +-----------------------------------------------+
```

#### States & Visual Indicators:

| State | Visual Icon & Color | Text Header | Subtext / Details | Actions Available |
|---|---|---|---|---|
| `online` | Solid Green Circle (`#10B981`) | "Connected" | "Last synced: 1m ago • 0 pending" | Tap triggers immediate manual delta sync |
| `weak` | Pulsing Amber Circle (`#F59E0B`) | "Weak Signal" | "Last synced: 12m ago • 3 queued (retrying)" | Tap forces retry of pending queue |
| `offline` | Slate / Red Circle (`#EF4444`) | "Offline Mode" | "Last synced: 42m ago • 5 items saved on phone" | Tap shows informational snackbar: "Items safely stored offline" |
| `syncing` | Spinning Blue Indicator (`#3B82F6`) | "Syncing..." | "Pushing 2 of 4 items..." | Manual button disabled during sync |

#### Manual Trigger Mechanics:
- When user taps "Sync Now":
  1. The UI checks active network interface.
  2. If interface is absent, immediately displays: *"Device is offline. Data is securely stored on device."*
  3. If interface is active, fires immediate probe `HEAD /health`.
  4. If probe returns 200/204 within 1500ms, transitions state to `syncing`.
  5. Clears any exponential backoff timers on outbox.
  6. Dispatches priority push batch immediately.
  7. Upon push completion, dispatches delta pull.
  8. Updates `last_sync_success_at` and transitions state to `online`.

---

## 2. R6: API Contract & Mock Backend Simulation

### 2.1 OpenAPI 3.1 Specification (`openapi.yaml`)

The complete REST and WebSocket interface definition for SAHAYA Field.

```yaml
openapi: 3.1.0
info:
  title: SAHAYA Field Coordination Engine API
  version: 1.0.0
  description: >
    Production API for SAHAYA Field offline-first mobile application and cloud coordination backend.
paths:
  /auth/login:
    post:
      summary: Authenticate device & user role
      description: Returns JWT access and refresh tokens. Cached long-lived offline.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [role, device_id]
              properties:
                role:
                  type: string
                  enum: [citizen, rescue, hospital, police_fire, ngo]
                device_id:
                  type: string
                passcode:
                  type: string
      responses:
        '200':
          description: Successful authentication
          content:
            application/json:
              schema:
                type: object
                required: [token, refresh_token, user, expires_at]
                properties:
                  token: { type: string }
                  refresh_token: { type: string }
                  expires_at: { type: integer }
                  user:
                    type: object
                    required: [id, role, name]
                    properties:
                      id: { type: string }
                      role: { type: string }
                      name: { type: string }
                      unit_id: { type: string, nullable: true }

  /sync/push:
    post:
      summary: Push batched outbox mutations
      description: Ingests prioritized client writes. Gzip compression supported. Idempotency guaranteed via UUIDs.
      parameters:
        - in: header
          name: Content-Encoding
          schema: { type: string, enum: [gzip] }
          required: false
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [device_id, items]
              properties:
                device_id: { type: string }
                items:
                  type: array
                  items:
                    type: object
                    required: [idempotency_key, priority, collection, record_id, action, payload, client_timestamp]
                    properties:
                      idempotency_key: { type: string, format: uuid }
                      priority: { type: integer, enum: [0, 1, 2, 3] }
                      collection: { type: string }
                      record_id: { type: string }
                      action: { type: string, enum: [create, update, delta_capacity, delete] }
                      payload: { type: object }
                      client_timestamp: { type: integer }
      responses:
        '200':
          description: Push results per item
          content:
            application/json:
              schema:
                type: object
                required: [results]
                properties:
                  results:
                    type: array
                    items:
                      type: object
                      required: [idempotency_key, status, server_timestamp]
                      properties:
                        idempotency_key: { type: string, format: uuid }
                        status: { type: string, enum: [applied, duplicate_ignored, rejected] }
                        server_timestamp: { type: integer }
                        error_message: { type: string, nullable: true }

  /sync/pull:
    get:
      summary: Delta pull of updated records and tombstones
      parameters:
        - in: query
          name: since
          required: true
          schema: { type: integer }
          description: Timestamp cursor (epoch ms) of last successful pull
        - in: query
          name: collections
          required: false
          schema: { type: string }
          description: Comma-separated list of target collections
        - in: query
          name: district
          required: false
          schema: { type: string }
      responses:
        '200':
          description: Delta updates and tombstones
          content:
            application/json:
              schema:
                type: object
                required: [cursor, server_time, collections]
                properties:
                  cursor: { type: integer }
                  server_time: { type: integer }
                  collections:
                    type: object
                    additionalProperties:
                      type: object
                      required: [upserts, deletes]
                      properties:
                        upserts: { type: array, items: { type: object } }
                        deletes: { type: array, items: { type: string } }

  /packs/{district}:
    get:
      summary: Get offline map tile pack & road graph manifest
      parameters:
        - in: path
          name: district
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Manifest containing bundle URLs and hashes
          content:
            application/json:
              schema:
                type: object
                required: [district_id, district_name, version, tile_pack, road_graph]
                properties:
                  district_id: { type: string }
                  district_name: { type: string }
                  version: { type: string }
                  tile_pack:
                    type: object
                    required: [url, size_bytes, md5]
                    properties:
                      url: { type: string }
                      size_bytes: { type: integer }
                      md5: { type: string }
                  road_graph:
                    type: object
                    required: [url, size_bytes, md5]
                    properties:
                      url: { type: string }
                      size_bytes: { type: integer }
                      md5: { type: string }

  /media/upload/init:
    post:
      summary: Initialize chunked resumable media upload
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [file_name, mime_type, total_bytes, idempotency_key]
              properties:
                file_name: { type: string }
                mime_type: { type: string }
                total_bytes: { type: integer }
                idempotency_key: { type: string, format: uuid }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [upload_id, chunk_size]
                properties:
                  upload_id: { type: string }
                  chunk_size: { type: integer }

  /media/upload/chunk:
    put:
      summary: Upload a single media chunk
      parameters:
        - in: header
          name: X-Upload-Id
          required: true
          schema: { type: string }
        - in: header
          name: Content-Range
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/octet-stream:
            schema: { type: string, format: binary }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [bytes_received]
                properties:
                  bytes_received: { type: integer }

  /media/upload/complete:
    post:
      summary: Finalize media upload
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [upload_id]
              properties:
                upload_id: { type: string }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [media_url]
                properties:
                  media_url: { type: string, format: uri }

  /live:
    get:
      summary: WebSocket live event stream
      description: Full-duplex connection for real-time dispatch, critical alerts, and status changes.
      parameters:
        - in: query
          name: token
          required: true
          schema: { type: string }
        - in: query
          name: device_id
          required: true
          schema: { type: string }
      responses:
        '101': { description: Switching Protocols to WebSocket }
```

---

### 2.2 Retrofit/Dio Client and Interceptors

The HTTP networking stack is built on `dio` with modular interceptors:

1. **`AuthInterceptor`**:
   - Intercepts outgoing requests: fetches token from `FlutterSecureStorage`.
   - Injects `Authorization: Bearer <token>`.
   - On HTTP 401: intercepts response, halts pending requests, dispatches `/auth/refresh`, updates secure storage, and retries original request.
2. **`GzipCompressionInterceptor`**:
   - For `POST /sync/push`: if body size > 512 bytes, applies `gzip.encode(utf8.encode(jsonBody))`.
   - Adds `Content-Encoding: gzip` and `Content-Type: application/json`.
3. **`RetryInterceptor`**:
   - Evaluates Dio exceptions (`DioExceptionType.connectionTimeout`, `sendTimeout`, `receiveTimeout`, or `connectionError`).
   - Does NOT retry 4xx errors (e.g. 400 Bad Request, 403 Forbidden).
   - Retries up to 3 times with jittered exponential backoff before returning failure to caller.
4. **`MockBackendInterceptor`**:
   - Checked via configuration flag `AppConfig.useMockBackend`.
   - When `true`, completely bypasses network sockets and delegates request directly to `MockBackend.handleRequest(options)`. Returns synthesized `Response<T>`.

---

### 2.3 Full Specification of MockBackend Seeded Flood Scenario

To enable complete standalone development and offline verification with zero network dependencies, `MockBackend` seeds an authentic disaster environment in the **Chennai Flood Zone (Adyar River & Velachery Basin)**.

#### Scenario Geography:
- Center Datum: `Latitude: 13.0067° N, Longitude: 80.2206° E` (Saidapet / Anna Salai Bridge).
- Bounding Box: `[12.9600° N, 80.1900° E]` to `[13.0400° N, 80.2800° E]`.

---

#### 12 Seeded Wards (Greater Chennai Corporation Zones IX, X, XIII):

| Ward ID | Ward Name | Center Latitude | Center Longitude | Flood Inundation Level | Status & Notes |
|---|---|---|---|---|---|
| `W-168` | Saidapet North | 13.0180 | 80.2220 | 1.2 meters | Severe residential waterlogging; grid offline |
| `W-169` | Saidapet South | 13.0105 | 80.2215 | 2.5 meters | Critical flood; Adyar River embankment overflowing |
| `W-170` | Guindy Industrial West | 13.0060 | 80.2080 | 0.8 meters | Power substations submerged; industrial evacuation |
| `W-171` | Guindy East / Kathipara | 13.0075 | 80.2165 | 0.5 meters | Major transit junction partially passable |
| `W-172` | Kotturpuram North | 13.0230 | 80.2410 | 2.0 meters | Severe flooding; ground floors submerged |
| `W-173` | Kotturpuram South | 13.0160 | 80.2425 | 2.8 meters | Breach in river bund; boat rescues mandatory |
| `W-174` | Adyar West / Gandhi Nagar | 13.0065 | 80.2520 | 1.0 meters | Water entering houses; tree falls on main road |
| `W-175` | Adyar East / Malviya Ave | 13.0030 | 80.2580 | 0.3 meters | Staging point; medical camp active |
| `W-176` | Besant Nagar | 12.9980 | 80.2670 | 0.0 meters | Elevated safe zone; primary relief logistics hub |
| `W-177` | Velachery North (Lake Basin) | 12.9850 | 80.2210 | 2.2 meters | Velachery lake surplus weir overflow; cut off |
| `W-178` | Velachery South / Tansi Nagar | 12.9720 | 80.2180 | 1.8 meters | Submerged residential layout; elderly trapped |
| `W-179` | Thiruvanmiyur West | 12.9860 | 80.2610 | 0.4 meters | Safe transit corridor towards ECR |

---

#### Critical Infrastructure: Bridge R-14 (Saidapet Maraimalai Adigal Bridge):
- **Segment ID**: `R-14`
- **Name**: "Anna Salai Bridge over Adyar River (Saidapet)"
- **Endpoints**: Connects `Node-Saidapet-North` (`13.0125, 80.2210`) to `Node-Saidapet-South` (`13.0090, 80.2218`).
- **Length**: $380\text{ meters}$.
- **Initial Baseline Status**: `status: 'open'`, `official_status: 1`, `penalty_weight: 1.0`, `reliability_tier: 'official'`.
- **Simulated Event**:
  - Police/Fire official order: Adyar River exceeded high flood line by $1.4\text{m}$.
  - Transitioned to: `status: 'closed'`, `official_status: 1`, `penalty_weight: 1000000000.0`.
  - Impact: Anna Salai north-south axis severed. Dijkstra routing isolates force reroute through Kotturpuram Bridge or Jafferkhanpet Bridge.

---

#### 3 Seeded Shelters:

1. **`shelter-saidapet`**: "Saidapet Govt Girls Higher Secondary School Camp"
   - Location: `13.0155, 80.2240` (Ward 168)
   - Capacity: Total `350`, Occupied `280`, Available `70`
   - Status: `open`
   - Managing Body: "Red Cross Tamil Nadu"
   - Inventory: Drinking Water: `1,200 L` (Adequate), Food: `840 packets` (Adequate), Medical: `15 kits`
2. **`shelter-velachery`**: "Velachery Community Hall Relief Center"
   - Location: `12.9810, 80.2235` (Ward 177)
   - Capacity: Total `500`, Occupied `475`, Available `25` (Near capacity)
   - Status: `open` (Target of "Fill Shelter Capacity" simulation action)
   - Managing Body: "Bhoomi Disaster Relief"
   - Inventory: Drinking Water: `400 L` (Low), Food: `200 packets` (Critical shortage), Medical: `5 kits`
3. **`shelter-besant`**: "Besant Nagar Cultural Pavilion Relief Ground"
   - Location: `12.9995, 80.2650` (Ward 176 - Elevated Safe Zone)
   - Capacity: Total `800`, Occupied `210`, Available `590` (High capacity surplus)
   - Status: `open`
   - Managing Body: "Goonj Relief Taskforce"
   - Inventory: Drinking Water: `6,000 L` (Surplus), Food: `4,500 packets` (Surplus), Medical: `50 kits`

---

#### 3 Seeded Hospitals:

1. **`hosp-guindy`**: "Kalaignar Centenary Super Speciality Hospital (Guindy)"
   - Location: `13.0115, 80.2115` (Ward 171)
   - General Beds: Total `500`, Free `45`
   - ICU Beds: Total `60`, Free `4`
   - Trauma Level: `1` (Full critical care)
   - Diversion Status: `0` (Normal)
   - Hotline: `+91-44-2250-0100`
2. **`hosp-adyar`**: "Adyar Cancer Institute & Emergency Care Annex"
   - Location: `13.0070, 80.2480` (Ward 174)
   - General Beds: Total `300`, Free `12`
   - ICU Beds: Total `35`, Free `0` (ICU Full)
   - Trauma Level: `2`
   - Diversion Status: `0` (Accepting non-ICU emergency admissions)
   - Hotline: `+91-44-2491-0754`
3. **`hosp-saidapet`**: "Saidapet Government Taluk Hospital"
   - Location: `13.0085, 80.2195` (Ward 169 - Adjacent to Adyar River)
   - General Beds: Total `120`, Free `2`
   - ICU Beds: Total `10`, Free `0`
   - Trauma Level: `3`
   - Diversion Status: `1` (**ON DIVERSION** — Ground floor flooded, generator submerged, cannot admit emergency patients)
   - Hotline: `+91-44-2435-1234`

---

#### 21 Seeded Operational Field Units:

| Unit ID | Designator / Agency | Role | Vehicle Type | Status | Lat / Lon Coordinates |
|---|---|---|---|---|---|
| `unit-rec-01` | NDRF Team 4A | `rescue` | Inflatable Motor Boat | `on_scene` | 13.0105, 80.2215 (Ward 169) |
| `unit-rec-02` | NDRF Team 4B | `rescue` | Inflatable Motor Boat | `en_route` | 13.0160, 80.2425 (Ward 173) |
| `unit-rec-03` | SDRF Squad 1 | `rescue` | 4x4 Heavy Rescue Truck | `available` | 13.0075, 80.2165 (Guindy) |
| `unit-rec-04` | SDRF Squad 2 | `rescue` | Zodiac Inflatable Boat | `on_scene` | 12.9850, 80.2210 (Velachery) |
| `unit-rec-05` | Coast Guard Dive Team 1 | `rescue` | Rigid Hull Inflatable | `available` | 12.9980, 80.2670 (Besant) |
| `unit-rec-06` | Civil Defence Volunteer 1 | `rescue` | Rescue Van | `en_route` | 13.0180, 80.2220 (Saidapet) |
| `unit-rec-07` | Civil Defence Volunteer 2 | `rescue` | High-Clearance Truck | `available` | 13.0065, 80.2520 (Adyar) |
| `unit-rec-08` | Fire & Rescue Commando | `rescue` | Multi-Purpose Rescue | `on_scene` | 12.9720, 80.2180 (Tansi Nagar) |
| `unit-pol-01` | Traffic Police Patrol 1 | `police_fire` | Police Interceptor | `on_scene` | 13.0125, 80.2210 (Bridge R-14) |
| `unit-pol-02` | Law & Order Sector A | `police_fire` | Police Gypsy 4x4 | `en_route` | 13.0060, 80.2080 (Guindy) |
| `unit-pol-03` | Adyar Station Patrol | `police_fire` | Motorcycle Outrider | `available` | 13.0030, 80.2580 (Adyar) |
| `unit-pol-04` | Velachery Checkpost Unit | `police_fire` | Barricade Transport | `on_scene` | 12.9855, 80.2225 (Velachery) |
| `unit-fir-01` | Fire Station Saidapet | `police_fire` | High-Pressure Water Pump | `on_scene` | 13.0175, 80.2230 (Saidapet) |
| `unit-fir-02` | Fire Station Guindy | `police_fire` | De-watering Foam Tender | `available` | 13.0055, 80.2090 (Guindy) |
| `unit-med-01` | 108 Emergency Ambulance ALS | `hospital` | Advanced Life Support Van | `en_route` | 13.0115, 80.2115 (Guindy) |
| `unit-med-02` | 108 Emergency Ambulance BLS | `hospital` | Basic Life Support Van | `on_scene` | 13.0165, 80.2415 (Kotturpuram) |
| `unit-med-03` | Trauma Mobile ICU | `hospital` | Mobile ICU Van | `available` | 13.0070, 80.2480 (Adyar) |
| `unit-med-04` | Red Cross Mobile Clinic | `hospital` | All-Terrain Ambulance | `en_route` | 12.9815, 80.2240 (Velachery) |
| `unit-ngo-01` | Bhoomi Relief Supply 1 | `ngo` | 5-Ton Food Cargo Truck | `en_route` | 12.9810, 80.2235 (Velachery) |
| `unit-ngo-02` | Red Cross Water Tanker | `ngo` | 10,000L Potable Tanker | `available` | 13.0155, 80.2240 (Saidapet) |
| `unit-ngo-03` | Goonj Logistics Carrier | `ngo` | Supply Carrier Truck | `available` | 12.9995, 80.2650 (Besant) |

---

#### 20 Seeded Reports (Realistic Honest Status & Reliability Distribution):

| Report ID | Type | Title | Lat / Lon | Status | Reliability Tier | Priority |
|---|---|---|---|---|---|---|
| `rep-001` | `sos` | "Family of 4 trapped on terrace with infant" | 13.0102, 80.2212 | `saved_on_phone` | `public` | 0 |
| `rep-002` | `sos` | "Elderly dialysis patient trapped, water 5ft" | 12.9852, 80.2218 | `sent_to_server` | `public` | 0 |
| `rep-003` | `sos` | "Pregnant woman in labor, road submerged" | 13.0162, 80.2428 | `received_by_control_room` | `field_reported` | 0 |
| `rep-004` | `sos` | "Collapsed roof with 2 injured persons" | 12.9725, 80.2185 | `in_progress` | `verified` | 0 |
| `rep-005` | `flood` | "Water entered ground floor, power line down" | 13.0182, 80.2225 | `received_by_control_room` | `public` | 2 |
| `rep-006` | `flood` | "Adyar river bund leaking near Kotturpuram" | 13.0158, 80.2420 | `received_by_control_room` | `verified` | 1 |
| `rep-007` | `hazard` | "High voltage transformer sparking in water" | 13.0062, 80.2085 | `sent_to_server` | `public` | 1 |
| `rep-008` | `hazard` | "Open manhole submerged near bus stand" | 13.0078, 80.2170 | `saved_on_phone` | `public` | 2 |
| `rep-009` | `medical`| "Heart patient requires oxygen cylinder" | 13.0068, 80.2525 | `received_by_control_room` | `field_reported` | 0 |
| `rep-010` | `medical`| "Severe fever outbreak in relief camp" | 12.9812, 80.2238 | `sent_to_server` | `field_reported` | 1 |
| `rep-011` | `evacuation`| "50 families require immediate boat transport"| 12.9858, 80.2212 | `received_by_control_room` | `official` | 0 |
| `rep-012` | `evacuation`| "Slum area completely inundated" | 13.0110, 80.2218 | `in_progress` | `official` | 1 |
| `rep-013` | `food_water`| "Clean drinking water exhausted" | 13.0152, 80.2242 | `received_by_control_room` | `verified` | 2 |
| `rep-014` | `food_water`| "Baby formula urgently needed for 8 infants"| 12.9722, 80.2182 | `sent_to_server` | `public` | 2 |
| `rep-015` | `structural`| "Apartment perimeter wall collapsed" | 13.0232, 80.2412 | `saved_on_phone` | `public` | 2 |
| `rep-016` | `structural`| "Scaffolding fallen across roadway" | 13.0028, 80.2582 | `resolved` | `verified` | 2 |
| `rep-017` | `road_closure`| "Trees blocking Jafferkhanpet link road" | 13.0195, 80.2150 | `received_by_control_room` | `official` | 1 |
| `rep-018` | `flood` | "Velachery 100ft road impassable for cars" | 12.9880, 80.2200 | `sent_to_server` | `public` | 2 |
| `rep-019` | `shelter` | "Community hall roof leak in dorm area" | 12.9815, 80.2232 | `saved_on_phone` | `field_reported` | 2 |
| `rep-020` | `sos` | "Stranded school van with 12 children" | 13.0095, 80.2180 | `received_by_control_room` | `official` | 0 |

---

### 2.4 Simulate Debug Menu Actions

A persistent floating debug tool or drawer action panel allows examiners to trigger four critical disaster scenarios:

```
+----------------------------------------------------------------+
|                 SAHAYA SIMULATE DEBUG ACTIONS                  |
+----------------------------------------------------------------+
| [Action 1: Close Bridge R-14]                                  |
|   - Mutates R-14 status to 'closed' (penalty = 1e9)            |
|   - Triggers Priority 0 push & WebSocket broadcast             |
|   - Isolate recalculates active routes around R-14             |
+----------------------------------------------------------------+
| [Action 2: Fill Shelter Capacity]                              |
|   - Sets Velachery Shelter occupied = 500, available = 0       |
|   - Status changes to 'full'                                   |
|   - Tests relative delta sync & UI capacity re-ranking         |
+----------------------------------------------------------------+
| [Action 3: Push Critical Alert]                                |
|   - Broadcasts Dam Release flood wave warning                  |
|   - Requires user full-screen acknowledgement                  |
|   - Syncs ack back to backend via outbox                       |
+----------------------------------------------------------------+
| [Action 4: Toggle Offline State]                               |
|   - Cycles: ONLINE -> WEAK -> OFFLINE -> ONLINE               |
|   - Simulates latency & packet drop                            |
|   - Tests outbox buffering and automatic reconnect flush       |
+----------------------------------------------------------------+
```

1. **`Close Bridge R-14`**:
   - Programmatically executes:
     `UPDATE road_segments SET status = 'closed', official_status = 1, penalty_weight = 1000000000.0, updated_at = :now WHERE id = 'R-14';`
   - Injects Priority 0 event into Outbox.
   - Pushes WebSocket frame `{"event": "road_closed", "id": "R-14"}`.
   - Triggers active navigation session to execute Dijkstra reroute isolate, emitting route warning: *"Active route obstructed: Bridge R-14 closed. Recalculating detour."*
2. **`Fill Shelter Capacity`**:
   - Targets `shelter-velachery`.
   - Sends relative delta update: `{ "action": "delta_capacity", "delta_occupied": +25, "delta_available": -25 }`.
   - Sets `status = 'full'`.
   - Verifies shelter selector in navigation dynamically disables routing to this shelter and highlights nearest available shelter (`shelter-besant`).
3. **`Push Critical Alert`**:
   - Synthesizes alert:
     - Title: *"CRITICAL: Chembarambakkam Dam discharge raised to 25,000 cusecs"*
     - Severity: `critical`
     - Hazard: `dam_release`
     - Polygon: GeoJSON covering Wards 168–173.
     - `requires_acknowledgement: 1`.
   - Triggers audio alarm, haptic buzz, full-screen lock screen notification.
   - Dismissing requires tapping "Acknowledge & Evacuate", which enqueues an outbox ack record.
4. **`Toggle Offline State`**:
   - Cycles state across `ONLINE` -> `WEAK` -> `OFFLINE`.
   - In `WEAK` state, `MockBackendInterceptor` introduces a $1500\text{ms}$ artificial delay and drops $50\%$ of HTTP requests with `SocketException`.
   - In `OFFLINE` state, all HTTP requests fail instantly with `DioExceptionType.connectionError`.
   - Verifies all user interactions save cleanly into `outbox` and flush automatically upon returning to `ONLINE`.

---

## 3. R7: Security, Privacy, and Safety Architecture

### 3.1 SQLCipher Key Management & Hardware Keystore Integration

1. **Key Generation**:
   - On initial app launch, a 256-bit cryptographically secure symmetric key is generated via Dart `Random.secure()`.
   - The key is converted to a 64-character hexadecimal string.
2. **Key Storage**:
   - Android: Saved to `FlutterSecureStorage` backed by **Android Keystore System** using AES-256-GCM encryption with master key generated via `MasterKeys.AES256_GCM_SPEC`.
   - iOS: Saved to `FlutterSecureStorage` backed by **iOS Keychain** configured with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`.
3. **Database Initialization Hook**:
   - Drift `NativeDatabase` initializes SQLite using SQLCipher pragma:
     ```sql
     PRAGMA key = "x'A3F5B8...<64 hex characters>'";
     PRAGMA cipher_compatibility = 4;
     PRAGMA kdf_iter = 256000;
     PRAGMA cipher_page_size = 4096;
     ```
   - Attempting to open the database file without this key yields `file is not a database` (SQLITE_NOTADB).
4. **Keystore Loss & Recovery Handling**:
   - If keystore encryption keys are wiped or invalidated by OS biometrics reset:
     - The app prompts user with recovery dialog: *"Encrypted session invalid. Re-authenticate to restore database or reset local cache."*
     - Allows re-login from scratch; pulls fresh data without corrupting uncommitted server state.

---

### 3.2 Secure Token Storage & Session Lifecycle

- **JWT Token Management**:
  - `access_token` (1-hour lifespan) and `refresh_token` (30-day offline lifespan).
  - Stored exclusively in hardware-encrypted secure storage keys:
    - `sahaya_auth_access_token`
    - `sahaya_auth_refresh_token`
    - `sahaya_user_profile_json`
  - Plaintext SharedPreferences, SQLite non-encrypted columns, and disk files are strictly prohibited from storing credentials.
- **Offline Session Longevity**:
  - In a disaster field zone without cell towers, access token expiration must NOT log out field personnel.
  - The client operates offline indefinitely against local cached credentials until the user explicitly logs out or connectivity is restored and token renewal occurs.

---

### 3.3 Role-Based Access Control (RBAC)

RBAC is enforced strictly at the database/sync layer and mirrored in the presentation layer:

| Role | Permitted Actions | Prohibited / Restricted Actions |
|---|---|---|
| **Citizen** | Submit SOS, submit incident report, view safe shelters/hospitals, view alerts | Cannot view tactical unit positions, cannot view police road closure admin, cannot view internal hospital trauma stats |
| **Rescue** | Accept tasks, update task status, submit field reports, GPS auto-tracking, perform verification tasks | Cannot declare official road closures, cannot edit hospital bed capacity |
| **Hospital** | Update bed capacity, update ICU capacity, toggle emergency diversion, view incoming triage | Cannot accept field rescue tasks, cannot update road segments |
| **Police / Fire** | Declare official road closures/reopenings, create road hazards, update unit status | Cannot modify hospital bed counts |
| **NGO / Shelter** | Track shelter occupancy, log resource deliveries, submit resource requests | Cannot alter hospital diversion status or tactical assignments |

*Server Rule*: Server validates JWT role on `/sync/push`. If a citizen sends a road closure with `official_status: 1`, the server rejects that specific item with status `rejected`.

---

### 3.4 Minimal Personal Data Collection & Location Privacy

1. **No Compulsory Registration for Citizens**:
   - Citizens can send life-critical SOS without entering names, emails, or phone numbers.
   - Client generates a random pseudonymous device UUID (`device_id`).
   - Contact phone is strictly optional for citizens requesting phone callbacks.
2. **Citizen Location Privacy**:
   - Continuous background GPS tracking for Citizens is **strictly prohibited**.
   - Citizen GPS is sampled **only once** upon the explicit tap of "Send SOS" or "Submit Report".
   - App presents an explicit system permission dialog with a clear, honest rationale.
3. **Operational Unit GPS Tracking**:
   - For `rescue`, `police_fire` roles, background GPS tracking is an operational necessity.
   - Requires explicit in-app confirmation upon role login: *"Field dispatch requires sharing unit GPS position with Control Room."*
   - UI displays a persistent top banner: *"📡 GPS Live Tracking Active — Sharing position with HQ"*.
   - Unit can pause tracking via settings if taking mandatory rest.
4. **Zero Third-Party Telemetry**:
   - No Google Analytics, Firebase Crashlytics, Mixpanel, or advertising identifiers.
   - All diagnostic crash logs are stored locally and scrubbed of PII.

---

### 3.5 Secure Data Wipe on Logout

When a field responder or citizen logs out:
1. Revocation notification `POST /auth/logout` sent to server if network is reachable.
2. `FlutterSecureStorage.deleteAll()` executes immediately.
3. SQLCipher database file is zeroized and deleted from the filesystem:
   ```dart
   await db.close();
   final dbFile = File(databasePath);
   if (await dbFile.exists()) {
     await dbFile.delete();
   }
   ```
4. All cached photo files in temporary app storage are permanently deleted.
5. In-memory Riverpod/Provider state is destroyed, navigating back to login.

---

### 3.6 Untrusted Server Text Sanitization & Safety

- Problem: Malicious or compromised backend payloads / user input could contain HTML tags, scripts, or broken control codes.
- Enforcement:
  - App prohibits `flutter_html` or raw webviews for rendering server descriptions, notes, or alert messages.
  - All text is sanitized through a regex scrubber stripping HTML tags: `<[^>]*>`.
  - Content rendered strictly via native Flutter `Text` widgets or a safe, constrained markdown parser.
  - Text length limits enforced at both DB and UI layers:
    - Title: max 120 characters
    - Description: max 1,000 characters
    - Notes: max 500 characters

---

### 3.7 Persistent Visible Safety Disclaimer

To adhere to life-safety guidelines and prevent false reliance during severe crises:
- **Mandatory Disclaimer Text**:
  > *"This app supports emergency services; call your local emergency number for immediate danger."*
- **Visual Display Requirements**:
  - Rendered persistently on the Login Screen, Citizen SOS Screen, and Home Screen bottom footer.
  - High-contrast, non-dismissible banner.
  - Includes a direct "Call Emergency Services (112)" one-tap button opening the native device dialer intent with emergency dispatch pre-filled.

---

## 4. Features Discovered & Specification Matrix

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Database | Drift + SQLCipher Schema | 11 encrypted tables covering all disaster domain entities | Data entities, migrations | Encrypted SQLite DB file | Throws `SqliteException` on missing key or corrupt pragma | R2 Specification |
| 2 | Outbox | Priority Queueing (0-3) | Multi-tier queue ordering writes; 0 jumps queue | Outbox records, priority enum | Ordered push queue | Jittered exponential backoff on retry | R2 Specification |
| 3 | Outbox | UUID Idempotency | Client UUID prevents duplicate writes | RFC 4122 v4 UUID | HTTP 200 `duplicate_ignored` | Deduplication cache check | R2 Specification |
| 4 | Push Engine | Gzip Request Batching | Normal priority items batched and compressed | List of Outbox rows | Compressed HTTP request | Falls back to uncompressed if server rejects gzip | R2 Specification |
| 5 | Push Engine | Chunked Media Upload | 256KB chunked resumable photo upload | Local image file URI | Remote CDN URL | Resumes at last byte offset after drop | R2 Specification |
| 6 | Pull Engine | Delta Sync via Cursors | Replicates only changed rows and soft deletes | Timestamp `since` cursor | Upserts array + Deletes array | Retries pull on next sync cycle | R2 Specification |
| 7 | Pull Engine | WebSocket Live Push | Real-time event streaming for critical changes | WS connection, JWT token | Stream of disaster events | Automatic fallback to 15s polling | R2 Specification |
| 8 | Conflict | Server Status Wins | Server timestamp supersedes local status | `server_updated_at` | Overwritten status field | Supersedes pending local status outbox item | R2 Specification |
| 9 | Conflict | Relative Delta Capacity | Capacity synced as +/- N deltas | `delta_occupied`, `delta_available` | Recomputed absolute capacity | Server atomic increment | R2 Specification |
| 10| UI Honesty | Staleness Badges | Badges past thresholds (15m alerts, 30m roads) | Record timestamp | Amber/Yellow warning badges | Alerts user data may be unverified | R2 Specification |
| 11| UI State | Sync Status Bar | Displays online/offline/weak, pending count | Connectivity stream, probe | Visual header widget | Shows offline tooltip if tapped offline | R2 Specification |
| 12| API | OpenAPI 3.1 Contract | Complete schema for login, sync, packs, media | HTTP requests | JSON / Binary responses | Standardized HTTP 4xx/5xx errors | R6 Specification |
| 13| Network | Dio Client & Interceptors | Auth, Gzip, Retry, Mock interceptors | API requests | Executed or mocked response | Controlled retry or pass-through | R6 Specification |
| 14| MockBackend| Seeded Flood Scenario | Standalone simulation in Chennai Flood Zone | District manifest | 12 wards, 3 shelters, 3 hosps, 21 units, 20 reps | Zero network calls needed | R6 Specification |
| 15| Debug Menu | Close Bridge R-14 | Simulates bridge closure and rerouting | Tap button | Road R-14 closed, Dijkstra reroute | Triggers active route obstruction alert | R6 Specification |
| 16| Debug Menu | Fill Shelter Capacity | Sets Velachery shelter to 100% capacity | Tap button | Capacity full, delta sync | Re-ranks shelter pickers | R6 Specification |
| 17| Debug Menu | Push Critical Alert | Broadcasts dam release warning | Tap button | Full-screen lock screen alert | Enqueues ack in outbox | R6 Specification |
| 18| Debug Menu | Toggle Offline State | Cycles Online / Weak / Offline | Tap button | Network mode switch | Outbox buffers; flushes on reconnect | R6 Specification |
| 19| Security | Hardware Keystore Key | 256-bit AES key stored in Keystore/Keychain | OS Keyring | SQLCipher encryption pragma | Prompts recovery on keystore reset | R7 Specification |
| 20| Security | Secure Token Storage | Access & refresh tokens stored in secure storage | JWT strings | Authenticated requests | Cleared on logout | R7 Specification |
| 21| Security | Role-Based Access Control| Backend + UI enforcement of role permissions | User role claim | Screen/Action accessibility | Server 403 on unauthorized mutation | R7 Specification |
| 22| Privacy | Citizen Location Privacy | No continuous tracking for citizens | Citizen GPS consent | Single coordinate on SOS | Denied tracking if permission rejected | R7 Specification |
| 23| Security | Secure Data Wipe | Full purge of DB, keys, and cache on logout | Logout event | Zeroized disk files | Navigates to clean login | R7 Specification |
| 24| Safety | Text Sanitization | Scans untrusted strings to remove HTML/script | Raw text strings | Plain sanitized text | Strips tags before rendering | R7 Specification |
| 25| Safety | Emergency Disclaimer | Persistent banner to call 112 for direct help | Screen mount | Visible disclaimer + 112 dialer | Always rendered across screens | R7 Specification |

---

## 5. Edge Cases & Boundary Behaviors

| # | Feature | Input / Trigger Condition | Observed / Required Behavior |
|---|---|---|---|
| 1 | Outbox | App killed while Priority 0 push is in flight | Outbox row has `locked_until` set for 30s. On app restart, after 30s lease expires, engine immediately picks up row and retries. Server idempotency key prevents duplicate execution. |
| 2 | Outbox | 100+ items accumulated while device was offline for 3 days | Engine drains queue in batches of 25 sorted by priority. Priority 0 items execute first. Total outbox count in Sync Status Bar decreases smoothly. |
| 3 | Media Upload | Network switches from Wi-Fi to Cellular mid-upload | If user setting has "Wi-Fi Only Media Upload" enabled, chunked upload halts immediately at current chunk offset. Does NOT fail or delete; resumes automatically when Wi-Fi returns. |
| 4 | Delta Sync | Server returns deletion tombstone for a shelter currently open in UI | Drift transaction marks `is_deleted = 1`. Reactive stream emits update; UI transitions shelter card to "Shelter decommissioned / closed" and prompts user to pick an alternate. |
| 5 | Conflict | Two disconnected shelter managers both record 30 arrivals | Both generate delta outbox items `{delta_occupied: +30}`. When reconnected, server applies both (+60 total). Neither update is overwritten or lost. |
| 6 | Conflict | Citizen reports road open, but Police official marks road closed | Police update carries `official_status: 1` and server timestamp. Server status wins unconditionally. Citizen device updates to closed. |
| 7 | Dijkstra Routing | Road R-14 closes while rescue unit is actively driving towards it | WebSocket push updates `road_segments` in DB. Reactive listener triggers Dijkstra isolate reroute. UI displays audible obstruction notification and updates polyline to avoid R-14. |
| 8 | Reachability | Wi-Fi connected to router with no upstream internet connection | `connectivity_plus` reports Wi-Fi, but active reachability probe `HEAD /health` times out. State machine correctly labels status as `offline` or `weak`, NOT `online`. |
| 9 | Authentication | Access token expires while device is completely offline in the field | Client continues normal offline operation using local cached role and profile. No forced logout or screen blocking occurs while disconnected. |
| 10| SQLCipher | Device storage runs out of disk space during database write | SQLite throws `SQLITE_FULL`. Outbox write transaction rolls back cleanly. App displays low-storage banner without database corruption. |
| 11| Geofencing | Device enters polygon of newly seeded critical flood alert | Local isolate detects lat/lon intersection with cached polygon. Fires critical local alert notification with vibration and sound even if device is in airplane mode. |
| 12| Text Sanitization| Citizen SOS includes `<script>alert('xss')</script><b>Help!</b>` | Text sanitizer strips `<script>` and `<b>` tags. UI displays clean string: `alert('xss') Help!`. |

---

## 6. Implementation Guidelines for Development Phase

When milestone implementation commences:
1. **Database Class**: Create `AppDatabase` extending `_$AppDatabase` with Drift 2.x and `NativeDatabase.createInBackground(file, setup: (db) { ... SQLCipher pragma ... })`.
2. **Outbox Daemon**: Run outbox supervisor in a background Dart isolate or singleton service listening to connectivity changes and local outbox table insertions.
3. **Mock Backend Switch**: Controlled via a single compile-time or runtime configuration:
   ```dart
   class AppConfig {
     static const bool useMockBackend = bool.fromEnvironment('USE_MOCK_BACKEND', defaultValue: true);
   }
   ```
4. **Clean Architecture Modules**:
   - `core/database`: Drift database, schema tables, DAOs, type converters.
   - `core/network`: Dio configuration, interceptors, OpenAPI models, WebSocket client.
   - `core/security`: SQLCipher key manager, secure storage, sanitizers.
   - `features/sync`: Outbox repository, push engine, pull engine, conflict resolver, sync status bar.
   - `features/mock_backend`: Seed data generators, mock HTTP interceptor, simulate actions controller.
