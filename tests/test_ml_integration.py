import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ml_health_and_models(client: AsyncClient):
    """Verify ML health endpoint returns all models and their provenance status."""
    resp = await client.get("/api/v1/ml/health")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] in ["healthy", "degraded"]
    assert data["total_models"] == 5
    assert data["models_loaded_count"] >= 4

    models = data["models"]
    assert "flood_risk" in models
    assert "damage_prediction" in models
    assert "anomaly_detection" in models
    assert "incident_classification" in models
    assert "yolo_detection" in models

    # Confirm YOLO is honestly marked as unavailable
    assert models["yolo_detection"]["loaded"] is False
    assert models["yolo_detection"]["readiness_status"] == "Not available"

    # Also test GET /api/v1/ml/models
    models_resp = await client.get("/api/v1/ml/models")
    assert models_resp.status_code == 200


@pytest.mark.asyncio
async def test_ml_flood_prediction(client: AsyncClient):
    """Test flood risk prediction endpoint for heavy rainfall scenario."""
    payload = {
        "rainfall_mm": 255.0,
        "water_level_m": 15.2,
        "danger_level_m": 14.75,
        "flow_rate_cusecs": 1020000.0,
        "wind_speed_kmh": 130.0,
        "latitude": 16.94,
        "longitude": 81.76,
        "model_type": "rf",
    }
    resp = await client.post("/api/v1/ml/flood/predict", json=payload)
    assert resp.status_code == 200
    res = resp.json()

    assert res["predicted_risk_category"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "uncalibrated_confidence" in res
    assert 0.0 <= res["uncalibrated_confidence"] <= 1.0
    assert "class_probabilities" in res
    assert res["danger_ratio"] > 1.0
    assert "feature_contributions" in res

    # Test XGBoost model type
    payload["model_type"] = "xgb"
    xgb_resp = await client.post("/api/v1/ml/flood/predict", json=payload)
    assert xgb_resp.status_code == 200

    # Also test via direct /api/ml/flood/predict route
    direct_resp = await client.post("/api/ml/flood/predict", json=payload)
    assert direct_resp.status_code == 200


@pytest.mark.asyncio
async def test_ml_damage_prediction(client: AsyncClient):
    """Test disaster damage severity prediction endpoint."""
    payload = {
        "wind_speed_kmh": 135.0,
        "rainfall_mm": 264.5,
        "flood_depth_m": 1.85,
        "affected_population": 54000,
        "evacuated_population": 18500,
        "affected_households": 14200,
        "model_type": "rf",
    }
    resp = await client.post("/api/v1/ml/damage/predict", json=payload)
    assert resp.status_code == 200
    res = resp.json()

    assert res["predicted_severity"] in ["MODERATE", "HIGH", "CRITICAL", "CATASTROPHIC"]
    assert 0.0 <= res["uncalibrated_confidence"] <= 1.0
    assert "class_probabilities" in res
    assert 0.0 <= res["evacuation_ratio"] <= 1.0


@pytest.mark.asyncio
async def test_ml_anomaly_detection(client: AsyncClient):
    """Test sensor anomaly detection endpoint for normal and severe cyclone telemetry."""
    # 1. Normal atmospheric reading
    normal_payload = {
        "wind_speed_kmh": 45.0,
        "wmo_pressure_hpa": 1005.0,
        "latitude": 16.5,
        "longitude": 82.0,
    }
    resp_norm = await client.post("/api/v1/ml/anomaly/detect", json=normal_payload)
    assert resp_norm.status_code == 200
    res_norm = resp_norm.json()
    assert res_norm["status"] == "NORMAL_TELEMETRY"
    assert res_norm["is_anomaly"] is False
    assert res_norm["anomaly_score"] > 0.0

    # 2. Extreme Cyclonic Anomaly reading
    anom_payload = {
        "wind_speed_kmh": 165.0,
        "wmo_pressure_hpa": 955.0,
        "latitude": 16.4,
        "longitude": 81.9,
    }
    resp_anom = await client.post("/api/v1/ml/anomaly/detect", json=anom_payload)
    assert resp_anom.status_code == 200
    res_anom = resp_anom.json()
    assert res_anom["status"] == "ANOMALY_DETECTED"
    assert res_anom["is_anomaly"] is True
    assert res_anom["anomaly_score"] < 0.0


@pytest.mark.asyncio
async def test_ml_incident_classification(client: AsyncClient):
    """Test emergency incident classification for distress text."""
    payload = {
        "text": "Seawater entered our colony and families are stranded on the second floor, send rescue boats immediately"
    }
    resp = await client.post("/api/v1/ml/incident/classify", json=payload)
    assert resp.status_code == 200
    res = resp.json()

    assert res["predicted_category"] in [
        "flood",
        "medical_emergency",
        "rescue_request",
        "road_blockage",
        "shelter_request",
        "other",
    ]
    assert 0.0 <= res["confidence"] <= 1.0
    assert "recommended_action" in res


@pytest.mark.asyncio
async def test_ml_invalid_input_handling(client: AsyncClient):
    """Verify input validation errors return 422 Unprocessable Entity."""
    # Negative rainfall
    invalid_flood = {
        "rainfall_mm": -50.0,
        "water_level_m": 15.2,
        "danger_level_m": 14.75,
        "flow_rate_cusecs": 1020000.0,
        "wind_speed_kmh": 130.0,
        "latitude": 16.94,
        "longitude": 81.76,
    }
    resp = await client.post("/api/v1/ml/flood/predict", json=invalid_flood)
    assert resp.status_code == 422

    # Empty text in incident classification
    empty_incident = {"text": ""}
    resp_empty = await client.post("/api/v1/ml/incident/classify", json=empty_incident)
    assert resp_empty.status_code == 422

