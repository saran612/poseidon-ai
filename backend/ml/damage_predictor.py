from typing import Dict
import numpy as np
import pandas as pd
from backend.ml.model_loader import get_model_loader
from backend.ml.schemas import DamagePredictionRequest, DamagePredictionResponse


class DamagePredictor:
    """Inference service for Disaster Damage Severity Prediction."""

    def __init__(self):
        self.loader = get_model_loader()

    def predict(self, req: DamagePredictionRequest) -> DamagePredictionResponse:
        if not self.loader.status.get("damage_prediction") or self.loader.damage_preproc is None:
            raise RuntimeError("Disaster Damage ML models are not loaded. Check model files.")

        preproc = self.loader.damage_preproc
        features = preproc["features"]
        le = preproc["label_encoder"]

        input_dict = {
            "wind_speed_kmh": req.wind_speed_kmh,
            "rainfall_mm": req.rainfall_mm,
            "flood_depth_m": req.flood_depth_m,
            "affected_population": req.affected_population,
            "evacuated_population": req.evacuated_population,
            "affected_households": req.affected_households,
        }

        df_row = pd.DataFrame([input_dict])[features]

        if req.model_type == "xgb" and self.loader.xgb_damage is not None:
            model = self.loader.xgb_damage
            model_name = "XGBoost Damage Classifier"
        else:
            model = self.loader.rf_damage
            model_name = "Random Forest Damage Classifier"

        pred_idx = model.predict(df_row)[0]
        probs = model.predict_proba(df_row)[0]
        label = le.inverse_transform([pred_idx])[0]

        class_probs: Dict[str, float] = {
            str(cls): float(prob) for cls, prob in zip(le.classes_, probs)
        }

        evac_ratio = req.evacuated_population / max(req.affected_population, 1)

        return DamagePredictionResponse(
            predicted_severity=label,
            model_used=model_name,
            uncalibrated_confidence=float(np.max(probs)),
            class_probabilities=class_probs,
            evacuation_ratio=round(evac_ratio, 4),
        )


_damage_predictor = DamagePredictor()


def get_damage_predictor() -> DamagePredictor:
    return _damage_predictor

