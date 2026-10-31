import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface StaleBadgeProps {
  lastUpdated: string;
  thresholdMinutes?: number; // default 15 mins
  onRefresh?: () => void;
  className?: string;
}

export const StaleBadge: React.FC<StaleBadgeProps> = ({
  lastUpdated,
  thresholdMinutes = 15,
  onRefresh,
  className = '',
}) => {
  const updatedDate = new Date(lastUpdated);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - updatedDate.getTime()) / 60000);
  const isStale = diffMinutes >= thresholdMinutes;

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono ${
          isStale
            ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700 animate-pulse'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Clock className="w-3 h-3" />
        {diffMinutes <= 0 ? 'just now' : `${diffMinutes}m ago`}
        {isStale && <span className="font-bold uppercase tracking-wider ml-1 text-[10px] text-amber-700 dark:text-amber-300">Stale</span>}
      </span>

      {isStale && onRefresh && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          title="Request field verification"
          className="p-0.5 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
