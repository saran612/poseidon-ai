import React, { useState } from 'react';
import {
  CloudRain,
  Compass,
  Wind,
  ExternalLink,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { WeatherPage } from '@/pages/WeatherPage';

export const WeatherDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'telemetry'>('radar');
  const [radarProvider, setRadarProvider] = useState<'windy' | 'zoomearth'>('windy');
  const [fullscreenRadar, setFullscreenRadar] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const zoomEarthUrl =
    'https://zoom.earth/maps/precipitation/#view=10.332,78.417,6z/model=gfs/date=2026-10-31,13:50,+5.5';
  
  // Windy live precipitation radar embed centered on exact coordinates 10.33° N, 78.41° E (Tamil Nadu)
  const windyEmbedUrl =
    'https://embed.windy.com/embed2.html?lat=10.332&lon=78.417&detailLat=10.332&detailLon=78.417&width=100%25&height=600&zoom=6&level=surface&overlay=radar&product=radar&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1';

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
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-xs font-bold'
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
                  {radarProvider === 'windy'
                    ? 'Windy Live Doppler Radar & Cloud Layer'
                    : 'Zoom Earth GFS Precipitation Model'}
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-[10px] font-bold">
                  10.332° N, 78.417° E
                </span>
              </div>

              {/* Provider switcher + actions */}
              <div className="flex items-center gap-2">
                {/* Switch between Windy (iframe supported) and Zoom Earth */}
                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setRadarProvider('windy');
                      setIframeError(false);
                    }}
                    className={`px-2.5 py-1 rounded transition-all ${
                      radarProvider === 'windy'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Windy Radar (Live Stream)
                  </button>
                  <button
                    onClick={() => setRadarProvider('zoomearth')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      radarProvider === 'zoomearth'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Zoom Earth GFS
                  </button>
                </div>

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
                      <Maximize2 className="w-3.5 h-3.5" /> Expand
                    </>
                  )}
                </button>

                <a
                  href={radarProvider === 'zoomearth' ? zoomEarthUrl : 'https://www.windy.com'}
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

            {/* Note about Zoom Earth X-Frame-Options */}
            {radarProvider === 'zoomearth' && (
              <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Browser Security Note:</strong> Zoom Earth sets <code>X-Frame-Options: SAMEORIGIN</code> which some browsers restrict inside iframes. If blank, click "Open in Zoom Earth" or switch to <strong>Windy Radar</strong>.
                  </span>
                </div>
                <a
                  href={zoomEarthUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
                >
                  Open in Zoom Earth ↗
                </a>
              </div>
            )}

            {/* Embedded Live Weather Map */}
            <div
              className={`w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-950 transition-all ${
                fullscreenRadar ? 'h-[750px]' : 'h-[600px]'
              }`}
            >
              <iframe
                title="Live Weather Precipitation Radar"
                width="100%"
                height="100%"
                src={radarProvider === 'windy' ? windyEmbedUrl : zoomEarthUrl}
                frameBorder="0"
                className="w-full h-full"
                allowFullScreen
              />
            </div>

            {/* Quick Context Strip */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Coverage: Tamil Nadu, Bay of Bengal Coastal Corridor & South India Basin</span>
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
