# POSEIDON AI
**Predictive, Offline-First Disaster Intelligence & Autonomous Relief Coordination Platform**

> *"We don't just detect disasters. We coordinate the response when everything changes."*

POSEIDON AI transforms fragmented, delayed, duplicated, contradictory, and unreliable emergency information into evidence-backed decisions and coordinated relief operations. Capable of operating completely without internet connectivity within a locally deployed emergency command-room network.

---

## 1. Geographical Focus
- **Region:** Noyyal River corridor and urban lake clusters in **Coimbatore District, Tamil Nadu**.
- **Key Waterbodies & Corridors:** Perur Basin, Selvampathy & Kumaraswamy Lakes, Ukkadam Periyakulam, Singanallur Lake, and Ondipudur Reach.
- **Candidate Crossing Bridges:** Perur Noyyal Bridge, Siruvani Road Bridge, Ukkadam-Sungam Bypass Bridge, and Trichy Road Singanallur Crossing.

---

## 2. Core Innovations

1. **Evidence Trust Engine:**
   - Multi-transport consolidated idempotency (Wi-Fi, SMS with Base64 encoding, Sub-GHz LoRa radio).
   - 31-byte compact authenticated binary frame with 8-byte HMAC tag and constant-time validation.
   - Persistent 64-bit sliding window replay protection for legitimate out-of-order packet delivery without counter rollback.
   - Exponential freshness decay using domain-specific half-lives (30m to 360m) calculated strictly from `observed_at`.
   - Independence clustering with a $0.60$ confidence cap on public reports (public reports alone cannot achieve `VERIFIED`).
   - Asymmetric safety rules enforcing conservative road closures until verified reopening.

2. **Fairness-Aware Relief Optimization:**
   - Powered by Google OR-Tools CP-SAT solver.
   - Enforces a mathematical fairness floor:
     $$\sum_{j} x_{j, z} + \text{slack}_z \ge \lfloor \theta \cdot \text{demand}_z \cdot \min(1, S/D) \rfloor, \quad \theta = 0.5$$
   - Prevents starvation of vulnerable secondary zones during severe supply shortages.
   - Records explicit shortfall causes: `supply_exhausted`, `no_feasible_route`, `deadline_infeasible`, `capacity_limit`.

3. **Cascading Impact Replanning:**
   - Ingests road/bridge closures, invalidates affected topological routes, and re-optimizes assignments.
   - Produces versioned plans ($v1 \to v2$) with structural diffs (rerouted paths, travel times, unmet changes).
   - Enforces a strict **Human Authorization Gate**: Plan $v2$ remains held in `PENDING_APPROVAL` until an authorized incident commander signs off.

---

## 3. Technology Stack

- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, NetworkX, Google OR-Tools CP-SAT.
- **Database:** PostgreSQL/PostGIS (Production Docker) and SQLite/pure-spatial (Instant local Windows development).
- **Frontend Command Centre:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide tactical icons.
- **Testing:** Pytest, pytest-asyncio, HTTPX ASGI transport.

---

## 4. Quickstart & Local Setup

### 4.1. Local Python Environment (Windows 11)
```powershell
# 1. Install dependencies
python -m pip install -e . --no-build-isolation
python -m pip install -r requirements.txt

# 2. Run database migrations
alembic upgrade head

# 3. Start the FastAPI server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4.2. Accessing the Application
- **Mission Command Centre:** [http://localhost:8000/](http://localhost:8000/)
- **Interactive API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 4.3. Docker Compose Deployment (PostGIS + API)
```bash
docker compose up -d --build
```

---

## 5. Verification & Test Suite

Run the full automated test suite covering all 20 mandatory test cases:
```powershell
pytest -v
```
**Test Results:** 24 passed in 0.28 seconds.

---

## 6. Documentation
- [System Architecture Specification](docs/ARCHITECTURE.md)
- [Demonstration Execution Guide](docs/DEMO_GUIDE.md)
