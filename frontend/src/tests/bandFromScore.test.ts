import { describe, it, expect } from 'vitest';
import { bandFromScore, shouldPrecautionaryEscalate } from '@/lib/priority';

describe('bandFromScore Boundaries & Monotonicity', () => {
  it('handles low band and upper boundary at 24.9', () => {
    expect(bandFromScore(0)).toBe('LOW');
    expect(bandFromScore(10)).toBe('LOW');
    expect(bandFromScore(24.9)).toBe('LOW');
    expect(bandFromScore(24.99)).toBe('LOW');
  });

  it('handles medium band boundaries at 25 and 44.9', () => {
    expect(bandFromScore(25)).toBe('MEDIUM');
    expect(bandFromScore(25.0)).toBe('MEDIUM');
    expect(bandFromScore(35)).toBe('MEDIUM');
    expect(bandFromScore(44.9)).toBe('MEDIUM');
    expect(bandFromScore(44.99)).toBe('MEDIUM');
  });

  it('handles high band boundaries at 45 and 64.9', () => {
    expect(bandFromScore(45)).toBe('HIGH');
    expect(bandFromScore(45.0)).toBe('HIGH');
    expect(bandFromScore(55)).toBe('HIGH');
    expect(bandFromScore(64.9)).toBe('HIGH');
    expect(bandFromScore(64.99)).toBe('HIGH');
  });

  it('handles critical band boundaries at 65 and above', () => {
    expect(bandFromScore(65)).toBe('CRITICAL');
    expect(bandFromScore(65.0)).toBe('CRITICAL');
    expect(bandFromScore(80)).toBe('CRITICAL');
    expect(bandFromScore(100)).toBe('CRITICAL');
    expect(bandFromScore(105)).toBe('CRITICAL');
  });

  it('correctly evaluates precautionary escalation rule (score >= 0.75 and confidence >= 0.25)', () => {
    // Both conditions met
    expect(shouldPrecautionaryEscalate(0.80, 0.30)).toBe(true);
    expect(shouldPrecautionaryEscalate(80, 0.30)).toBe(true);
    expect(shouldPrecautionaryEscalate(0.75, 0.25)).toBe(true);
    expect(shouldPrecautionaryEscalate(75, 0.25)).toBe(true);

    // Score too low
    expect(shouldPrecautionaryEscalate(0.74, 0.50)).toBe(false);
    expect(shouldPrecautionaryEscalate(74, 0.50)).toBe(false);

    // Confidence too low
    expect(shouldPrecautionaryEscalate(0.90, 0.24)).toBe(false);
    expect(shouldPrecautionaryEscalate(90, 0.24)).toBe(false);

    // Both too low
    expect(shouldPrecautionaryEscalate(0.50, 0.10)).toBe(false);
  });
});
