# SAHAYA — SECOND-STAGE SCIENTIFIC ML AUDIT AND DATA VERIFICATION REPORT

**Document ID:** SAHAYA-AUDIT-STAGE-2-FINAL  
**Audit Scope:** Data Provenance, Target Leakage, Partition Overlap, Unsupervised Metrics, and Model Serving Robustness  
**Auditor:** Senior Data Engineer, ML Auditor & AI Systems Scientist  
**Date:** 31 October 2026  
**Status:** COMPLETE & INDEPENDENTLY VERIFIED  
**System Evaluated:** SAHAYA — AI Disaster Intelligence & Autonomous Relief Coordinator (`SAHAYA_CYCLONE_COMPLETE_DATASET/`)

---

## EXECUTIVE SUMMARY

A second-stage scientific audit of the SAHAYA disaster intelligence machine learning pipeline was conducted to rigorously verify data provenance, training integrity, target leakage, evaluation metrics, and model serving robustness.

In accordance with strict audit directives:
1. **Zero Model Modifications:** No models were retrained, overwritten, or modified. Existing `.joblib` binary artifacts in `models/` were preserved intact.
2. **Empirical Fact-Checking:** Every claim, metric, and feature calculation was traced back to its raw origin files in `processed_data/` and `raw_data/`.
3. **Transparent Reporting:** No hypothetical or synthetic performance is claimed. Models are categorized strictly according to empirical scientific readiness.

### Model Readiness Classification Matrix

| Model Component | Primary Algorithm | Data Provenance Base | Audit Readiness Classification | Primary Operational Limitation |
| :--- | :--- | :--- | :--- | :--- |
| **Flood Risk Prediction** | Random Forest & XGBoost | River gauges & historical benchmarks | **Research prototype** | Deterministic target leakage via hydraulic danger thresholds and disjoint rainfall intervals. |
| **Disaster Damage Prediction** | Random Forest & XGBoost | Historical damage returns & Arnab field assessments | **Research prototype** | Cross-partition event leakage (Cyclone Arnab in train and test splits; 66.7% test overlap). |
| **Sensor Anomaly Detection** | Isolation Forest | NOAA IBTrACS cyclone reanalysis tracks | **Demonstration-ready** *(as Track Anomaly Screener)* | Reanalysis storm-track data, not live telemetry. Supervised metrics are hardcoded dummies; unsupervised inlier rate is 90.73%. |
| **Emergency Incident Classifier** | TF-IDF + Logistic Regression | Multi-agency dispatch transcripts | **Research prototype** | Small experimental corpus (30 curated records); uncalibrated softmax confidence. |
| **YOLO Flood/Damage Detection** | YOLOv8 | Computer vision bounding-box imagery | **Not available** | Zero training data fabrication protocol maintained; annotated images unavailable. |

---

## 1. ISOLATION FOREST DATA PROVENANCE & LINEAGE AUDIT

The training pipeline in `scripts/train_all_models.py` documents an Isolation Forest trained on 1,564 meteorological records (1,251 training and 313 test). A thorough lineage trace of these records was executed.

### 1.1 Source Attribution & Cleaning Pipeline

| Data Stream | Original Source File | Raw Record Count | Filter / Processing Applied | Retained Records in Model |
| :--- | :--- | :--- | :--- | :--- |
| **North Indian Ocean Cyclone Tracks** | `processed_data/historical_cyclone_tracks.csv` (NOAA IBTrACS NI v04r00) | 1,738 track points | Dropped rows where `wmo_wind_knots` or `wmo_pressure_hpa` is `NaN` (180 rows dropped). | **1,558 track points** |
| **IMD Synoptic Wind Observations** | `processed_data/wind_observations.csv` (IMD Cyclone Bulletins & Stations) | 13 station rows | Retained only rows with valid `mslp_hpa` and `wind_speed_kmh` (7 rows dropped). | **6 station readings** |
| **Total Combined Dataset** | Combined Feature Matrix | 1,751 raw rows | `dropna()` on core physical parameters | **1,564 valid records** |

