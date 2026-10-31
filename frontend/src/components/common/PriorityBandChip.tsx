import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import type { PriorityBand } from '@/types';
import { bandFromScore } from '@/lib/priority';

interface PriorityBandChipProps {
  band?: PriorityBand;
  score?: number;
  className?: string;
}

export const PriorityBandChip: React.FC<PriorityBandChipProps> = ({ band, score, className = '' }) => {
  const effectiveBand = score !== undefined ? bandFromScore(score) : (band || 'LOW');

  const config = {
    CRITICAL: {
      label: 'CRITICAL',
      icon: AlertCircle,
      classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800',
    },
    HIGH: {
      label: 'HIGH',
      icon: AlertTriangle,
      classes: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
    },
    MEDIUM: {
      label: 'MEDIUM',
      icon: Info,
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/70 dark:text-yellow-200 dark:border-yellow-800',
    },
    LOW: {
      label: 'LOW',
      icon: ShieldCheck,
      classes: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
  }[effectiveBand];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase ${config.classes} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      {config.label}
      {score !== undefined && <span className="font-mono ml-1 font-semibold opacity-90">({score.toFixed(1)})</span>}
    </span>
  );
};
