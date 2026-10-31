import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CloudRain,
  Compass,
  Wind,
  Layers,
  ExternalLink,
  ShieldAlert,
  Radio,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { WeatherPage } from '@/pages/WeatherPage';

export const WeatherDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'telemetry'>('radar');
  const [fullscreenRadar, setFullscreenRadar] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CloudRain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Live Weather & Radar Intelligence Dashboard</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time Doppler precipitation radar (Windy satellite & radar feed) synchronized with hydrological telemetry
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'radar'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Doppler Radar Live</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Sensors & Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Radar Frame */}
      {activeTab === 'radar' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Zoom Earth Live Precipitation & GFS Model Map
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-[10px] font-bold">
                  VIEW: 10.332° N, 78.417° E (6z)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFullscreenRadar(!fullscreenRadar)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  {fullscreenRadar ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" /> Collapse
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" /> Expand Radar
                    </>
                  )}
                </button>
                <a
                  href="https://zoom.earth/maps/precipitation/#view=10.332,78.417,6z/model=gfs/date=2026-10-31,13:50,+5.5"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Open in Zoom Earth"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Embedded Live Weather Map (Zoom Earth Precipitation Model) */}
            <div
              className={`w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-950 transition-all ${
                fullscreenRadar ? 'h-[750px]' : 'h-[600px]'
              }`}
            >
              <iframe
                title="Live Weather Precipitation Radar"
                width="100%"
                height="100%"
                src="https://zoom.earth/maps/precipitation/#view=10.332,78.417,6z/model=gfs/date=2026-10-31,13:50,+5.5"
                frameBorder="0"
                className="w-full h-full"
                allowFullScreen
              />
            </div>

            {/* Quick Context Strip */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Coverage: Tamil Nadu, Bay of Bengal Coastal Corridor & South India Basin</span>
              <span className="font-mono">Live Doppler Radar • Updated Every 5 min</span>
            </div>
          </div>
        </div>
      ) : (
        /* River gauges, sensors, and threshold charts */
        <WeatherPage />
      )}
    </div>
  );
};
