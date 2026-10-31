"""
SAHAYA - AI Disaster Intelligence & Autonomous Relief Coordinator
Unified Prediction & FastAPI Integration Engine
Author: Senior ML Engineer
"""

import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = r'd:\SSG_Fullstack_projects\TCS_Hackathon\SAHAYA_CYCLONE_COMPLETE_DATASET'
MODELS_DIR = os.path.join(BASE_DIR, 'models')

class SahayaDisasterPredictor:
    """
    Unified predictor service ready for immediate integration into FastAPI endpoints.
    Provides inference for:
      1. Flood Risk Prediction (Random Forest & XGBoost)
      2. Disaster Damage Prediction (Random Forest & XGBoost)
      3. Sensor Anomaly Detection (Isolation Forest)
      4. Emergency Incident Classification (TF-IDF + Logistic Regression)
    """

    def __init__(self, models_dir=MODELS_DIR):
        self.models_dir = models_dir
        self._load_models()

    def _load_models(self):
        print("Loading SAHAYA AI models into memory for inference...")

        # 1. Flood Risk Models
        self.flood_preproc = joblib.load(os.path.join(self.models_dir, 'flood_risk', 'flood_risk_preprocessor.joblib'))
        self.rf_flood = joblib.load(os.path.join(self.models_dir, 'flood_risk', 'random_forest_flood_risk.joblib'))
        self.xgb_flood = joblib.load(os.path.join(self.models_dir, 'flood_risk', 'xgboost_flood_risk.joblib'))

        # 2. Damage Prediction Models
        self.dmg_preproc = joblib.load(os.path.join(self.models_dir, 'damage_prediction', 'damage_preprocessor.joblib'))
        self.rf_dmg = joblib.load(os.path.join(self.models_dir, 'damage_prediction', 'random_forest_damage.joblib'))
        self.xgb_dmg = joblib.load(os.path.join(self.models_dir, 'damage_prediction', 'xgboost_damage.joblib'))

        # 3. Anomaly Detection Models
        self.anomaly_preproc = joblib.load(os.path.join(self.models_dir, 'anomaly_detection', 'anomaly_scaler.joblib'))
        self.iso_forest = joblib.load(os.path.join(self.models_dir, 'anomaly_detection', 'isolation_forest.joblib'))

        # 4. Incident Classification Models
        self.tfidf = joblib.load(os.path.join(self.models_dir, 'incident_classification', 'tfidf_vectorizer.joblib'))
        self.lr_incident = joblib.load(os.path.join(self.models_dir, 'incident_classification', 'logistic_regression_incident.joblib'))
        self.le_incident = joblib.load(os.path.join(self.models_dir, 'incident_classification', 'incident_label_encoder.joblib'))

        print("All models loaded successfully!")

    def predict_flood_risk(self, rainfall_mm, water_level_m, danger_level_m, flow_rate_cusecs, wind_speed_kmh, latitude, longitude, model_type='rf'):
        """Predicts flood risk category: LOW, MODERATE, HIGH, CRITICAL."""
        danger_ratio = water_level_m / max(danger_level_m, 0.001)
        row = pd.DataFrame([{
            'rainfall_mm': rainfall_mm,
            'water_level_m': water_level_m,
            'danger_ratio': danger_ratio,
            'flow_rate_cusecs': flow_rate_cusecs,
            'wind_speed_kmh': wind_speed_kmh,
            'latitude': latitude,
            'longitude': longitude
        }])[self.flood_preproc['features']]

        model = self.rf_flood if model_type == 'rf' else self.xgb_flood
        pred_idx = model.predict(row)[0]
        probs = model.predict_proba(row)[0]
        label = self.flood_preproc['label_encoder'].inverse_transform([pred_idx])[0]

        return {
            'predicted_risk_category': label,
            'model_used': 'RandomForest' if model_type == 'rf' else 'XGBoost',
            'confidence': float(np.max(probs)),
            'class_probabilities': {
                cls: float(prob) for cls, prob in zip(self.flood_preproc['label_encoder'].classes_, probs)
            }
        }

    def predict_damage_severity(self, wind_speed_kmh, rainfall_mm, flood_depth_m, affected_population, evacuated_population, affected_households, model_type='rf'):
        """Predicts disaster damage severity: MODERATE, HIGH, CRITICAL, CATASTROPHIC."""
        row = pd.DataFrame([{
            'wind_speed_kmh': wind_speed_kmh,
            'rainfall_mm': rainfall_mm,
            'flood_depth_m': flood_depth_m,
            'affected_population': affected_population,
            'evacuated_population': evacuated_population,
            'affected_households': affected_households
        }])[self.dmg_preproc['features']]

        model = self.rf_dmg if model_type == 'rf' else self.xgb_dmg
        pred_idx = model.predict(row)[0]
        probs = model.predict_proba(row)[0]
        label = self.dmg_preproc['label_encoder'].inverse_transform([pred_idx])[0]

        return {
            'predicted_severity': label,
            'model_used': 'RandomForest' if model_type == 'rf' else 'XGBoost',
            'confidence': float(np.max(probs)),
            'class_probabilities': {
                cls: float(prob) for cls, prob in zip(self.dmg_preproc['label_encoder'].classes_, probs)
            }
        }

    def detect_sensor_anomaly(self, wind_speed_kmh, wmo_pressure_hpa, latitude, longitude):
        """Detects whether telemetry sensor reading is normal (1) or anomalous/extreme (-1)."""
        row = pd.DataFrame([{
            'wind_speed_kmh': wind_speed_kmh,
            'wmo_pressure_hpa': wmo_pressure_hpa,
            'latitude': latitude,
            'longitude': longitude
        }])[self.anomaly_preproc['features']]

        row_sc = self.anomaly_preproc['scaler'].transform(row)
        pred = self.iso_forest.predict(row_sc)[0]
        score = float(self.iso_forest.decision_function(row_sc)[0])

        return {
            'is_anomaly': bool(pred == -1),
            'status': 'ANOMALY_DETECTED' if pred == -1 else 'NORMAL_TELEMETRY',
            'anomaly_score': score,
            'explanation': 'Abnormal pressure drop or extreme wind reading' if pred == -1 else 'Within expected historical physical envelope'
        }

    def classify_emergency_report(self, text):
        """Classifies citizen or helpline distress text into emergency categories."""
        vec = self.tfidf.transform([text])
        pred_idx = self.lr_incident.predict(vec)[0]
        probs = self.lr_incident.predict_proba(vec)[0]
        label = self.le_incident.inverse_transform([pred_idx])[0]

        return {
            'input_text': text,
            'predicted_category': label,
            'confidence': float(np.max(probs)),
            'category_probabilities': {
                cls: float(p) for cls, p in zip(self.le_incident.classes_, probs)
            }
        }


