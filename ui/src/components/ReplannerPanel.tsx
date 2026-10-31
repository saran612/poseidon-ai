import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import type { PlanVersion, PlanComparison, Bridge } from '../types';

interface ReplannerPanelProps {
  planHistory: PlanVersion[];
  activePlan: PlanVersion | null;
  comparison: PlanComparison | null;
  activeClosures: Record<string, string>;
  isApproving: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  bridges: Bridge[];
}

export const ReplannerPanel: React.FC<ReplannerPanelProps> = ({
  planHistory,
  activePlan,
  comparison,
  activeClosures,
  isApproving,
  onApprove,
  onReject,
  bridges,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'comparison' | 'diff' | 'history'>('overview');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Field patrol confirms bridge water level subsided; route clear.');

  const isPending = activePlan?.status === 'PENDING_APPROVAL';
  const latestDiff = activePlan?.diff;

  // Impact analysis computed strictly from closed bridges & graph relations
  const closedBridgeIds = Object.keys(activeClosures);
  const closedBridgesInfo = bridges.filter(b => closedBridgeIds.includes(b.bridge_id));

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-5 flex flex-col justify-between h-full">
      {/* 1. Header with Version Status & Sub-Navigation */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#172B4D]">Cascading Impact Replanner</h2>
              <p className="text-[11px] text-[#64748B]">
                OR-Tools CP-SAT Invalidation & Route Resynthesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded font-bold border flex items-center gap-1.5 ${
                isPending
                  ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                  : activePlan?.status === 'APPROVED'
                  ? 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]'
                  : 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPending ? 'bg-[#D97706] animate-pulse' : activePlan?.status === 'APPROVED' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                }`}
              />
              {activePlan ? `Plan v${activePlan.version_number} · ${activePlan.status}` : 'Plan v1 (Baseline)'}
            </span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-md border border-[#E2E8F0] text-xs mb-4">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex-1 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeSubTab === 'overview' ? 'bg-white text-[#2563EB] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            Overview & Impact
          </button>
          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`flex-1 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeSubTab === 'comparison' ? 'bg-white text-[#2563EB] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            Before & After
          </button>
          <button
            onClick={() => setActiveSubTab('diff')}
            className={`flex-1 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeSubTab === 'diff' ? 'bg-white text-[#2563EB] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            Changes Diff
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeSubTab === 'history' ? 'bg-white text-[#2563EB] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            Audit History
          </button>
        </div>

        {/* 2. SUBTAB: Overview & Impact Analysis */}
        {activeSubTab === 'overview' && (
          <div className="space-y-3.5">
            {/* Status Alert Banner */}
            <div
              className={`p-3 rounded-lg border text-xs leading-relaxed ${
                isPending
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                  : activePlan?.status === 'APPROVED'
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                  : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {isPending ? 'Action Required: Revised Plan Pending Sign-off' : `Operational Status: ${activePlan?.status || 'APPROVED'}`}
                </span>
                <span className="text-[10px] font-mono">
                  {activePlan?.solve_duration_ms ? `Solved in ${activePlan.solve_duration_ms}ms` : 'CP-SAT Opt'}
                </span>
              </div>
              <p className="mt-1 text-[11px] opacity-90">
                {latestDiff?.summary ||
                  activePlan?.trigger_description ||
                  'Baseline operational plan v1 active across all arterial Noyyal sectors.'}
              </p>
            </div>

            {/* Impact Analysis Breakdown */}
            <div className="bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-3 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-[#172B4D] font-bold border-b border-[#E2E8F0] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
                  Active Inundation & Segment Severance Impact
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded border border-[#CBD5E1] text-[#64748B]">
                  {closedBridgeIds.length} Cuts
                </span>
              </div>

              {closedBridgeIds.length > 0 ? (
                <div className="space-y-2">
                  {closedBridgesInfo.map(b => (
                    <div key={b.bridge_id} className="p-2.5 bg-white rounded border border-[#E2E8F0] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#DC2626]">{b.bridge_id}</span>
                        <span className="text-[9px] bg-[#FEF2F2] text-[#DC2626] font-bold px-1.5 py-0.5 rounded border border-[#FCA5A5]">
                          SEVERED
                        </span>
                      </div>
                      <div className="font-medium text-[#172B4D] text-[11px]">{b.name}</div>
                      <div className="text-[10px] text-[#64748B]">
                        Connected Zones: {b.connected_zones?.join(', ') || 'Corridor Reach'}
                      </div>
                      <div className="text-[10px] text-[#475569] bg-[#F8FAFC] p-1 rounded">
                        <strong>Impact:</strong> {b.route_dependency}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                      <span className="text-[#64748B] text-[10px]">Depots Rerouted:</span>
                      <div className="font-bold text-[#172B4D]">Peelamedu & RS Puram</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                      <span className="text-[#64748B] text-[10px]">Medical Access:</span>
                      <div className="font-bold text-[#2563EB]">CMCH / PSG Hospital</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-[#64748B]">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] mx-auto mb-1" />
                  <p className="font-medium text-[11px]">All 4 candidate bridges fully intact.</p>
                  <p className="text-[10px] text-[#94A3B8]">
                    Click any bridge on the GIS map or bridge cards to simulate a flood cut.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SUBTAB: Before-and-After Comparison Table */}
        {activeSubTab === 'comparison' && (
          <div className="space-y-3">
            <div className="text-xs text-[#64748B] leading-relaxed">
              Comparison between <strong>Previous Operational Posture</strong> and{' '}
              <strong>Proposed CP-SAT Replanned Posture</strong>:
            </div>

            {comparison ? (
              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Metric</th>
                      <th className="py-2.5 px-3">Previous Plan</th>
                      <th className="py-2.5 px-3">Proposed Plan</th>
                      <th className="py-2.5 px-3 text-right">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#172B4D]">Reachable Zones</td>
                      <td className="py-2.5 px-3 text-[#64748B] font-mono">{comparison.reachable_zones.previous}</td>
                      <td className="py-2.5 px-3 font-bold text-[#172B4D] font-mono">{comparison.reachable_zones.proposed}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-[#16A34A]">{comparison.reachable_zones.delta}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#172B4D]">Affected Assignments</td>
                      <td className="py-2.5 px-3 text-[#64748B] font-mono">{comparison.affected_assignments.previous}</td>
                      <td className="py-2.5 px-3 font-bold text-[#D97706] font-mono">{comparison.affected_assignments.proposed}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-[#D97706]">+{comparison.affected_assignments.delta}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#172B4D]">Estimated Response Time</td>
                      <td className="py-2.5 px-3 text-[#64748B] font-mono">{comparison.estimated_response_time.previous}</td>
                      <td className="py-2.5 px-3 font-bold text-[#2563EB] font-mono">{comparison.estimated_response_time.proposed}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-[#2563EB]">{comparison.estimated_response_time.delta}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#172B4D]">Unmet Relief Demand</td>
                      <td className="py-2.5 px-3 text-[#64748B] font-mono">{comparison.unmet_demand.previous}</td>
                      <td className="py-2.5 px-3 font-bold text-[#DC2626] font-mono">{comparison.unmet_demand.proposed}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-[#DC2626]">{comparison.unmet_demand.delta}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#172B4D]">Resource Utilization</td>
                      <td className="py-2.5 px-3 text-[#64748B] font-mono">{comparison.resource_utilization.previous}</td>
                      <td className="py-2.5 px-3 font-bold text-[#16A34A] font-mono">{comparison.resource_utilization.proposed}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-[#16A34A]">{comparison.resource_utilization.delta}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-center text-[#64748B]">
                Baseline plan active. Comparison will populate when an arterial closure is injected.
              </div>
            )}
          </div>
        )}

        {/* 4. SUBTAB: Changes Diff (Rerouted, Cancelled, New) */}
        {activeSubTab === 'diff' && (
          <div className="space-y-3">
            {latestDiff && latestDiff.rerouted && latestDiff.rerouted.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#172B4D]">
                  Rerouted Dispatches ({latestDiff.rerouted.length}):
                </div>
                {latestDiff.rerouted.map((r, i) => (
                  <div key={i} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs">
                    <div className="flex justify-between items-center font-bold text-[#172B4D]">
                      <span className="flex items-center gap-1.5">
                        {r.depot_id} <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" /> {r.zone_id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        REROUTED
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#E2E8F0] text-[11px]">
                      <div>
                        <span className="text-[#64748B]">Old ETA:</span>{' '}
                        <span className="font-mono text-[#64748B]">{r.old_travel_time || r.old_time} min</span>
                      </div>
                      <div>
                        <span className="text-[#64748B]">New Detour ETA:</span>{' '}
                        <span className="font-mono font-bold text-[#2563EB]">{r.new_travel_time || r.new_time} min</span>
                      </div>
                    </div>
                    {r.new_path && (
                      <div className="mt-1 text-[10px] text-[#64748B] font-mono truncate">
                        Path: {r.new_path.join(' ➔ ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-center text-[#64748B] text-xs">
                No active assignment reroutes in current plan version.
              </div>
            )}
          </div>
        )}

        {/* 5. SUBTAB: Version Audit History */}
        {activeSubTab === 'history' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-[#172B4D] mb-1">Plan Audit Trail & Sign-offs:</div>
            {planHistory.map(v => (
              <div key={v.version_number} className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#172B4D]">Plan Version v{v.version_number}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      v.status === 'APPROVED'
                        ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                        : v.status === 'PENDING_APPROVAL'
                        ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                        : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5">{v.trigger_description}</div>
                <div className="flex justify-between items-center text-[10px] text-[#94A3B8] mt-1 pt-1 border-t border-[#E2E8F0]">
                  <span>Sign-off: {v.approved_by || 'Awaiting Authorization'}</span>
                  <span>{v.approved_at ? new Date(v.approved_at).toLocaleTimeString() : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Human Authorization Gate (Subject to District Command Approval) */}
      {isPending && (
        <div className="pt-4 border-t border-[#E2E8F0] mt-4">
          <div className="p-2.5 bg-[#FEF2F2] rounded-md border border-[#FCA5A5] text-[#991B1B] text-[11px] mb-3 leading-relaxed flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <strong>Human Authorization Gate:</strong> Operational dispatches held. Requires District Command sign-off
              to commit routing changes to field terminals.
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onApprove}
              disabled={isApproving}
              className="flex-1 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-md text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isApproving ? 'Authorizing Dispatch...' : `Authorize Plan v${activePlan.version_number}`}
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isApproving}
              className="px-3 py-2 bg-white hover:bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] font-semibold rounded-md text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xl max-w-md w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-3">
              <span className="font-bold text-sm text-[#172B4D] flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-[#DC2626]" />
                Reject Proposed Plan v{activePlan?.version_number}
              </span>
              <button onClick={() => setShowRejectModal(false)} className="text-[#64748B] hover:text-[#172B4D]">
                ✕
              </button>
            </div>
            <p className="text-[#64748B] mb-2 leading-relaxed">
              State the operational reason for rejecting this proposed replan. The system will revert to the previous
              active operational plan posture.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-2 border border-[#CBD5E1] rounded text-xs mb-4 h-20 focus:outline-none focus:border-[#2563EB]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 rounded border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(rejectReason);
                  setShowRejectModal(false);
                }}
                className="px-3 py-1.5 rounded bg-[#DC2626] text-white font-bold hover:bg-[#B91C1C] cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
