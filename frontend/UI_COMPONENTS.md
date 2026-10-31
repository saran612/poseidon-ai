# Poseidon AI Dashboard — UI Components Directory

This document provides a comprehensive inventory of all UI components in the Poseidon dashboard (`frontend/src/components/`), categorized by architectural domain and responsibility, along with page-level views.

---

## 1. Domain & Common Components (`src/components/common/`)
Core emergency response, triage, and real-time operational components.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`KpiCard`** | [`KpiCard.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/KpiCard.tsx) | Metric tile featuring neutral background, left severity border accent, tabular figures, trend chip, and optional tier-mix breakdown. |
| **`PriorityBandChip`** | [`PriorityBandChip.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/PriorityBandChip.tsx) | Status badge dynamically resolving priority band (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) from score via `bandFromScore()`. |
| **`AssignmentCard`** | [`AssignmentCard.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/AssignmentCard.tsx) | Resource dispatch proposal card displaying route risk tooltip, evidence tier, reliability, reason link, and approval workflow. |
| **`DispatchQueueDrawer`** | [`DispatchQueueDrawer.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/DispatchQueueDrawer.tsx) | Slide-over drawer detailing pending dispatch assignments and approvals. |
| **`DecisionCardModal`** | [`DecisionCardModal.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/DecisionCardModal.tsx) | Modal dialog explaining incident priority scoring breakdown, evidence weights, and rationale. |
| **`EvidenceLedger`** | [`EvidenceLedger.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/EvidenceLedger.tsx) | Multi-source telemetry audit trail showing verified reports, sensor readings, and verification logs. |
| **`FactorBars`** | [`FactorBars.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/FactorBars.tsx) | Normalized visual bars for score dimensions: Severity (S), Vulnerability (V), Urgency (U), Exposure (E), Need (N). |
| **`ReliabilityBar`** | [`ReliabilityBar.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/ReliabilityBar.tsx) | Accessible progress bar indicating data confidence / reliability rating (0.00 – 1.00). |
| **`StaleBadge`** | [`StaleBadge.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/StaleBadge.tsx) | Visual warning indicator alerting operators when telemetry or sensor data has exceeded the staleness threshold. |
| **`TierBadge`** | [`TierBadge.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/TierBadge.tsx) | Source credibility tier indicator (`Tier 1` sensor, `Tier 2` official broadcast, `Tier 3` citizen report). |
| **`ConnectionBanner`** | [`ConnectionBanner.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/ConnectionBanner.tsx) | Real-time connectivity banner reflecting socket status (`Live`, `Reconnecting`, `Mock Simulation`). |
| **`SimulationControls`** | [`SimulationControls.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/SimulationControls.tsx) | Emergency simulation injection toolbar/popover (Close Bridge, Fill Shelter, Faulty Sensor) with playback controls. |
| **`ReplanDiffModal`** | [`ReplanDiffModal.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/ReplanDiffModal.tsx) | Automated rerouting diff viewer for reviewing affected routes when road or environmental hazards change. |
| **`CommandPalette`** | [`CommandPalette.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/common/CommandPalette.tsx) | Global quick-action search and command dialog (`Ctrl/Cmd + K`). |

---

## 2. Layout & Application Shell (`src/components/layout/` & `src/components/shell/`)
Top-level application container, responsive navigation, and user context.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`AppShell`** | [`AppShell.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/layout/AppShell.tsx) | Main responsive shell integrating sidebar, topbar header, breadcrumbs, and command palette. |
| **`Sidebar`** | [`Sidebar.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/Sidebar.tsx) | Left navigation sidebar with i18n support, active route indicator, and collapsible state. |
| **`Topbar`** | [`Topbar.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/Topbar.tsx) | Header containing search trigger, simulation toolbar, dispatch queue indicator, and user profile menu. |
| **`Breadcrumbs`** | [`Breadcrumbs.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/Breadcrumbs.tsx) | Contextual navigation breadcrumb trail. |
| **`ThemeToggle`** | [`ThemeToggle.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/ThemeToggle.tsx) | Light/dark theme switch with system preference synchronization and persistent storage. |
| **`NotificationsBell`**| [`NotificationsBell.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/NotificationsBell.tsx) | Notification bell drawer with unread counters and alert filters. |
| **`UserMenu`** | [`UserMenu.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/UserMenu.tsx) | User identity dropdown displaying operator name, organization with tooltip, role, and logout action. |
| **`FilterBar`** | [`FilterBar.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/FilterBar.tsx) | Reusable horizontal toolbar for page-level filters, status dropdowns, and search inputs. |
| **`Tabs`** | [`Tabs.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/Tabs.tsx) | Tab navigation bar for sub-views and filtered lists. |
| **`DateRangePicker`** | [`DateRangePicker.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/shell/DateRangePicker.tsx) | Temporal range selection component for historical logs and analytics. |

