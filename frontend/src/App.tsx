import { useState, useEffect } from 'react';
import {
  Radio,
  Wifi,
  MessageSquare,
  Navigation,
  Activity,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Cpu,
  FileCheck2,
} from 'lucide-react';
import type {
  Zone,
  Bridge,
  EvidenceItem,
  EvidenceCluster,
  NetworkGIS,
  PlanVersion,
  PlanComparison,
  DemoStep,
} from './types';
import { OperationalOverview } from './components/OperationalOverview';
import { MissionMap } from './components/MissionMap';
import { BridgeCards } from './components/BridgeCards';
import { ReplannerPanel } from './components/ReplannerPanel';
import { IncidentIntelligence } from './components/IncidentIntelligence';
import { EvidenceTrustExplorer } from './components/EvidenceTrustExplorer';
import { RiskPrioritizationMatrix } from './components/RiskPrioritizationMatrix';
import { FairnessAwareAllocator } from './components/FairnessAwareAllocator';
import { DemoProtocol } from './components/DemoProtocol';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'map' | 'incidents' | 'trust' | 'priorities' | 'relief' | 'demo'
  >('map');

  // Backend state
  const [zones, setZones] = useState<Zone[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [clusters, setClusters] = useState<EvidenceCluster[]>([]);
  const [networkGis, setNetworkGis] = useState<NetworkGIS | null>(null);
  const [planHistory, setPlanHistory] = useState<PlanVersion[]>([]);
  const [activePlan, setActivePlan] = useState<PlanVersion | null>(null);
  const [comparison, setComparison] = useState<PlanComparison | null>(null);
  const [activeClosures, setActiveClosures] = useState<Record<string, string>>({});
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedBridgeId, setSelectedBridgeId] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Zones & Priorities
      const zRes = await fetch('/api/v1/situation/zones');
      if (zRes.ok) {
        const data = await zRes.json();
        setZones(data.zones || []);
      }

      // 2. Candidate Bridges
      const bRes = await fetch('/api/v1/situation/bridges');
      if (bRes.ok) {
        const data = await bRes.json();
        setBridges(data.bridges || []);
      }

      // 3. GIS Road Network & Infrastructure
      const nRes = await fetch('/api/v1/situation/network');
      if (nRes.ok) {
        const data = await nRes.json();
        setNetworkGis(data);
      }

      // 4. Evaluated Evidence
      const eRes = await fetch('/api/v1/evidence');
      if (eRes.ok) {
        const data = await eRes.json();
        setEvidence(data.items || []);
      }

      // 5. Evidence Clusters
      const cRes = await fetch('/api/v1/evidence/clusters');
      if (cRes.ok) {
        const data = await cRes.json();
        setClusters(data.clusters || []);
      }

      // 6. Operational Plan History & Comparison
      const pRes = await fetch('/api/v1/replanning/plans/PLAN-OPERATIONAL-01');
      if (pRes.ok) {
        const data = await pRes.json();
        const versions: PlanVersion[] = data.versions || [];
        setPlanHistory(versions);
        if (versions.length > 0) {
          setActivePlan(versions[versions.length - 1]);
        }
        if (data.comparison) {
          setComparison(data.comparison);
        }
        if (data.active_road_closures) {
          setActiveClosures(data.active_road_closures);
        }
      }
    } catch (e) {
      console.error('Failed to load operational data:', e);
    }
  };

  // Run 20-step synthetic flood scenario
  const handleRunDemoScenario = async () => {
    setIsRunningDemo(true);
    try {
      const res = await fetch('/api/v1/simulation/run-demo-scenario', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDemoSteps(data.steps || []);
        setActiveTab('demo');
        await fetchInitialData();
      }
    } catch (e) {
      console.error('Error running 20-step demo:', e);
    } finally {
      setIsRunningDemo(false);
    }
  };

  // Simulate bridge cut or reopen
  const handleSimulateBridgeCut = async (bridgeId: string) => {
    const bridge = bridges.find(b => b.bridge_id === bridgeId);
    if (!bridge) return;

    if (bridge.status === 'CLOSED') {
      // Reopen bridge
      try {
        const res = await fetch('/api/v1/replanning/reopen-bridge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bridge_id: bridgeId,
            plan_id: 'PLAN-OPERATIONAL-01',
          }),
        });
        if (res.ok) {
          await fetchInitialData();
        }
      } catch (e) {
        console.error('Failed to reopen bridge:', e);
      }
    } else {
      // Close bridge and cascade replan
      try {
        const res = await fetch('/api/v1/replanning/close-bridge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: 'PLAN-OPERATIONAL-01',
            bridge_id: bridgeId,
            closure_reason: 'Flood surge water level exceeding bridge safety margin by 0.95m',
            operator_role: 'FIELD_COMMANDER_WEST',
          }),
        });
        if (res.ok) {
          await fetchInitialData();
        }
      } catch (e) {
        console.error('Failed to close bridge:', e);
      }
    }
  };

  // Authorize revised plan (Human Authorization Gate)
  const handleApprovePlan = async () => {
    if (!activePlan) return;
    setIsApproving(true);
    try {
      const res = await fetch('/api/v1/replanning/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'PLAN-OPERATIONAL-01',
          version_number: activePlan.version_number,
          operator_id: 'DISTRICT_COLLECTOR_CBE',
        }),
      });
      if (res.ok) {
        await fetchInitialData();
      }
    } catch (e) {
      console.error('Approval failed:', e);
    } finally {
      setIsApproving(false);
    }
  };

  // Reject proposed plan
  const handleRejectPlan = async (reason: string) => {
    if (!activePlan) return;
    try {
      const res = await fetch('/api/v1/replanning/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'PLAN-OPERATIONAL-01',
          version_number: activePlan.version_number,
          operator_id: 'DISTRICT_COLLECTOR_CBE',
          reason: reason,
        }),
      });
      if (res.ok) {
        await fetchInitialData();
      }
    } catch (e) {
      console.error('Rejection failed:', e);
    }
  };

  const closedBridgesCount = bridges.filter(b => b.status === 'CLOSED').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Clean White Enterprise Header */}
      <header className="border-b border-[#E2E8F0] bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-[#172B4D] tracking-tight">
                POSEIDON <span className="text-[#2563EB]">AI</span>
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                Offline-First Engine Active
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
                SYNTHETIC DEMO
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Noyyal River Corridor & Coimbatore Lake Cluster · Disaster Intelligence & Relief Command
            </p>
          </div>
        </div>

        {/* Transport Status Indicators & Primary Action */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 border-r border-[#E2E8F0] pr-3 text-[#64748B]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <Wifi className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="font-semibold text-[#172B4D]">Mesh Wi-Fi</span>
              <span className="text-[10px] text-[#16A34A] font-bold">ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-semibold text-[#172B4D]">GSM/SMS</span>
              <span className="text-[10px] text-[#2563EB] font-bold font-mono">CSQ 24</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <Radio className="w-3.5 h-3.5 text-[#6366F1]" />
              <span className="font-semibold text-[#172B4D]">LoRa 865MHz</span>
              <span className="text-[10px] text-[#6366F1] font-bold font-mono">-92 dBm</span>
            </div>
          </div>

          <button
            onClick={handleRunDemoScenario}
            disabled={isRunningDemo}
            className="px-3.5 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] font-bold text-white shadow-xs text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRunningDemo ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Executing 20 Steps...
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                Run 20-Step Demo Protocol
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Enterprise Horizontal Navigation */}
      <nav className="bg-white border-b border-[#E2E8F0] px-6 py-1.5 flex items-center gap-1 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === 'map'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Mission Map & Replanner
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === 'incidents'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Incident Intelligence Feed ({evidence.length})
        </button>

        <button
          onClick={() => setActiveTab('trust')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === 'trust'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Evidence Trust Explorer ({clusters.length} Clusters)
        </button>

        <button
          onClick={() => setActiveTab('priorities')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === 'priorities'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Risk Prioritization Matrix ({zones.length} Zones)
        </button>

        <button
          onClick={() => setActiveTab('relief')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === 'relief'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Fairness-Aware Allocator
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === 'demo'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
              : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          20-Step Demo Sequence ({demoSteps.length > 0 ? `${demoSteps.length}/20` : 'Ready'})
        </button>
      </nav>

      {/* 3. Main Dashboard Viewport */}
      <main className="flex-1 p-6 max-w-[1560px] mx-auto w-full">
        {/* Operational Overview: 8 Micro-Metric Cards */}
        <OperationalOverview
          zones={zones}
          evidence={evidence}
          clusters={clusters}
          activePlan={activePlan}
          closedBridgesCount={closedBridgesCount}
        />

        {/* TAB 1: Mission Map & Replanner */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: GIS Map Canvas + Interactive Bridge Cards */}
            <div className="lg:col-span-8 flex flex-col">
              <MissionMap
                zones={zones}
                bridges={bridges}
                evidence={evidence}
                networkGis={networkGis}
                selectedBridgeId={selectedBridgeId}
                onSelectBridge={b => setSelectedBridgeId(b.bridge_id)}
                onSimulateCut={handleSimulateBridgeCut}
              />

              <BridgeCards
                bridges={bridges}
                selectedBridgeId={selectedBridgeId}
                onSelectBridge={b => setSelectedBridgeId(b.bridge_id)}
                onSimulateCut={handleSimulateBridgeCut}
              />
            </div>

            {/* Right 4 Cols: Cascading Impact Replanner Panel */}
            <div className="lg:col-span-4 h-full min-h-[620px]">
              <ReplannerPanel
                planHistory={planHistory}
                activePlan={activePlan}
                comparison={comparison}
                activeClosures={activeClosures}
                isApproving={isApproving}
                onApprove={handleApprovePlan}
                onReject={handleRejectPlan}
                bridges={bridges}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Incident Intelligence Feed */}
        {activeTab === 'incidents' && (
          <IncidentIntelligence
            evidence={evidence}
            onSelectIncident={item => {
              if (item.latitude && item.longitude) {
                setActiveTab('map');
              }
            }}
          />
        )}

        {/* TAB 3: Evidence Trust Explorer */}
        {activeTab === 'trust' && (
          <EvidenceTrustExplorer
            clusters={clusters}
            evidence={evidence}
          />
        )}

        {/* TAB 4: Risk Prioritization Matrix */}
        {activeTab === 'priorities' && (
          <RiskPrioritizationMatrix zones={zones} />
        )}

        {/* TAB 5: Fairness-Aware Allocator */}
        {activeTab === 'relief' && (
          <FairnessAwareAllocator
            activePlan={activePlan}
            onReoptimize={async () => {
              await fetchInitialData();
            }}
          />
        )}

        {/* TAB 6: 20-Step Demo Protocol */}
        {activeTab === 'demo' && (
          <DemoProtocol
            demoSteps={demoSteps}
            isRunningDemo={isRunningDemo}
            onRunDemo={handleRunDemoScenario}
          />
        )}
      </main>
    </div>
  );
}
