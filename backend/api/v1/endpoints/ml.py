import logging
from fastapi import APIRouter, HTTPException, status
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
)
from backend.ml.service import get_ml_service

logger = logging.getLogger("poseidon.api.ml")
router = APIRouter()


@router.post(
    "/flood/predict",
    response_model=FloodPredictionResponse,
    summary="Predict Flood Risk Category",
    description="Predicts flood severity ('LOW', 'MODERATE', 'HIGH', 'CRITICAL') using Random Forest or XGBoost.",
)
async def predict_flood(req: FloodPredictionRequest):
    try:
        service = get_ml_service()
        return service.predict_flood(req)
    except RuntimeError as e:
        logger.error(f"Flood prediction service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in flood prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Inference error: {str(e)}"
        )


@router.post(
    "/damage/predict",
    response_model=DamagePredictionResponse,
    summary="Predict Disaster Damage Severity",
    description="Predicts damage severity ('MODERATE', 'HIGH', 'CRITICAL', 'CATASTROPHIC') from storm variables.",
)
async def predict_damage(req: DamagePredictionRequest):
    try:
        service = get_ml_service()
        return service.predict_damage(req)
    except RuntimeError as e:
        logger.error(f"Damage prediction service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in damage prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Inference error: {str(e)}"
        )


@router.post(
    "/anomaly/detect",
    response_model=AnomalyDetectionResponse,
    summary="Detect Sensor / Track Meteorological Anomaly",
    description="Identifies abnormal pressure drops and extreme wind conditions using Isolation Forest.",
)
async def detect_anomaly(req: AnomalyDetectionRequest):
    try:
        service = get_ml_service()
        return service.detect_anomaly(req)
    except RuntimeError as e:
        logger.error(f"Anomaly detection service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in anomaly detection: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Inference error: {str(e)}"
        )


@router.post(
    "/incident/classify",
    response_model=IncidentClassificationResponse,
    summary="Classify Emergency Distress Incident",
    description="Classifies citizen helpline and field messages into 6 disaster operational categories.",
)
async def classify_incident(req: IncidentClassificationRequest):
    try:
        service = get_ml_service()
        return service.classify_incident(req)
    except RuntimeError as e:
        logger.error(f"Incident classification service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in incident classification: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Inference error: {str(e)}"
        )


@router.get(
    "/health",
    response_model=MLHealthResponse,
    summary="ML Intelligence Health & Status",
    description="Returns loading status, active algorithms, and scientific provenance for all 5 models.",
)
async def ml_health():
    service = get_ml_service()
    return service.get_health()


@router.get(
    "/models",
    response_model=MLHealthResponse,
    summary="Model Catalog & Audit Metadata",
    description="Detailed registry of ML models, training records, feature schemas, and validation status.",
)
async def ml_models():
    service = get_ml_service()
    return service.get_health()

