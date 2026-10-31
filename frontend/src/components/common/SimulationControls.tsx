import React from 'react';
import { Play, Pause, FastForward, ShieldAlert, Bridge, RefreshCw } from 'lucide-react';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { realtimeClient } from '@/lib/realtime';

export const SimulationControls: React.FC = () => {
  const { simSpeed, setSimSpeed, isPaused, togglePause, simTime } = useRealtimeStore();

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
      {/* Simulation Clock */}
      <div className="px-2 font-mono text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {simTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

      {/* Pause / Play */}
      <button
        onClick={togglePause}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
      >
        {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
      </button>

      {/* Speed 1x, 2x, 5x */}
      <div className="flex items-center rounded bg-slate-200/70 dark:bg-slate-900 p-0.5">
        {([1, 2, 5] as const).map((speed) => (
          <button
            key={speed}
            onClick={() => setSimSpeed(speed)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
              simSpeed === speed
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

      {/* Quick Inject: Close Bridge (Key Demo Action!) */}
      <button
        onClick={() => realtimeClient.triggerBridgeClosure()}
        title="Inject Bridge Closure: Closes Perur Noyyal Bridge & Triggers Replan Diff"
        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors shadow-xs"
      >
        <Bridge className="w-3.5 h-3.5" />
        <span>Close Bridge</span>
      </button>

      {/* Quick Inject: Fill Shelter */}
      <button
        onClick={() => realtimeClient.triggerFillShelter()}
        title="Inject Shelter Overflow: Sets Arts College to 100% capacity"
        className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium text-[11px] transition-colors"
      >
        Fill Shelter
      </button>

      {/* Quick Inject: Faulty Sensor */}
      <button
        onClick={() => realtimeClient.triggerFaultySensor()}
        title="Inject Faulty Sensor: Spikes Singanallur flow sensor to 999"
        className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium text-[11px] transition-colors"
      >
        Faulty Sensor
      </button>
    </div>
  );
};