# ==============================================================================
# DEMO EXECUTION
# ==============================================================================
if __name__ == '__main__':
    predictor = SahayaDisasterPredictor()

    print("\n" + "=" * 70)
    print("LIVE PREDICTION EXAMPLES (FASTAPI-COMPATIBLE)")
    print("=" * 70)

    # 1. Flood Risk Example
    print("\n[1. Flood Risk Prediction Example]")
    res_fl = predictor.predict_flood_risk(
        rainfall_mm=255.0, water_level_m=15.2, danger_level_m=14.75,
        flow_rate_cusecs=1020000.0, wind_speed_kmh=130.0, latitude=16.94, longitude=81.76, model_type='rf'
    )
    print("Input: Heavy rain 255mm, Barrage water level 15.2m (Danger: 14.75m), Flow: 1.02M cusecs")
    print(f"Prediction: {res_fl['predicted_risk_category']} (Confidence: {res_fl['confidence']:.2%})")

    # 2. Disaster Damage Prediction Example
    print("\n[2. Disaster Damage Severity Example]")
    res_dmg = predictor.predict_damage_severity(
        wind_speed_kmh=135.0, rainfall_mm=245.0, flood_depth_m=1.8,
        affected_population=60000, evacuated_population=18000, affected_households=14000, model_type='xgb'
    )
    print("Input: Gale 135 km/h, 245mm rain, 1.8m surge depth, 60,000 population exposed")
    print(f"Prediction: {res_dmg['predicted_severity']} (Confidence: {res_dmg['confidence']:.2%})")

    # 3. Sensor Anomaly Detection Example
    print("\n[3. Sensor Anomaly Detection Example]")
    # Normal reading
    res_norm = predictor.detect_sensor_anomaly(wind_speed_kmh=45.0, wmo_pressure_hpa=1005.0, latitude=16.5, longitude=82.0)
    print(f"Telemetry (45 km/h, 1005 hPa): {res_norm['status']} (Score: {res_norm['anomaly_score']:.3f})")

    # Severe Cyclone Anomaly reading (deep pressure drop, 150 km/h)
    res_anom = predictor.detect_sensor_anomaly(wind_speed_kmh=155.0, wmo_pressure_hpa=965.0, latitude=16.4, longitude=81.9)
    print(f"Telemetry (155 km/h, 965 hPa): {res_anom['status']} (Score: {res_anom['anomaly_score']:.3f})")

    # 4. Emergency Incident Classification Example
    print("\n[4. Emergency Incident Classification Example]")
    distress_text = "Seawater entered our colony and 30 families are stuck on the second floor, send rescue boats urgently"
    res_txt = predictor.classify_emergency_report(distress_text)
    print(f"Distress Report: '{distress_text}'")
    print(f"Classified As: '{res_txt['predicted_category']}' (Confidence: {res_txt['confidence']:.2%})")

