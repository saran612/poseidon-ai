import logging
import os
from typing import Any, Dict, Optional
import joblib

logger = logging.getLogger("poseidon.ml")

MODELS_BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")


class MLModelLoader:
    """
    Thread-safe Singleton Model Loader for SAHAYA AI Disaster Intelligence.
    Loads models into memory once at application startup.
    Catches errors gracefully to prevent crashing unrelated services.
    """

    _instance: Optional["MLModelLoader"] = None

    def __init__(self, models_dir: str = MODELS_BASE_DIR):
        self.models_dir = models_dir
        self.is_loaded = False

        # Model containers
        self.flood_preproc: Optional[Dict[str, Any]] = None
        self.rf_flood: Optional[Any] = None
        self.xgb_flood: Optional[Any] = None

        self.damage_preproc: Optional[Dict[str, Any]] = None
        self.rf_damage: Optional[Any] = None
        self.xgb_damage: Optional[Any] = None

        self.anomaly_preproc: Optional[Dict[str, Any]] = None
        self.iso_forest: Optional[Any] = None

        self.incident_tfidf: Optional[Any] = None
        self.incident_lr: Optional[Any] = None
        self.incident_le: Optional[Any] = None

        # Track loaded status for each component
        self.status: Dict[str, bool] = {
            "flood_risk": False,
            "damage_prediction": False,
            "anomaly_detection": False,
            "incident_classification": False,
            "yolo_detection": False,
        }

    @classmethod
    def get_instance(cls, models_dir: str = MODELS_BASE_DIR) -> "MLModelLoader":
        if cls._instance is None:
            cls._instance = cls(models_dir)
        return cls._instance

    def load_models(self) -> None:
        """Loads all available models from disk."""
        logger.info(f"Loading SAHAYA Disaster Intelligence ML models from: {self.models_dir}")

        # 1. Flood Risk Models
        try:
            fl_dir = os.path.join(self.models_dir, "flood_risk")
            self.flood_preproc = joblib.load(os.path.join(fl_dir, "flood_risk_preprocessor.joblib"))
            self.rf_flood = joblib.load(os.path.join(fl_dir, "random_forest_flood_risk.joblib"))
            self.xgb_flood = joblib.load(os.path.join(fl_dir, "xgboost_flood_risk.joblib"))
            self.status["flood_risk"] = True
            logger.info("  [OK] Flood Risk Models loaded (RF & XGBoost)")
        except Exception as e:
            logger.warning(f"  [WARN] Failed to load Flood Risk models: {e}")
            self.status["flood_risk"] = False

        # 2. Damage Severity Models
        try:
            dmg_dir = os.path.join(self.models_dir, "damage_prediction")
            self.damage_preproc = joblib.load(os.path.join(dmg_dir, "damage_preprocessor.joblib"))
            self.rf_damage = joblib.load(os.path.join(dmg_dir, "random_forest_damage.joblib"))
            self.xgb_damage = joblib.load(os.path.join(dmg_dir, "xgboost_damage.joblib"))
            self.status["damage_prediction"] = True
            logger.info("  [OK] Damage Severity Models loaded (RF & XGBoost)")
        except Exception as e:
            logger.warning(f"  [WARN] Failed to load Damage Severity models: {e}")
            self.status["damage_prediction"] = False

        # 3. Sensor Anomaly Detection Model
        try:
            anom_dir = os.path.join(self.models_dir, "anomaly_detection")
            self.anomaly_preproc = joblib.load(os.path.join(anom_dir, "anomaly_scaler.joblib"))
            self.iso_forest = joblib.load(os.path.join(anom_dir, "isolation_forest.joblib"))
            self.status["anomaly_detection"] = True
            logger.info("  [OK] Sensor Anomaly Detection Model loaded (Isolation Forest)")
        except Exception as e:
            logger.warning(f"  [WARN] Failed to load Anomaly Detection model: {e}")
            self.status["anomaly_detection"] = False

        # 4. Emergency Incident Classification Models
        try:
            inc_dir = os.path.join(self.models_dir, "incident_classification")
            self.incident_tfidf = joblib.load(os.path.join(inc_dir, "tfidf_vectorizer.joblib"))
            self.incident_lr = joblib.load(os.path.join(inc_dir, "logistic_regression_incident.joblib"))
            self.incident_le = joblib.load(os.path.join(inc_dir, "incident_label_encoder.joblib"))
            self.status["incident_classification"] = True
            logger.info("  [OK] Emergency Incident Classifier loaded (TF-IDF + LR)")
        except Exception as e:
            logger.warning(f"  [WARN] Failed to load Incident Classifier models: {e}")
            self.status["incident_classification"] = False

        # 5. YOLO Detection Status Check (Check without fabricating)
        yolo_path = os.path.join(self.models_dir, "yolo_detection", "yolo_status.txt")
        if os.path.exists(yolo_path):
            with open(yolo_path, "r", encoding="utf-8") as f:
                content = f.read()
                self.status["yolo_detection"] = "TRAINED_AVAILABLE" in content
        else:
            self.status["yolo_detection"] = False

        self.is_loaded = any(self.status.values())
        logger.info(f"ML Model Loading Complete: {sum(1 for v in self.status.values() if v)}/5 components active.")


def get_model_loader() -> MLModelLoader:
    loader = MLModelLoader.get_instance()
    if not loader.is_loaded:
        loader.load_models()
    return loader
