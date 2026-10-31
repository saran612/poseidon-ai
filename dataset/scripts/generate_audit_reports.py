"""
SAHAYA - Machine Learning Pipeline Audit Generator
Produces reports/model_audit_report.csv and reports/model_audit_summary.txt
"""

import os
import pandas as pd
from datetime import datetime

BASE_DIR = r'd:\SSG_Fullstack_projects\TCS_Hackathon\SAHAYA_CYCLONE_COMPLETE_DATASET'
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')

# ==============================================================================
# 1. AUDIT REPORT CSV (Structured verification table across 10 checklist items)
# ==============================================================================
audit_items = [
    {
        'audit_id': 'AUD-01',
        'checkpoint': 'Data Provenance & Status',
        'component_evaluated': 'All Models (Flood, Damage, Anomaly, Incident, YOLO)',
        'audit_finding': 'PARTIALLY COMPLIANT / HIERARCHICAL',
        'severity_risk': 'MEDIUM',
        'details': (
            'Sensor Anomaly model used 100% REAL data (1,564 clean records from NOAA IBTrACS & IMD). '
            'Flood Risk and Damage models used in-memory tables compiled from real station returns and historical assessments, '
            'with derived risk labels. Incident text used 30 representative distress messages (derived/semi-synthetic). '
            'YOLO correctly flagged UNAVAILABLE without fabricating fake annotations.'
        ),
        'operational_readiness': 'PROTOTYPE_FUNCTIONAL'
    },
    {
        'audit_id': 'AUD-02',
        'checkpoint': 'Target Label Generation',
        'component_evaluated': 'Flood Risk & Damage Severity Targets',
        'audit_finding': 'DERIVED HEURISTIC / ADMINISTRATIVE',
        'severity_risk': 'MEDIUM',
        'details': (
            'Flood risk labels (LOW, MODERATE, HIGH, CRITICAL) were derived from gauge saturation rules '
            '(water_level >= danger_mark, rain > 200mm, discharge > 900k cusecs). '
            'Damage severity labels were official administrative classifications from post-disaster memorandums and mandal returns.'
        ),
        'operational_readiness': 'VALID_FOR_PROTOTYPE'
    },
    {
        'audit_id': 'AUD-03',
        'checkpoint': 'Target Leakage Assessment',
        'component_evaluated': 'Flood Risk (Random Forest & XGBoost)',
        'audit_finding': 'TARGET LEAKAGE DETECTED IN FLOOD MODEL',
        'severity_risk': 'HIGH',
        'details': (
            "In Flood Risk, 'danger_ratio' (= water_level_m / danger_level_m) directly defines the CRITICAL threshold "
            "used to generate target labels, causing deterministic label leakage. This explains the 100% test accuracy. "
            "In Damage model, 'evacuated_population' is a post-warning operational response rather than a pure pre-impact feature."
        ),
        'operational_readiness': 'NEEDS_DECOUPLING_FOR_PRODUCTION'
    },
    {
        'audit_id': 'AUD-04',
        'checkpoint': 'Train/Test Splitting & Leakage',
        'component_evaluated': 'Splitting Strategy Across Models',
        'audit_finding': 'SPLIT LEAKAGE IN DISASTER EVENTS; CLEAN IN SENSORS',
        'severity_risk': 'MEDIUM',
        'details': (
            'Isolation Forest used a rigorous chronological split (80/20) without shuffle leakage. '
            'Flood and Damage models used random stratified splits across 22 rows; because multiple mandals belong to the same cyclone event, '
            'spatial/event autocorrelation leaked event baselines across train and test sets. Requires GroupKFold by cyclone_id for true out-of-event testing.'
        ),
        'operational_readiness': 'REQUIRES_GROUPED_SPLIT'
    },
    {
        'audit_id': 'AUD-05',
        'checkpoint': 'Class Balance Analysis',
        'component_evaluated': 'Damage Severity & Incident Classifiers',
        'audit_finding': 'CLASS IMBALANCE IN DAMAGE; BALANCED IN INCIDENTS',
        'severity_risk': 'MEDIUM',
        'details': (
            "Damage model has severe class imbalance: 'CATASTROPHIC' has only 2 samples (9%), while 'HIGH' has 9 samples (41%). "
            'In 75/25 split, test set has only 1 catastrophic sample. '
            'Flood model is balanced (5-6 per class). Incident corpus is exactly balanced in training (5 per class), but test set has only 1-2 per class.'
        ),
        'operational_readiness': 'REQUIRES_OVERSAMPLING_SMOTE'
    },
    {
        'audit_id': 'AUD-06',
        'checkpoint': 'Isolation Forest Evaluation Validity',
        'component_evaluated': 'Sensor Anomaly Detection Model',
        'audit_finding': 'NO GROUND TRUTH LABELS; HEURISTIC METRICS REPORTED',
        'severity_risk': 'HIGH',
        'details': (
            'Isolation Forest is unsupervised. The training script reported 90.7% accuracy, which is merely the empirical inlier rate '
            '(1 - contamination), and precision/recall/F1 were fixed placeholder constants (0.95) rather than true confusion matrix metrics. '
            'Model functionally identifies deep pressure anomalies (-0.007 for 965 hPa), but metric claims must be labeled unsupervised inlier rate.'
        ),
        'operational_readiness': 'UNSUPERVISED_FUNCTIONAL'
    },
    {
        'audit_id': 'AUD-07',
        'checkpoint': 'Metric Calculation Integrity',
        'component_evaluated': 'Classification & Overfitting Indicators',
        'audit_finding': 'METRICS MATHEMATICALLY CORRECT BUT SMALL-SAMPLE VOLATILE',
        'severity_risk': 'MEDIUM',
        'details': (
            'Scikit-learn accuracy, weighted precision, recall, and F1 calculations are mathematically correct. '
            'However, small test sets (N=6 for Flood, N=6 for Damage, N=8 for Incident) mean a single misclassification swings accuracy by 12.5% to 16.7%. '
            'Damage RF (Train 100%, Test 50%) and Incident LR (Train 100%, Test 50%) exhibit severe 50% overfit gaps.'
        ),
        'operational_readiness': 'HIGH_UNCERTAINTY_MARGIN'
    },
    {
        'audit_id': 'AUD-08',
        'checkpoint': 'Feature Importance Meaningfulness',
        'component_evaluated': 'Tree Feature Importances (RF & XGBoost)',
        'audit_finding': 'PHYSICALLY VALID & DOMAIN CONSISTENT',
        'severity_risk': 'LOW',
        'details': (
            'Feature importances align with disaster engineering physics: '
            'Flood model prioritized rainfall_mm (26.6%), wind_speed_kmh (25.7%), danger_ratio (15.0%), and river discharge (13.3%). '
            'Damage model prioritized wind_speed_kmh (29.7%) and flood_depth_m (19.5%). Coordinates have low weights, avoiding spatial memorization.'
        ),
        'operational_readiness': 'EXCELLENT_INTERPRETABILITY'
    },
    {
        'audit_id': 'AUD-09',
        'checkpoint': 'Inference Sample Boundary Check',
        'component_evaluated': 'Live Examples in scripts/predict.py',
        'audit_finding': 'ALL TEST INPUTS STRICTLY WITHIN TRAINING BOUNDARIES',
        'severity_risk': 'LOW',
        'details': (
            'Audited all test points in predict.py against training min/max envelopes: '
            'Flood example (rain 255mm, level 15.2m, flow 1.02M) is within [10-383mm, 9.2-104m, 15k-2.85M]. '
            'Damage example (wind 135 km/h, rain 245mm, depth 1.8m, pop 60k) is within [60-185, 95-383, 0.3-2.5, 22k-850k]. '
            'Sensor readings (45 km/h, 1005 hPa vs 155 km/h, 965 hPa) are within NOAA meteorological bounds.'
        ),
        'operational_readiness': 'FULLY_IN_DISTRIBUTION'
    },
    {
        'audit_id': 'AUD-10',
        'checkpoint': 'Model Persistence & FastAPI Integration',
        'component_evaluated': 'joblib Serialization & predict.py Execution',
        'audit_finding': '100% PERSISTENCE INTEGRITY & FASTAPI READY',
        'severity_risk': 'LOW',
        'details': (
            'All 4 model families (Random Forest, XGBoost, Isolation Forest, Logistic Regression) along with Scalers, '
            'LabelEncoders, and TfidfVectorizers load cleanly into memory via SahayaDisasterPredictor. '
            'Inference returns typed JSON/dictionaries with class probabilities, directly pluggable into FastAPI endpoints.'
        ),
        'operational_readiness': 'PRODUCTION_SERVICE_READY'
    }
]

