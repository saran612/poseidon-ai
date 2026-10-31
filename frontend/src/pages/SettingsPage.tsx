import React from 'react';
import {
  Settings,
  Languages,
  Moon,
  Sun,
  Sliders,
  Bridge,
  Radio,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { realtimeClient } from '@/lib/realtime';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    audioAlertsEnabled,
    toggleAudioAlerts,
    mapTileUrl,
    setMapTileUrl,
  } = useUiStore();
  const { user } = useAuthStore();

  const handleLangChange = (lang: 'en' | 'ta' | 'hi') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          System Configuration & Simulation Sandbox
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adjust operator preferences, localization, map tile providers, and test synthetic failure injection
        </p>
      </div>

      {/* Grid */}
      <div className="space-y-4 text-xs">
        {/* Localization & Theme */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            Language & Interface Theme
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Dashboard Language
              </label>
              <div className="flex gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ta', label: 'தமிழ் (Tamil)' },
                  { code: 'hi', label: 'हिन्दी (Hindi)' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handleLangChange(item.code as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                      language === item.code
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Color Palette Theme
              </label>
              <button
                onClick={toggleTheme}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold flex items-center gap-2"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>Active: {theme === 'dark' ? 'Dark Mode' : 'Light Enterprise Mode'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Tile Source */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Map Raster Tile Source
          </h3>
          <p className="text-slate-500">
            Tile URL configurable via environment variable or custom self-hosted endpoint.
          </p>
          <input
            type="text"
            value={mapTileUrl}
            onChange={(e) => setMapTileUrl(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
          />
        </div>

        {/* Mock-Mode Synthetic Event Injection Controls */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <Bridge className="w-4 h-4 text-rose-600" />
            <span>Synthetic Scenario Fault & Event Injectors</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Trigger simulated physical events to stress-test human-in-the-loop workflows, dynamic replanning, and algorithmic isolation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => realtimeClient.triggerBridgeClosure()}
              className="p-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Bridge className="w-4 h-4" />
              Close Musi River Bridge
            </button>
            <button
              onClick={() => realtimeClient.triggerFillShelter()}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              Fill Shelter to 100%
            </button>
            <button
              onClick={() => realtimeClient.triggerFaultySensor()}
              className="p-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              Inject Faulty Sensor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
