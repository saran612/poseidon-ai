# POSEIDON AI: System Architecture & Technical Specification

## 1. System Overview
**POSEIDON AI** is a predictive, offline-first disaster intelligence and autonomous relief coordination platform engineered for local emergency network survivability during major flood catastrophes.

- **Primary Geography**: Noyyal River corridor and urban lake clusters (Singanallur, Ukkadam Periyakulam, Valankulam, Selvampathy, Kumaraswamy) in Coimbatore District, Tamil Nadu.
- **Core Workflow**: `VERIFY ➔ PRIORITIZE ➔ ALLOCATE ➔ ROUTE ➔ MONITOR ➔ REPLAN`
- **Deployment Topology**: Self-contained local command-room server (Windows 11 / WSL2 / Docker) hosting FastAPI, PostgreSQL/PostGIS (or SQLite fallback), OR-Tools CP-SAT, and local mesh communication gateways.

---

## 2. Ingestion Protocol & Cryptographic Security (`poseidon.ingestion`)

### 2.1. 31-Byte Compact Binary Frame Layout
Engineered for constrained emergency radio and SMS links:
- `Version` (1 byte, `uint8`): Protocol version (default 1).
- `Device ID` (2 bytes, `uint16`): Pre-registered hardware/node identifier.
- `Sequence Counter` (4 bytes, `uint32`): Monotonic packet counter.
- `Message Type` (1 byte, `uint8`): 1=Water Level, 2=Casualty/Medical, 3=Road Status, 4=SOS.
- `Latitude` (4 bytes, signed `int32`): Scaled by $10^7$ (sub-meter resolution).
- `Longitude` (4 bytes, signed `int32`): Scaled by $10^7$.
- `People Affected` (2 bytes, `uint16`): Integer count of people in distress.
- `Flags` (1 byte, `uint8` bitmask): Bit 0: GPS fix valid, Bit 1: Media attached, Bit 2: Urgent medical, Bit 3: Trapped.
- `Timestamp` (4 bytes, `uint32`): Observation time in epoch minutes.
- `HMAC Tag` (8 bytes, binary): Truncated HMAC-SHA256 calculated over the preceding 23 bytes using the device's pre-shared key.

### 2.2. Persistent Sliding-Window Replay Protection
- Standard monotonic counter checks fail during disaster scenarios because radio mesh packets legitimately arrive out-of-order.
- POSEIDON implements a 64-bit sliding window bitmap centered at `highest_counter`:
  - `counter > highest_counter`: Bitmap shifts left by `(counter - highest_counter)`, bit 0 set, `highest_counter` updated.
  - `highest_counter - 64 <= counter < highest_counter`: Bit `(highest_counter - counter)` checked; if unset, accepted as valid out-of-order delivery.
  - Counter duplicate or lag $\ge 64$: Strictly rejected as replay attempt.

### 2.3. Multi-Transport Consolidated Idempotency
- Incoming packets from Wi-Fi, SMS (Base64 wrapper), and LoRa are resolved to a deterministic `origin_id = sha256(device_id:counter:timestamp_min)`.
- If a message with matching `origin_id` arrives across multiple physical paths, the server stores individual `TransportReceipt` records for auditability without duplicating evidence or inflating corroboration metrics.

---

## 3. Evidence Trust Engine (`poseidon.trust`)

### 3.1. Confidence Formulation
$$c_i = \text{base\_tier} \times \text{reputation} \times \text{freshness} \times \text{specificity}$$
- **Base Tiers**: T1 Field Officer (0.90), T2 Hydrology Sensor (0.75), T3 Verified Citizen (0.45), T4 Public / Unknown (0.20).
- **Reputation**: Clamped in $[0.5, 1.2]$ based on historical verification outcomes.
- **Specificity**: In $[0.6, 1.0]$ based on location precision, GPS flag, and casualty detail.
- **Exponential Freshness Decay**:
  $$\text{freshness} = 0.5^{(\text{age\_minutes} / \text{half\_life\_minutes})}$$
  Half-lives: Sensor (30m), Casualty (60m), Citizen Report (120m), Road Status (180m), Government Alert (360m).
  Calculated strictly from `observed_at`, NOT server `received_at`.
  Packets with timestamps $> 300\text{s}$ into the future are rejected.

### 3.2. Independence Clustering & Public Cap
- Evidence items within $300\text{m}$ (expanded dynamically by location precision uncertainty) and $90\text{ minutes}$ are grouped into incident clusters.
- Supporting confidence: $C_{\text{support}} = 1 - \prod (1 - c_k)$.
- **Strict Guardrail**: If no T1 or T2 source exists in the cluster, $C_{\text{support}}$ is capped at $0.60$. Public reports alone can never achieve `VERIFIED` status without authoritative confirmation.

### 3.3. Asymmetric Safety
- Roads marked `CLOSED` remain closed until an equal-or-higher tier source with a fresher timestamp reports reopening. Contradictory reports enforce conservative closure.

---

## 4. Disaster Prioritization Engine (`poseidon.situation`)
Multi-factor normalized scoring across 5 dimensions:
- Life threat ($w_1 = 0.35$)
- Exposure ($w_2 = 0.20$)
- Vulnerability ($w_3 = 0.20$)
- Access loss ($w_4 = 0.15$)
- Trend ($w_5 = 0.10$)

Interval Scoring:
- `score_expected`: Computed exclusively from verified and corroborated evidence.
- `score_upper`: Computed incorporating unverified claims (e.g., rumor of 200 trapped people).
- If `score_upper` would change ranking: the zone is tagged `verify_next = True` for priority aerial/ground reconnaissance without skewing immediate dispatch orders.
- Verified imminent life threats force zone classification to `CRITICAL` regardless of numerical score.

---

## 5. Fairness-Aware Relief Optimization (`poseidon.optimization`)
Powered by Google OR-Tools CP-SAT (`ReliefResourceOptimizer`):
- Decision variables $x_{j, z} \in \mathbb{Z}_{\ge 0}$ representing resource units dispatched from depot $j$ to zone $z$.
- Depot capacity: $\sum_z x_{j, z} \le \text{supply}[j]$.
- Demand satisfaction: $\sum_j x_{j, z} \le \text{demand}[z]$.
- Fairness floor constraint:
  $$\sum_j x_{j, z} + \text{slack}_z \ge \lfloor \theta \cdot \text{demand}_z \cdot \min(1, S/D) \rfloor, \quad \theta = 0.5$$
- Multi-objective minimization: Priority-weighted unmet demand, travel penalty, and fairness slack.
- Explicit shortfall logging: `supply_exhausted`, `no_feasible_route`, `deadline_infeasible`, `capacity_limit`.

---

## 6. Cascading Impact Replanner (`poseidon.replanning`)
- Road/bridge closure ingestion invalidates active routes in the topological graph (`CoimbatoreRoadNetwork`).
- Cascading analyzer identifies affected relief teams and triggers OR-Tools re-optimization.
- Generates versioned revised plans ($v1 \to v2$) with structural diff (cancelled, rerouted, new dispatches).
- **Human-In-The-Loop Sign-off**: Plan $v2$ remains strictly held in `PENDING_APPROVAL` status until an authorized operator issues operational sign-off.