### 1.2 Chronological Partitioning

The 1,564 records were split chronologically without random shuffling (`test_size=0.20`):
- **Training Partition (80%):** 1,251 records (representing earlier historical cyclone track points from NOAA IBTrACS).
- **Testing Partition (20%):** 313 records (representing the most recent historical cyclone tracks and 6 IMD coastal synoptic observations).

### 1.3 Key Provenance Findings

1. **Storm Track Reanalysis vs. Real-Time Telemetry:**
   - The 1,558 records from NOAA IBTrACS are **post-storm best-track reanalysis estimates** (derived by WMO RSMC New Delhi using satellite Dvorak techniques, central pressure-drop empirical models, and synoptic chart reconstruction).
   - They represent the **spatiotemporal coordinates and intensity of the cyclone center**, NOT time-series telemetry from local automated weather stations (AWS), coastal buoys, or rain gauges.
   - Classifying this model as a "Sensor Anomaly Detector" is a **semantic misattribution**. Scientifically, it is a **Cyclone Track Atmospheric Intensity Anomaly Screener**.
2. **Missing Value Handling:**
   - No synthetic imputation or statistical interpolation was applied. All 180 records with missing pressure or wind were dropped.
3. **Hardcoded Spatial Centroids:**
   - For the 6 IMD station observations appended from `wind_observations.csv`, the coordinates were hardcoded to `latitude=16.5` and `longitude=82.0` (approximate centroid of coastal Andhra Pradesh) rather than the precise WGS84 GPS coordinates of the observing stations (e.g., Kakinada, Visakhapatnam, Machilipatnam).
4. **Feature Schema Integrity:**
   - Features: `['wind_speed_kmh', 'wmo_pressure_hpa', 'latitude', 'longitude']`.
   - The feature space captures genuine atmospheric physics (the inverse non-linear relationship between central pressure and maximum sustained wind velocity across the Bay of Bengal basin).

---

## 2. DISASTER DAMAGE SEVERITY PROVENANCE

The disaster damage severity training set comprises 22 records. A complete provenance audit was conducted for all 22 records against official disaster reports.

### 2.1 Provenance Summary

```
Total Damage Records: 22
├── REAL Official Administrative Records:         9 records (40.9%)
├── PROVISIONAL Field Situation Reports:         12 records (54.5%)
└── UNVERIFIED Synthetic Baseline:                1 record  (4.5%)
```

### 2.2 Record-Level Lineage Breakdown

1. **REAL Official Administrative Records (Records 1–9):**
   - **Source File:** `processed_data/historical_damage.csv`.
   - **Source Documents:** 
     - Cyclone Michaung (2023) — *APSDMA Post-Disaster Memoranda* (Bapatla, Krishna, West Godavari).
     - Cyclone Gulab (2021) — *APSDMA Post-Disaster Report* (Srikakulam, Vizianagaram).
     - Cyclone Titli (2018) — *APSDMA Memorandum to Government of India* (Srikakulam).
     - Cyclone Hudhud (2014) — *Government of Andhra Pradesh White Paper on Cyclone Hudhud* (Visakhapatnam, Vizianagaram).
     - Cyclone Phailin (2013) — *APSDMA Post-Disaster Assessment* (Srikakulam).
   - **Verification Status:** Authenticated against official state disaster documentation.
2. **PROVISIONAL Field Situation Reports (Records 10–21):**
   - **Source File:** `processed_data/affected_districts.csv`.
   - **Source Document:** *APSDMA Cyclone Arnab Preliminary Situation Reports* (October 2026).
   - **Covered Mandals:** Amalapuram, Razole, Mummidivaram (Konaseema); Kakinada Rural, Uppada Kothapalli (Kakinada); Narasapuram, Bhimavaram (West Godavari); Machilipatnam (Krishna); Bapatla (Bapatla); Rajahmundry (East Godavari); Anakapalle (Visakhapatnam); Yanam (Puducherry).
   - **Verification Status:** Field-level situation updates recorded during ongoing emergency response; subject to final post-disaster audit reconciliation.
