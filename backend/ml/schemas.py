from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


# ==============================================================================
# 1. FLOOD RISK SCHEMAS
# ==============================================================================
class FloodPredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    rainfall_mm: float = Field(
        ..., ge=0.0, le=1500.0, description="24-hr cumulative precipitation in mm", examples=[245.8]
    )
    water_level_m: float = Field(
        ..., ge=0.0, le=100.0, description="Current river/barrage stage in meters", examples=[14.85]
    )
    danger_level_m: float = Field(
        ..., gt=0.0, le=100.0, description="Official CWC danger level threshold in meters", examples=[14.75]
    )
    flow_rate_cusecs: float = Field(
        ..., ge=0.0, le=10000000.0, description="Discharge outflow rate in cusecs", examples=[985000.0]
    )
    wind_speed_kmh: float = Field(
        ..., ge=0.0, le=350.0, description="Surface wind velocity in km/h", examples=[125.0]
    )
    latitude: float = Field(
        ..., ge=-90.0, le=90.0, description="Observation station latitude (WGS84)", examples=[16.94]
    )
    longitude: float = Field(
        ..., ge=-180.0, le=180.0, description="Observation station longitude (WGS84)", examples=[81.76]
    )
    model_type: Literal["rf", "xgb"] = Field(
        "rf", description="Inference model: 'rf' (Random Forest) or 'xgb' (XGBoost)"
    )


class FloodPredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    predicted_risk_category: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    model_used: str
    uncalibrated_confidence: float = Field(
        ..., description="Raw ensemble voting fraction (uncalibrated probability)"
    )
    class_probabilities: Dict[str, float]
    danger_ratio: float
    feature_contributions: Dict[str, float]
    audit_notes: str = (
        "Research prototype: Probabilities reflect uncalibrated tree ensemble vote fractions. "
        "Target label derived from CWC hydraulic thresholds."
    )


# ==============================================================================
# 2. DISASTER DAMAGE SCHEMAS
# ==============================================================================
class DamagePredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    wind_speed_kmh: float = Field(..., ge=0.0, le=350.0, description="Peak wind speed in km/h", examples=[135.0])
    rainfall_mm: float = Field(..., ge=0.0, le=1500.0, description="24-hr storm rainfall in mm", examples=[264.5])
    flood_depth_m: float = Field(..., ge=0.0, le=20.0, description="Inundation/surge depth in meters", examples=[1.85])
    affected_population: int = Field(..., ge=0, description="Estimated exposed population", examples=[54000])
    evacuated_population: int = Field(..., ge=0, description="Total persons evacuated", examples=[18500])
    affected_households: int = Field(..., ge=0, description="Affected households count", examples=[14200])
    model_type: Literal["rf", "xgb"] = Field("rf", description="Model architecture")


class DamagePredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    predicted_severity: Literal["MODERATE", "HIGH", "CRITICAL", "CATASTROPHIC"]
    model_used: str
    uncalibrated_confidence: float
    class_probabilities: Dict[str, float]
    evacuation_ratio: float
    audit_notes: str = (
        "Research prototype: Trained on historical disaster returns and provisional field reports. "
        "Subject to within-storm spatial generalization."
    )


# ==============================================================================
# 3. SENSOR ANOMALY DETECTION SCHEMAS
# ==============================================================================
class AnomalyDetectionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    wind_speed_kmh: float = Field(..., ge=0.0, le=350.0, description="Wind speed in km/h", examples=[155.0])
    wmo_pressure_hpa: float = Field(
        ..., ge=800.0, le=1060.0, description="Atmospheric pressure in hPa/mbar", examples=[965.0]
    )
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude", examples=[16.4])
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude", examples=[81.9])


class AnomalyDetectionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    is_anomaly: bool
    status: Literal["ANOMALY_DETECTED", "NORMAL_TELEMETRY"]
    anomaly_score: float = Field(..., description="Isolation Forest decision score; < 0 denotes anomaly")
    threshold: float = 0.0
    explanation: str
    provenance_notes: str = (
        "Demonstration-ready: Trained on NOAA IBTrACS historical cyclone track reanalysis points. "
        "Acts as a meteorological envelope and track intensity screener."
    )


# ==============================================================================
# 4. EMERGENCY INCIDENT CLASSIFICATION SCHEMAS
# ==============================================================================
class IncidentClassificationRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Distress report, helpline transcript, or field message",
        examples=["High sea water entered village main street with 1.5m tidal waterlogging, families stranded on rooftops"],
    )


class IncidentClassificationResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    input_text: str
    predicted_category: str
    confidence: float
    category_probabilities: Dict[str, float]
    recommended_action: str
    audit_notes: str = (
        "Research prototype: TF-IDF + Multinomial Logistic Regression trained on multi-agency dispatch reports."
    )


# ==============================================================================
# 5. MODEL HEALTH & CATALOG SCHEMAS
# ==============================================================================
class ModelInfo(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    name: str
    category: str
    readiness_status: Literal[
        "Demonstration-ready", "Research prototype", "Requires additional validation", "Not available"
    ]
    loaded: bool
    primary_algorithm: str
    training_records: int
    features: List[str]
    notes: str


class MLHealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    models_loaded_count: int
    total_models: int
    models: Dict[str, ModelInfo]
