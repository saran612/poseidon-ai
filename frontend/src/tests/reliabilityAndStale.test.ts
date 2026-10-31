import { describe, it, expect } from 'vitest';
import { TierDescription, ReliabilityTier } from '@/types';

export const STALE_THRESHOLDS: Record<string, number> = {
  reports: 15,    // citizen / field reports stale after 15 min
  roads: 20,      // road status updates stale after 20 min
  sensors: 10,    // hydrological IoT sensors stale after 10 min
  shelters: 30,   // shelter capacity reports stale after 30 min
  hospitals: 30,  // hospital ICU bed capacity stale after 30 min
};

export function isRecordStale(lastUpdated: string, dataType: string, currentTime = new Date()): boolean {
  const updatedDate = new Date(lastUpdated);
  const diffMinutes = Math.floor((currentTime.getTime() - updatedDate.getTime()) / 60000);
  const threshold = STALE_THRESHOLDS[dataType] ?? 15;
  return diffMinutes >= threshold;
}

describe('Reliability Formatting & Tier Mapping (T1 to T4)', () => {
  it('correctly maps T1 to T4 tiers to labels and class tokens', () => {
    const tiers: ReliabilityTier[] = ['T1', 'T2', 'T3', 'T4'];
    tiers.forEach((tier) => {
      const config = TierDescription[tier];
      expect(config).toBeDefined();
      expect(config.label).toContain(tier);
      expect(config.badgeClass).toBeDefined();
      expect(config.desc.length).toBeGreaterThan(10);
    });
  });

  it('formats reliability values to two decimal places and clamped percentages', () => {
    const formatReliability = (score: number) => {
      const percentage = Math.round(Math.max(0, Math.min(1, score)) * 100);
      return {
        numeric: score.toFixed(2),
        percentage,
        category: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low',
      };
    };

    expect(formatReliability(0.954)).toEqual({ numeric: '0.95', percentage: 95, category: 'high' });
    expect(formatReliability(0.72)).toEqual({ numeric: '0.72', percentage: 72, category: 'medium' });
    expect(formatReliability(0.35)).toEqual({ numeric: '0.35', percentage: 35, category: 'low' });
    expect(formatReliability(1.5)).toEqual({ numeric: '1.50', percentage: 100, category: 'high' });
    expect(formatReliability(-0.2)).toEqual({ numeric: '-0.20', percentage: 0, category: 'low' });
  });

  it('evaluates stale thresholds per data type accurately', () => {
    const baseTime = new Date('2026-10-31T12:00:00Z');

    const twelveMinAgo = new Date('2026-10-31T11:48:00Z').toISOString();
    expect(isRecordStale(twelveMinAgo, 'sensors', baseTime)).toBe(true);
    expect(isRecordStale(twelveMinAgo, 'reports', baseTime)).toBe(false);
    expect(isRecordStale(twelveMinAgo, 'shelters', baseTime)).toBe(false);

    const twentyTwoMinAgo = new Date('2026-10-31T11:38:00Z').toISOString();
    expect(isRecordStale(twentyTwoMinAgo, 'roads', baseTime)).toBe(true);
    expect(isRecordStale(twentyTwoMinAgo, 'shelters', baseTime)).toBe(false);

    const thirtyFiveMinAgo = new Date('2026-10-31T11:25:00Z').toISOString();
    expect(isRecordStale(thirtyFiveMinAgo, 'shelters', baseTime)).toBe(true);
    expect(isRecordStale(thirtyFiveMinAgo, 'hospitals', baseTime)).toBe(true);
  });
});
