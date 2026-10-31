# POSEIDON Mobile Application — Technical Architecture

This document details the architectural design, patterns, database structures, offline synchronization engines, and security models powering the POSEIDON AI dedicated Flutter mobile application (`apps/mobile`).

---

## 1. Architectural Philosophy & Principles

POSEIDON AI is designed for disaster response operations where communication infrastructure is degraded or absent. The mobile client operates as a first-class, offline-first tactical workstation for field rescue teams and incident commanders.

### Core Architectural Axioms
1. **Local-First Authoritativeness**: Every operational action (report creation, evidence logging, assignment acknowledgement) is committed to durable SQLite storage prior to any network transmission.
2. **Server-Controlled Acknowledgement**: A local action is never presented as "Synchronized" or "Acknowledged" until an authoritative cryptographically valid receipt or HTTP 200/201 response is returned by the POSEIDON FastAPI backend.
3. **Idempotency & Replay Protection**: Every transaction carries a deterministic or UUID-based message identifier. Re-transmissions caused by transient network timeouts or dropped packets do not generate duplicate records or double-allocate resources.
4. **Degraded Mode Resilience**: The app seamlessly switches between high-bandwidth HTTP/WebSocket REST APIs, local mesh/gateway Wi-Fi networks, and low-bandwidth SMS/LoRa 31-byte compact binary frames without loss of data integrity.
5. **Shared Authoritative Core**: The mobile app and the React web dashboard share the exact same FastAPI backend, data schemas, trust metrics, priority queues, and spatial coordinate models.

---

## 2. System Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   POSEIDON Flutter Mobile Architecture                 │
├────────────────────────────────────────────────────────────────────────┤
│  Presentation Layer (Flutter 3.44.2 + Riverpod 3 + GoRouter)           │
│  ┌───────────────┐ ┌────────────────┐ ┌─────────────────────────────┐  │
│  │ Dashboard     │ │ Incident Entry │ │ Evidence Camera / Capture   │  │
│  └───────┬───────┘ └───────┬────────┘ └──────────────┬──────────────┘  │
│  ┌───────┴───────┐ ┌───────┴────────┐ ┌──────────────┴──────────────┐  │
│  │ Rescue Tasks  │ │ Mission Map    │ │ Officer Profile / Config    │  │
│  └───────┬───────┘ └───────┬────────┘ └──────────────┬──────────────┘  │
├──────────┼─────────────────┼─────────────────────────┼─────────────────┤
│  Application & State Layer (Riverpod Notifiers & Value Stream)         │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌──────────────┐  │
│  │ AuthNotifier          │ │ AssignmentsNotifier   │ │ SyncEngine   │  │
│  └───────────┬───────────┘ └───────────┬───────────┘ └──────┬───────┘  │
├──────────────┼─────────────────────────┼────────────────────┼──────────┤
│  Offline-First Engine & Persistence Layer                              │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ OutboxManager (Retry with Exponential Backoff & Jitter)       │      │
│  └──────────────────────────────┬───────────────────────────────┘      │
│  ┌──────────────────────────────┴───────────────────────────────┐      │
│  │ Drift SQLite Database (sqlite3_flutter_libs)                 │      │
│  │ - OutboxEntries   - IncidentReports   - EvidenceRecords      │      │
│  │ - LocalAssignments- LocalRoadClosures - SyncMetadata         │      │
│  └──────────────────────────────┬───────────────────────────────┘      │
├─────────────────────────────────┼──────────────────────────────────────┤
│  Communication & Transport Layer                                       │
│  ┌──────────────────────────────┴───────────────────────────────┐      │
│  │ TransportAdapter Interface                                   │      │
│  │ ├─ HttpTransportAdapter (REST / Dio / TLS 1.3)               │      │
│  │ └─ GatewayTransportAdapter (LoRa / SMS Compact Binary Codec) │      │
│  └──────────────────────────────┬───────────────────────────────┘      │
│  ┌──────────────────────────────┴───────────────────────────────┐      │
│  │ WebSocketService (Broadcast situational updates & telemetry) │      │
│  └──────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

The codebase is organized in `apps/mobile/lib/` using a clean, feature-driven modular structure:

