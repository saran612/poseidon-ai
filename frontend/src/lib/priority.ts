import type { PriorityBand } from '@/types';

/**
 * Derives the official operational Priority Band from a 0-100 score:
 * - CRITICAL: 65.0 and above
 * - HIGH: 45.0 to 64.99...
 * - MEDIUM: 25.0 to 44.99...
 * - LOW: below 25.0
 */
export function bandFromScore(score: number): PriorityBand {
  if (score >= 65) return 'CRITICAL';
  if (score >= 45) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

/**
 * Precautionary escalation rule:
 * Shown only when raw score is at least 0.75 (or 75) and confidence is at least 0.25
 */
export function shouldPrecautionaryEscalate(scoreP: number, confidenceC: number): boolean {
  const normalizedScore = scoreP > 1 ? scoreP / 100 : scoreP;
  return normalizedScore >= 0.75 && confidenceC >= 0.25;
}