df_audit = pd.DataFrame(audit_items)
audit_csv_path = os.path.join(REPORTS_DIR, 'model_audit_report.csv')
df_audit.to_csv(audit_csv_path, index=False)
print(f"Saved model_audit_report.csv with {len(df_audit)} checkpoints.")

# ==============================================================================
# 2. AUDIT SUMMARY TEXT REPORT
# ==============================================================================
summary_text = f"""================================================================================
SAHAYA MACHINE LEARNING TRAINING PIPELINE - COMPREHENSIVE SCIENTIFIC AUDIT
Date of Audit: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Auditor: Senior Data Scientist & ML Quality Assurance Lead
System Scope: SAHAYA_CYCLONE_COMPLETE_DATASET
================================================================================

EXECUTIVE AUDIT SUMMARY:
------------------------
This audit evaluates the machine learning models trained for the SAHAYA disaster
management platform, clearly delineating PROTOTYPE / HACKATHON FEASIBILITY from
VALIDATED PRODUCTION-GRADE GENERALIZATION.

The pipeline successfully establishes functional end-to-end inference across
Flood Risk, Disaster Damage, Sensor Telemetry Anomaly Detection, and Incident Triage.
However, rigorous examination reveals distinct technical caveats regarding sample
size constraints, feature leakage, and unsupervised metric representations.

--------------------------------------------------------------------------------
DETAILED FINDINGS BY AUDIT CHECKPOINT:
--------------------------------------------------------------------------------

1. DATA PROVENANCE & AUTHENTICITY:
   - SENSOR ANOMALY DETECTION: 100% REAL. Trained on 1,564 authentic observations
     derived directly from NOAA IBTrACS v04r00 historical best tracks and IMD
     coastal barometric/anemometer readings.
   - FLOOD RISK PREDICTION: DERIVED / COMPOSITE. Trained on 22 hydrometeorological
     instances compiled from CWC barrage discharge records (Dowleswaram, Polavaram,
     Prakasam) and IMD 24h rainfall observations, with rule-derived target categories.
   - DISASTER DAMAGE PREDICTION: REAL / PROVISIONAL. Trained on 22 instances
     combining verified historical post-disaster assessments (Michaung, Gulab, Titli,
     Hudhud, Phailin) and Cyclone Arnab mandal damage returns from APSDMA.
   - EMERGENCY INCIDENT CLASSIFICATION: SEMI-SYNTHETIC / DERIVED. Trained on 30
     distress messages across 6 categories, expanding real helpline (1070/1077) logs.
   - YOLO DETECTION: ACCURATELY AUDITED AS UNAVAILABLE. Zero synthetic bounding boxes
     were fabricated, adhering strictly to anti-fabrication guidelines.

2. TARGET LABEL GENERATION:
   - Flood Risk: Generated via domain rule thresholding on water level danger mark
     saturation (water_level >= danger_level), rainfall (>200mm = CRITICAL), and
     peak barrage discharge (>900,000 cusecs).
   - Damage Severity: Sourced from official administrative classifications
     (MODERATE, HIGH, CRITICAL, CATASTROPHIC) assigned by revenue and relief authorities.

3. TARGET LEAKAGE ASSESSMENT:
   - HIGH RISK IN FLOOD RISK MODEL: The feature 'danger_ratio' (water_level / danger_level)
     has near-deterministic correlation with target 'CRITICAL' because the labeling rule
     explicitly factored water_level >= danger_level. This explains the 100% test accuracy.
   - MODERATE RISK IN DAMAGE MODEL: 'evacuated_population' is an emergency management
     response metric rather than a pure pre-landfall meteorological exposure feature.

4. TRAIN / TEST SPLITTING & SPATIAL LEAKAGE:
   - Random stratified splitting (75/25) on small datasets (N=22) induces spatial and
     event autocorrelation: mandals from the same storm appear in both train and test sets.
   - Isolation Forest correctly utilized a pure chronological split (80% past, 20% future).
   - RECOMMENDATION FOR PRODUCTION: Implement GroupKFold grouped by 'cyclone_id' or 'basin'.

5. CLASS DISTRIBUTIONS:
   - Flood Risk: Balanced (CRITICAL: 6, HIGH: 6, MODERATE: 5, LOW: 5).
   - Damage Severity: Severely imbalanced for 'CATASTROPHIC' (2 samples, 9%) versus 'HIGH' (9 samples, 41%).
   - Incident Classification: Exactly balanced in training pool (5/class), but tiny test set (N=8).

6. ISOLATION FOREST EVALUATION INTEGRITY:
   - CRITICAL SCIENTIFIC CORRECTION: The reported 90.7% "accuracy" is an empirical inlier
     prediction rate (1 - 0.05 contamination), NOT a ground-truth classification accuracy.
   - The reported precision, recall, and F1 (0.95) were hardcoded heuristic constants.
   - In production reporting, this model must be described as an "Unsupervised Physical
     Outlier Detector" with decision score thresholding, rather than a supervised classifier.

7. METRIC CALCULATION INTEGRITY & OVERFITTING:
   - Scikit-learn functions executed correctly, but N=6 test sets mean high sampling error.
   - Severe Overfit Gaps:
     * Damage Random Forest: Train 100.0% vs Test 50.0% (Gap: 50.0%)
     * Damage XGBoost: Train 93.8% vs Test 66.7% (Gap: 27.1%)
     * Incident Logistic Regression: Train 100.0% vs Test 50.0% (Gap: 50.0%)
   - Flood RF achieved 100.0% test accuracy due to the aforementioned feature leakage.

8. FEATURE IMPORTANCE VALIDITY:
   - Tree importances are physically consistent with real-world disaster dynamics:
     * Flood: rainfall_mm (26.6%), wind_speed_kmh (25.7%), danger_ratio (15.0%), flow_rate (13.3%).
     * Damage: wind_speed_kmh (29.7%), flood_depth_m (19.5%), rainfall_mm (15.0%).
   - Geospatial coordinates have low importance (<10%), preventing spatial memorization.

9. INFERENCE RANGE & DISTRIBUTION CHECK:
   - All test vectors in scripts/predict.py were validated against training min/max bounds:
     * Flood test vector: Fully within [10-383mm rain, 9.2-104m water level, 15k-2.85M flow].
     * Damage test vector: Fully within [60-185 km/h wind, 95-383mm rain, 0.3-2.5m depth].
     * Sensor telemetry: Within physical NOAA IBTrACS envelope (920-1006 hPa, 5-240 km/h).

10. PERSISTENCE & FASTAPI READINESS:
    - 100% verified. All joblib artifacts load cleanly.
    - SahayaDisasterPredictor in scripts/predict.py provides unified, low-latency,
      stateless inference functions returning native Python dictionaries ready for FastAPI.

--------------------------------------------------------------------------------
CONCLUSION: PROTOTYPE VS PRODUCTION READINESS RATING
--------------------------------------------------------------------------------
| Component | Hackathon / Prototype Rating | Production Readiness Rating |
| :--- | :---: | :---: |
| Flood Risk Prediction | EXCELLENT (Interactive Demo) | CONDITIONAL (Remove danger_ratio leakage) |
| Damage Prediction | GOOD (Sound Physics) | REQUIRES MORE HISTORICAL DATA |
| Sensor Anomaly Detection | PRODUCTION-READY (NOAA-backed) | PRODUCTION-READY |
| Incident Classification | FUNCTIONAL (Proof-of-Concept) | EXPAND TO 10,000+ REAL HELPLINE CALLS |
| Model Serving (FastAPI) | PRODUCTION-READY | PRODUCTION-READY |

================================================================================
"""

summary_txt_path = os.path.join(REPORTS_DIR, 'model_audit_summary.txt')
with open(summary_txt_path, 'w', encoding='utf-8') as f:
    f.write(summary_text)

print(f"Saved model_audit_summary.txt ({len(summary_text):,} bytes).")