---

## 3. Data Presentation & Tables (`src/components/data/`)
Components for presenting complex tabular data, logs, and telemetry feeds.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`DataTable`** | [`DataTable.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/data/DataTable.tsx) | Full-featured data table supporting sorting, column filtering, pagination, selection, and empty states. |
| **`ActivityFeed`** | [`ActivityFeed.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/data/ActivityFeed.tsx) | Live chronological activity stream with event type icons, timestamps, and severity styling. |
| **`DetailDrawer`** | [`DetailDrawer.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/data/DetailDrawer.tsx) | Slide-over drawer for deep-dive inspection of selected records, incidents, or resources. |
| **`KeyValueCard`** | [`KeyValueCard.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/data/KeyValueCard.tsx) | Compact metadata inspector displaying key-value attribute pairs. |
| **`JsonViewer`** | [`JsonViewer.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/data/JsonViewer.tsx) | Formatted, syntax-highlighted JSON viewer with copy-to-clipboard functionality. |
| **`LogViewer`** | [`LogViewer.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/data/LogViewer.tsx) | Monospace virtualized log console with severity filtering, auto-scroll toggle, and search. |

---

## 4. Charts & Visualizations (`src/components/charts/`)
D3 / SVG chart components for analytics, weather trends, and risk distributions.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`LineChart`** | [`LineChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/LineChart.tsx) | Multi-series time-series trend line chart with tooltip hover points. |
| **`AreaChart`** | [`AreaChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/AreaChart.tsx) | Filled gradient area chart for continuous metric tracking (e.g. rainfall, water levels). |
| **`StackedAreaChart`**| [`StackedAreaChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/StackedAreaChart.tsx) | Stacked cumulative volume chart (e.g. incident types over time). |
| **`BarChart`** | [`BarChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/BarChart.tsx) | Categorical vertical/horizontal bar chart. |
| **`DonutChart`** | [`DonutChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/DonutChart.tsx) | Proportional donut chart for status distributions (e.g. shelter capacities, unit states). |
| **`ScatterChart`** | [`ScatterChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/ScatterChart.tsx) | 2D scatter plot visualizing correlation between vulnerability and urgency scores. |
| **`RadarChart`** | [`RadarChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/RadarChart.tsx) | Multi-axis radar/spider chart for multi-factor priority comparisons. |
| **`Heatmap`** | [`Heatmap.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/Heatmap.tsx) | 2D matrix heatmap showing temporal or geographic incident density. |
| **`Histogram`** | [`Histogram.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/Histogram.tsx) | Value distribution chart with configurable bucket intervals. |
| **`FunnelChart`** | [`FunnelChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/FunnelChart.tsx) | Triage progression funnel (Ingested → Verified → Prioritized → Dispatched). |
| **`Sparkline`** | [`Sparkline.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/charts/Sparkline.tsx) | Micro-chart designed for compact inline KPI cards and table rows. |

---

## 5. Machine Learning & Model Observability (`src/components/ml/`)
Model evaluation, explainability, calibration, and drift monitoring panels.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`ModelMetricsCard`** | [`ModelMetricsCard.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/ModelMetricsCard.tsx) | Summary card for model accuracy, F1-score, precision, recall, and latency. |
| **`CalibrationPlot`** | [`CalibrationPlot.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/CalibrationPlot.tsx) | Reliability diagram comparing predicted confidence against empirical observed frequency. |
| **`ConfusionMatrix`** | [`ConfusionMatrix.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/ConfusionMatrix.tsx) | Classification confusion matrix with normalized cell color scales. |
| **`RocPrCurve`** | [`RocPrCurve.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/RocPrCurve.tsx) | ROC and Precision-Recall evaluation curves with AUC computation. |
| **`FeatureImportanceChart`** | [`FeatureImportanceChart.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/FeatureImportanceChart.tsx) | Bar visualization of SHAP / feature attribution weights. |
| **`DriftMonitor`** | [`DriftMonitor.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/DriftMonitor.tsx) | Distribution drift tracking (PSI / KS-test) across input features over time. |
| **`AnomalyList`** | [`AnomalyList.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/AnomalyList.tsx) | List of detected anomalous inputs, unexpected sensor spikes, or outlier reports. |
| **`BaselineComparison`**| [`BaselineComparison.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/BaselineComparison.tsx) | Side-by-side metric comparison between current model run and reference baseline. |
| **`PredictionTable`** | [`PredictionTable.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/PredictionTable.tsx) | Interactive table of sample inferences with ground truth comparison. |
| **`ReviewControls`** | [`ReviewControls.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/ReviewControls.tsx) | Human-in-the-loop audit controls for overriding model classifications. |
| **`ExperimentHistoryTable`** | [`ExperimentHistoryTable.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/ExperimentHistoryTable.tsx) | Historical registry of ML training runs, hyperparameters, and checkpoints. |
| **`LlmTracePanel`** | [`LlmTracePanel.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ml/LlmTracePanel.tsx) | LLM prompt/completion inspector, token usage breakdown, and reasoning traces. |

---

## 6. KPI & Metric Gauges (`src/components/kpi/`)
Specialized visual gauge and metric display components.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`ComparisonCard`** | [`ComparisonCard.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/kpi/ComparisonCard.tsx) | Card contrasting current period values directly against historical averages. |
| **`ProgressBar`** | [`ProgressBar.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/kpi/ProgressBar.tsx) | Standard progress bar supporting custom thresholds and semantic color gradients. |
| **`RadialGauge`** | [`RadialGauge.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/kpi/RadialGauge.tsx) | Circular radial meter displaying percentage or capacity utilization. |
| **`StatGroup`** | [`StatGroup.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/kpi/StatGroup.tsx) | Layout container organizing multiple related sub-stats in a cohesive row. |
| **`StatusPill`** | [`StatusPill.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/kpi/StatusPill.tsx) | Colored rounded pill tag indicating operational state. |
| **`TrendBadge`** | [`TrendBadge.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/kpi/TrendBadge.tsx) | Chip showing delta percentage with up/down arrows (`+18%`, `-5%`). |

---

## 7. Form Controls & Inputs (`src/components/inputs/`)
Accessible interactive input components.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`Button`** | [`Button.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/Button.tsx) | Versatile button supporting primary, secondary, destructive, ghost variants and loading spinners. |
| **`SearchInput`** | [`SearchInput.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/SearchInput.tsx) | Search text field with embedded clear action and keyboard shortcuts. |
| **`Select`** | [`Select.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/Select.tsx) | Accessible dropdown select component. |
| **`Combobox`** | [`Combobox.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/Combobox.tsx) | Autocomplete combobox with filterable options list. |
| **`MultiSelect`** | [`MultiSelect.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/MultiSelect.tsx) | Multi-value selector with removable chips and keyboard navigation. |
| **`Slider`** | [`Slider.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/Slider.tsx) | Range input slider with track fill and numeric value display. |
| **`Toggle`** | [`Toggle.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/Toggle.tsx) | Boolean switch toggle with clear active/inactive visual states. |
| **`SegmentedControl`** | [`SegmentedControl.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/SegmentedControl.tsx) | Pill-style segmented button group for mutually exclusive options. |
| **`FileUpload`** | [`FileUpload.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/inputs/FileUpload.tsx) | Drag-and-drop file upload target with file type validation and upload progress. |