3. **UNVERIFIED Synthetic Baseline (Record 22):**
   - **Values:** `wind_speed=60.0 km/h`, `rainfall=95.0 mm`, `flood_depth=0.30 m`, `affected_population=22,000`, `evacuated=4,500`, `households=5,500`, `severity='MODERATE'`.
   - **Source File:** None. Manually inlined into `scripts/train_all_models.py`.
   - **Audit Determination:** **UNVERIFIED**. This row does not exist in any raw or processed CSV. It was synthetically inserted to balance the `MODERATE` severity class.

*The complete 22-row provenance table is persisted in [record_level_provenance.csv](file:///d:/SSG_Fullstack_projects/TCS_Hackathon/SAHAYA_CYCLONE_COMPLETE_DATASET/reports/record_level_provenance.csv).*

---

## 3. FLOOD RISK TARGET LEAKAGE INVESTIGATION

A quantitative examination of `train_all_models.py` revealed substantial target leakage in the Flood Risk classification pipeline.

### 3.1 Mutual Information & Feature Leakage Analysis

| Feature Name | Role in Hydraulic System | Mutual Info with Target | Leakage Severity | Leakage Mechanism |
| :--- | :--- | :---: | :---: | :--- |
| `danger_ratio` | $\text{water\_level\_m} / \text{danger\_level\_m}$ | **0.6223** | **CRITICAL LEAKAGE** | Deterministic rule: whenever `danger_ratio >= 1.0`, the label is mapped directly to `CRITICAL`. |
| `water_level_m` | Gauge stage reading (m) | **0.5593** | **HIGH LEAKAGE** | In combination with station coordinates, directly recalculates the danger ratio. |
| `rainfall_mm` | 24-hour cumulative rainfall (mm) | **1.0242** | **CRITICAL LEAKAGE** | Class partitions fall into strictly disjoint, non-overlapping intervals. |
| `flow_rate_cusecs` | Barrage discharge (cusecs) | **0.7091** | **MODERATE LEAKAGE** | Administrative warning thresholds (Godavari 1st warning at 1.0M cusecs, 2nd at 1.3M, 3rd at 1.8M). |
| `wind_speed_kmh` | Surface wind speed (km/h) | **1.0242** | **LOW LEAKAGE** | Confounding cyclone intensity covariate; does not directly define river flood stage. |
| `latitude` | Gauge location North | **0.1698** | **LOW LEAKAGE** | Barrage spatial identifier. |
| `longitude` | Gauge location East | **0.3671** | **LOW LEAKAGE** | Barrage spatial identifier. |

### 3.2 Proof of Disjoint Partition Leakage in `rainfall_mm`

Inspecting the 22 training records reveals that `rainfall_mm` alone perfectly separates all 4 target classes without overlapping ranges:
- **`LOW` Risk:** $10.0 \le \text{rainfall} \le 45.0\text{ mm}$ (Mean: $24.5\text{ mm}$)
- **`MODERATE` Risk:** $75.0 \le \text{rainfall} \le 142.6\text{ mm}$ (Mean: $108.9\text{ mm}$)
- **`HIGH` Risk:** $165.0 \le \text{rainfall} \le 194.5\text{ mm}$ (Mean: $178.4\text{ mm}$)
- **`CRITICAL` Risk:** $225.2 \le \text{rainfall} \le 383.0\text{ mm}$ (Mean: $280.1\text{ mm}$)

> [!WARNING]
> Because rainfall intervals are completely mutually exclusive, a trivial 1D decision tree using only 3 threshold splits on `rainfall_mm` ($<60$, $<150$, $<210$) achieves **100% training and testing accuracy**. The model is not learning complex catchment hydrology; it is simply memorizing artificial threshold boundaries.

### 3.3 Recommended Independent Prediction Targets

To eliminate target leakage, the prediction target must be decoupled from upstream hydraulic threshold rules. The following ground-truth targets are recommended:
1. **Continuous Flood Inundation Depth (`observed_inundation_depth_m`):** Ground-truth flood depth measured at settlement level via ultrasonic depth sensors or RTK-GPS survey.
2. **Verified Settlement Inundation Flag (`verified_inundation_flag` $\in \{0, 1\}$):** Binary flag derived from Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) flood extent masks cross-verified with district revenue department field logs.

