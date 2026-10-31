import React, { useState } from 'react';
import {
  CloudRain,
  Compass,
  Wind,
  ExternalLink,
} from 'lucide-react';
import { WeatherPage } from '@/pages/WeatherPage';

export const WeatherDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'telemetry'>('radar');


  // Windy live precipitation radar embed centered on Vijayawada (16.506° N, 80.648° E)
  // Configured with Rain, Thunder overlay preset for Cyclone Arnab
  const windyEmbedUrl =
    'https://embed.windy.com/embed2.html?lat=16.506&lon=80.648&detailLat=16.506&detailLon=80.648&width=100%25&height=600&zoom=7&level=surface&overlay=rain&product=rain&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1';



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
            Real-time Doppler precipitation radar synchronized with river stage and rainfall telemetry
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'radar'
                  ? 'bg-white dark:bg-black text-blue-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Live Radar & Clouds</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-white dark:bg-black text-blue-600 dark:text-white shadow-xs font-bold'
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
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Windy Live Rain, Thunder & Precipitation Map
                </h3>

                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-[10px] font-bold">
                  16.506° N, 80.648° E (Vijayawada)
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href="https://www.windy.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:underline border border-blue-200 dark:border-blue-900"
                  title="Open live radar feed in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Fullscreen</span>
                </a>
              </div>
            </div>

            {/* Embedded Live Weather Map - Always Expanded */}
            <div className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-950 h-[780px]">
              <iframe
                title="Live Weather Precipitation Radar"
                width="100%"
                height="100%"
                src={windyEmbedUrl}
                frameBorder="0"
                className="w-full h-full"
                allowFullScreen
              />
            </div>

            {/* Quick Context Strip */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Coverage: Cyclone Arnab Track — Vijayawada (Prakasam Barrage, Krishna River & Budameru Basins)</span>
              <span className="font-mono">Live Doppler Radar • Updated in Real Time</span>
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
