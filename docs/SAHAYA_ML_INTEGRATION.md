# SAHAYA AI — Machine Learning Integration Specification

**Platform:** POSEIDON AI / SAHAYA Disaster Intelligence  
**Branch:** `feature/sahaya-ml-integration`  
**Status:** Integrated & Fully Tested  
**Backend Framework:** FastAPI / Pydantic v2 / Scikit-Learn / XGBoost  
**Frontend Framework:** React 19 / TypeScript / Vite / Tailwind CSS v4 / TanStack Query  

---

## 1. Architecture Overview

The SAHAYA Machine Learning Intelligence suite has been integrated into the POSEIDON AI full-stack application as a modular, decoupled inference engine.

```
poseidon-ai/
├── backend/
│   ├── ml/                                 <-- Core ML Service Module
│   │   ├── __init__.py                     <-- Export service facades
│   │   ├── model_loader.py                 <-- Singleton startup model loader
│   │   ├── schemas.py                      <-- Pydantic v2 I/O validation schemas
│   │   ├── flood_predictor.py              <-- Flood Risk inference service
│   │   ├── damage_predictor.py             <-- Disaster Damage severity service
│   │   ├── anomaly_detector.py             <-- Isolation Forest anomaly detector
│   │   ├── incident_classifier.py          <-- TF-IDF + Logistic Regression NLP
│   │   ├── service.py                      <-- Unified ML service facade
│   │   └── models/                         <-- Preserved model artifacts (.joblib)
│   │       ├── flood_risk/
│   │       ├── damage_prediction/
│   │       ├── anomaly_detection/
│   │       ├── incident_classification/
│   │       └── yolo_detection/
│   ├── api/v1/endpoints/
│   │   └── ml.py                           <-- REST API routes (/api/v1/ml/*)
│   └── main.py                             <-- Lifespan model startup integration
├── frontend/
│   └── src/
│       ├── lib/mlApi.ts                    <-- Typed async API client
│       └── pages/MlIntelligencePage.tsx    <-- Interactive ML Mission Dashboard
└── tests/
    └── test_ml_integration.py              <-- 6 automated integration tests
```

---

## 2. Model Catalog & Scientific Validation Status

In compliance with our empirical ML audit, model capabilities and limitations are explicitly documented:

| Model Component | Primary Algorithm | Training Provenance | Scientific Status | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Flood Risk Prediction** | Random Forest (100) & XGBoost (50) | CWC Barrage stages & historical floods ($N=22$) | **Research prototype** | `rainfall_mm`, `water_level_m`, `danger_ratio`, `flow_rate_cusecs`, `wind_speed_kmh`, `latitude`, `longitude` |
| **Disaster Damage Severity** | Random Forest & XGBoost Multi-Class | Official disaster returns & Arnab field data ($N=22$) | **Research prototype** | `wind_speed_kmh`, `rainfall_mm`, `flood_depth_m`, `affected_population`, `evacuated_population`, `affected_households` |
| **Sensor Anomaly Detection** | Isolation Forest (5% Contamination) | NOAA IBTrACS cyclone reanalysis ($N=1,564$) | **Demonstration-ready** *(as Track Anomaly Screener)* | `wind_speed_kmh`, `wmo_pressure_hpa`, `latitude`, `longitude` |
| **Emergency Incident Classifier** | TF-IDF + Multinomial Logistic Regression | Multi-agency dispatch transcripts ($N=30$) | **Research prototype** | `text` (Distress report, helpline transcript) |
| **YOLO Damage Detection** | YOLOv8 Object Detector | Annotated aerial imagery | **Not available** | Zero fabrication protocol maintained. |

---

## 3. API Endpoints Specification

