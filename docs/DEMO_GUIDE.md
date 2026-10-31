# POSEIDON AI: Demonstration Execution Guide

## Overview
This guide provides the operational steps to execute and observe the complete 20-step synthetic flood coordination scenario in the Coimbatore Noyyal River corridor.

---

## 1. Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ (for building UI)
- Local Windows 11 host or Linux/macOS

### Running the Platform
1. **Start the Backend API Server**:
   ```powershell
   # From c:\project\poseidon
   python -m uvicorn poseidon.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Access the Mission Command Centre**:
   Open a web browser and navigate to:
   - **Operational Command Dashboard**: `http://localhost:8000/`
   - **Interactive API Documentation**: `http://localhost:8000/docs`

---

## 2. Executing the 20-Step Demonstration Sequence

You can execute the entire 20-step demonstration automatically via the Web UI or via a single API call:

### Option A: Via Command Centre UI
1. Navigate to `http://localhost:8000/`.
2. Click the prominent **"Run 20-Step Demo"** button in the top right ribbon.
3. Switch to the **"20-Step Demo Protocol"** tab to inspect each step in real time with logged latencies ($t_{\text{ingested}}, t_{\text{verified}}, t_{\text{prioritized}}, t_{\text{proposed}}$).

### Option B: Via REST API
```bash
curl -X POST http://localhost:8000/api/v1/simulation/run-demo-scenario
```

---

## 3. Walkthrough of the 20 Steps

| Step | Milestone | What Occurs in POSEIDON AI |
|---|---|---|
| **1** | Scenario Initialization | Injects synthetic monsoon depression event over the Coimbatore Noyyal catchment. |
| **2** | Government Alert Ingestion | Authenticated field commander device sends flood warning via Wi-Fi; verified as T1. |
| **3** | Telemetry Sensor Ingestion | River hydrology telemetry sensor transmits surge data over 865 MHz LoRa; verified as T2. |
| **4** | Citizen Report Ingestion | Resident volunteer sends distress alert with 12 trapped residents; scored as T3. |
| **5** | Multi-Transport Broadcast | A single road status packet is transmitted simultaneously across Wi-Fi, SMS, and LoRa. |
| **6** | Transport Deduplication | Server recognizes identical `origin_id`, recording 3 transport receipts while keeping 1 evidence item. |
| **7** | Authentication & Tier Resolution | Evaluates HMAC signatures, enforces sliding replay windows, and resolves tier privileges. |
| **8** | Corroboration & Clustering | Incident clusters calculated; public reports capped at $0.60$ confidence. |
| **9** | Disaster Prioritization | Zones ranked: Perur and Ukkadam elevated due to verified imminent life threats. |
| **10** | Factor Breakdown & Counterfactuals | Counterfactuals explain what evidence would change ranking (`what_would_change_this`). |
| **11** | Fairness-Aware Allocation (v1) | OR-Tools CP-SAT allocates boats/med-kits enforcing fairness floor $\theta=0.5$. |
| **12** | Shelter Recommendation | Identifies active accessible shelters (VOC Park, Singanallur). |
| **13** | Feasible Arterial Routing | Generates shortest valid arterial paths avoiding flooded choke-points. |
| **14** | Bridge Closure Injection | Sungam Bypass Bridge (`BR-UKKADAM-01`) declared closed due to 1.1m overtopping. |
| **15** | Impacted Assignments Analysis | Detects assignments crossing the severed bridge and invalidates their routes. |
| **16** | Revised Plan v2 Generation | Re-solves resource allocation on damaged graph, creating Plan Version 2. |
| **17** | Old vs New Plan Comparison | Computes structural diff: rerouted paths, cancelled dispatches, and unmet delta. |
| **18** | Human Authorization Gate | Plan v2 held in `PENDING_APPROVAL` status; autonomous execution paused. |
| **19** | Operational Sign-off | Authorized operator (`DISTRICT_COLLECTOR_CBE`) issues operational approval. |
| **20** | Acknowledgement & Audit Trail | Field devices acknowledge updated dispatch orders via LoRa/Wi-Fi with full audit logs. |

---

## 4. Running Automated Tests

Run the full automated test suite covering all mandatory test cases:
```powershell
pytest -v
```
All 24 test cases execute in $< 1.0\text{s}$ verifying cryptographic authentication, replay protection, transport deduplication, fairness floors, and replanning diffs.