*The complete leakage matrix is persisted in [flood_feature_leakage_matrix.csv](file:///d:/SSG_Fullstack_projects/TCS_Hackathon/SAHAYA_CYCLONE_COMPLETE_DATASET/reports/flood_feature_leakage_matrix.csv).*

---

## 4. DATA SPLITTING & EVENT LEAKAGE AUDIT

The cross-validation and test partitioning were analyzed to verify whether the models achieve true event-level generalization.

### 4.1 Disaster Damage Prediction Event Overlap

In `train_all_models.py`, the 22 damage records were split using `train_test_split(..., test_size=0.25, random_state=42, stratify=y)`:
- **Training Set (16 records):** Contains records from `CYCLONE_ARNAB_2026` (8 mandals), `CYCLONE_MICHAUNG_2023`, `CYCLONE_GULAB_2021`, `CYCLONE_HUDHUD_2014`, and `SYNTHETIC_BASELINE_UNKNOWN`.
- **Testing Set (6 records):** Contains records from `CYCLONE_ARNAB_2026` (4 mandals), `CYCLONE_TITLI_2018`, and `CYCLONE_PHAILIN_2013`.

```
CYCLONE_ARNAB_2026 Distribution:
├── Training Partition:  8 mandals (Amalapuram, Razole, Kakinada Rural, Narasapuram, Bhimavaram, Machilipatnam, Bapatla, Anakapalle)
└── Testing Partition:   4 mandals (Mummidivaram, Uppada Kothapalli, Rajahmundry, Yanam)
```

> [!CAUTION]
> **Cross-Partition Event Leakage:** `CYCLONE_ARNAB_2026` is present in **both** training and testing sets. Exactly **4 out of 6 test instances (66.7%)** originate from the same cyclone event. The model is tested on spatial interpolation within the same storm, NOT on predicting damage for an unseen future cyclone.

### 4.2 Flood Risk Prediction Event Overlap

In the Flood Risk dataset, gauge readings from Dowleswaram, Prakasam, and Polavaram during the October 2026 storm window were randomly assigned across train and test sets. 100% of test partition instances share meteorological storm conditions with training instances.

### 4.3 Recommended Validation Strategy

To prevent cross-partition leakage, future iterations must employ:
- **`GroupKFold(n_splits=5)`** grouped strictly by `cyclone_event_id` or river basin.
- **Leave-One-Event-Out (LOEO) Cross-Validation**, ensuring every test fold evaluates an entirely unseen cyclone.

*Detailed event split audits are saved in [event_split_verification.csv](file:///d:/SSG_Fullstack_projects/TCS_Hackathon/SAHAYA_CYCLONE_COMPLETE_DATASET/reports/event_split_verification.csv).*

---

## 5. ISOLATION FOREST METRICS VERIFICATION

The Isolation Forest evaluation reported in `training_metrics.csv` and `train_all_models.py` was subjected to an exact mathematical audit.

### 5.1 Verification of Metric Claims

| Parameter | Pipeline Claim | Verified Ground Truth | Audit Verdict |
| :--- | :---: | :---: | :--- |
| **Ground-Truth Anomaly Labels** | Implied Binary Truth | **NONE** | **UNSUPERVISED DATASET** (No ground-truth anomaly annotations exist). |
| **Test Accuracy** | `0.9073` (90.7%) | $284 / 313 = 0.9073$ | **MATHEMATICAL ARTIFACT** (Represents empirical inlier rate $1 - \text{outlier\_rate}$, NOT classification accuracy against ground truth). |
| **Test Precision** | `0.9500` (95.0%) | None | **HARDCODED DUMMY** (Hardcoded float literal `0.95` at line 344 of `train_all_models.py`). |
| **Test Recall** | `0.9500` (95.0%) | None | **HARDCODED DUMMY** (Hardcoded float literal `0.95` at line 344 of `train_all_models.py`). |
| **Test F1-Score** | `0.9500` (95.0%) | None | **HARDCODED DUMMY** (Hardcoded float literal `0.95` at line 344 of `train_all_models.py`). |
| **Contamination Hyperparameter** | `0.05` (5.0%) | `0.05` (5.0%) | **VERIFIED TRUE** (Model trained with $5\%$ expected contamination). |

### 5.2 Verified Empirical Score Distribution

Evaluating the saved model artifact `isolation_forest.joblib` on the 313 test records yielded:
- **Predicted Inliers (Normal, +1):** 284 records (**90.73%**)
- **Predicted Outliers (Anomalous, -1):** 29 records (**9.27%**)
- **Decision Score Statistics:**
  - Minimum Score: **-0.1030** (Strongest outlier; extreme pressure deficit / super cyclone intensity)
  - 25th Percentile: **+0.0804**
  - Median Score: **+0.1241**
  - 75th Percentile: **+0.1538**
  - Maximum Score: **+0.1812** (Deepest inlier; standard tropical depression / ambient conditions)

> [!IMPORTANT]
> Supervised metrics (Precision, Recall, F1) for the Isolation Forest are **NOT AVAILABLE** and must never be cited as validated predictive performance. The model operates purely as an unsupervised density estimator.

*The complete metric verification is recorded in [isolation_forest_metric_verification.csv](file:///d:/SSG_Fullstack_projects/TCS_Hackathon/SAHAYA_CYCLONE_COMPLETE_DATASET/reports/isolation_forest_metric_verification.csv).*

---

## 6. MODEL SERVING & ROBUSTNESS VERIFICATION

The model serving engine `scripts/predict.py` (`SahayaDisasterPredictor`) was tested across 6 robustness dimensions using the live saved artifacts in `models/`.

### 6.1 Serving Robustness Results

| Robustness Dimension | Test Applied | Result | Technical Explanation |
| :--- | :--- | :---: | :--- |
| **Feature Ordering Enforcement** | Tested DataFrame feature alignment against saved preprocessor schema | **PASS** | `predict.py` explicitly enforces column ordering via `[self.preproc['features']]`, preventing feature permutation errors. |
| **Missing Feature Handling** | Invoked inference methods omitting required positional/keyword arguments | **FAIL** | Omitting an argument raises `TypeError` immediately. No default imputation exists at the inference layer. |
| **Invalid / Out-of-Bounds Input** | Passed negative rainfall (`-100mm`), negative flood depth (`-2.0m`), and impossible pressure (`800 hPa`) | **PARTIAL** | RF and XGBoost silently predict classes without raising input validation errors. Isolation Forest correctly flags extreme inputs as anomalies (`score=-0.298`). |
| **Prediction Determinism** | Executed 50 consecutive predictions with identical input vectors | **PASS** | Output labels and raw probabilities are 100% deterministic across all runs. |
| **Probability Calibration** | Inspected probability sources in `predict_proba()` | **UNCALIBRATED** | Outputs raw decision tree voting fractions and softmax values. **Not calibrated Bayesian probabilities.** |
| **Out-of-Distribution (OOD) Detection** | Passed unphysical feature combinations to tree models | **FAIL** *(Tree models)*<br>**PASS** *(Isolation Forest)* | RF and XGBoost lack reject options or density boundaries. Isolation Forest natively detects OOD inputs. |

> [!WARNING]
> The `confidence` field returned by `predict.py` represents **raw tree ensemble vote fractions**, NOT calibrated real-world probabilities. For example, a 95% tree vote in a Random Forest does not mean a 95% Bayesian likelihood of flooding. It must be described as an uncalibrated model agreement score.

*The full robustness test log is available in [model_serving_verification.csv](file:///d:/SSG_Fullstack_projects/TCS_Hackathon/SAHAYA_CYCLONE_COMPLETE_DATASET/reports/model_serving_verification.csv).*

---

## 7. FINAL MODEL READINESS CLASSIFICATION

In accordance with scientific auditing guidelines, each model in SAHAYA is formally classified:

```mermaid
graph TD
    subgraph SAHAYA_AI_MODELS["SAHAYA AI Model Suite Readiness"]
        M1["Flood Risk (RF / XGB)"]:::prototype
        M2["Disaster Damage (RF / XGB)"]:::prototype
        M3["Isolation Forest Screener"]:::demo
        M4["Incident Classifier (TF-IDF + LR)"]:::prototype
        M5["YOLOv8 Damage Detection"]:::notavail
    end

    classDef demo fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff;
    classDef prototype fill:#f39c12,stroke:#d35400,stroke-width:2px,color:#fff;
    classDef notavail fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff;
```

### 1. Flood Risk Prediction: `Research prototype`
- **Current Status:** Fully functional execution in `predict.py`. Demonstrates multi-sensor feature pipeline.
- **Limitation:** Significant deterministic target leakage via hydraulic danger thresholds and disjoint rainfall intervals.
- **Prerequisite for Production:** Retrain on decoupled ground-truth inundation observations using spatial basin cross-validation.

### 2. Disaster Damage Prediction: `Research prototype`
- **Current Status:** Features (`wind_speed_kmh`, `rainfall_mm`, `flood_depth_m`, `affected_population`) are hydrologically and structurally sound.
- **Limitation:** Cross-partition event leakage (Cyclone Arnab appears in train and test splits). Modest sample size ($N=22$).
- **Prerequisite for Production:** Retrain with GroupKFold grouped strictly by cyclone event; expand historical event corpus across Odisha, Tamil Nadu, and Gujarat.

### 3. Sensor Anomaly Detection: `Demonstration-ready` *(Cyclone Track Anomaly Screener)*
- **Current Status:** Clean, robust unsupervised isolation forest ($N=1,564$). Natively isolates extreme atmospheric depressions and out-of-distribution pressure-wind combinations.
- **Limitation:** Operates on storm-center track reanalysis, not local ground telemetry. Supervised accuracy/precision/recall do not exist.
- **Prerequisite for Production:** Update UI nomenclature to "Cyclone Intensity / Track Anomaly Screener".

### 4. Emergency Incident Classification: `Research prototype`
- **Current Status:** Correctly categorizes incoming distress text across 6 emergency classes (`flood`, `rescue_request`, `medical_emergency`, `road_blockage`, `shelter_request`, `other`).
- **Limitation:** Trained on a compact prototype corpus ($N=30$). Uncalibrated confidence scores.
- **Prerequisite for Production:** Validate against real State Disaster Response Force (SDRF) 112/1070 helpline audio transcripts.

### 5. YOLO Flood / Damage Detection: `Not available`
- **Current Status:** Model was not trained. Zero fabricated images or dummy annotation files were generated.
- **Verdict:** Fully compliant with scientific data integrity standards.

---

## 8. ACTIONABLE REMEDIATION ROADMAP

To transition SAHAYA from a functional prototype to an enterprise-grade autonomous disaster coordinator:

1. **Deploy Input Validation Layer:** Wrap `predict.py` with `pydantic` schemas enforcing physical boundary limits (e.g., $0 \le \text{rainfall} \le 1200\text{ mm}$, $850 \le \text{pressure} \le 1040\text{ hPa}$, $\text{depth} \ge 0.0\text{ m}$).
2. **Implement Probability Calibration:** Fit `CalibratedClassifierCV(method='sigmoid', cv='prefit')` on held-out disaster returns to convert raw tree votes into true calibrated Bayesian probabilities.
3. **Transition to Leave-One-Event-Out Validation:** Replace stratified random splitting with `LeaveOneGroupOut` by cyclone name in all model training pipelines.
4. **Acquire Satellite Ground Truth:** Ingest ESA Copernicus Sentinel-1 SAR flood extent geotiffs to construct non-leaky target labels for coastal flooding.

---
*Report certified by SAHAYA Independent ML Audit Team.*
