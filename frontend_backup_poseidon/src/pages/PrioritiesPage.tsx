import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Save,
  Radio,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { PriorityBandChip } from '@/components/common/PriorityBandChip';
import { FactorBars } from '@/components/common/FactorBars';
import { ReliabilityBar } from '@/components/common/ReliabilityBar';
import { TierBadge } from '@/components/common/TierBadge';
import { StaleBadge } from '@/components/common/StaleBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { useUiStore } from '@/store/useUiStore';
import type { PriorityWeights } from '@/types';

export const PrioritiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { openDecisionCard } = useUiStore();
  const isSupervisor = user?.role === 'Supervisor';

  const [expandedWardId, setExpandedWardId] = useState<string | null>('ZONE_UKKADAM');
  const [bandFilter, setBandFilter] = useState<string>('ALL');

  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: mockApi.getAreas });
  const { data: weights } = useQuery({ queryKey: ['weights'], queryFn: mockApi.getWeights });

  // Weights state for live re-ranking preview
  const [localWeights, setLocalWeights] = useState<Partial<PriorityWeights>>({
    severityWeight: 0.3,
    vulnerabilityWeight: 0.25,
    urgencyWeight: 0.2,
    exposureWeight: 0.15,
    needWeight: 0.1,
  });

  const updateWeightsMutation = useMutation({
    mutationFn: () =>
      mockApi.updateWeights(
        localWeights,
        user ? `${user.name} (${user.role})` : 'Supervisor'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['weights'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  const filteredAreas = areas.filter(
    (area) => bandFilter === 'ALL' || area.band === bandFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Affected-Area Prioritization & Scoring
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamic mathematical ranking based on Severity (S), Vulnerability (V), Urgency (U),
            Exposure (E), and Unmet Need (N)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Band:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((b) => (
            <button
              key={b}
              onClick={() => setBandFilter(b)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                bandFilter === b
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Supervisor Weight Adjustment Panel */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Scoring Weight Parameters {isSupervisor ? '(Supervisor Mode)' : '(Read-Only)'}
            </h3>
          </div>
          {isSupervisor && (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setLocalWeights({
                    severityWeight: 0.3,
                    vulnerabilityWeight: 0.25,
                    urgencyWeight: 0.2,
                    exposureWeight: 0.15,
                    needWeight: 0.1,
                  })
                }
                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
              <button
                onClick={() => updateWeightsMutation.mutate()}
                disabled={updateWeightsMutation.isPending}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {updateWeightsMutation.isPending ? 'Saving...' : 'Apply & Log Override'}
              </button>
            </div>
          )}
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
          {[
            { key: 'severityWeight', label: 'Severity (S)', val: localWeights.severityWeight ?? 0.3 },
            { key: 'vulnerabilityWeight', label: 'Vulnerability (V)', val: localWeights.vulnerabilityWeight ?? 0.25 },
            { key: 'urgencyWeight', label: 'Urgency (U)', val: localWeights.urgencyWeight ?? 0.2 },
            { key: 'exposureWeight', label: 'Exposure (E)', val: localWeights.exposureWeight ?? 0.15 },
            { key: 'needWeight', label: 'Unmet Need (N)', val: localWeights.needWeight ?? 0.1 },
          ].map((slider) => (
            <div key={slider.key} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{slider.label}</span>
                <span className="font-mono font-bold text-blue-600">{(slider.val * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                disabled={!isSupervisor}
                value={slider.val}
                onChange={(e) =>
                  setLocalWeights({
                    ...localWeights,
                    [slider.key]: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="p-3 w-12 text-center">Rank</th>
              <th className="p-3">Ward / Area</th>
              <th className="p-3">Priority Band</th>
              <th className="p-3 text-right">Score P</th>
              <th className="p-3 text-right">Confidence C</th>
              <th className="p-3 text-right">People At Risk</th>
              <th className="p-3 text-right">Assigned</th>
              <th className="p-3 text-right">Waiting</th>
              <th className="p-3">Reliability & Tier</th>
              <th className="p-3 text-center">Explain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAreas.map((area) => {
              const isExpanded = expandedWardId === area.id;
              return (
                <React.Fragment key={area.id}>
                  <tr
                    onClick={() => setExpandedWardId(isExpanded ? null : area.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-center font-mono font-bold text-slate-400">
                      #{area.rank}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{area.name}</span>
                        {area.precautionaryEscalation && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                            Precautionary
                          </span>
                        )}
                        {area.isSilent && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                            Silent Area
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <PriorityBandChip band={area.band} />
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {area.scoreP.toFixed(1)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      {(area.confidenceC * 100).toFixed(0)}%
                    </td>
                    <td className="p-3 text-right font-mono">
                      {area.peopleAtRisk.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {area.assignedUnits} units
                    </td>
                    <td className="p-3 text-right font-mono text-amber-600 font-semibold">
                      {area.waitingTimeMinutes}m
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <TierBadge tier={area.tier} />
                        <ReliabilityBar score={area.reliability} size="sm" className="w-20" />
                      </div>
                    </td>
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openDecisionCard(`DEC-${area.id}`)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded"
                        title="Explain Priority Decision"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row with Factor Breakdown */}
                  {isExpanded && (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/40">
                      <td colSpan={10} className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Mathematical Factor Composition ($S, V, U, E, N$)
                            </h4>
                            <FactorBars factors={area.factors} />
                          </div>
                          <div className="space-y-2 text-xs">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Operational Context & Actions
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300">
                              Primary required resource class: <strong>{area.primaryNeed}</strong>
                            </p>
                            <p className="text-slate-500">
                              Coordinates: {area.coordinates[0]}, {area.coordinates[1]}
                            </p>
                            <StaleBadge lastUpdated={area.lastUpdated} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
