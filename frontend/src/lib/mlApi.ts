/**
 * SAHAYA Machine Learning Intelligence API Client
 * Connects React UI to FastAPI backend endpoints with full TypeScript safety.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface FloodPredictionRequest {
  rainfall_mm: number;
  water_level_m: number;
  danger_level_m: number;
  flow_rate_cusecs: number;
  wind_speed_kmh: number;
  latitude: number;
  longitude: number;
  model_type: 'rf' | 'xgb';
}

export interface FloodPredictionResponse {
  predicted_risk_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  model_used: string;
  uncalibrated_confidence: number;
  class_probabilities: Record<string, number>;
  danger_ratio: number;
  feature_contributions: Record<string, number>;
  audit_notes: string;
}

export interface DamagePredictionRequest {
  wind_speed_kmh: number;
  rainfall_mm: number;
  flood_depth_m: number;
  affected_population: number;
  evacuated_population: number;
  affected_households: number;
  model_type: 'rf' | 'xgb';
}

export interface DamagePredictionResponse {
  predicted_severity: 'MODERATE' | 'HIGH' | 'CRITICAL' | 'CATASTROPHIC';
  model_used: string;
  uncalibrated_confidence: number;
  class_probabilities: Record<string, number>;
  evacuation_ratio: number;
  audit_notes: string;
}

export interface AnomalyDetectionRequest {
  wind_speed_kmh: number;
  wmo_pressure_hpa: number;
  latitude: number;
  longitude: number;
}

export interface AnomalyDetectionResponse {
  is_anomaly: boolean;
  status: 'ANOMALY_DETECTED' | 'NORMAL_TELEMETRY';
  anomaly_score: number;
  threshold: number;
  explanation: string;
  provenance_notes: string;
}

export interface IncidentClassificationRequest {
  text: string;
}

export interface IncidentClassificationResponse {
  input_text: string;
  predicted_category: string;
  confidence: number;
  category_probabilities: Record<string, number>;
  recommended_action: string;
  audit_notes: string;
}

export interface ModelInfo {
  name: string;
  category: string;
  readiness_status: 'Demonstration-ready' | 'Research prototype' | 'Requires additional validation' | 'Not available';
  loaded: boolean;
  primary_algorithm: string;
  training_records: number;
  features: string[];
  notes: string;
}

export interface MLHealthResponse {
  status: string;
  models_loaded_count: number;
  total_models: number;
  models: Record<string, ModelInfo>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `API error ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const mlApi = {
  getHealth: async (): Promise<MLHealthResponse> => {
    const res = await fetch(`${API_BASE}/ml/health`);
    return handleResponse<MLHealthResponse>(res);
  },

  getModels: async (): Promise<MLHealthResponse> => {
    const res = await fetch(`${API_BASE}/ml/models`);
    return handleResponse<MLHealthResponse>(res);
  },

  predictFlood: async (data: FloodPredictionRequest): Promise<FloodPredictionResponse> => {
    const res = await fetch(`${API_BASE}/ml/flood/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<FloodPredictionResponse>(res);
  },

  predictDamage: async (data: DamagePredictionRequest): Promise<DamagePredictionResponse> => {
    const res = await fetch(`${API_BASE}/ml/damage/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<DamagePredictionResponse>(res);
  },

  detectAnomaly: async (data: AnomalyDetectionRequest): Promise<AnomalyDetectionResponse> => {
    const res = await fetch(`${API_BASE}/ml/anomaly/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AnomalyDetectionResponse>(res);
  },

  classifyIncident: async (data: IncidentClassificationRequest): Promise<IncidentClassificationResponse> => {
    const res = await fetch(`${API_BASE}/ml/incident/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<IncidentClassificationResponse>(res);
  },
};
