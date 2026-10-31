import React from 'react';
import type { FactorBreakdown } from '@/types';

interface FactorBarsProps {
  factors: FactorBreakdown;
  className?: string;
}

export const FactorBars: React.FC<FactorBarsProps> = ({ factors, className = '' }) => {
  const items = [
    { label: 'Severity (S)', value: factors.severity, color: 'bg-rose-500' },
    { label: 'Vulnerability (V)', value: factors.vulnerability, color: 'bg-orange-500' },
    { label: 'Urgency (U)', value: factors.urgency, color: 'bg-amber-500' },
    { label: 'Exposure (E)', value: factors.exposure, color: 'bg-indigo-500' },
    { label: 'Unmet Need (N)', value: 1 - factors.needCoverage, color: 'bg-purple-500' },
    { label: 'Waiting Bonus', value: factors.waitingBonus * 2, color: 'bg-cyan-500' },
  ];

  return (
    <div className={`space-y-1.5 text-xs ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="w-28 text-slate-600 dark:text-slate-400 truncate" title={item.label}>
            {item.label}
          </span>
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${item.color}`}
              style={{ width: `${Math.min(100, Math.round(item.value * 100))}%` }}
            />
          </div>
          <span className="w-8 font-mono text-right text-slate-700 dark:text-slate-300">
            {item.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};
