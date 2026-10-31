import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, CheckCheck, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { mockApi } from '@/lib/api';

export const ReplanDiffModal: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeReplanDiff, setActiveReplanDiff } = useRealtimeStore();
  const { user } = useAuthStore();

  const canOperate = user?.role === 'Operator' || user?.role === 'Supervisor';

  const approveAllMutation = useMutation({
    mutationFn: async () => {
      if (!activeReplanDiff) return;
      // Approve all affected items
      for (const item of activeReplanDiff.affectedItems) {
        item.approved = true;
      }
      // Trigger log
      await mockApi.approveAssignment(
        activeReplanDiff.affectedItems[0]?.assignmentId || 'ASGN-PROPOSED-01',
        user?.name || 'Operator',
        `Batch Replan Approved: ${activeReplanDiff.triggerEvent}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['roads'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      setActiveReplanDiff(null);
    },
  });

  if (!activeReplanDiff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-black border-2 border-amber-500 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 animate-bounce" />
            <div>
              <h3 className="font-bold text-base">Network Disruption & Dynamic Replan Diff</h3>
              <p className="text-xs text-amber-100">{activeReplanDiff.triggerEvent}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-600 rounded text-xs font-mono font-bold">
            ACTION REQUIRED
          </span>
        </div>

        {/* Isolation Banner */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
          <span className="font-medium">
            Isolation Protocol: <strong>{activeReplanDiff.unaffectedAssignmentsCount}</strong> unaffected
            assignments preserved intact without modification.
          </span>
          <span className="font-mono bg-blue-200/60 dark:bg-blue-900 px-2 py-0.5 rounded text-[11px]">
            {activeReplanDiff.affectedItems.length} affected
          </span>
        </div>

        {/* Affected Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeReplanDiff.affectedItems.map((item) => (
            <div
              key={item.assignmentId}
              className="p-3.5 border rounded-lg bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.unitCallsign}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px] uppercase">
                    {item.reason}
                  </span>
                </div>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {item.wardName}
                </span>
              </div>

              {/* Old vs New comparison */}
              <div className="grid grid-cols-2 gap-2 p-2 bg-white dark:bg-black rounded border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Previous Route</span>
                  <p className="text-slate-700 dark:text-slate-300 line-through opacity-70">
                    {item.oldTarget}
                  </p>
                  <p className="font-mono text-slate-500">ETA: {item.oldEtaMinutes}m</p>
                </div>
                <div className="space-y-1 border-l pl-2 border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Re-routed Path
                  </span>
                  <p className="font-medium text-slate-900 dark:text-white">{item.newTarget}</p>
                  <p className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    ETA: {item.newEtaMinutes}m (+{item.newEtaMinutes - item.oldEtaMinutes}m)
                  </p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 italic">"{item.explanation}"</p>
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setActiveReplanDiff(null)}
            className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Review Later
          </button>

          {canOperate ? (
            <button
              onClick={() => approveAllMutation.mutate()}
              disabled={approveAllMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              {approveAllMutation.isPending
                ? 'Applying Reroutes...'
                : 'Approve All Replan Diffs & Dispatch'}
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Supervisor or Operator authorization required to dispatch reroutes.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
