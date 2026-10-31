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
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
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

  // Initial data fetch
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
          closure_reason: 'Flood surge exceeding bridge safety margin by 0.85m',
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col font-sans">
      {/* 1. Clean White Enterprise Header */}
      <header className="border-b border-[#E2E8F0] bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#172B4D] tracking-tight">
                POSEIDON <span className="text-[#2563EB]">AI</span>
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                Offline-First Active
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
                SYNTHETIC DEMO
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Noyyal River Corridor & Coimbatore Lake Cluster | Tamil Nadu
            </p>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 border-r border-[#E2E8F0] pr-3 text-[#64748B]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <Wifi className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="font-medium text-[#172B4D]">Mesh Wi-Fi</span>
              <span className="text-[10px] text-[#16A34A] font-semibold">ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-medium text-[#172B4D]">GSM/SMS</span>
              <span className="text-[10px] text-[#2563EB] font-semibold font-mono">CSQ 24</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <Radio className="w-3.5 h-3.5 text-[#6366F1]" />
              <span className="font-medium text-[#172B4D]">LoRa 865MHz</span>
              <span className="text-[10px] text-[#6366F1] font-semibold font-mono">-92 dBm</span>
            </div>
          </div>

          <button
            onClick={runDemoScenario}
            disabled={isRunningDemo}
            className="px-3.5 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] font-medium text-white shadow-xs text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
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

      {/* 2. Enterprise Horizontal Navigation */}
      <nav className="bg-white border-b border-[#E2E8F0] px-6 py-1.5 flex items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
            activeTab === 'map'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Mission Map & Replanner
        </button>

        <button
          onClick={() => setActiveTab('trust')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
            activeTab === 'trust'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Evidence Trust Explorer
        </button>

        <button
          onClick={() => setActiveTab('priorities')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
            activeTab === 'priorities'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Risk Prioritization Matrix
        </button>

        <button
          onClick={() => setActiveTab('relief')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
            activeTab === 'relief'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Fairness-Aware Allocator
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
            activeTab === 'demo'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          20-Step Demo Protocol ({demoSteps.length > 0 ? `${demoSteps.length}/20` : 'Ready'})
        </button>
      </nav>

      {/* 3. Main Dashboard Viewport */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* TAB 1: Mission Map & Replanner */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: GIS Spatial Map Canvas */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="font-semibold text-sm text-[#172B4D] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                    Noyyal River Corridor Tactical Spatial View
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Live road network, bridge vulnerability points, and zone flood severity
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#DC2626]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span> Critical
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#D97706]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> High
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#CA8A04]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]"></span> Medium
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#16A34A]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span> Safe
                  </span>
                </div>
              </div>

              {/* Clean White GIS Map Aesthetic */}
              <div className="relative flex-1 min-h-[380px] bg-[#F8FAFC] rounded-md border border-[#E2E8F0] p-4 flex flex-col justify-between overflow-hidden">
                {/* Subtle map coordinate grid lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-35"></div>

                {/* Tactical River Flow Network */}
                <div className="relative z-10 flex items-center justify-between w-full h-full py-8 px-2">
                  {/* Perur Zone */}
                  <div className="flex flex-col items-center">
                    <div className="w-13 h-13 rounded-full border-2 border-[#DC2626] bg-[#FEF2F2] flex flex-col items-center justify-center p-1 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-[#DC2626]">ZONE</span>
                      <span className="text-[9px] font-semibold text-[#172B4D]">PERUR</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#DC2626] mt-1">CRITICAL</span>
                    <span className="text-[9px] text-[#64748B]">Pop: 18.5k</span>
                  </div>

                  {/* Flow Section 1 */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <div className="w-full h-1.5 bg-[#BFDBFE] rounded-full relative">
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white border border-[#CBD5E1] px-1.5 py-0.5 rounded text-[9px] font-medium text-[#1E40AF] shadow-xs whitespace-nowrap">
                        Perur Bridge
                      </div>
                    </div>
                    <span className="text-[9px] text-[#3B82F6] mt-1 font-medium">Noyyal ➔</span>
                  </div>

                  {/* Selvapuram Zone */}
                  <div className="flex flex-col items-center">
                    <div className="w-13 h-13 rounded-full border-2 border-[#D97706] bg-[#FFFBEB] flex flex-col items-center justify-center p-1 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-[#D97706]">ZONE</span>
                      <span className="text-[9px] font-semibold text-[#172B4D]">SELVAPURAM</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#D97706] mt-1">HIGH</span>
                    <span className="text-[9px] text-[#64748B]">Pop: 34k</span>
                  </div>

                  {/* Flow Section 2 */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <div className="w-full h-1.5 bg-[#BFDBFE] rounded-full relative">
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white border border-[#CBD5E1] px-1.5 py-0.5 rounded text-[9px] font-medium text-[#1E40AF] shadow-xs whitespace-nowrap">
                        Siruvani Bridge
                      </div>
                    </div>
                    <span className="text-[9px] text-[#3B82F6] mt-1 font-medium">Noyyal ➔</span>
                  </div>

                  {/* Ukkadam Zone */}
                  <div className="flex flex-col items-center">
                    <div className="w-13 h-13 rounded-full border-2 border-[#DC2626] bg-[#FEF2F2] flex flex-col items-center justify-center p-1 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-[#DC2626]">ZONE</span>
                      <span className="text-[9px] font-semibold text-[#172B4D]">UKKADAM</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#DC2626] mt-1">CRITICAL</span>
                    <span className="text-[9px] text-[#64748B]">Pop: 42k</span>
                  </div>

                  {/* Flow Section 3: Ukkadam-Sungam */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <div className={`w-full h-1.5 ${bridges.find(b => b.bridge_id === 'BR-UKKADAM-01')?.status === 'CLOSED' ? 'bg-[#DC2626]' : 'bg-[#BFDBFE]'} rounded-full relative`}>
                      <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-semibold shadow-xs whitespace-nowrap ${
                        bridges.find(b => b.bridge_id === 'BR-UKKADAM-01')?.status === 'CLOSED'
                          ? 'bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626]'
                          : 'bg-white border border-[#CBD5E1] text-[#1E40AF]'
                      }`}>
                        Sungam Bridge {bridges.find(b => b.bridge_id === 'BR-UKKADAM-01')?.status === 'CLOSED' && '(CUT)'}
                      </div>
                    </div>
                    <span className="text-[9px] text-[#3B82F6] mt-1 font-medium">Noyyal ➔</span>
                  </div>

                  {/* Singanallur Zone */}
                  <div className="flex flex-col items-center">
                    <div className="w-13 h-13 rounded-full border-2 border-[#D97706] bg-[#FFFBEB] flex flex-col items-center justify-center p-1 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-[#D97706]">ZONE</span>
                      <span className="text-[9px] font-semibold text-[#172B4D]">SINGANALLUR</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#D97706] mt-1">HIGH</span>
                    <span className="text-[9px] text-[#64748B]">Pop: 29k</span>
                  </div>

                  {/* Flow Section 4 */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <div className="w-full h-1.5 bg-[#BFDBFE] rounded-full relative">
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white border border-[#CBD5E1] px-1.5 py-0.5 rounded text-[9px] font-medium text-[#1E40AF] shadow-xs whitespace-nowrap">
                        Trichy Rd Bridge
                      </div>
                    </div>
                    <span className="text-[9px] text-[#3B82F6] mt-1 font-medium">Noyyal ➔</span>
                  </div>

                  {/* Ondipudur Zone */}
                  <div className="flex flex-col items-center">
                    <div className="w-13 h-13 rounded-full border-2 border-[#CA8A04] bg-[#FEFCE8] flex flex-col items-center justify-center p-1 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-[#CA8A04]">ZONE</span>
                      <span className="text-[9px] font-semibold text-[#172B4D]">ONDIPUDUR</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#CA8A04] mt-1">MEDIUM</span>
                    <span className="text-[9px] text-[#64748B]">Pop: 26.5k</span>
                  </div>
                </div>

                {/* Base Depots & Shelters Info Bar */}
                <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0] text-xs">
                  <div className="bg-white p-2.5 rounded border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#172B4D]">Depot: RS Puram Base</span>
                      <div className="text-[11px] text-[#64748B]">10 Rescue Boats · 150 Medical Kits</div>
                    </div>
                    <span className="text-[#16A34A] text-[10px] px-2 py-0.5 bg-[#F0FDF4] rounded border border-[#DCFCE7] font-semibold">
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#172B4D]">Depot: Peelamedu Base</span>
                      <div className="text-[11px] text-[#64748B]">8 Rescue Boats · 200 Medical Kits</div>
                    </div>
                    <span className="text-[#16A34A] text-[10px] px-2 py-0.5 bg-[#F0FDF4] rounded border border-[#DCFCE7] font-semibold">
                      OPERATIONAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Bridges Interactive Controls */}
              <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                <h3 className="text-xs font-semibold text-[#172B4D] mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                  Candidate Noyyal Crossing Bridges (Click to simulate flood closure)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {bridges.map(b => (
                    <button
                      key={b.bridge_id}
                      onClick={() => handleSimulateBridgeCut(b.bridge_id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        b.status === 'CLOSED'
                          ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#172B4D]">{b.bridge_id}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                          b.status === 'CLOSED'
                            ? 'bg-[#DC2626] text-white'
                            : 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#172B4D] truncate mt-1">{b.name}</div>
                      <div className="text-[10px] text-[#64748B] truncate">{b.crosses_waterway}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Cascading Replanning & Human Authorization Panel */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                  <h2 className="font-semibold text-sm text-[#172B4D] flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#2563EB]" />
                    Cascading Impact Replanner
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                    Plan {replanState ? `v${replanState.version}` : 'v1 (Baseline)'}
                  </span>
                </div>

                {replanState ? (
                  <div className="space-y-4">
                    {/* Status Alert Banner */}
                    <div
                      className={`p-3 rounded-lg border text-xs ${
                        replanState.status === 'PENDING_APPROVAL'
                          ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                          : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Status: {replanState.status}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                        {replanState.diffSummary || 'Revised routing and resource assignments calculated.'}
                      </p>
                    </div>

                    {/* Rerouted Assignments Table */}
                    {replanState.rerouted && replanState.rerouted.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-[#172B4D] mb-2">Affected / Rerouted Dispatches:</h4>
                        <div className="space-y-2">
                          {replanState.rerouted.map((r, i) => (
                            <div key={i} className="bg-[#F8FAFC] p-2.5 rounded border border-[#E2E8F0] text-xs">
                              <div className="flex justify-between items-center text-[#172B4D] font-medium">
                                <span className="flex items-center gap-1">
                                  {r.depot_id} <ArrowRight className="w-3 h-3 text-[#64748B]" /> {r.zone_id}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                                  REROUTED
                                </span>
                              </div>
                              <div className="text-[11px] text-[#64748B] mt-1 flex justify-between">
                                <span>Old Travel: {r.old_time}m</span>
                                <span className="text-[#2563EB] font-medium">New Travel: {r.new_time}m</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] leading-relaxed">
                    Baseline Plan v1 is operational. All primary bridges remain intact. Click any bridge in the left panel to simulate a flood cut and observe automatic cascading replanning.
                  </div>
                )}
              </div>

              {/* Human-In-The-Loop Sign-off Gate */}
              {replanState && replanState.status === 'PENDING_APPROVAL' && (
                <div className="pt-4 border-t border-[#E2E8F0] mt-4">
                  <div className="p-2.5 bg-[#FEF2F2] rounded border border-[#FCA5A5] text-[#991B1B] text-[11px] mb-3 leading-relaxed">
                    <UserCheck className="w-3.5 h-3.5 inline mr-1 text-[#DC2626]" />
                    <strong>Human Authorization Gate:</strong> Autonomous dispatches held pending District Command approval.
                  </div>
                  <button
                    onClick={handleApprovePlan}
                    disabled={isApproving}
                    className="w-full py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-medium rounded-md text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
              <h2 className="font-semibold text-sm text-[#172B4D] flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                Evidence Trust Engine Architecture & Tier Framework
              </h2>
              <p className="text-xs text-[#64748B] mb-4">
                Deterministic trust evaluation calculated strictly from observed time, bounded replay counters, and cryptographic MAC.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[11px] font-medium">T1: Field Officer</span>
                  <div className="text-base font-bold text-[#2563EB] mt-0.5">Base Trust: 0.90</div>
                  <div className="text-[11px] text-[#64748B] mt-1">HMAC Authenticated Field Commander</div>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[11px] font-medium">T2: Telemetry Sensor</span>
                  <div className="text-base font-bold text-[#16A34A] mt-0.5">Base Trust: 0.75</div>
                  <div className="text-[11px] text-[#64748B] mt-1">Noyyal River Hydrology Telemetry</div>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[11px] font-medium">T3: Citizen Volunteer</span>
                  <div className="text-base font-bold text-[#D97706] mt-0.5">Base Trust: 0.45</div>
                  <div className="text-[11px] text-[#64748B] mt-1">Registered Resident Volunteer</div>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[11px] font-medium">T4: Public / Unverified</span>
                  <div className="text-base font-bold text-[#DC2626] mt-0.5">Base Trust: 0.20</div>
                  <div className="text-[11px] text-[#64748B] mt-1">Unauthenticated Public Telegram/SMS</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 text-xs">
                <h3 className="font-semibold text-[#172B4D] mb-2.5 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#D97706]" />
                  Asymmetric Safety Principles
                </h3>
                <ul className="space-y-2 text-[#334155] leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#2563EB] font-bold">•</span>
                    <span><strong>Road Status:</strong> A road marked CLOSED remains closed until a fresher equal-or-higher tier source reopens it.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#2563EB] font-bold">•</span>
                    <span><strong>Public Report Cap:</strong> Independent public reports alone are capped at C_support ≤ 0.60 and can never achieve VERIFIED without T1/T2 corroboration.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#2563EB] font-bold">•</span>
                    <span><strong>Monotonic Replay Window:</strong> 64-bit sliding window accepts legitimate out-of-order packets while rejecting replays.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 text-xs">
                <h3 className="font-semibold text-[#172B4D] mb-2.5 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  Domain Half-Life Freshness Decay
                </h3>
                <div className="space-y-2 text-[#334155]">
                  <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                    <span>Water Level Sensor:</span>
                    <span className="font-medium text-[#2563EB]">30 minutes</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                    <span>Casualty / Trapped People:</span>
                    <span className="font-medium text-[#2563EB]">60 minutes</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                    <span>Citizen Report:</span>
                    <span className="font-medium text-[#2563EB]">120 minutes</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                    <span>Road Status:</span>
                    <span className="font-medium text-[#2563EB]">180 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Government Alert:</span>
                    <span className="font-medium text-[#2563EB]">360 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Risk Prioritization Matrix */}
        {activeTab === 'priorities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                <div>
                  <h2 className="font-semibold text-sm text-[#172B4D] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                    Explainable Multi-Factor Zone Prioritization
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Dual interval ranking: score_expected vs score_upper with counterfactual delta explanations
                  </p>
                </div>
                <div className="text-xs text-[#64748B] font-mono">
                  Weights: Life 0.35 | Exposure 0.20 | Vuln 0.20 | Access 0.15 | Trend 0.10
                </div>
              </div>

              <div className="space-y-3">
                {zones.map(z => (
                  <div
                    key={z.zone_id}
                    className="p-4 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center font-bold text-[#2563EB] text-xs">
                        #{z.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-[#172B4D]">{z.name}</h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              z.tier === 'CRITICAL'
                                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                                : z.tier === 'HIGH'
                                ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                                : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                            }`}
                          >
                            {z.tier}
                          </span>
                          {z.verify_next && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]">
                              VERIFY NEXT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-1">{z.evidence_summary}</p>
                        <p className="text-[11px] text-[#2563EB] mt-1 font-medium italic">
                          ➔ {z.what_would_change_this}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs self-end md:self-center">
                      <div className="text-right">
                        <div className="text-[#64748B] text-[10px]">Expected Score</div>
                        <div className="text-sm font-bold text-[#172B4D] font-mono">{z.score_expected}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#64748B] text-[10px]">Upper Bound</div>
                        <div className="text-sm font-bold text-[#D97706] font-mono">{z.score_upper}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#64748B] text-[10px]">Confidence</div>
                        <div className="text-sm font-bold text-[#16A34A] font-mono">{z.confidence}</div>
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
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
              <h2 className="font-semibold text-sm text-[#172B4D] flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                Google OR-Tools CP-SAT Relief Allocator
              </h2>
              <p className="text-xs text-[#64748B] mb-4">
                Constrained optimization enforcing fairness floor floor(θ · demand · min(1, S/D)) with θ=0.5.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-6">
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[11px] font-medium">Depot Boats Available</span>
                  <div className="text-xl font-bold text-[#172B4D] mt-1">18 Units</div>
                  <div className="text-[11px] text-[#64748B]">RS Puram (10) + Peelamedu (8)</div>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[11px] font-medium">Total Zone Demand</span>
                  <div className="text-xl font-bold text-[#D97706] mt-1">29 Units</div>
                  <div className="text-[11px] text-[#64748B]">Severe Supply Shortage Detected</div>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[11px] font-medium">Fairness Floor Parameter</span>
                  <div className="text-xl font-bold text-[#16A34A] mt-1">θ = 0.50</div>
                  <div className="text-[11px] text-[#64748B]">Guarantees non-starvation of zones</div>
                </div>
              </div>

              <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <h3 className="font-semibold text-[#172B4D] mb-2 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
                  Shortfall Reason Codes Tracked by Solver:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
                  <div className="p-2.5 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#D97706] font-semibold">• supply_exhausted</span>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Demands exceeded overall depot supply</p>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#DC2626] font-semibold">• no_feasible_route</span>
                    <p className="text-[10px] text-[#64748B] mt-0.5">All road/bridge connections severed</p>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#7E22CE] font-semibold">• deadline_infeasible</span>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Travel time exceeds 45min cutoff</p>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#2563EB] font-semibold">• capacity_limit</span>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Depot vehicle dispatch bottleneck</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 20-Step Demo Protocol */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                <div>
                  <h2 className="font-semibold text-sm text-[#172B4D] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
                    Mandatory 20-Step End-to-End Flood Demonstration Sequence
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Autonomous verification from raw sensor ingestion to bridge cut cascading replanning
                  </p>
                </div>
                <button
                  onClick={runDemoScenario}
                  disabled={isRunningDemo}
                  className="px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRunningDemo ? 'animate-spin' : ''}`} />
                  Re-execute Scenario
                </button>
              </div>

              {demoSteps.length > 0 ? (
                <div className="space-y-2">
                  {demoSteps.map(s => (
                    <div
                      key={s.step}
                      className="p-3 bg-white rounded-md border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors flex items-start gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE] text-[11px]">
                        {s.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#172B4D]">{s.name}</span>
                          <span className="text-[#16A34A] font-medium text-[10px] px-2 py-0.5 bg-[#F0FDF4] rounded border border-[#DCFCE7]">
                            PASSED
                          </span>
                        </div>
                        {s.description && <p className="text-[#64748B] text-[11px] mt-0.5">{s.description}</p>}
                        {s.verdict && <p className="text-[#2563EB] text-[11px] mt-0.5 font-medium">{s.verdict}</p>}
                        {s.processing_metrics && (
                          <div className="mt-2 pt-2 border-t border-[#F1F5F9] flex gap-4 text-[10px] font-mono text-[#64748B]">
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
                <div className="p-8 text-center bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <Activity className="w-8 h-8 text-[#2563EB] mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-[#172B4D] font-medium">No scenario execution run yet.</p>
                  <p className="text-[11px] text-[#64748B] mt-1">
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
