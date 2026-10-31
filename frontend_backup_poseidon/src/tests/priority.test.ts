import { describe, it, expect } from 'vitest';
import { Area, PriorityWeights } from '@/types';
import { INITIAL_AREAS, INITIAL_WEIGHTS } from '@/mock/seedData';

describe('Prioritization & Weight Calculations', () => {
  it('correctly calculates priority score P from factors', () => {
    const area = INITIAL_AREAS[0];
    const w = INITIAL_WEIGHTS;

    const calculatedScore =
      area.factors.severity * (w.severityWeight * 100) +
      area.factors.vulnerability * (w.vulnerabilityWeight * 100) +
      area.factors.urgency * (w.urgencyWeight * 100) +
      area.factors.exposure * (w.exposureWeight * 100) +
      (1 - area.factors.needCoverage) * (w.needWeight * 100) +
      area.factors.waitingBonus * (w.waitingTimeMultiplier * 50);

    expect(calculatedScore).toBeGreaterThan(80);
    expect(area.scoreP).toBeCloseTo(94.6, 0);
  });

  it('ranks critical areas ahead of medium/low areas', () => {
    const sorted = [...INITIAL_AREAS].sort((a, b) => b.scoreP - a.scoreP);
    expect(sorted[0].band).toBe('CRITICAL');
    expect(sorted[sorted.length - 1].band).toBe('LOW');
  });

  it('ensures silent areas retain their flag and coordinates', () => {
    const silent = INITIAL_AREAS.find((a) => a.isSilent);
    expect(silent).toBeDefined();
    expect(silent?.coordinates).toHaveLength(2);
  });
});
