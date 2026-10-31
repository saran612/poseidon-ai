import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Navigation,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Bridge,
  Clock,
  ArrowRight,
  ShieldAlert,
  Edit,
  Save,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { realtimeClient } from '@/lib/realtime';
import { useAuthStore } from '@/store/useAuthStore';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { PriorityBandChip } from '@/comp/common/PriorityBandChip';
import type { Assignment } from '@/types';

export const RoutingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { activeReplanDiff, setActiveReplanDiff } = useRealtimeStore();

  const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: mockApi.getAssignments });
  const { data: roads = [] } = useQuery({ queryKey: ['roads'], queryFn: mockApi.getRoads });
  const { data: resources = [] } = useQuery({ queryKey: ['resources'], queryFn: mockApi.getResources });
  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: mockApi.getAreas });

  const [selectedAsgnId, setSelectedAsgnId] = useState<string>('ASGN-PROPOSED-01');
  const [isEditing, setIsEditing] = useState(false);
  const [editUnitId, setEditUnitId] = useState('');
  const [editWardId, setEditWardId] = useState('');
  const [editReason, setEditReason] = useState('');

  const selectedAsgn = assignments.find((a) => a.id === selectedAsgnId) || assignments[0];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Routing Network & Dynamic Replanning
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time flood-risk weighted routing with autonomous re-planning diffs on road/bridge closures
          </p>
        </div>

        {/* Demo Button: Trigger Bridge Closure End-to-End */}
        <button
          onClick={() => realtimeClient.triggerBridgeClosure()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all animate-pulse"
        >
          <Bridge className="w-4 h-4" />
          <span>Simulate Bridge Closure & Trigger Replan Diff</span>
        </button>
      </div>

      {/* Network Alert if bridge closed */}
      {roads.some((r) => r.isBridge && r.status === 'closed') && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">CRITICAL CORRIDOR BREACH: Musi Corridor Bridge Closed</span>
              <p>
                Cyclone Arnab flood waters reached 0.95m overtopping Puranapul Musi River Bridge (BR-PERUR-01). All units
                utilizing this artery have been isolated and queued for rerouting approval.
              </p>
            </div>
          </div>
          {activeReplanDiff && (
            <button
              onClick={() => setActiveReplanDiff(activeReplanDiff)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs shrink-0 shadow-xs"
            >
              View Active Replan Diff
            </button>
          )}
        </div>
      )}

      {/* Grid: Route Inspector & Comparison Table */}
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
                    ? 'border-blue-500 bg-white dark:bg-black shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-black'
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
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs space-y-4 text-xs">
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
    </div>
  );
};
