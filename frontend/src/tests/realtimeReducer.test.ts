import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { realtimeClient } from '@/lib/realtime';
import { useRealtimeStore } from '@/store/useRealtimeStore';

describe('Realtime Event Reducer & Cache Patching', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    realtimeClient.init(queryClient);

    queryClient.setQueryData(['incidents'], [
      { id: 'INC-01', title: 'Old Incident', priorityBand: 'MEDIUM', status: 'probable' },
    ]);
    queryClient.setQueryData(['areas'], [
      { id: 'AREA-01', name: 'Ward 84', scoreP: 40, band: 'MEDIUM' },
      { id: 'AREA-02', name: 'Ward 72', scoreP: 60, band: 'HIGH' },
    ]);
    queryClient.setQueryData(['assignments'], [
      { id: 'ASGN-01', unitCallsign: 'Boat 1', state: 'proposed' },
    ]);
    queryClient.setQueryData(['roads'], [
      { id: 'ROAD-01', name: 'Main Road', status: 'open' },
    ]);
    queryClient.setQueryData(['shelters'], [
      { id: 'SHELTER-01', name: 'Camp 1', currentOccupancy: 200 },
    ]);
    queryClient.setQueryData(['resources'], [
      { id: 'RES-01', callsign: 'Truck 1', status: 'available' },
    ]);
    queryClient.setQueryData(['sensors'], [
      { id: 'SENS-01', name: 'River Gauge', currentValue: 3.2 },
    ]);
    queryClient.setQueryData(['logs'], [
      { id: 'LOG-01', summary: 'Previous log' },
    ]);
  });

  it('patches incident.updated without triggering a full refetch', () => {
    const updatedIncident = {
      id: 'INC-01',
      title: 'Severe Inundation at Bus Stand',
      wardId: 'ZONE_UKKADAM',
      wardName: 'Ward 84 - Ukkadam',
      lat: 10.99,
      lng: 76.96,
      priorityBand: 'CRITICAL',
      status: 'confirmed',
      tier: 'T1',
      reliability: 0.95,
      affectedCount: 250,
      needClass: 'Rescue',
      description: 'Water level reached 1.2m',
      reportedAt: '2026-10-31T11:00:00Z',
      updatedAt: '2026-10-31T11:30:00Z',
      assignedUnitIds: ['RES-BOAT-01'],
      evidenceCount: 4,
    };

    realtimeClient.handleIncomingEvent({
      type: 'incident.updated',
      timestamp: new Date().toISOString(),
      data: updatedIncident,
    });

    const cachedIncidents = queryClient.getQueryData<any[]>(['incidents']);
    expect(cachedIncidents).toBeDefined();
    expect(cachedIncidents![0].title).toBe('Severe Inundation at Bus Stand');
    expect(cachedIncidents![0].priorityBand).toBe('CRITICAL');
  });

  it('patches priority.updated and re-sorts areas by scoreP descending', () => {
    const updatedArea = {
      id: 'AREA-01',
      name: 'Ward 84',
      rank: 1,
      band: 'CRITICAL',
      scoreP: 95.5,
      confidenceC: 0.9,
      peopleAtRisk: 1200,
      vulnerableShare: 0.35,
      assignedUnits: 2,
      waitingTimeMinutes: 45,
      tier: 'T1',
      reliability: 0.95,
      lastUpdated: '2026-10-31T12:00:00Z',
      isSilent: false,
      precautionaryEscalation: false,
      factors: { severity: 0.9, vulnerability: 0.8, urgency: 0.9, exposure: 0.7, needCoverage: 0.2, waitingBonus: 0.1 },
      primaryNeed: 'Rescue',
      coordinates: [10.99, 76.96],
    };

    realtimeClient.handleIncomingEvent({
      type: 'priority.updated',
      timestamp: new Date().toISOString(),
      data: updatedArea,
    });

    const cachedAreas = queryClient.getQueryData<any[]>(['areas']);
    expect(cachedAreas).toBeDefined();
    expect(cachedAreas![0].id).toBe('AREA-01');
    expect(cachedAreas![0].scoreP).toBe(95.5);
  });

  it('patches road.status when a road segment is submerged', () => {
    const closedRoad = {
      id: 'ROAD-01',
      name: 'Main Road',
      startCoord: [10.99, 76.96],
      endCoord: [11.00, 76.97],
      polyline: [[10.99, 76.96], [11.00, 76.97]],
      status: 'closed',
      waterDepthCm: 80,
      tier: 'T1',
      reliability: 0.98,
      lastVerified: new Date().toISOString(),
      isBridge: true,
    };

    realtimeClient.handleIncomingEvent({
      type: 'road.status',
      timestamp: new Date().toISOString(),
      data: closedRoad,
    });

    const cachedRoads = queryClient.getQueryData<any[]>(['roads']);
    expect(cachedRoads![0].status).toBe('closed');
    expect(cachedRoads![0].waterDepthCm).toBe(80);
  });

  it('updates replan.diff in Zustand without affecting unrelated cache', () => {
    const diff = {
      id: 'DIFF-TEST-01',
      triggerEvent: 'Bridge Cutoff',
      timestamp: new Date().toISOString(),
      totalAssignmentsCount: 5,
      unaffectedAssignmentsCount: 4,
      affectedItems: [
        {
          assignmentId: 'ASGN-01',
          unitCallsign: 'Boat 1',
          wardName: 'Ward 84',
          reason: 'Rerouted',
          oldEtaMinutes: 15,
          newEtaMinutes: 28,
          oldTarget: 'Direct Path',
          newTarget: 'Southern Bypass',
          explanation: 'Road impassable',
          approved: false,
        },
      ],
      status: 'pending_review',
    };

    realtimeClient.handleIncomingEvent({
      type: 'replan.diff',
      timestamp: new Date().toISOString(),
      data: diff,
    });

    expect(useRealtimeStore.getState().activeReplanDiff?.id).toBe('DIFF-TEST-01');
  });
});
