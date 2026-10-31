/**
 * @file Sample fixture datasets for testing and verification only.
 * @description These datasets are strictly for testing and demos. Production components must receive data via props.
 */

export interface SampleNavigationItem {
  id: string
  label: string
  href: string
  iconName?: string
  badge?: string | number
  active?: boolean
}

export const sampleNavigationItems: SampleNavigationItem[] = [
  { id: "overview", label: "Overview", href: "#overview", active: true },
  { id: "analytics", label: "Analytics", href: "#analytics" },
  { id: "models", label: "Model Registry", href: "#models", badge: 3 },
  { id: "deployments", label: "Deployments", href: "#deployments" },
  { id: "settings", label: "Settings", href: "#settings" },
]

export const sampleBreadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Engineering", href: "/engineering" },
  { label: "ML Telemetry", href: "/engineering/ml", current: true },
]

export const sampleUser = {
  name: "Sarah Chen",
  email: "s.chen@apple-design.internal",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  role: "Principal ML Engineer",
}

export const sampleNotifications = [
  { id: "n1", title: "Model Drift Alert", message: "Embedding drift exceeded 0.08 on evaluation split.", time: "10m ago", unread: true },
  { id: "n2", title: "Deployment Healthy", message: "Inference v2.4 successfully scaled to 8 pods.", time: "1h ago", unread: false },
]

export const sampleKpiMetrics = [
  { label: "Inference Throughput", value: "4,820", unit: "req/s", delta: 12.4, trend: "up" as const, period: "vs last hour" },
  { label: "P99 Latency", value: "18.2", unit: "ms", delta: -3.8, trend: "down" as const, period: "vs baseline" },
  { label: "F1 Score (Validation)", value: "0.942", unit: "", delta: 0.8, trend: "up" as const, period: "vs epoch 20" },
  { label: "GPU Memory Utilized", value: "76.4", unit: "%", delta: 4.1, trend: "up" as const, period: "vs yesterday" },
]

export const sampleSparklineData = [
  { value: 42 }, { value: 45 }, { value: 40 }, { value: 48 }, { value: 52 },
  { value: 58 }, { value: 54 }, { value: 65 }, { value: 68 }, { value: 72 },
]

export const sampleTimeSeriesData = [
  { timestamp: "00:00", requests: 1200, errors: 4, latency: 14 },
  { timestamp: "04:00", requests: 800, errors: 1, latency: 12 },
  { timestamp: "08:00", requests: 3400, errors: 12, latency: 18 },
  { timestamp: "12:00", requests: 5600, errors: 18, latency: 22 },
  { timestamp: "16:00", requests: 4900, errors: 9, latency: 17 },
  { timestamp: "20:00", requests: 3800, errors: 7, latency: 15 },
]

export const sampleBarChartData = [
  { category: "Vision Transformer", train: 94.2, test: 91.8 },
  { category: "ResNet-50", train: 88.5, test: 86.1 },
  { category: "BERT Large", train: 96.0, test: 93.4 },
  { category: "LLaMA 3 8B", train: 98.1, test: 95.6 },
]

export const sampleDonutData = [
  { name: "Direct Cache", value: 64 },
  { name: "Vector Index", value: 24 },
  { name: "Cold Storage", value: 12 },
]

export const sampleRadarData = [
  { subject: "Accuracy", score: 92, benchmark: 85 },
  { subject: "Latency", score: 88, benchmark: 80 },
  { subject: "Robustness", score: 95, benchmark: 90 },
  { subject: "Fairness", score: 89, benchmark: 85 },
  { subject: "Efficiency", score: 94, benchmark: 75 },
]

export const sampleScatterData = [
  { x: 12, y: 88, z: 200 },
  { x: 18, y: 92, z: 400 },
  { x: 24, y: 94, z: 600 },
  { x: 32, y: 95, z: 800 },
  { x: 45, y: 96, z: 1200 },
]

export const sampleFunnelData = [
  { stage: "Total Requests", count: 100000 },
  { stage: "Prompt Screened", count: 98500 },
  { stage: "Cache Miss", count: 42000 },
  { stage: "Model Inference", count: 41800 },
  { stage: "Output Verified", count: 41650 },
]

export const sampleConfusionMatrix = {
  split: "validation_v1.4",
  labels: ["Benign", "Suspicious", "Malicious"],
  matrix: [
    [1420, 32, 8],
    [24, 480, 16],
    [5, 12, 590],
  ],
}

export const sampleRocPoints = [
  { fpr: 0.0, tpr: 0.0 },
  { fpr: 0.02, tpr: 0.65 },
  { fpr: 0.05, tpr: 0.84 },
  { fpr: 0.1, tpr: 0.92 },
  { fpr: 0.2, tpr: 0.96 },
  { fpr: 0.5, tpr: 0.99 },
  { fpr: 1.0, tpr: 1.0 },
]

export const sampleFeatureImportance = [
  { feature: "token_entropy", importance: 0.38, category: "Structural" },
  { feature: "embedding_cosine_sim", importance: 0.26, category: "Semantic" },
  { feature: "prompt_length", importance: 0.18, category: "Lexical" },
  { feature: "repetition_ratio", importance: 0.11, category: "Lexical" },
  { feature: "temperature_setting", importance: 0.07, category: "Parametric" },
]

export const sampleLlmTrace = {
  traceId: "tr-94829-axf",
  timestamp: "2026-10-30T15:45:12Z",
  prompt: "Synthesize the user feedback on authentication latency and recommend next steps.",
  response: "Based on 42 telemetry logs, latency spikes correlate with peak token validation times in OAuth microservice. Recommend introducing JWT session caching.",
  latencyMs: 342,
  tokensIn: 84,
  tokensOut: 48,
  model: "gemini-1.5-pro",
  costUsd: 0.00034,
}

export const sampleDriftMetrics = [
  { feature: "input_length", psi: 0.042, status: "stable" as const, threshold: 0.1 },
  { feature: "embedding_norm", psi: 0.148, status: "warning" as const, threshold: 0.1 },
  { feature: "out_of_vocab_rate", psi: 0.021, status: "stable" as const, threshold: 0.1 },
  { feature: "response_sentiment", psi: 0.220, status: "critical" as const, threshold: 0.2 },
]
