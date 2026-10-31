import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewPage } from '@/pages/OverviewPage';
import { MapPage } from '@/pages/MapPage';
import { PrioritiesPage } from '@/pages/PrioritiesPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { SheltersHospitalsPage } from '@/pages/SheltersHospitalsPage';
import { RoutingPage } from '@/pages/RoutingPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { WeatherDashboardPage } from '@/pages/WeatherDashboardPage';
import { WeatherPage } from '@/pages/WeatherPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { MlIntelligencePage } from '@/pages/MlIntelligencePage';
import { LogsPage } from '@/pages/LogsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { realtimeClient } from '@/lib/realtime';

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
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
