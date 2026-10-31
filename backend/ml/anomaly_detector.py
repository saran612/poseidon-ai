import pandas as pd
from backend.ml.model_loader import get_model_loader
from backend.ml.schemas import AnomalyDetectionRequest, AnomalyDetectionResponse


class AnomalyDetector:
    """Inference service for Meteorological Sensor / Track Anomaly Detection."""

    def __init__(self):
        self.loader = get_model_loader()

    def detect(self, req: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
        if not self.loader.status.get("anomaly_detection") or self.loader.anomaly_preproc is None:
            raise RuntimeError("Anomaly Detection model is not loaded. Check model files.")

        preproc = self.loader.anomaly_preproc
        features = preproc["features"]
        scaler = preproc["scaler"]
        iso_model = self.loader.iso_forest

        input_dict = {
            "wind_speed_kmh": req.wind_speed_kmh,
            "wmo_pressure_hpa": req.wmo_pressure_hpa,
            "latitude": req.latitude,
            "longitude": req.longitude,
        }

        df_row = pd.DataFrame([input_dict])[features]
        row_scaled = scaler.transform(df_row)

        pred = iso_model.predict(row_scaled)[0]
        score = float(iso_model.decision_function(row_scaled)[0])

        is_anom = bool(pred == -1)

        if is_anom:
            if req.wmo_pressure_hpa < 970.0 and req.wind_speed_kmh > 120.0:
                explanation = "Severe tropical cyclonic vortex detected: deep barometric pressure deficit coupled with high sustained wind."
            elif req.wmo_pressure_hpa < 960.0:
                explanation = "Abnormal central pressure deficit (< 960 hPa) exceeding regional 99th percentile."
            elif req.wind_speed_kmh > 140.0:
                explanation = "Extreme surface wind gust velocity exceeding standard operational safety boundaries."
            else:
                explanation = "Atypical atmospheric multi-parameter vector diverging from historical regional envelope."
        else:
            explanation = "Atmospheric observations fall within expected historical baseline envelope."

        return AnomalyDetectionResponse(
            is_anomaly=is_anom,
            status="ANOMALY_DETECTED" if is_anom else "NORMAL_TELEMETRY",
            anomaly_score=round(score, 4),
            threshold=0.0,
            explanation=explanation,
        )


_anomaly_detector = AnomalyDetector()


def get_anomaly_detector() -> AnomalyDetector:
    return _anomaly_detector

