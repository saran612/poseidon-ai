import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'critical' | 'warning' | 'safe';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
    critical: 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20',
    warning: 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20',
    safe: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20',
  };

  const iconStyles = {
    default: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
    critical: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70',
    safe: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70',
  };

  return (
    <div className={`p-4 rounded-xl border ${variantStyles[variant]} shadow-xs space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <span className={`p-2 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
      )}
    </div>
  );
};
