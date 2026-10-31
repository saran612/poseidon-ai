import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Send, Inbox, AlertTriangle } from 'lucide-react';
import { mockApi } from '@/lib/api';
import { useUiStore } from '@/store/useUiStore';
import { AssignmentCard } from './AssignmentCard';

export const DispatchQueueDrawer: React.FC = () => {
  const { dispatchQueueOpen, setDispatchQueueOpen } = useUiStore();

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: mockApi.getAssignments,
  });

  const proposedAssignments = assignments.filter((a) => a.state === 'proposed');

  if (!dispatchQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Dispatch Queue
              </h3>
              <p className="text-xs text-slate-500">
                {proposedAssignments.length} pending human approvals
              </p>
            </div>
          </div>
          <button
            onClick={() => setDispatchQueueOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>Humans Decide Protocol:</strong> Autonomous system proposed these allocations.
            Units will remain idle until an operator explicitly confirms dispatch.
          </span>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {proposedAssignments.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Inbox className="w-12 h-12 mb-2 stroke-1 opacity-60" />
              <p className="font-medium text-slate-600 dark:text-slate-300">All proposals reviewed</p>
              <p className="text-xs mt-1">No pending dispatches awaiting confirmation.</p>
            </div>
          ) : (
            proposedAssignments.map((asgn) => (
              <AssignmentCard key={asgn.id} assignment={asgn} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
