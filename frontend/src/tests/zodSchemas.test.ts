import { describe, it, expect } from 'vitest';
import {
  IncidentSchema,
  ReportSchema,
  RealtimeEventSchema,
} from '@/types';

describe('Zod Schema Validation & Rejection of Malformed Payloads', () => {
  it('accepts valid Incident payloads', () => {
    const valid = {
      id: 'INC-100',
      title: 'Waterlogged Underpass',
      wardId: 'ZONE_01',
      wardName: 'Central Ward',
      lat: 10.99,
      lng: 76.96,
      priorityBand: 'HIGH',
      status: 'confirmed',
      tier: 'T2',
      reliability: 0.88,
      affectedCount: 150,
      needClass: 'Infrastructure',
      description: 'Underpass flooded with 1.1m depth',
      reportedAt: '2026-10-31T11:00:00Z',
      updatedAt: '2026-10-31T11:15:00Z',
      assignedUnitIds: [],
      evidenceCount: 3,
    };
    const res = IncidentSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects malformed Incident payloads (missing required fields / invalid enum)', () => {
    const invalidPriority = {
      id: 'INC-101',
      title: 'Invalid Band Incident',
      wardId: 'ZONE_01',
      wardName: 'Central Ward',
      lat: 10.99,
      lng: 76.96,
      priorityBand: 'EXTREME_DANGER',
      status: 'confirmed',
      tier: 'T1',
      reliability: 0.9,
      affectedCount: 10,
      needClass: 'Rescue',
      description: 'Test',
      reportedAt: '2026-10-31T11:00:00Z',
      updatedAt: '2026-10-31T11:15:00Z',
      assignedUnitIds: [],
      evidenceCount: 1,
    };
    const res = IncidentSchema.safeParse(invalidPriority);
    expect(res.success).toBe(false);
  });

  it('rejects out-of-range reliability values (< 0 or > 1)', () => {
    const invalidReliability = {
      id: 'REP-01',
      timestamp: '2026-10-31T11:00:00Z',
      wardId: 'ZONE_01',
      wardName: 'Ward 1',
      tier: 'T4',
      reliability: 1.45,
      source: 'social_media',
      text: 'Water everywhere',
      lat: 10.99,
      lng: 76.96,
      category: 'flood',
      verified: false,
    };
    const res = ReportSchema.safeParse(invalidReliability);
    expect(res.success).toBe(false);
  });

  it('validates RealtimeEvent discriminated union correctly', () => {
    const validEvent = {
      type: 'sensor.reading',
      timestamp: '2026-10-31T12:00:00Z',
      data: {
        id: 'SENS-01',
        name: 'Gauge A',
        type: 'river_gauge',
        wardId: 'W1',
        wardName: 'Ward 1',
        currentValue: 4.2,
        unit: 'm',
        warningThreshold: 3.5,
        dangerThreshold: 4.5,
        tier: 'T2',
        reliability: 0.95,
        isFaulty: false,
        lastUpdated: '2026-10-31T12:00:00Z',
        history: [],
      },
    };
    expect(RealtimeEventSchema.safeParse(validEvent).success).toBe(true);

    const unknownEventType = {
      type: 'unknown.event',
      timestamp: '2026-10-31T12:00:00Z',
      data: {},
    };
    expect(RealtimeEventSchema.safeParse(unknownEventType).success).toBe(false);
  });
});