```
apps/mobile/lib/
├── config/
│   ├── env.dart                  # Base API URLs, timeout definitions, device presets
│   ├── routes.dart               # GoRouter configuration with ShellRoute & bottom navigation
│   └── theme.dart                # White-and-blue theme tokens and typography
├── core/
│   ├── constants/
│   │   └── colors.dart           # Strict color tokens (#FFFFFF, #F8FAFC, #2563EB, etc.)
│   ├── providers.dart            # Global dependency injection providers (Dio, DB, Services)
│   └── utils/
│       └── binary_codec.dart     # 31-byte binary packing with HMAC-SHA256 & Base64 SMS cycle
├── database/
│   ├── local_database.dart       # Drift schema, tables, DAOs, and database connection
│   └── local_database.g.dart     # Drift generated code
├── features/
│   ├── assignments/
│   │   ├── providers/            # Riverpod Notifier for rescue tasks & acknowledgment
│   │   └── screens/              # Assignments list and detailed mission view
│   ├── authentication/
│   │   └── screens/              # Login screen & secure device registration screen
│   ├── dashboard/
│   │   └── screens/              # Mobile operations overview with live telemetry & stats
│   ├── evidence/
│   │   └── screens/              # Photographic evidence capture and audit metadata preservation
│   ├── map/
│   │   └── screens/              # FlutterMap with offline tiles, risk zones, bridges, depots
│   ├── profile/
│   │   └── screens/              # Device status, cryptographic key fingerprint, sync triggers
│   └── reporting/
│       └── screens/              # Incident reporting list & new incident form with GPS/photo
├── models/
│   └── user_session.dart         # UserSession, Role, and DeviceCredentials models
├── services/
│   ├── auth_service.dart         # Authentication API client, session management, secure tokens
│   └── websocket_service.dart    # Resilient WebSocket connection for real-time dispatch
└── sync/
    ├── outbox_manager.dart       # Durable outbox processor with exponential backoff & jitter
    ├── sync_engine.dart          # High-level two-way sync coordinator and state stream
    └── transport_adapter.dart    # Abstract transport and concrete HTTP / Gateway implementations
```

---

## 4. Local Persistence Schema (Drift / SQLite)

The mobile client utilizes `drift` alongside `sqlite3_flutter_libs` for high-performance ACID-compliant storage.

### 4.1 Schema Tables

1. **`outbox_entries`**:
   - `id` (Text, Primary Key): Deterministic UUID identifying the outbox transmission task.
   - `endpoint` (Text): Target API route (e.g., `/api/v1/ingestion/report`).
   - `method` (Text): HTTP verb (`POST`, `PUT`).
   - `payload` (Text): Full JSON string or binary representation.
   - `retry_count` (Int): Current count of failed delivery attempts.
   - `last_attempt_at` (DateTime, Nullable): Timestamp of the most recent transmission attempt.
   - `status` (Text): `pending`, `syncing`, `synced`, `failed`.
   - `error_message` (Text, Nullable): Last error received from server or transport layer.
   - `created_at` (DateTime): Creation timestamp on the mobile device.

2. **`incident_reports`**:
   - `id` (Text, Primary Key): Unique report identifier.
   - `category` (Text): `flood`, `infrastructure_collapse`, `medical`, `blocked_road`, `stranded_person`.
   - `description` (Text): Field observation notes.
   - `latitude`, `longitude` (Real): Captured GPS coordinates.
   - `affected_population` (Int): Estimated number of people in distress.
   - `casualties` (Int): Number of confirmed casualties requiring emergency extraction.
   - `priority` (Text): `P1_CRITICAL`, `P2_HIGH`, `P3_MEDIUM`, `P4_LOW`.
   - `photo_path` (Text, Nullable): Local path to stored camera image.
   - `sync_status` (Text): `pending`, `syncing`, `synced`, `rejected`.
   - `observed_at` (DateTime): True timestamp of field observation.
   - `synced_at` (DateTime, Nullable): Timestamp when server acknowledged receipt.

3. **`evidence_records`**:
   - `id` (Text, Primary Key): Unique evidence identifier.
   - `incident_id` (Text, Foreign Key): Related incident.
   - `photo_path` (Text): On-device file storage reference.
   - `description` (Text): Contextual evidence description.
   - `latitude`, `longitude` (Real): Location metadata captured at shutter time.
   - `device_id` (Text): Unique hardware/device fingerprint.
   - `sync_status` (Text): `pending`, `syncing`, `synced`.
   - `captured_at` (DateTime): Time of photographic capture.

4. **`local_assignments`**:
   - `id` (Text, Primary Key): Authoritative assignment identifier from backend.
   - `title` (Text): Task description / callsign.
   - `zone_id`, `zone_name` (Text): Operational disaster zone (e.g., `Perur`, `Singanallur`).
   - `priority` (Text): `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
   - `status` (Text): `pending`, `acknowledged`, `in_progress`, `completed`.
   - `allocated_boats`, `allocated_medics` (Int): Tactical resources assigned.
   - `destination_lat`, `destination_lng` (Real): Destination coordinates.
   - `route_summary` (Text, Nullable): Safe ingress/egress notes.
   - `updated_at` (DateTime): Timestamp of last status update.

5. **`local_road_closures`**:
   - `id` (Text, Primary Key): Bridge or road segment identifier.
   - `road_name` (Text): e.g., "Trichy Road Bridge", "Perur Causeway".
   - `is_closed` (Bool): Real-time impassability status.
   - `reason` (Text): Inundation, structural compromise, fallen debris.
   - `latitude`, `longitude` (Real): Coordinates for map layer rendering.

6. **`sync_metadata`**:
   - Key-value state store tracking `last_sync_timestamp`, server sequence tokens, and device credentials.

---

## 5. Offline Outbox & Synchronization Engine

### 5.1 Outbox Transaction Lifecycle
```
[User Action: Submit Report]
          │
          ▼