---

## 8. Feedback, Modals & Overlays (`src/components/feedback/`)
User feedback, state alerts, and dialog overlays.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`ConfirmDialog`** | [`ConfirmDialog.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/ConfirmDialog.tsx) | Accessible confirmation modal with keyboard trap (`Escape`/`Enter`) and explicit action gates. |
| **`EmptyState`** | [`EmptyState.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/EmptyState.tsx) | Placeholder screen when queries or lists return zero results, with call-to-action button. |
| **`ErrorState`** | [`ErrorState.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/ErrorState.tsx) | Accessible error message display with error details and retry handler. |
| **`Toast`** | [`Toast.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/Toast.tsx) | Non-blocking toast notification alert with auto-dismiss and action links. |
| **`Banner`** | [`Banner.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/Banner.tsx) | Page-width banner for critical broadcast advisories and system notices. |
| **`Tooltip`** | [`Tooltip.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/Tooltip.tsx) | Accessible hover/focus popup describing UI elements or truncated text. |
| **`Popover`** | [`Popover.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/Popover.tsx) | Floating popover container for dropdown menus and contextual action clusters. |
| **`SkeletonSet`** | [`SkeletonSet.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/SkeletonSet.tsx) | Loading skeleton placeholders mirroring cards, tables, and metric blocks. |
| **`LiveIndicator`** | [`LiveIndicator.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/feedback/LiveIndicator.tsx) | Pulsing status dot indicating real-time WebSocket connection heartbeat. |

---

## 9. Core Primitives (`src/components/ui/`)
Lightweight headless / base presentation building blocks.

| Component | File Path | Description & Purpose |
| :--- | :--- | :--- |
| **`Card`** | [`card.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ui/card.tsx) | Container surface supporting `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent`. |
| **`Badge`** | [`badge.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ui/badge.tsx) | Base badge component with semantic color variants. |
| **`Button`** | [`button.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ui/button.tsx) | Base button primitive. |
| **`Input`** | [`input.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ui/input.tsx) | Base HTML input wrapper with unified border and focus styling. |
| **`Table`** | [`table.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/components/ui/table.tsx) | Base HTML table primitives (`TableHeader`, `TableBody`, `TableRow`, `TableCell`). |

