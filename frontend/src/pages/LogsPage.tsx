import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ListOrdered,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Info,
  ShieldAlert,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { useUiStore } from '@/store/useUiStore';
import type { LogEntry } from '@/types';

export const LogsPage: React.FC = () => {
  const { openDecisionCard } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const { data: logs = [] } = useQuery({ queryKey: ['logs'], queryFn: mockApi.getLogs });

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || l.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const severityStyles = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    override: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            System Event & Operator Audit Logs
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable trace of operator confirmations, manual overrides, autonomous suggestions, and sensor events
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs, actors, entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-xs w-56"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="override">Operator Override</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-black shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="p-3 w-28">Timestamp</th>
              <th className="p-3 w-24">Severity</th>
              <th className="p-3 w-40">Actor</th>
              <th className="p-3 w-32">Entity</th>
              <th className="p-3">Summary & Override Justification</th>
              <th className="p-3 w-20 text-center">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="p-3 text-slate-400 font-medium">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      severityStyles[log.severity]
                    }`}
                  >
                    {log.severity}
                  </span>
                </td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 font-sans">
                  {log.actor}
                </td>
                <td className="p-3 text-slate-500 font-sans">{log.entity}</td>
                <td className="p-3 font-sans">
                  <span className="text-slate-800 dark:text-slate-200 block">{log.summary}</span>
                  {log.overrideReason && (
                    <span className="text-amber-600 dark:text-amber-400 italic block mt-0.5">
                      Mandatory Reason: "{log.overrideReason}"
                    </span>
                  )}
                </td>
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  {log.decisionId && (
                    <button
                      onClick={() => openDecisionCard(log.decisionId!)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950"
                      title="Open linked decision card"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
