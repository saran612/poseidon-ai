import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Navigation,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Bridge as BridgeIcon,
  Clock,
  ArrowRight,
  ShieldAlert,
  Edit,
  Save,
  Layers,
  Activity,
  Check,
  Undo2,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { realtimeClient } from '@/lib/realtime';
import { useAuthStore } from '@/store/useAuthStore';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { ReplannerPanel } from '@/components/ReplannerPanel';
import type { Assignment, Bridge } from '@/types';

export const RoutingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { activeReplanDiff, setActiveReplanDiff } = useRealtimeStore();

  const [activeTab, setActiveTab] = useState<'replanner' | 'corridors'>('replanner');
  const [selectedBridgeId, setSelectedBridgeId] = useState<string>('BR-PERUR-01');

  // Live queries
  const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: mockApi.getAssignments });
  const { data: roads = [] } = useQuery({ queryKey: ['roads'], queryFn: mockApi.getRoads });
  const { data: resources = [] } = useQuery({ queryKey: ['resources'], queryFn: mockApi.getResources });
  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: mockApi.getAreas });
  const { data: bridges = [] } = useQuery({ queryKey: ['bridges'], queryFn: mockApi.getBridges });
  const { data: planData } = useQuery({
    queryKey: ['planHistory'],
    queryFn: () => mockApi.getPlanHistory('PLAN-OPERATIONAL-01'),
    refetchInterval: 5000,
  });

  const [selectedAsgnId, setSelectedAsgnId] = useState<string>('ASGN-PROPOSED-01');
  const [isEditing, setIsEditing] = useState(false);
  const [editUnitId, setEditUnitId] = useState('');
  const [editWardId, setEditWardId] = useState('');
  const [editReason, setEditReason] = useState('');

  const selectedAsgn = assignments.find((a) => a.id === selectedAsgnId) || assignments[0];

  const planHistory = planData?.versions || [];
  const activePlan = planHistory.length > 0 ? planHistory[planHistory.length - 1] : null;
  const comparison = planData?.comparison || null;
  const activeClosures: Record<string, string> = planData?.active_road_closures || {};

  const editMutation = useMutation({
    mutationFn: () =>
      mockApi.editAssignment(
        selectedAsgn.id,
        user ? `${user.name} (${user.role})` : 'Operator',
        editUnitId || selectedAsgn.unitId,
        editWardId || selectedAsgn.wardId,
        editReason || 'Operator manual route adjustment'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setIsEditing(false);
    },
  });

  const approvePlanMutation = useMutation({
    mutationFn: () =>
      mockApi.approvePlan(
        'PLAN-OPERATIONAL-01',
        activePlan?.version_number || 2,
        user ? `${user.name} (${user.role})` : 'Commander Chen (EMERGENCY_COMMANDER)'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planHistory'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['roads'] });
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    },
  });

  const rejectPlanMutation = useMutation({
    mutationFn: (reason: string) =>
      mockApi.rejectPlan(
        'PLAN-OPERATIONAL-01',
        activePlan?.version_number || 2,
        user ? `${user.name} (${user.role})` : 'Commander Chen (EMERGENCY_COMMANDER)',
        reason
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planHistory'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['roads'] });
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    },
  });

  const closeBridgeMutation = useMutation({
    mutationFn: (bridgeId: string) =>
      mockApi.closeBridgeAndReplan(bridgeId, '0.95m flood overtopping - corridor impassable'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planHistory'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['roads'] });
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    },
  });

  const reopenBridgeMutation = useMutation({
    mutationFn: (bridgeId: string) => mockApi.reopenBridge(bridgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planHistory'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['roads'] });
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    },
  });

  const isSelectedBridgeClosed = Boolean(activeClosures[selectedBridgeId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Routing Network & Dynamic Replanning
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time flood-risk weighted routing with autonomous OR-Tools CP-SAT replanning and human-in-the-loop approvals
          </p>
        </div>

        {/* Live Bridge Invalidation Controls */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pl-1">
            <BridgeIcon className="w-4 h-4 text-blue-600" />
            <span>Arterial Bridge:</span>
          </label>
          <select
            value={selectedBridgeId}
            onChange={(e) => setSelectedBridgeId(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
          >
            {bridges.length > 0 ? (
              bridges.map((b: any) => (
                <option key={b.bridge_id} value={b.bridge_id}>
                  {b.name} ({b.bridge_id}) {activeClosures[b.bridge_id] ? '[CLOSED]' : '[OPEN]'}
                </option>
              ))
            ) : (
              <option value="BR-PERUR-01">Perur Noyyal Bridge (BR-PERUR-01)</option>
            )}
          </select>

          {isSelectedBridgeClosed ? (
            <button
              onClick={() => reopenBridgeMutation.mutate(selectedBridgeId)}
              disabled={reopenBridgeMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{reopenBridgeMutation.isPending ? 'Reopening...' : 'Reopen Bridge'}</span>
            </button>
          ) : (
            <button
              onClick={() => closeBridgeMutation.mutate(selectedBridgeId)}
              disabled={closeBridgeMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{closeBridgeMutation.isPending ? 'Simulating...' : 'Sever & Trigger Replan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Network Alert if bridge closed */}
      {Object.keys(activeClosures).length > 0 && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">
                ACTIVE CORRIDOR BREACH: {Object.keys(activeClosures).length} Arterial Bridge(s) Severed
              </span>
              <p>
                {Object.entries(activeClosures).map(([id, reason]) => `${id}: ${reason}`).join(' | ')}.
                Affected missions are held pending Emergency Commander plan authorization.
              </p>
            </div>
          </div>
          {activePlan && activePlan.status === 'PENDING_APPROVAL' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => approvePlanMutation.mutate()}
                disabled={approvePlanMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Authorize Plan v{activePlan.version_number}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs between ReplannerPanel and Corridors View */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('replanner')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-colors ${
            activeTab === 'replanner'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Dynamic Replanner & Impact Matrix</span>
          {activePlan?.status === 'PENDING_APPROVAL' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold animate-pulse">
              Pending
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('corridors')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-colors ${
            activeTab === 'corridors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mission Corridors & Route Inspector</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600">
            {assignments.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'replanner' ? (
        <div className="min-h-[500px]">
          <ReplannerPanel
            planHistory={planHistory}
            activePlan={activePlan}
            comparison={comparison}
            activeClosures={activeClosures}
            isApproving={approvePlanMutation.isPending}
            onApprove={() => approvePlanMutation.mutate()}
            onReject={(reason: string) => rejectPlanMutation.mutate(reason)}
            bridges={bridges}
          />
        </div>
      ) : (
        /* Corridor Routes Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Assignment Picker */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Active Mission Assignments
            </h3>
            <div className="space-y-2">
              {assignments.map((asgn) => (
                <div
                  key={asgn.id}
                  onClick={() => {
                    setSelectedAsgnId(asgn.id);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedAsgnId === asgn.id
                      ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{asgn.unitCallsign}</span>
                    <span className="font-mono text-slate-500 uppercase">{asgn.state}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Target: {asgn.wardName}</p>
                  <div className="flex items-center justify-between pt-1 border-t mt-1 font-mono text-[11px] text-slate-500">
                    <span>ETA: {asgn.primaryRoute.etaMinutes}m</span>
                    <span>Dist: {asgn.primaryRoute.distanceKm}km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center & Right: Selected Route Details & Edit Mode */}
          <div className="lg:col-span-2 space-y-6">
            {selectedAsgn && (
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {selectedAsgn.unitCallsign} ➔ {selectedAsgn.wardName}
                    </h3>
                    <span className="text-slate-400 font-mono">Assignment ID: {selectedAsgn.id}</span>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditUnitId(selectedAsgn.unitId);
                        setEditWardId(selectedAsgn.wardId);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Unit or Destination
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => editMutation.mutate()}
                        disabled={editMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {editMutation.isPending ? 'Validating...' : 'Recalculate Route'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit Mode Controls */}
                {isEditing && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1">Swap Assigned Unit:</label>
                        <select
                          value={editUnitId}
                          onChange={(e) => setEditUnitId(e.target.value)}
                          className="w-full p-2 rounded border bg-white dark:bg-slate-800"
                        >
                          {resources.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.callsign} ({r.type})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Change Target Sector:</label>
                        <select
                          value={editWardId}
                          onChange={(e) => setEditWardId(e.target.value)}
                          className="w-full p-2 rounded border bg-white dark:bg-slate-800"
                        >
                          {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Reason for manual change:</label>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="e.g. Higher ground access requested by field team"
                        className="w-full p-2 rounded border bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* Route Comparison Table (Primary vs Alternative) */}
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Evaluated Route Corridors
                  </span>
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[10px]">
                        <th className="p-2.5">Corridor Route</th>
                        <th className="p-2.5 text-right">Distance (km)</th>
                        <th className="p-2.5 text-right">ETA (min)</th>
                        <th className="p-2.5 text-right">Flood Risk Score</th>
                        <th className="p-2.5">Dependent Road Segments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="bg-emerald-50/30 dark:bg-emerald-950/20 font-medium">
                        <td className="p-2.5 text-emerald-800 dark:text-emerald-300 font-bold">
                          Primary (Fastest Corridor)
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {selectedAsgn.primaryRoute.distanceKm} km
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-600">
                          {selectedAsgn.primaryRoute.etaMinutes} mins
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {(selectedAsgn.primaryRoute.riskScore * 100).toFixed(0)}%
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {selectedAsgn.primaryRoute.dependentEdges.join(', ')}
                        </td>
                      </tr>

                      {selectedAsgn.alternativeRoute && (
                        <tr className="text-slate-600 dark:text-slate-400">
                          <td className="p-2.5 font-semibold">Alternative Bypass</td>
                          <td className="p-2.5 text-right font-mono">
                            {selectedAsgn.alternativeRoute.distanceKm} km
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {selectedAsgn.alternativeRoute.etaMinutes} mins
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {(selectedAsgn.alternativeRoute.riskScore * 100).toFixed(0)}%
                          </td>
                          <td className="p-2.5 font-mono text-[11px]">
                            {selectedAsgn.alternativeRoute.dependentEdges.join(', ')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Rationale explanation */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Autonomous Routing Rationale:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 italic">"{selectedAsgn.rationale}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
