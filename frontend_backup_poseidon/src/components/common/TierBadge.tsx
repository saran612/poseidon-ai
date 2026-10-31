import React from 'react';
import { ReliabilityTier, TierDescription } from '@/types';

interface TierBadgeProps {
  tier: ReliabilityTier;
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = '' }) => {
  const info = TierDescription[tier] || TierDescription.T4;

  return (
    <span
      title={info.desc}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${info.badgeClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {info.label}
    </span>
  );
};
