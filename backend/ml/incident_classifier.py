from typing import Dict
import numpy as np
from backend.ml.model_loader import get_model_loader
from backend.ml.schemas import IncidentClassificationRequest, IncidentClassificationResponse


class IncidentClassifier:
    """Inference service for Citizen & Helpline Emergency Incident Classification."""

    def __init__(self):
        self.loader = get_model_loader()

    def classify(self, req: IncidentClassificationRequest) -> IncidentClassificationResponse:
        if not self.loader.status.get("incident_classification") or self.loader.incident_tfidf is None:
            raise RuntimeError("Emergency Incident ML models are not loaded. Check model files.")

        tfidf = self.loader.incident_tfidf
        lr_model = self.loader.incident_lr
        le = self.loader.incident_le

        vec = tfidf.transform([req.text])
        pred_idx = lr_model.predict(vec)[0]
        probs = lr_model.predict_proba(vec)[0]
        label = le.inverse_transform([pred_idx])[0]

        cat_probs: Dict[str, float] = {
            str(cls): round(float(p), 4) for cls, p in zip(le.classes_, probs)
        }

        # Operational dispatch recommendations based on category
        action_map = {
            "flood": "Alert Central Flood Monitoring Room, evaluate nearby embankment telemetry, and verify river stage.",
            "rescue_request": "Priority dispatch of SDRF inflatable motorized boats and life-vest extraction squads.",
            "medical_emergency": "Reroute highest-readiness Advanced Life Support (ALS) emergency ambulance.",
            "road_blockage": "Task heavy engineering earth-movers / chain-saw crews to clear arterial evacuation lifeline.",
            "shelter_request": "Direct displaced families to designated community cyclone shelter and issue food rations.",
            "other": "Route to incident command triage queue for manual tele-operator assessment.",
        }

        recommended_action = action_map.get(
            label, "Route to emergency triage officer for verification."
        )

        return IncidentClassificationResponse(
            input_text=req.text,
            predicted_category=label,
            confidence=round(float(np.max(probs)), 4),
            category_probabilities=cat_probs,
            recommended_action=recommended_action,
        )


_incident_classifier = IncidentClassifier()


def get_incident_classifier() -> IncidentClassifier:
    return _incident_classifier

