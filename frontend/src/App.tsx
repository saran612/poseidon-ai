import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/comp/layout/AppShell';
import { realtimeClient } from '@/lib/realtime';

const OverviewPage = lazy(() => import('@/pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const MapPage = lazy(() => import('@/pages/MapPage').then(m => ({ default: m.MapPage })));
const PrioritiesPage = lazy(() => import('@/pages/PrioritiesPage').then(m => ({ default: m.PrioritiesPage })));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const SheltersHospitalsPage = lazy(() => import('@/pages/SheltersHospitalsPage').then(m => ({ default: m.SheltersHospitalsPage })));
const RoutingPage = lazy(() => import('@/pages/RoutingPage').then(m => ({ default: m.RoutingPage })));
const DecisionsPage = lazy(() => import('@/pages/DecisionsPage').then(m => ({ default: m.DecisionsPage })));
const WeatherDashboardPage = lazy(() => import('@/pages/WeatherDashboardPage').then(m => ({ default: m.WeatherDashboardPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const MlIntelligencePage = lazy(() => import('@/pages/MlIntelligencePage').then(m => ({ default: m.MlIntelligencePage })));
const LogsPage = lazy(() => import('@/pages/LogsPage').then(m => ({ default: m.LogsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize WebSocket & Mock Simulation pipeline
realtimeClient.init(queryClient);

export const App: React.FC = () => {
  React.useEffect(() => {
    const stored = localStorage.getItem('poseidon-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-black">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<OverviewPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="priorities" element={<PrioritiesPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="shelters" element={<SheltersHospitalsPage />} />
              <Route path="routing" element={<RoutingPage />} />
              <Route path="decisions" element={<DecisionsPage />} />
              <Route path="weather" element={<WeatherDashboardPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="ml-intelligence" element={<MlIntelligencePage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
