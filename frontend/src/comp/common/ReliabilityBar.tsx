import React from 'react';

interface ReliabilityBarProps {
  score: number; // 0 to 1
  showNumeric?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ReliabilityBar: React.FC<ReliabilityBarProps> = ({
  score,
  showNumeric = true,
  size = 'md',
  className = '',
}) => {
  const percentage = Math.round(Math.max(0, Math.min(1, score)) * 100);

  // Accessible color coding + pattern
  const getColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getAriaLabel = (p: number) => {
    if (p >= 80) return `High reliability: ${percentage}%`;
    if (p >= 60) return `Medium reliability: ${percentage}%`;
    return `Low reliability: ${percentage}%`;
  };

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${heightClass}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={getAriaLabel(percentage)}
      >
        <div
          className={`${heightClass} rounded-full transition-all duration-300 ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showNumeric && (
        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 min-w-[32px] text-right">
          {score.toFixed(2)}
        </span>
      )}
    </div>
  );
};
