import React, { useState } from 'react';
import { Play, Pause, Bridge, SlidersHorizontal, Check, Droplets, Activity } from 'lucide-react';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { realtimeClient } from '@/lib/realtime';

export const SimulationControls: React.FC = () => {
  const { simSpeed, setSimSpeed, isPaused, togglePause, simTime } = useRealtimeStore();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCloseBridge = () => {
    realtimeClient.triggerBridgeClosure();
    showToast('Injected Perur Bridge closure! Autonomous replan diff generated.');
  };

  const handleFillShelter = () => {
    realtimeClient.triggerFillShelter();
    showToast('Injected shelter capacity overflow (100% full at Arts College).');
  };

  const handleFaultySensor = () => {
    realtimeClient.triggerFaultySensor();
    showToast('Injected sensor failure on Singanallur flow meter (spiked to 999).');
  };

  return (
    <div className="relative flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
      {/* Simulation Clock with clear Simulated label */}
      <div className="px-2 font-mono text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5" title="Simulated Mission Clock">
        <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-bold uppercase">Simulated</span>
        <span>{simTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

      {/* Pause / Play */}
      <button
        type="button"
        onClick={togglePause}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        aria-label={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
      >
        {isPaused ? <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" /> : <Pause className="w-4 h-4" />}
      </button>

      {/* Speed Controls (1x, 2x, 5x) */}
      <div className="flex items-center rounded bg-slate-200/80 dark:bg-black p-0.5" role="group" aria-label="Simulation speed">
        {([1, 2, 5] as const).map((speed) => (
          <button
            type="button"
            key={speed}
            onClick={() => setSimSpeed(speed)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
              simSpeed === speed
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={`Set simulation speed to ${speed}x`}
          >
            {speed}x
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

      {/* Simulation Tools Popover Trigger */}
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition-colors"
        title="Open synthetic fault and event injection controls"
        aria-expanded={popoverOpen}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Simulation</span>
      </button>

      {/* Simulation Popover */}
      {popoverOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white">Synthetic Event Injectors</span>
            <span className="text-[10px] text-slate-400 font-mono">Real-time mock</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={handleCloseBridge}
              className="w-full p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 text-rose-800 dark:text-rose-300 text-left flex items-start gap-2 transition-colors"
            >
              <Bridge className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Close Perur Bridge</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Triggers flood severance and replanning</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleFillShelter}
              className="w-full p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-left flex items-start gap-2 transition-colors"
            >
              <Droplets className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Fill Shelter to 100%</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Forces shelter rerouting & triage</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleFaultySensor}
              className="w-full p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 text-blue-800 dark:text-blue-300 text-left flex items-start gap-2 transition-colors"
            >
              <Activity className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-bold">Inject Faulty Sensor</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Spikes Singanallur flow to 999 cusecs</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
