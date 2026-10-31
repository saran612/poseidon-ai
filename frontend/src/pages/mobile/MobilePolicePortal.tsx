import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  MapPin,
  Radio,
  Siren,
  Phone,
  Navigation,
  Compass,
} from 'lucide-react';

interface RoadClosure {
  id: string;
  name: string;
  sector: string;
  status: 'CLOSED' | 'PARTIALLY_BLOCKED' | 'CLEAR';
  waterDepthCm: number;
  diversionRoute: string;
  officerInCharge: string;
}

export const MobilePolicePortal: React.FC = () => {
  const [closures, setClosures] = useState<RoadClosure[]>([
    {
      id: 'ROAD-01',
      name: 'Sungam Bypass Flyover Underpass',
      sector: 'Sector 3 - South Traffic Division',
      status: 'CLOSED',
      waterDepthCm: 95,
      diversionRoute: 'Divert via Trichy Road flyover upper ramp',
      officerInCharge: 'SI Karthik (P-42)',
    },
    {
      id: 'ROAD-02',
      name: 'Ukkadam - Valankulam Lake bund arterial road',
      sector: 'Sector 2 - West Traffic Division',
      status: 'CLOSED',
      waterDepthCm: 110,
      diversionRoute: 'Strict barricade; divert toward Perur main link',
      officerInCharge: 'Insp. Natarajan (P-18)',
    },
    {
      id: 'ROAD-03',
      name: 'Avinashi Road underpass (VOC Park link)',
      sector: 'Sector 1 - Central Zone',
      status: 'PARTIALLY_BLOCKED',
      waterDepthCm: 35,
      diversionRoute: 'Single lane open for emergency ambulances only',
      officerInCharge: 'HC Shanmugam (P-07)',
    },
  ]);

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const toggleClosure = (id: string) => {
    setClosures((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next =
            r.status === 'CLOSED'
              ? 'PARTIALLY_BLOCKED'
              : r.status === 'PARTIALLY_BLOCKED'
              ? 'CLEAR'
              : 'CLOSED';
          return { ...r, status: next };
        }
        return r;
      })
    );
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage('');
    }, 3500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md flex items-center justify-between border border-blue-800">
        <div>
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="font-bold text-base md:text-lg">Police & Traffic Control Command</h2>
          </div>
          <p className="text-xs text-blue-200 mt-0.5">
            Perimeter Security, Inundation Barricades & Rapid Green Corridors
          </p>
        </div>
        <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-mono font-bold">
          High Alert
        </span>
      </div>

      {/* Instant Green Corridor / Traffic Flash */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Broadcast Green Corridor / Rapid Closure Advisory
          </h3>
        </div>

        {broadcastSent && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
            <span>Emergency Traffic Flash dispatched to all mobile patrol PCR units & Field Radios!</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-2 text-xs">
          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            required
            rows={2}
            placeholder="e.g. FLASH: Clear all civilian traffic on Trichy Rd toward Govt GH for 3 incoming rescue ambulances."
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Auto-routes to 14 Mobile Patrol Vehicles</span>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors"
            >
              Push Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* Inundated Roads & Barricade Enforcement */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Road Blockade & Barricade Enforcement
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Tap status to cycle</span>
        </div>

        <div className="space-y-2.5">
          {closures.map((road) => (
            <div
              key={road.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{road.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">({road.id})</span>
                  </div>
                  <span className="text-slate-500 text-[11px] block mt-0.5">{road.sector}</span>
                </div>
                <button
                  onClick={() => toggleClosure(road.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    road.status === 'CLOSED'
                      ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                      : road.status === 'PARTIALLY_BLOCKED'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {road.status === 'CLOSED' ? '🛑 BARRICADED' : road.status === 'PARTIALLY_BLOCKED' ? '⚠️ 1-LANE ONLY' : '✅ OPEN'}
                </button>
              </div>

              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    Water Inundation: {road.waterDepthCm} cm
                  </span>
                  <span className="text-slate-400">Field Unit: {road.officerInCharge}</span>
                </div>
                <div className="text-slate-500 flex items-start gap-1">
                  <Navigation className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                  <span>{road.diversionRoute}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

