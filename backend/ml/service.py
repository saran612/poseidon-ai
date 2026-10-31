from typing import Dict
from backend.ml.anomaly_detector import get_anomaly_detector
from backend.ml.damage_predictor import get_damage_predictor
from backend.ml.flood_predictor import get_flood_predictor
from backend.ml.incident_classifier import get_incident_classifier
from backend.ml.model_loader import get_model_loader
from backend.ml.schemas import (
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
    DamagePredictionRequest,
    DamagePredictionResponse,
    FloodPredictionRequest,
    FloodPredictionResponse,
    IncidentClassificationRequest,
    IncidentClassificationResponse,
    MLHealthResponse,
    ModelInfo,
)


class MLService:
    """Unified Service Facade for all SAHAYA Disaster Intelligence ML capabilities."""

    def __init__(self):
        self.loader = get_model_loader()
        self.flood_pred = get_flood_predictor()
        self.damage_pred = get_damage_predictor()
        self.anomaly_det = get_anomaly_detector()
        self.incident_clf = get_incident_classifier()

    def predict_flood(self, req: FloodPredictionRequest) -> FloodPredictionResponse:
        return self.flood_pred.predict(req)

    def predict_damage(self, req: DamagePredictionRequest) -> DamagePredictionResponse:
        return self.damage_pred.predict(req)

    def detect_anomaly(self, req: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
        return self.anomaly_det.detect(req)

    def classify_incident(self, req: IncidentClassificationRequest) -> IncidentClassificationResponse:
        return self.incident_clf.classify(req)

    def get_health(self) -> MLHealthResponse:
        status_dict = self.loader.status
        models: Dict[str, ModelInfo] = {
            "flood_risk": ModelInfo(
                name="Flood Risk Prediction",
                category="Hydrological Intelligence",
                readiness_status="Research prototype",
                loaded=status_dict.get("flood_risk", False),
                primary_algorithm="Random Forest (100 trees) & XGBoost (50 estimators)",
                training_records=22,
                features=[
                    "rainfall_mm",
                    "water_level_m",
                    "danger_ratio",
                    "flow_rate_cusecs",
                    "wind_speed_kmh",
                    "latitude",
                    "longitude",
                ],
                notes="Rule-derived target labels based on CWC danger marks; uncalibrated tree ensemble probabilities.",
            ),
            "damage_prediction": ModelInfo(
                name="Disaster Damage Severity",
                category="Impact Assessment",
                readiness_status="Research prototype",
                loaded=status_dict.get("damage_prediction", False),
                primary_algorithm="Random Forest & XGBoost Multi-Class",
                training_records=22,
                features=[
                    "wind_speed_kmh",
                    "rainfall_mm",
                    "flood_depth_m",
                    "affected_population",
                    "evacuated_population",
                    "affected_households",
                ],
                notes="Trained on historical disaster returns (Michaung, Gulab, Titli, Hudhud, Phailin) and Arnab field data.",
            ),
            "anomaly_detection": ModelInfo(
                name="Atmospheric / Sensor Anomaly Detector",
                category="Telemetry Monitoring",
                readiness_status="Demonstration-ready",
                loaded=status_dict.get("anomaly_detection", False),
                primary_algorithm="Isolation Forest (Contamination=5%)",
                training_records=1564,
                features=["wind_speed_kmh", "wmo_pressure_hpa", "latitude", "longitude"],
                notes="Trained on NOAA IBTrACS cyclone track reanalysis points. Acts as an empirical atmospheric physical filter.",
            ),
            "incident_classification": ModelInfo(
                name="Emergency Incident Classifier",
                category="NLP / Dispatch Triage",
                readiness_status="Research prototype",
                loaded=status_dict.get("incident_classification", False),
                primary_algorithm="TF-IDF (1-2 ngrams) + Multinomial Logistic Regression",
                training_records=30,
                features=["text"],
                notes="Classifies distress texts across 6 categories: flood, medical, rescue, road blockage, shelter, other.",
            ),
            "yolo_detection": ModelInfo(
                name="YOLO Computer Vision Damage Detector",
                category="Computer Vision",
                readiness_status="Not available",
                loaded=False,
                primary_algorithm="YOLOv8 Object Detector",
                training_records=0,
                features=["aerial_image_rgb"],
                notes="Zero fake training data created; requires verified bounding-box aerial disaster imagery.",
            ),
        }

        loaded_count = sum(1 for m in models.values() if m.loaded)
        overall_status = "healthy" if loaded_count >= 4 else ("degraded" if loaded_count > 0 else "unavailable")

        return MLHealthResponse(
            status=overall_status,
            models_loaded_count=loaded_count,
            total_models=len(models),
            models=models,
        )


_ml_service = MLService()


def get_ml_service() -> MLService:
    return _ml_service