1. Write to SQLite:
   - incident_reports (sync_status = 'pending')
   - outbox_entries (status = 'pending')
          │
          ▼
2. Trigger OutboxProcessor (Check connectivity & transport)
          │
    ┌─────┴─────────────────────────────────────┐
    ▼                                           ▼
[Connectivity Available]               [No Connectivity]
    │                                           │
3. Execute Transport Adapter                   Keep in SQLite
   (HTTP POST with Authorization)               Sleep until network event
    │                                           or scheduled periodic poll
    ├─────────────────────────────┬─────────────┘
    ▼                             ▼
[HTTP 200/201 Success]        [Network Error / Timeout]
    │                             │
4. Mark outbox entry 'synced'  4. Increment retry_count
   Mark incident 'synced'         Calculate backoff with jitter:
   Update synced_at timestamp     delay = min(max_backoff, base * 2^retries) + jitter
   Notify UI via State Stream     Keep status 'pending'
```

### 5.2 Exponential Backoff with Decorrelated Jitter
To prevent thundering herd problems when cell towers recover after outages, retries use randomized exponential backoff:
$$\Delta t = \min(M, B \cdot 2^{n}) + \text{random}(0, J)$$
Where $B = 2.0\text{s}$ base, $M = 300\text{s}$ maximum delay, and $J = 1.0\text{s}$ uniform jitter.

---

## 6. Binary Codec & Mesh/LoRa/SMS Adapter

When cellular broadband is unavailable, the application can encode emergency alerts into a 31-byte compact binary frame identical to POSEIDON's backend protocol (`backend/ingestion/codec.py`).

### 6.1 31-Byte Frame Specification
| Offset | Field | Type | Description |
|---|---|---|---|
| `0` | `protocol_version` | `uint8` | Version byte (`0x01`) |
| `1-2` | `device_id` | `uint16` | Compact 16-bit hardware identifier |
| `3-6` | `sequence_number` | `uint32` | Monotonically increasing replay protection sequence |
| `7` | `channel_and_flags` | `uint8` | High nibble: channel (1=LoRa, 2=SMS); Low nibble: priority |
| `8-11` | `latitude` | `int32` | Scaled coordinate: $\text{int}(\text{lat} \times 10^7)$ |
| `12-15` | `longitude` | `int32` | Scaled coordinate: $\text{int}(\text{lng} \times 10^7)$ |
| `16-17` | `hazard_code` | `uint16` | Compact enum representing disaster type |
| `18` | `trust_score` | `uint8` | Scaled device trust metric (0–100) |
| `19-22` | `timestamp` | `uint32` | UTC epoch seconds |
| `23-30` | `hmac_signature` | `bytes[8]`| Truncated HMAC-SHA256 signature using shared device secret |

Frames can be passed directly to serial LoRa modems or serialized as Base64 strings for transmission via SMS gateways.

---

## 7. Security Architecture

1. **Token Protection**: JWT access and refresh tokens are stored using flutter secure storage primitives.
2. **Cryptographic Validation**: Device-level payloads carry an 8-byte HMAC-SHA256 digest calculated over the frame header and body.
3. **Replay Rejection**: Transmissions with stale timestamps or non-monotonic sequence numbers are rejected by backend idempotency layers.
4. **Transport Encryption**: All standard HTTP communication is enforced over TLS 1.3.

---

## 8. Mobile Navigation & User Interface

The UI is built with a responsive bottom navigation bar configured via GoRouter ShellRoute:
- **Tab 1: Home (Dashboard)**: Real-time operational snapshot, connectivity badge, active alert cards, sync counter.
- **Tab 2: Map**: Tactical OpenStreetMap view with cached offline vector styling, live risk zones, river corridor polygons, bridge closures, and depot markers.
- **Tab 3: Reports**: Local incident reports with live status badges (`SYNCED`, `PENDING SYNC`, `FAILED`), filter tabs, and rapid offline report creation modal.
- **Tab 4: Assignments**: Active rescue operations with assignment details, required resources (boats/medics), route directions, and 2-way server-confirmed acknowledgment buttons.
- **Tab 5: Profile**: Responder credentials, callsign, device identification, manual sync triggers, and offline storage diagnostics.

