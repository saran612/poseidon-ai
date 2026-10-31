import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label?: string;
  title?: string;
  value: string | number;
  caption?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  tierDistribution?: {
    t1: number;
    t2: number;
    t3: number;
    t4: number;
  };
  severity?: 'critical' | 'high' | 'warning' | 'safe' | 'info' | 'default';
  variant?: 'default' | 'critical' | 'warning' | 'safe';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  title,
  value,
  caption,
  subtitle,
  icon: Icon,
  trend,
  tierDistribution,
  severity,
  variant = 'default',
  className = '',
}) => {
  const displayLabel = label || title || '';
  const displayCaption = caption || subtitle || '';
  const resolvedSeverity = severity || (variant === 'default' ? 'default' : variant);

  // Border accent for severity indication without colored backgrounds
  const severityBorder = {
    default: 'border-l-4 border-l-slate-400 dark:border-l-slate-600',
    critical: 'border-l-4 border-l-rose-600 dark:border-l-rose-500',
    high: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
    warning: 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400',
    safe: 'border-l-4 border-l-emerald-600 dark:border-l-emerald-500',
    info: 'border-l-4 border-l-blue-600 dark:border-l-blue-400',
  }[resolvedSeverity];

  const iconColor = {
    default: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
    critical: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60',
    high: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60',
    warning: 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/60',
    safe: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60',
    info: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60',
  }[resolvedSeverity];

  return (
    <div
      className={`p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs flex flex-col justify-between ${severityBorder} ${className}`}
    >
      {/* Top: Label & Icon Chip */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">
          {displayLabel}
        </span>
        <span className={`p-1.5 rounded-md ${iconColor} shrink-0`} aria-hidden="true">
          <Icon className="w-4 h-4" />
        </span>
      </div>

      {/* Middle: Main Value with optional trend */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-slate-50 font-sans">
          {value}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              trend.isPositive
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {/* Bottom: Caption or Tier Distribution Bar */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between min-h-[20px]">
        <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">
          {displayCaption}
        </p>

        {tierDistribution && (
          <div
            className="flex items-center h-2 w-16 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ml-1.5"
            title={`T1: ${tierDistribution.t1}%, T2: ${tierDistribution.t2}%, T3: ${tierDistribution.t3}%, T4: ${tierDistribution.t4}%`}
          >
            <div style={{ width: `${tierDistribution.t1}%` }} className="h-full bg-blue-600" />
            <div style={{ width: `${tierDistribution.t2}%` }} className="h-full bg-emerald-500" />
            <div style={{ width: `${tierDistribution.t3}%` }} className="h-full bg-amber-500" />
            <div style={{ width: `${tierDistribution.t4}%` }} className="h-full bg-rose-500" />
          </div>
        )}
      </div>
    </div>
  );
};
