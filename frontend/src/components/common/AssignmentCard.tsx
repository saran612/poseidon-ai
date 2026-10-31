import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Edit3, HelpCircle, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { mockApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useUiStore } from '@/store/useUiStore';
import type { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  compact?: boolean;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, compact = false }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { openDecisionCard } = useUiStore();

  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve' | 'reject' | 'edit';
    open: boolean;
  } | null>(null);

  const [reasonInput, setReasonInput] = useState('');
  const canOperate = user?.role === 'Operator' || user?.role === 'Supervisor';

  const approveMutation = useMutation({
    mutationFn: () =>
      mockApi.approveAssignment(assignment.id, user ? `${user.name} (${user.role})` : 'Operator'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setConfirmDialog(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      mockApi.rejectAssignment(
        assignment.id,
        user ? `${user.name} (${user.role})` : 'Operator',
        reasonInput || 'Operational constraints on the ground.'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setConfirmDialog(null);
      setReasonInput('');
    },
  });

  const stateBadges = {
    proposed: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300',
    active: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 animate-pulse',
    rejected: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300',
    completed: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <div
      className={`border rounded-xl transition-all ${
        assignment.state === 'proposed'
          ? 'border-blue-400 bg-blue-50/20 dark:border-blue-700 dark:bg-blue-950/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      } p-3.5 space-y-2.5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              {assignment.unitCallsign}
            </h4>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                stateBadges[assignment.state]
              }`}
            >
              {assignment.state}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Target: <span className="font-medium text-slate-700 dark:text-slate-200">{assignment.wardName}</span>
          </p>
        </div>

        <button
          onClick={() => openDecisionCard(`DEC-${assignment.id}`)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Why?
        </button>
      </div>

      {/* Rationale & Route Stats */}
      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
        "{assignment.rationale}"
      </p>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-500" />
          ETA: {assignment.primaryRoute.etaMinutes} mins
        </span>
        <span>Dist: {assignment.primaryRoute.distanceKm} km</span>
        <span>Risk: {(assignment.primaryRoute.riskScore * 100).toFixed(0)}%</span>
      </div>

      {/* Human in the loop action buttons */}
      {assignment.state === 'proposed' && (
        <div className="pt-2 flex items-center gap-2">
          {canOperate ? (
            <>
              <button
                onClick={() => setConfirmDialog({ type: 'approve', open: true })}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => setConfirmDialog({ type: 'reject', open: true })}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-600 dark:border-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              Viewer role (read-only; action buttons disabled)
            </span>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog && confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-base">
                {confirmDialog.type === 'approve'
                  ? 'Confirm Relief Unit Dispatch'
                  : 'Confirm Assignment Rejection'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.type === 'approve' ? (
                <>
                  You are about to authorize dispatch of{' '}
                  <span className="font-bold">{assignment.unitCallsign}</span> to{' '}
                  <span className="font-bold">{assignment.wardName}</span> with an estimated arrival time of{' '}
                  <span className="font-bold">{assignment.primaryRoute.etaMinutes} minutes</span>.
                </>
              ) : (
                <>
                  Please provide a mandatory operational justification for rejecting the autonomous proposal for{' '}
                  <span className="font-bold">{assignment.unitCallsign}</span>:
                </>
              )}
            </p>

            {confirmDialog.type === 'reject' && (
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. Unit reassigned to critical secondary dyke; alternative team en route."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              {confirmDialog.type === 'approve' ? (
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {approveMutation.isPending ? 'Confirming...' : 'Yes, Dispatch Unit'}
                </button>
              ) : (
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending || !reasonInput.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  {rejectMutation.isPending ? 'Submitting...' : 'Confirm Rejection'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
