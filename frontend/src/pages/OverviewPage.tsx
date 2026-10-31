import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  Users,
  Building2,
  Clock,
  Radio,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { KpiCard } from '@/components/common/KpiCard';
import { PriorityBandChip } from '@/components/common/PriorityBandChip';
import { ReliabilityBar } from '@/components/common/ReliabilityBar';
import { TierBadge } from '@/components/common/TierBadge';
import { StaleBadge } from '@/components/common/StaleBadge';
import { AssignmentCard } from '@/components/common/AssignmentCard';
import { useUiStore } from '@/store/useUiStore';
import { useRealtimeStore } from '@/store/useRealtimeStore';

export const OverviewPage: React.FC = () => {
  const { openDecisionCard, toggleDispatchQueue } = useUiStore();
  const { eventBuffer } = useRealtimeStore();

  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: mockApi.getAreas });
  const { data: resources = [] } = useQuery({ queryKey: ['resources'], queryFn: mockApi.getResources });
  const { data: incidents = [] } = useQuery({ queryKey: ['incidents'], queryFn: mockApi.getIncidents });
  const { data: shelters = [] } = useQuery({ queryKey: ['shelters'], queryFn: mockApi.getShelters });
  const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: mockApi.getAssignments });

  // Compute KPIs
  const criticalCount = incidents.filter((i) => i.priorityBand === 'CRITICAL').length;
  const highCount = incidents.filter((i) => i.priorityBand === 'HIGH').length;
  const availableUnits = resources.filter((r) => r.status === 'available').length;
  const totalUnits = resources.length;
  const totalShelterCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const occupancyPct = totalShelterCap ? Math.round((totalOccupancy / totalShelterCap) * 100) : 0;
  const pendingApprovals = assignments.filter((a) => a.state === 'proposed').length;
  const avgReliability = areas.length
    ? areas.reduce((acc, a) => acc + a.reliability, 0) / areas.length
    : 0.85;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Operational Overview & Dispatch Coordination
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-agency situational intelligence across Coimbatore Urban Corridor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDispatchQueue}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Open Pending Queue ({pendingApprovals})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Open Incidents"
          value={`${criticalCount} Crit`}
          subtitle={`${highCount} High Priority`}
          icon={AlertCircle}
          variant="critical"
        />
        <KpiCard
          title="Fleet Units"
          value={`${availableUnits}/${totalUnits}`}
          subtitle="Available / Deployed"
          icon={TrendingUp}
          variant="safe"
        />
        <KpiCard
          title="Shelter Capacity"
          value={`${occupancyPct}%`}
          subtitle={`${totalOccupancy}/${totalShelterCap} Occupied`}
          icon={Building2}
          variant={occupancyPct > 80 ? 'warning' : 'default'}
        />
        <KpiCard
          title="Pending Approvals"
          value={pendingApprovals}
          subtitle="Requires Operator Action"
          icon={ShieldAlert}
          variant={pendingApprovals > 0 ? 'warning' : 'safe'}
        />
        <KpiCard
          title="Median Response"
          value="14.2m"
          subtitle="-3.4m vs baseline"
          icon={Clock}
          trend={{ value: '18% faster', isPositive: true }}
          variant="default"
        />
        <KpiCard
          title="Avg Reliability"
          value={`${(avgReliability * 100).toFixed(0)}%`}
          subtitle="Multi-source consensus"
          icon={Radio}
          variant="default"
        />
      </div>

      {/* Grid: Priority Areas & Live Alert Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top 5 Priority Areas & Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Priority Areas */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Top Priority Affected Sectors
                </h3>
              </div>
              <span className="text-xs text-slate-500">Autonomous multi-factor ranking (S,V,U,E,N)</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {areas.slice(0, 5).map((area) => (
                <div
                  key={area.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">#{area.rank}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{area.name}</span>
                      <PriorityBandChip band={area.band} score={area.scoreP} />
                      {area.precautionaryEscalation && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                          Precautionary Escalation
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                      <span>{area.peopleAtRisk.toLocaleString()} at risk</span>
                      <span>{(area.vulnerableShare * 100).toFixed(0)}% vulnerable</span>
                      <span>Waiting: {area.waitingTimeMinutes}m</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28 hidden sm:block">
                      <ReliabilityBar score={area.reliability} size="sm" />
                    </div>
                    <button
                      onClick={() => openDecisionCard(`DEC-${area.id}`)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Why?
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Dispatches Waiting Human Approval */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Pending Human Dispatches ({pendingApprovals})
                </h3>
              </div>
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Humans Decide Rule: No action is taken until approved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignments
                .filter((a) => a.state === 'proposed')
                .map((asgn) => (
                  <AssignmentCard key={asgn.id} assignment={asgn} />
                ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Event & Alert Stream */}
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Event Feed</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">WebSocket Cache</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {eventBuffer.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Listening for real-time telemetry and incident updates...
                </div>
              ) : (
                eventBuffer.slice(0, 15).map((ev, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 uppercase">
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ev.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {'summary' in ev.data
                        ? (ev.data as any).summary
                        : 'text' in ev.data
                        ? (ev.data as any).text
                        : 'title' in ev.data
                        ? (ev.data as any).title
                        : JSON.stringify(ev.data).slice(0, 80)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