---

## 10. Dashboard Pages (`src/pages/`)
Top-level views composing the dashboard components.

| Page | File Path | Key Components Utilized |
| :--- | :--- | :--- |
| **Overview** | [`OverviewPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/OverviewPage.tsx) | `KpiCard`, `PriorityBandChip`, `AssignmentCard`, `SimulationControls`, `ConnectionBanner`, `ActivityFeed` |
| **Map** | [`MapPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/MapPage.tsx) | Leaflet Map, `TierBadge`, `PriorityBandChip`, `DetailDrawer` |
| **Priorities** | [`PrioritiesPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/PrioritiesPage.tsx) | `DataTable`, `FactorBars`, `PriorityBandChip`, `DecisionCardModal` |
| **Routing** | [`RoutingPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/RoutingPage.tsx) | `AssignmentCard`, `ReplanDiffModal`, `ConfirmDialog`, `LineChart` |
| **Resources** | [`ResourcesPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/ResourcesPage.tsx) | `DataTable`, `StatusPill`, `DonutChart`, `DetailDrawer` |
| **Shelters & Hospitals**| [`SheltersHospitalsPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/SheltersHospitalsPage.tsx) | `RadialGauge`, `DataTable`, `ComparisonCard`, `ProgressBar` |
| **Weather** | [`WeatherPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/WeatherPage.tsx) | `AreaChart`, `LineChart`, `Heatmap`, `KpiCard` |
| **Weather Dashboard** | [`WeatherDashboardPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/WeatherDashboardPage.tsx) | Multi-parameter sensor telemetry, rain gauges, wind vectors |
| **Analytics** | [`AnalyticsPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/AnalyticsPage.tsx) | `ModelMetricsCard`, `CalibrationPlot`, `ConfusionMatrix`, `DriftMonitor` |
| **Decisions** | [`DecisionsPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/DecisionsPage.tsx) | `EvidenceLedger`, `LlmTracePanel`, `ReviewControls` |
| **Logs** | [`LogsPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/LogsPage.tsx) | `LogViewer`, `DateRangePicker`, `JsonViewer` |
| **Settings** | [`SettingsPage.tsx`](file:///home/saran/projects/poseidon-ai/frontend/src/pages/SettingsPage.tsx) | `Toggle`, `Slider`, `Select`, `ThemeToggle` |
