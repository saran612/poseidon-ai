import React from 'react';
import { TierBadge } from './TierBadge';
import { ReliabilityBar } from './ReliabilityBar';
import { StaleBadge } from './StaleBadge';
import type { ReliabilityTier } from '@/types';

export interface EvidenceItem {
  source: string;
  tier: ReliabilityTier;
  reliability: number;
  ageMinutes: number;
  snippet: string;
}

interface EvidenceLedgerProps {
  evidence: EvidenceItem[];
  className?: string;
}

export const EvidenceLedger: React.FC<EvidenceLedgerProps> = ({ evidence, className = '' }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Evidence Ledger ({evidence.length} sources)
      </h4>
      <div className="space-y-2">
        {evidence.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <TierBadge tier={item.tier} />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.source}</span>
              </div>
              <StaleBadge lastUpdated={new Date(Date.now() - item.ageMinutes * 60000).toISOString()} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 italic">"{item.snippet}"</p>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Reliability Score:</span>
              <ReliabilityBar score={item.reliability} size="sm" className="w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
