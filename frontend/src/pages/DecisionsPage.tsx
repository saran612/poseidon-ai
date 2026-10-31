import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { useUiStore } from '@/store/useUiStore';
import { TierBadge } from '@/comp/common/TierBadge';
import { ReliabilityBar } from '@/comp/common/ReliabilityBar';
import { INITIAL_DECISIONS } from '@/mock/seedData';

export const DecisionsPage: React.FC = () => {
  const { openDecisionCard } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const decisionList = Object.values(INITIAL_DECISIONS);

  const filtered = decisionList.filter((dec) => {
    const matchesSearch =
      dec.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dec.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || dec.entityType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Explainable Priority & Allocation Decisions
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete attribution ledger for every priority rank, unit allocation, route pick, and replan
          </p>
        </div>

        {/* Search & Type filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search decisions or wards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-xs w-56"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-xs"
          >
            <option value="ALL">All Types</option>
            <option value="priority">Priority Area</option>
            <option value="assignment">Assignment</option>
            <option value="route">Route</option>
            <option value="replan">Replan</option>
          </select>
        </div>
      </div>

      {/* Decision Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((dec) => (
          <div
            key={dec.id}
            onClick={() => openDecisionCard(dec.id)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black hover:border-blue-500 cursor-pointer shadow-xs transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px] uppercase">
                {dec.entityType}
              </span>
              <span className="font-mono text-xs text-slate-400">{dec.id}</span>
            </div>

            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {dec.summary}
            </h3>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Counterfactual Preview:
              </span>
              <p className="text-slate-500 dark:text-slate-400 italic line-clamp-2">
                "{dec.counterfactual}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">{dec.evidenceList.length} evidence sources</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Full Card <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
