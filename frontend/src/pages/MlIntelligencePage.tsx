import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  BrainCircuit,
  CloudRain,
  Home,
  Radio,
  MessageSquareWarning,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Cpu,
  RefreshCw,
  Send,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import {
  mlApi,
  FloodPredictionRequest,
  FloodPredictionResponse,
  DamagePredictionRequest,
  DamagePredictionResponse,
  AnomalyDetectionRequest,
  AnomalyDetectionResponse,
  IncidentClassificationRequest,
  IncidentClassificationResponse,
} from '@/lib/mlApi';

export const MlIntelligencePage: React.FC = () => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'flood' | 'damage' | 'anomaly' | 'incident'>('flood');

  // Query ML Models Health
  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['ml-health'],
    queryFn: mlApi.getHealth,
    staleTime: 1000 * 30,
  });

  // ==========================================
  // 1. FLOOD RISK FORM STATE
  // ==========================================
  const [floodForm, setFloodForm] = useState<FloodPredictionRequest>({
    rainfall_mm: 245.8,
    water_level_m: 14.85,
    danger_level_m: 14.75,
    flow_rate_cusecs: 985000,
    wind_speed_kmh: 125,
    latitude: 16.94,
    longitude: 81.76,
    model_type: 'rf',
  });

  const floodMutation = useMutation({
    mutationFn: mlApi.predictFlood,
  });

  // ==========================================
  // 2. DAMAGE PREDICTION FORM STATE
  // ==========================================
  const [damageForm, setDamageForm] = useState<DamagePredictionRequest>({
    wind_speed_kmh: 135,
    rainfall_mm: 264.5,
    flood_depth_m: 1.85,
    affected_population: 54000,
    evacuated_population: 18500,
    affected_households: 14200,
    model_type: 'xgb',
  });

  const damageMutation = useMutation({
    mutationFn: mlApi.predictDamage,
  });

  // ==========================================
  // 3. ANOMALY DETECTION FORM STATE
  // ==========================================
  const [anomalyForm, setAnomalyForm] = useState<AnomalyDetectionRequest>({
    wind_speed_kmh: 155,
    wmo_pressure_hpa: 965,
    latitude: 16.4,
    longitude: 81.9,
  });

  const anomalyMutation = useMutation({
    mutationFn: mlApi.detectAnomaly,
  });

  // ==========================================
  // 4. INCIDENT CLASSIFICATION FORM STATE
  // ==========================================
  const [incidentForm, setIncidentForm] = useState<IncidentClassificationRequest>({
    text: 'High sea water entered village main street with 1.5m tidal waterlogging, families stranded on rooftops requiring immediate boat rescue.',
  });

  const incidentMutation = useMutation({
    mutationFn: mlApi.classifyIncident,
  });

  // Badge Color Mapping
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
      case 'CATASTROPHIC':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              SAHAYA AI Disaster Intelligence & Predictive Inference
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical multi-hazard predictive models: Flood Stage Classification, Disaster Damage Estimation, Telemetry Anomaly Detection, and Distress Dispatch NLP
          </p>
        </div>

        <button
          onClick={() => refetchHealth()}
          disabled={isHealthLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isHealthLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Model Status</span>
        </button>
      </div>

      {/* Model Catalog Health Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Model Catalog & Validation Status</h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {healthData ? `${healthData.models_loaded_count}/${healthData.total_models} Models Ready` : 'Checking...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {healthData &&
            Object.entries(healthData.models).map(([key, model]) => {
              const isLoaded = model.loaded;
              const isAvailable = model.readiness_status !== 'Not available';

              return (
                <div
                  key={key}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                    isLoaded
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20'
                      : isAvailable
                      ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white truncate" title={model.name}>
                      {model.name}
                    </span>
                    {isLoaded ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {model.primary_algorithm}
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded ${
                        model.readiness_status === 'Demonstration-ready'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : model.readiness_status === 'Research prototype'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {model.readiness_status}
                    </span>
                    <span className="font-mono text-slate-500">N={model.training_records}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('flood')}
          className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'flood'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <CloudRain className="w-4 h-4" />
          <span>Flood Risk Prediction</span>
        </button>

        <button
          onClick={() => setActiveTab('damage')}
          className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'damage'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Disaster Damage Severity</span>
        </button>

        <button
          onClick={() => setActiveTab('anomaly')}
          className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'anomaly'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Sensor Anomaly Detection</span>
        </button>

        <button
          onClick={() => setActiveTab('incident')}
          className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'incident'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span>Emergency Incident NLP</span>
        </button>
      </div>

      {/* Tab Panels */}
      {/* 1. FLOOD RISK TAB */}
      {activeTab === 'flood' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Hydraulic & Precipitation Input Parameters</span>
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFloodForm({
                      rainfall_mm: 245.8,
                      water_level_m: 14.85,
                      danger_level_m: 14.75,
                      flow_rate_cusecs: 985000,
                      wind_speed_kmh: 125,
                      latitude: 16.94,
                      longitude: 81.76,
                      model_type: 'rf',
                    })
                  }
                  className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Dowleswaram Arnab
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFloodForm({
                      rainfall_mm: 22.0,
                      water_level_m: 11.5,
                      danger_level_m: 14.75,
                      flow_rate_cusecs: 85000,
                      wind_speed_kmh: 25,
                      latitude: 16.94,
                      longitude: 81.76,
                      model_type: 'rf',
                    })
                  }
                  className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Ambient Normal
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                floodMutation.mutate(floodForm);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    24-hr Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1500"
                    value={floodForm.rainfall_mm}
                    onChange={(e) => setFloodForm({ ...floodForm, rainfall_mm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gauge Stage (meters)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="100"
                    value={floodForm.water_level_m}
                    onChange={(e) => setFloodForm({ ...floodForm, water_level_m: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Danger Mark Level (meters)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="100"
                    value={floodForm.danger_level_m}
                    onChange={(e) => setFloodForm({ ...floodForm, danger_level_m: parseFloat(e.target.value) || 0.1 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discharge Outflow (cusecs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    value={floodForm.flow_rate_cusecs}
                    onChange={(e) => setFloodForm({ ...floodForm, flow_rate_cusecs: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wind Speed (km/h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="350"
                    value={floodForm.wind_speed_kmh}
                    onChange={(e) => setFloodForm({ ...floodForm, wind_speed_kmh: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.01"
                    value={floodForm.latitude}
                    onChange={(e) => setFloodForm({ ...floodForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.01"
                    value={floodForm.longitude}
                    onChange={(e) => setFloodForm({ ...floodForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Model Architecture</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="fl_model"
                      value="rf"
                      checked={floodForm.model_type === 'rf'}
                      onChange={() => setFloodForm({ ...floodForm, model_type: 'rf' })}
                    />
                    <span>Random Forest (100 Trees)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="fl_model"
                      value="xgb"
                      checked={floodForm.model_type === 'xgb'}
                      onChange={() => setFloodForm({ ...floodForm, model_type: 'xgb' })}
                    />
                    <span>XGBoost Gradient Boosting</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={floodMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition"
              >
                {floodMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Predicting Flood Stage...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run Flood Risk Prediction</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Display */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">
              Hydrological Inference Result
            </h3>

            {floodMutation.error && (
              <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Error: {(floodMutation.error as Error).message}</span>
              </div>
            )}

            {floodMutation.data ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Predicted Risk Category
                    </span>
                    <div className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
                      {floodMutation.data.predicted_risk_category}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Model: {floodMutation.data.model_used}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${getSeverityBadge(
                        floodMutation.data.predicted_risk_category
                      )}`}
                    >
                      {floodMutation.data.predicted_risk_category} RISK
                    </span>
                    <div className="text-xs font-mono text-slate-500 mt-2">
                      Danger Ratio: {(floodMutation.data.danger_ratio * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Class Probabilities */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Model Output Class Distribution (Uncalibrated):
                  </span>
                  <div className="space-y-1.5">
                    {Object.entries(floodMutation.data.class_probabilities).map(([cls, prob]) => (
                      <div key={cls} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{cls}</span>
                          <span className="font-mono text-slate-500">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cls === 'CRITICAL'
                                ? 'bg-rose-500'
                                : cls === 'HIGH'
                                ? 'bg-amber-500'
                                : cls === 'MODERATE'
                                ? 'bg-blue-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(prob * 100, 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contributing Features */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Contributing Factor Pressures:</span>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    {Object.entries(floodMutation.data.feature_contributions).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b pb-1 dark:border-slate-800">
                        <span className="capitalize text-slate-500">{k.replace('_', ' ')}:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {(v * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">{floodMutation.data.audit_notes}</p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Click &quot;Run Flood Risk Prediction&quot; to test the live ML model pipeline.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DAMAGE PREDICTION TAB */}
      {activeTab === 'damage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-indigo-500" />
                <span>Storm Exposure & Demographic Features</span>
              </h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                damageMutation.mutate(damageForm);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wind Speed (km/h)
                  </label>
                  <input
                    type="number"
                    value={damageForm.wind_speed_kmh}
                    onChange={(e) => setDamageForm({ ...damageForm, wind_speed_kmh: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rainfall (mm)</label>
                  <input
                    type="number"
                    value={damageForm.rainfall_mm}
                    onChange={(e) => setDamageForm({ ...damageForm, rainfall_mm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Flood Depth (m)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={damageForm.flood_depth_m}
                    onChange={(e) => setDamageForm({ ...damageForm, flood_depth_m: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Affected Population
                  </label>
                  <input
                    type="number"
                    value={damageForm.affected_population}
                    onChange={(e) =>
                      setDamageForm({ ...damageForm, affected_population: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evacuated</label>
                  <input
                    type="number"
                    value={damageForm.evacuated_population}
                    onChange={(e) =>
                      setDamageForm({ ...damageForm, evacuated_population: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Households</label>
                  <input
                    type="number"
                    value={damageForm.affected_households}
                    onChange={(e) =>
                      setDamageForm({ ...damageForm, affected_households: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={damageMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition"
              >
                {damageMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Predicting Damage Severity...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run Damage Severity Prediction</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">
              Impact Assessment Result
            </h3>

            {damageMutation.data ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Predicted Severity
                    </span>
                    <div className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
                      {damageMutation.data.predicted_severity}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Model: {damageMutation.data.model_used}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${getSeverityBadge(
                        damageMutation.data.predicted_severity
                      )}`}
                    >
                      {damageMutation.data.predicted_severity}
                    </span>
                    <div className="text-xs font-mono text-slate-500 mt-2">
                      Evacuated: {(damageMutation.data.evacuation_ratio * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Class Probabilities:</span>
                  <div className="space-y-1.5">
                    {Object.entries(damageMutation.data.class_probabilities).map(([cls, prob]) => (
                      <div key={cls} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{cls}</span>
                          <span className="font-mono text-slate-500">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.max(prob * 100, 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">{damageMutation.data.audit_notes}</p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Submit storm parameters to predict structural and economic severity.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ANOMALY DETECTION TAB */}
      {activeTab === 'anomaly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-500" />
                <span>Atmospheric Telemetry Vectors</span>
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAnomalyForm({
                      wind_speed_kmh: 155,
                      wmo_pressure_hpa: 965,
                      latitude: 16.4,
                      longitude: 81.9,
                    })
                  }
                  className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Severe Vortex
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAnomalyForm({
                      wind_speed_kmh: 40,
                      wmo_pressure_hpa: 1008,
                      latitude: 16.5,
                      longitude: 82.0,
                    })
                  }
                  className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Normal Ambient
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                anomalyMutation.mutate(anomalyForm);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wind Speed (km/h)
                  </label>
                  <input
                    type="number"
                    value={anomalyForm.wind_speed_kmh}
                    onChange={(e) => setAnomalyForm({ ...anomalyForm, wind_speed_kmh: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Barometric Pressure (hPa)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={anomalyForm.wmo_pressure_hpa}
                    onChange={(e) =>
                      setAnomalyForm({ ...anomalyForm, wmo_pressure_hpa: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.01"
                    value={anomalyForm.latitude}
                    onChange={(e) => setAnomalyForm({ ...anomalyForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.01"
                    value={anomalyForm.longitude}
                    onChange={(e) => setAnomalyForm({ ...anomalyForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={anomalyMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition"
              >
                {anomalyMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Anomaly Density...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Detect Telemetry Anomaly</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">
              Isolation Forest Anomaly Assessment
            </h3>

            {anomalyMutation.data ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    anomalyMutation.data.is_anomaly
                      ? 'border-rose-300 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30'
                      : 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
                  }`}
                >
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Classification
                    </span>
                    <div
                      className={`text-xl font-black mt-0.5 ${
                        anomalyMutation.data.is_anomaly
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {anomalyMutation.data.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white dark:bg-slate-800 border">
                      Score: {anomalyMutation.data.anomaly_score.toFixed(4)}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">Threshold: &lt; 0.0000</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Physical Interpretation:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {anomalyMutation.data.explanation}
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 italic">{anomalyMutation.data.provenance_notes}</p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Submit atmospheric parameters to evaluate isolation forest density scores.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. INCIDENT CLASSIFICATION TAB */}
      {activeTab === 'incident' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquareWarning className="w-4 h-4 text-indigo-500" />
                <span>Helpline / Citizen Distress Message</span>
              </h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                incidentMutation.mutate(incidentForm);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Transcript Text
                </label>
                <textarea
                  rows={4}
                  value={incidentForm.text}
                  onChange={(e) => setIncidentForm({ text: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
                  placeholder="Enter citizen distress call or emergency field dispatch message..."
                  required
                />
              </div>

              {/* Sample Presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold">Test Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setIncidentForm({
                        text: 'High tidal surge flooded main street with 1.5m waterlogging, 30 families trapped on roof.',
                      })
                    }
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Flood / Inundation
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIncidentForm({
                        text: 'Dialysis patient collapsed in relief camp, breathing difficulty, urgent ambulance required.',
                      })
                    }
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Medical Emergency
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIncidentForm({
                        text: 'Massive banyan tree uprooted across bypass road, power poles broken, evacuation ambulance route cut off.',
                      })
                    }
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Road Blockage
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIncidentForm({
                        text: 'Fishermen colony homes washed away by high storm surge, need shelter and food packets.',
                      })
                    }
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Shelter Request
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={incidentMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition"
              >
                {incidentMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Classifying Distress Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Classify Distress Incident</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">
              NLP Classification & Dispatch Routing
            </h3>

            {incidentMutation.data ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Predicted Incident Class
                    </span>
                    <div className="text-xl font-black mt-0.5 uppercase text-indigo-600 dark:text-indigo-400">
                      {incidentMutation.data.predicted_category.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-white dark:bg-slate-800 border">
                      Confidence: {(incidentMutation.data.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/20 text-xs space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300">Autonomous Dispatch Protocol:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {incidentMutation.data.recommended_action}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Probabilities:</span>
                  <div className="space-y-1">
                    {Object.entries(incidentMutation.data.category_probabilities).map(([cat, prob]) => (
                      <div key={cat} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="capitalize text-slate-600 dark:text-slate-400">{cat.replace('_', ' ')}</span>
                          <span className="font-mono text-slate-500">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${Math.max(prob * 100, 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">{incidentMutation.data.audit_notes}</p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Submit an emergency helpline message to trigger automated classification.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default MlIntelligencePage;
