from typing import Dict
import numpy as np
import pandas as pd
from backend.ml.model_loader import get_model_loader
from backend.ml.schemas import FloodPredictionRequest, FloodPredictionResponse


class FloodPredictor:
    """Inference service for Flood Risk Category Prediction."""

    def __init__(self):
        self.loader = get_model_loader()

    def predict(self, req: FloodPredictionRequest) -> FloodPredictionResponse:
        if not self.loader.status.get("flood_risk") or self.loader.flood_preproc is None:
            raise RuntimeError("Flood Risk ML models are not loaded. Check model files.")

        preproc = self.loader.flood_preproc
        features = preproc["features"]
        le = preproc["label_encoder"]

        # Calculate hydraulic danger ratio
        danger_ratio = req.water_level_m / max(req.danger_level_m, 0.001)

        input_dict = {
            "rainfall_mm": req.rainfall_mm,
            "water_level_m": req.water_level_m,
            "danger_ratio": danger_ratio,
            "flow_rate_cusecs": req.flow_rate_cusecs,
            "wind_speed_kmh": req.wind_speed_kmh,
            "latitude": req.latitude,
            "longitude": req.longitude,
        }

        # Align columns strictly to training order
        df_row = pd.DataFrame([input_dict])[features]

        # Select model
        if req.model_type == "xgb" and self.loader.xgb_flood is not None:
            model = self.loader.xgb_flood
            model_name = "XGBoost Flood Risk Classifier"
        else:
            model = self.loader.rf_flood
            model_name = "Random Forest Flood Risk Classifier"

        pred_idx = model.predict(df_row)[0]
        probs = model.predict_proba(df_row)[0]
        label = le.inverse_transform([pred_idx])[0]

        class_probs: Dict[str, float] = {
            str(cls): float(prob) for cls, prob in zip(le.classes_, probs)
        }

        # Feature contribution indicators (heuristic based on normalized values)
        feature_contributions = {
            "hydraulic_saturation": round(min(danger_ratio, 2.0) / 2.0, 3),
            "precipitation_intensity": round(min(req.rainfall_mm / 300.0, 1.0), 3),
            "discharge_pressure": round(min(req.flow_rate_cusecs / 2000000.0, 1.0), 3),
            "cyclonic_wind_forcing": round(min(req.wind_speed_kmh / 150.0, 1.0), 3),
        }

        return FloodPredictionResponse(
            predicted_risk_category=label,
            model_used=model_name,
            uncalibrated_confidence=float(np.max(probs)),
            class_probabilities=class_probs,
            danger_ratio=round(danger_ratio, 4),
            feature_contributions=feature_contributions,
        )


_flood_predictor = FloodPredictor()


def get_flood_predictor() -> FloodPredictor:
    return _flood_predictor

