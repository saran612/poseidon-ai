import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, HelpCircle, CheckCircle, AlertTriangle, ShieldCheck, History } from 'lucide-react';
import { mockApi } from '@/lib/api';
import { TierBadge } from './TierBadge';
import { ReliabilityBar } from './ReliabilityBar';
import { StaleBadge } from './StaleBadge';
import { useUiStore } from '@/store/useUiStore';

export const DecisionCardModal: React.FC = () => {
  const { selectedDecisionId, closeDecisionCard } = useUiStore();
  const [activeTab, setActiveTab] = useState<'decision' | 'counterfactual' | 'audit'>('decision');

  const { data: decision, isLoading } = useQuery({
    queryKey: ['decision', selectedDecisionId],
    queryFn: () => (selectedDecisionId ? mockApi.getDecision(selectedDecisionId) : null),
    enabled: !!selectedDecisionId,
  });

  if (!selectedDecisionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-black/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Explainable Decision Card
              </h3>
              <span className="text-xs font-mono text-slate-500">{selectedDecisionId}</span>
            </div>
          </div>
          <button
            onClick={closeDecisionCard}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {isLoading || !decision ? (
            <div className="p-8 text-center text-slate-500">Loading decision attribution...</div>
          ) : (
            <>
              {/* One sentence decision */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 block mb-1">
                  Autonomous Decision Rationale
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {decision.summary}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('decision')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'decision'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Mathematical Breakdown & Evidence
                </button>
                <button
                  onClick={() => setActiveTab('counterfactual')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'counterfactual'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Counterfactual & Alternatives
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'audit'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Human Action History ({decision.operatorHistory.length})
                </button>
              </div>

              {activeTab === 'decision' && (
                <div className="space-y-4">
                  {/* Factor contributions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Factor Contribution Weights
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(decision.factorContributions).map(([name, weight]) => (
                        <div key={name} className="flex items-center gap-3">
                          <span className="w-36 text-xs text-slate-600 dark:text-slate-400 truncate">{name}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${Math.round(weight * 100)}%` }}
                            />
                          </div>
                          <span className="w-10 text-xs font-mono text-right font-medium">
                            {(weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence list */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Underlying Evidence & Provenance
                    </h4>
                    <div className="space-y-2">
                      {decision.evidenceList.map((ev, i) => (
                        <div
                          key={i}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TierBadge tier={ev.tier} />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{ev.source}</span>
                            </div>
                            <StaleBadge lastUpdated={new Date(Date.now() - ev.ageMinutes * 60000).toISOString()} />
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">"{ev.snippet}"</p>
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[11px] text-slate-400">Reliability:</span>
                            <ReliabilityBar score={ev.reliability} size="sm" className="w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'counterfactual' && (
                <div className="space-y-4">
                  {/* Counterfactual */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                      Counterfactual Analysis ("What Would Change This?")
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200">{decision.counterfactual}</p>
                  </div>

                  {/* Sensitivity note */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Sensitivity Analysis:</span>
                    <p className="text-slate-600 dark:text-slate-400">{decision.sensitivityNote}</p>
                  </div>

                  {/* Alternatives considered */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Alternatives Evaluated & Reason for Rejection
                    </h4>
                    <div className="space-y-2">
                      {decision.alternativesConsidered.map((alt, i) => (
                        <div
                          key={i}
                          className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{alt.label}</span>
                            <span className="font-mono text-slate-500">Score: {alt.score.toFixed(1)}</span>
                          </div>
                          <p className="text-rose-600 dark:text-rose-400">Rejected reason: {alt.rejectedReason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fairness note if present */}
                  {decision.fairnessNote && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-xs">
                      <span className="font-semibold text-purple-800 dark:text-purple-300 block mb-0.5">
                        Fairness Constraint Enforcement:
                      </span>
                      <p className="text-purple-900 dark:text-purple-200">{decision.fairnessNote}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Human-in-the-Loop Operator Log
                  </h4>
                  {decision.operatorHistory.map((hist, i) => (
                    <div
                      key={i}
                      className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start gap-2 text-xs"
                    >
                      <History className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{hist.operatorName}</span>
                          <span className="text-[11px] text-slate-400">{hist.time}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{hist.action}</p>
                        {hist.reason && <p className="text-amber-600 dark:text-amber-400 italic">"{hist.reason}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-black/50 flex justify-end">
          <button
            onClick={closeDecisionCard}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Close Decision Card
          </button>
        </div>
      </div>
    </div>
  );
};
