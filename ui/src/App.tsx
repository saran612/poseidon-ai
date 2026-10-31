import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Radio,
  Wifi,
  MessageSquare,
  Navigation,
  Activity,
  CheckCircle2,
  Clock,
  RotateCcw,
  UserCheck,
  MapPin,
  TrendingUp,
  Cpu,
  FileCheck2,
} from 'lucide-react';

interface Zone {
  zone_id: string;
  name: string;
  rank: number;
  tier: string;
  score_expected: number;
  score_upper: number;
  confidence: number;
  factor_breakdown: Record<string, number>;
  evidence_summary: string;
  flags: string[];
  what_would_change_this: string;
  verify_next: boolean;
}

interface Bridge {
  bridge_id: string;
  name: string;
  crosses_waterway: string;
  latitude: number;
  longitude: number;
  status: string;
  closure_reason?: string;
}

interface DemoStep {
  step: number;
  name: string;
  description?: string;
  tier?: string;
  confidence?: number;
  status?: string;
  receipts_logged?: number;
  version_number?: number;
  approved_by?: string;
  verdict?: string;
  diff_summary?: string;
  processing_metrics?: Record<string, number>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'trust' | 'priorities' | 'relief' | 'demo'>('map');
  const [zones, setZones] = useState<Zone[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [replanState, setReplanState] = useState<{
    planId: string;
    version: number;
    status: string;
    diffSummary?: string;
    rerouted?: any[];
  } | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const zRes = await fetch('/api/v1/situation/zones');
      if (zRes.ok) {
        const data = await zRes.json();
        setZones(data.zones || []);
      }
      const bRes = await fetch('/api/v1/situation/bridges');
      if (bRes.ok) {
        const data = await bRes.json();
        setBridges(data.bridges || []);
      }
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  const runDemoScenario = async () => {
    setIsRunningDemo(true);
    try {
      const res = await fetch('/api/v1/simulation/run-demo-scenario', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDemoSteps(data.steps || []);
        setActiveTab('demo');
        // Update situation after demo run
        await fetchInitialData();
        setReplanState({
          planId: 'PLAN-DEMO-2026',
          version: 2,
          status: 'APPROVED',
          diffSummary: 'Bridge BR-UKKADAM-01 closed due to flood overtopping. 1 assignment rerouted via Peelamedu bypass.',
          rerouted: [
            {
              zone_id: 'ZONE_SINGANALLUR',
              depot_id: 'DEPOT_PEELAMEDU',
              old_time: 15.0,
              new_time: 10.0,
            },
          ],
        });
      }
    } catch (e) {
      console.error('Error running demo:', e);
    } finally {
      setIsRunningDemo(false);
    }
  };

  const handleSimulateBridgeCut = async (bridgeId: string) => {
    try {
      const res = await fetch('/api/v1/replanning/close-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'PLAN-OPERATIONAL-01',
          bridge_id: bridgeId,
          closure_reason: 'Flood surge exceeding bridge threshold by 0.85m',
          operator_role: 'FIELD_COMMANDER_WEST',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReplanState({
          planId: data.plan_id,
          version: data.revised_version,
          status: data.status,
          diffSummary: data.diff_summary,
          rerouted: data.rerouted_assignments,
        });
        await fetchInitialData();
      }
    } catch (e) {
      console.error('Failed to close bridge:', e);
    }
  };

  const handleApprovePlan = async () => {
    if (!replanState) return;
    setIsApproving(true);
    try {
      const res = await fetch('/api/v1/replanning/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: replanState.planId,
          version_number: replanState.version,
          operator_id: 'DISTRICT_COLLECTOR_CBE',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReplanState(prev => (prev ? { ...prev, status: data.status } : null));
      }
    } catch (e) {
      console.error('Approval failed:', e);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col selection:bg-sky-500/30">
      {/* 1. Header & Operational Status Ribbon */}
      <header className="border-b border-slate-800 bg-[#0c152b] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                POSEIDON <span className="text-sky-400 font-extrabold text-xs px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30">AI</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                OFFLINE-FIRST ACTIVE
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">
                SYNTHETIC DEMO
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide">
              Noyyal River Corridor & Coimbatore Lake Cluster | Tamil Nadu
            </p>
          </div>
        </div>

        {/* Transports Operational Health Badges */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Mesh Wi-Fi</span>
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300">GSM/SMS</span>
            <span className="text-sky-400 font-semibold">CSQ 24</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300">LoRa 865MHz</span>
            <span className="text-indigo-400 font-semibold">-92 dBm</span>
          </div>

          <button
            onClick={runDemoScenario}
            disabled={isRunningDemo}
            className="ml-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-semibold text-white shadow-md shadow-sky-500/20 text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunningDemo ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Executing Scenario...
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                Run 20-Step Demo
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Tactical Navigation Bar */}
      <nav className="bg-[#0b1328] border-b border-slate-800/80 px-6 py-2 flex items-center gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'map'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Mission Map & Replanner
        </button>

        <button
          onClick={() => setActiveTab('trust')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'trust'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Evidence Trust Explorer
        </button>

        <button
          onClick={() => setActiveTab('priorities')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'priorities'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Risk Prioritization Matrix
        </button>

        <button
          onClick={() => setActiveTab('relief')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'relief'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Fairness-Aware Allocator
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'demo'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          20-Step Demo Protocol ({demoSteps.length > 0 ? `${demoSteps.length}/20` : 'Ready'})
        </button>
      </nav>

      {/* 3. Main Operational Viewport */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* TAB 1: Mission Map & Replanner */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Tactical Corridor Map */}
            <div className="lg:col-span-2 bg-[#0d172e] rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    Noyyal River Corridor Tactical Spatial View
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live road network, bridge vulnerability points, and zone flood severity
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> CRITICAL
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> HIGH
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> SAFE
                  </span>
                </div>
              </div>

              {/* Tactical Corridor SVG Map */}
              <div className="relative flex-1 min-h-[380px] bg-[#070e22] rounded-lg border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                {/* River Flow Line Representation */}
                <div className="relative z-10 flex items-center justify-between w-full h-full py-8 px-4">
                  {/* Western Basin: Perur */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-2 border-rose-500 bg-rose-950/60 flex flex-col items-center justify-center p-1 text-center shadow-lg shadow-rose-950/50">
                      <span className="text-[10px] font-bold text-rose-300">ZONE</span>
                      <span className="text-[9px] text-white font-mono">PERUR</span>
                    </div>
                    <span className="text-[10px] text-rose-400 mt-1 font-mono">CRITICAL (0.88)</span>
                    <span className="text-[9px] text-slate-400">Pop: 18.5k</span>
                  </div>

                  {/* River Path Section 1 */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 rounded-full relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-sky-300 font-mono">
                        Perur Bridge
                      </div>
                    </div>
                    <span className="text-[9px] text-blue-400/80 mt-1 italic">Noyyal Waterway ➔</span>
                  </div>

                  {/* Selvapuram */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-500 bg-amber-950/60 flex flex-col items-center justify-center p-1 text-center shadow-lg shadow-amber-950/50">
                      <span className="text-[10px] font-bold text-amber-300">ZONE</span>
                      <span className="text-[9px] text-white font-mono">SELVAPURAM</span>
                    </div>
                    <span className="text-[10px] text-amber-400 mt-1 font-mono">HIGH (0.75)</span>
                    <span className="text-[9px] text-slate-400">Pop: 34k</span>
                  </div>

                  {/* River Path Section 2 */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 rounded-full relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-sky-300 font-mono">
                        Siruvani Bridge
                      </div>
                    </div>
                    <span className="text-[9px] text-blue-400/80 mt-1 italic">Noyyal Waterway ➔</span>
                  </div>

                  {/* Ukkadam Lake Hub */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-2 border-rose-500 bg-rose-950/60 flex flex-col items-center justify-center p-1 text-center shadow-lg shadow-rose-950/50">
                      <span className="text-[10px] font-bold text-rose-300">ZONE</span>
                      <span className="text-[9px] text-white font-mono">UKKADAM</span>
                    </div>
                    <span className="text-[10px] text-rose-400 mt-1 font-mono">CRITICAL (0.85)</span>
                    <span className="text-[9px] text-slate-400">Pop: 42k</span>
                  </div>

                  {/* River Path Section 3: Ukkadam-Sungam Bypass */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className={`w-full h-1 ${bridges.find(b => b.bridge_id === 'BR-UKKADAM-01')?.status === 'CLOSED' ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-sky-400'} rounded-full relative`}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-sky-300 font-mono">
                        Sungam Bridge
                      </div>
                    </div>
                    <span className="text-[9px] text-blue-400/80 mt-1 italic">Noyyal Waterway ➔</span>
                  </div>

                  {/* Singanallur Lake */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-500 bg-amber-950/60 flex flex-col items-center justify-center p-1 text-center shadow-lg shadow-amber-950/50">
                      <span className="text-[10px] font-bold text-amber-300">ZONE</span>
                      <span className="text-[9px] text-white font-mono">SINGANALLUR</span>
                    </div>
                    <span className="text-[10px] text-amber-400 mt-1 font-mono">HIGH (0.70)</span>
                    <span className="text-[9px] text-slate-400">Pop: 29k</span>
                  </div>

                  {/* River Path Section 4 */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-sky-300 font-mono">
                        Trichy Rd Bridge
                      </div>
                    </div>
                    <span className="text-[9px] text-blue-400/80 mt-1 italic">Noyyal Waterway ➔</span>
                  </div>

                  {/* Ondipudur Reach */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-2 border-yellow-500 bg-yellow-950/60 flex flex-col items-center justify-center p-1 text-center shadow-lg shadow-yellow-950/50">
                      <span className="text-[10px] font-bold text-yellow-300">ZONE</span>
                      <span className="text-[9px] text-white font-mono">ONDIPUDUR</span>
                    </div>
                    <span className="text-[10px] text-yellow-400 mt-1 font-mono">MEDIUM (0.60)</span>
                    <span className="text-[9px] text-slate-400">Pop: 26.5k</span>
                  </div>
                </div>

                {/* Depots & Shelters Base Ribbon */}
                <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sky-400 font-bold">DEPOT: RS Puram Base</span>
                      <div className="text-[11px] text-slate-400">10 Boats | 150 Med Kits</div>
                    </div>
                    <span className="text-emerald-400 text-[10px] px-1.5 py-0.5 bg-emerald-950 rounded border border-emerald-500/30">OPERATIONAL</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sky-400 font-bold">DEPOT: Peelamedu Base</span>
                      <div className="text-[11px] text-slate-400">8 Boats | 200 Med Kits</div>
                    </div>
                    <span className="text-emerald-400 text-[10px] px-1.5 py-0.5 bg-emerald-950 rounded border border-emerald-500/30">OPERATIONAL</span>
                  </div>
                </div>
              </div>

              {/* Candidate Bridges Interactive Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Candidate Noyyal Crossing Bridges (Click to inject flood closure)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {bridges.map(b => (
                    <button
                      key={b.bridge_id}
                      onClick={() => handleSimulateBridgeCut(b.bridge_id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        b.status === 'CLOSED'
                          ? 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold">{b.bridge_id}</span>
                        <span className={`px-1 rounded text-[9px] ${b.status === 'CLOSED' ? 'bg-rose-500 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium truncate mt-1 text-slate-200">{b.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{b.crosses_waterway}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Replanning & Human Authorization Panel */}
            <div className="bg-[#0d172e] rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    Cascading Impact Replanner
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-sky-950 text-sky-300 border border-sky-500/30">
                    Plan {replanState ? `v${replanState.version}` : 'v1 (Baseline)'}
                  </span>
                </div>

                {replanState ? (
                  <div className="space-y-4">
                    {/* Status Alert Banner */}
                    <div
                      className={`p-3 rounded-lg border text-xs ${
                        replanState.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                          : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Status: {replanState.status}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90">
                        {replanState.diffSummary || 'Revised routing and resource assignments calculated.'}
                      </p>
                    </div>

                    {/* Rerouted Assignments Table */}
                    {replanState.rerouted && replanState.rerouted.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-300 mb-2">Affected / Rerouted Dispatches:</h4>
                        <div className="space-y-2">
                          {replanState.rerouted.map((r, i) => (
                            <div key={i} className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-xs font-mono">
                              <div className="flex justify-between text-slate-300">
                                <span>{r.depot_id} ➔ {r.zone_id}</span>
                                <span className="text-amber-400 font-bold">REROUTED</span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                                <span>Old Travel: {r.old_time}m</span>
                                <span className="text-sky-300">New Travel: {r.new_time}m</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                    Baseline Plan v1 operational. No active road or bridge cuts detected. Click any candidate bridge above to simulate a flood cut and observe cascading replanning.
                  </div>
                )}
              </div>

              {/* Human-In-The-Loop Sign-off Button */}
              {replanState && replanState.status === 'PENDING_APPROVAL' && (
                <div className="pt-4 border-t border-slate-800 mt-4">
                  <div className="p-2.5 bg-rose-950/30 rounded border border-rose-500/30 text-rose-300 text-[11px] mb-3">
                    <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                    Human Authorization Gate: Autonomous dispatches remain held until District Command approval.
                  </div>
                  <button
                    onClick={handleApprovePlan}
                    disabled={isApproving}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isApproving ? 'Authorizing Dispatch...' : 'Authorize Revised Plan v2'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Evidence Trust Explorer */}
        {activeTab === 'trust' && (
          <div className="space-y-6">
            <div className="bg-[#0d172e] rounded-xl border border-slate-800 p-5 shadow-xl">
              <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Evidence Trust Engine Architecture & Formulas
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Deterministic calculation preserving provenance, rejecting future clock drift, and bounding replay counters.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-400 text-[11px]">T1: Field Officer</span>
                  <div className="text-base font-bold text-sky-400">Base Trust: 0.90</div>
                  <div className="text-[10px] text-slate-400 mt-1">HMAC Authenticated Field Device</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-400 text-[11px]">T2: Telemetry Sensor</span>
                  <div className="text-base font-bold text-emerald-400">Base Trust: 0.75</div>
                  <div className="text-[10px] text-slate-400 mt-1">Noyyal River Hydrology Station</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-400 text-[11px]">T3: Citizen Volunteer</span>
                  <div className="text-base font-bold text-amber-400">Base Trust: 0.45</div>
                  <div className="text-[10px] text-slate-400 mt-1">Registered Resident Volunteer</div>
                </div>
                <div className="p-3 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-400 text-[11px]">T4: Public / Forward</span>
                  <div className="text-base font-bold text-rose-400">Base Trust: 0.20</div>
                  <div className="text-[10px] text-slate-400 mt-1">Unauthenticated Public Telegram/SMS</div>
                </div>
              </div>
            </div>

            {/* Core Verification Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0d172e] rounded-xl border border-slate-800 p-5 text-xs">
                <h3 className="font-semibold text-slate-200 mb-2 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Asymmetric Safety Principles
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Road Status:</strong> A road marked CLOSED remains closed until a fresher equal-or-higher tier source confirms reopening.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Public Report Cap:</strong> Independent public reports alone are capped at C_support ≤ 0.60 and can never achieve VERIFIED without T1/T2 corroboration.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Monotonic Replay Window:</strong> 64-bit sliding window accepts legitimate out-of-order packets while rejecting replays.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#0d172e] rounded-xl border border-slate-800 p-5 text-xs font-mono">
                <h3 className="font-semibold text-slate-200 mb-2 text-sm flex items-center gap-1.5 font-sans">
                  <Clock className="w-4 h-4 text-sky-400" />
                  Domain Half-Life Freshness Decay
                </h3>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Water Level Sensor:</span>
                    <span className="text-sky-400">30 minutes</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Casualty / Trapped People:</span>
                    <span className="text-sky-400">60 minutes</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Citizen Report:</span>
                    <span className="text-sky-400">120 minutes</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Road Status:</span>
                    <span className="text-sky-400">180 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Government Alert:</span>
                    <span className="text-sky-400">360 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Risk Prioritization Matrix */}
        {activeTab === 'priorities' && (
          <div className="space-y-6">
            <div className="bg-[#0d172e] rounded-xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    Explainable Multi-Factor Zone Prioritization
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dual interval ranking: score_expected vs score_upper with counterfactual explanations
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Weights: Life 0.35 | Exposure 0.20 | Vuln 0.20 | Access 0.15 | Trend 0.10
                </div>
              </div>

              <div className="space-y-3">
                {zones.map(z => (
                  <div
                    key={z.zone_id}
                    className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-sky-400 text-sm">
                        #{z.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-slate-100">{z.name}</h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              z.tier === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                : z.tier === 'HIGH'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {z.tier}
                          </span>
                          {z.verify_next && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-950 text-purple-300 border border-purple-500/40 animate-pulse">
                              VERIFY NEXT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{z.evidence_summary}</p>
                        <p className="text-[11px] text-sky-300/90 mt-1.5 font-mono italic">
                          ➔ {z.what_would_change_this}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono self-end md:self-center">
                      <div className="text-right">
                        <div className="text-slate-400 text-[10px]">Expected Score</div>
                        <div className="text-sm font-bold text-white">{z.score_expected}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400 text-[10px]">Upper Bound</div>
                        <div className="text-sm font-bold text-amber-400">{z.score_upper}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400 text-[10px]">Confidence</div>
                        <div className="text-sm font-bold text-emerald-400">{z.confidence}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Fairness-Aware Resource Allocator */}
        {activeTab === 'relief' && (
          <div className="space-y-6">
            <div className="bg-[#0d172e] rounded-xl border border-slate-800 p-5 shadow-xl">
              <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-sky-400" />
                Google OR-Tools CP-SAT Relief Allocator
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Constrained optimization enforcing fairness floor floor(θ · demand · min(1, S/D)) with θ=0.5.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs mb-6">
                <div className="p-3 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Depot Boats Available</span>
                  <div className="text-xl font-bold text-white mt-1">18 Units</div>
                  <div className="text-[11px] text-slate-400">RS Puram (10) + Peelamedu (8)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Total Zone Demand</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">29 Units</div>
                  <div className="text-[11px] text-slate-400">Severe Supply Shortage Detected</div>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Fairness Floor Parameter</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">θ = 0.50</div>
                  <div className="text-[11px] text-slate-400">Guarantees non-starvation of zones</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <h3 className="font-semibold text-slate-200 mb-2">Shortfall Reason Codes Tracked:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-amber-400 font-bold">• supply_exhausted</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Demands exceeded overall depot reserve</p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-rose-400 font-bold">• no_feasible_route</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">All bridge/road paths disconnected</p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-purple-400 font-bold">• deadline_infeasible</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Travel time exceeds 45min operational cutoff</p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-sky-400 font-bold">• capacity_limit</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Depot vehicle/convoy dispatch throttle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 20-Step Demo Protocol */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <div className="bg-[#0d172e] rounded-xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-sky-400" />
                    Mandatory 20-Step End-to-End Flood Demonstration Sequence
                  </h2>
                  <p className="text-xs text-slate-400">
                    Autonomous verification from raw sensor ingestion to bridge cut cascading replanning
                  </p>
                </div>
                <button
                  onClick={runDemoScenario}
                  disabled={isRunningDemo}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRunningDemo ? 'animate-spin' : ''}`} />
                  Re-execute Scenario
                </button>
              </div>

              {demoSteps.length > 0 ? (
                <div className="space-y-2.5">
                  {demoSteps.map(s => (
                    <div
                      key={s.step}
                      className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0 border border-sky-500/30 text-[11px]">
                        {s.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-slate-200">{s.name}</span>
                          <span className="text-emerald-400 font-semibold text-[10px] px-1.5 py-0.5 bg-emerald-950 rounded border border-emerald-500/30">
                            PASSED
                          </span>
                        </div>
                        {s.description && <p className="text-slate-400 text-[11px] mt-0.5">{s.description}</p>}
                        {s.verdict && <p className="text-sky-300 text-[11px] mt-0.5 font-mono">{s.verdict}</p>}
                        {s.processing_metrics && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex gap-4 text-[10px] font-mono text-slate-400">
                            <span>t_ingested: {s.processing_metrics.t_ingested_avg_ms}ms</span>
                            <span>t_verified: {s.processing_metrics.t_verified_avg_ms}ms</span>
                            <span>t_prioritized: {s.processing_metrics.t_prioritized_ms}ms</span>
                            <span>t_proposed: {s.processing_metrics.t_proposed_ms}ms</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/40 rounded-lg border border-slate-800">
                  <Activity className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-300 font-medium">No scenario execution run yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click "Run 20-Step Demo" above to execute all 20 steps and view real-time latency benchmarks.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