### 3.1. Flood Risk Prediction
- **Endpoint:** `POST /api/v1/ml/flood/predict` (and `POST /api/ml/flood/predict`)
- **Request Example:**
```json
{
  "rainfall_mm": 245.8,
  "water_level_m": 14.85,
  "danger_level_m": 14.75,
  "flow_rate_cusecs": 985000.0,
  "wind_speed_kmh": 125.0,
  "latitude": 16.94,
  "longitude": 81.76,
  "model_type": "rf"
}
```
- **Response Example:**
```json
{
  "predicted_risk_category": "CRITICAL",
  "model_used": "Random Forest Flood Risk Classifier",
  "uncalibrated_confidence": 0.88,
  "class_probabilities": {
    "CRITICAL": 0.88,
    "HIGH": 0.12,
    "MODERATE": 0.0,
    "LOW": 0.0
  },
  "danger_ratio": 1.0068,
  "feature_contributions": {
    "hydraulic_saturation": 0.503,
    "precipitation_intensity": 0.819,
    "discharge_pressure": 0.493,
    "cyclonic_wind_forcing": 0.833
  },
  "audit_notes": "Research prototype: Probabilities reflect uncalibrated tree ensemble vote fractions. Target label derived from CWC hydraulic thresholds."
}
```

### 3.2. Disaster Damage Severity Prediction
- **Endpoint:** `POST /api/v1/ml/damage/predict`
- **Request Example:**
```json
{
  "wind_speed_kmh": 135.0,
  "rainfall_mm": 264.5,
  "flood_depth_m": 1.85,
  "affected_population": 54000,
  "evacuated_population": 18500,
  "affected_households": 14200,
  "model_type": "xgb"
}
```
- **Response Example:**
```json
{
  "predicted_severity": "CRITICAL",
  "model_used": "XGBoost Damage Classifier",
  "uncalibrated_confidence": 0.942,
  "class_probabilities": {
    "CATASTROPHIC": 0.021,
    "CRITICAL": 0.942,
    "HIGH": 0.035,
    "MODERATE": 0.002
  },
  "evacuation_ratio": 0.3426,
  "audit_notes": "Research prototype: Trained on historical disaster returns and provisional field reports."
}
```

### 3.3. Sensor / Meteorological Anomaly Detection
- **Endpoint:** `POST /api/v1/ml/anomaly/detect`
- **Request Example:**
```json
{
  "wind_speed_kmh": 155.0,
  "wmo_pressure_hpa": 965.0,
  "latitude": 16.4,
  "longitude": 81.9
}
```
- **Response Example:**
```json
{
  "is_anomaly": true,
  "status": "ANOMALY_DETECTED",
  "anomaly_score": -0.0842,
  "threshold": 0.0,
  "explanation": "Severe tropical cyclonic vortex detected: deep barometric pressure deficit coupled with high sustained wind.",
  "provenance_notes": "Demonstration-ready: Trained on NOAA IBTrACS historical cyclone track reanalysis points."
}
```

### 3.4. Emergency Incident Classification
- **Endpoint:** `POST /api/v1/ml/incident/classify`
- **Request Example:**
```json
{
  "text": "High sea water entered village main street with 1.5m tidal waterlogging, families stranded on rooftops"
}
```
- **Response Example:**
```json
{
  "input_text": "High sea water entered village main street with 1.5m tidal waterlogging, families stranded on rooftops",
  "predicted_category": "flood",
  "confidence": 0.7842,
  "category_probabilities": {
    "flood": 0.7842,
    "rescue_request": 0.1420,
    "medical_emergency": 0.0310,
    "road_blockage": 0.0215,
    "shelter_request": 0.0150,
    "other": 0.0063
  },
  "recommended_action": "Alert Central Flood Monitoring Room, evaluate nearby embankment telemetry, and verify river stage.",
  "audit_notes": "Research prototype: TF-IDF + Multinomial Logistic Regression trained on multi-agency dispatch reports."
}
```

### 3.5. Model Health & Status
- **Endpoint:** `GET /api/v1/ml/health` (and `GET /api/v1/ml/models`)
- Returns real-time initialization state, algorithm specs, and training metadata for all 5 models.

---

## 4. Local Execution & Verification

### Run Backend Tests (38 Tests: 32 Teammate + 6 ML Integration)
```powershell
python -m pytest -v
```

### Start Local Backend
```powershell
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API docs available at: `http://localhost:8000/docs`

### Start Frontend Command Center
```powershell
cd frontend
npm run dev
```
Navigate to: `http://localhost:3000/ml-intelligence`
