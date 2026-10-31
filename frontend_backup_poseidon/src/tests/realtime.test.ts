import { describe, it, expect } from 'vitest';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { useAuthStore } from '@/store/useAuthStore';

describe('Realtime & Auth Stores', () => {
  it('toggles simulation pause and advances timeline', () => {
    const store = useRealtimeStore.getState();
    const initialPause = store.isPaused;
    store.togglePause();
    expect(useRealtimeStore.getState().isPaused).toBe(!initialPause);

    const initialTime = useRealtimeStore.getState().simTime.getTime();
    store.advanceSimTime(60); // 60 seconds
    expect(useRealtimeStore.getState().simTime.getTime()).toBe(initialTime + 60000);
  });

  it('updates user role on login', () => {
    const auth = useAuthStore.getState();
    auth.login('Supervisor');
    expect(useAuthStore.getState().user?.role).toBe('Supervisor');

    auth.login('Viewer');
    expect(useAuthStore.getState().user?.role).toBe('Viewer');
  });

  it('buffers incoming real-time events and increments unread count on critical events', () => {
    const store = useRealtimeStore.getState();
    const prevAlerts = store.unreadAlertsCount;

    store.appendEvent({
      type: 'weather.alert',
      timestamp: new Date().toISOString(),
      data: {
        id: 'TEST-ALERT',
        title: 'Emergency Flood',
        severity: 'flash_flood_emergency',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        description: 'Test surge',
        affectedWards: ['ZONE_UKKADAM'],
      },
    });

    expect(useRealtimeStore.getState().unreadAlertsCount).toBe(prevAlerts + 1);
    expect(useRealtimeStore.getState().eventBuffer.length).toBeGreaterThan(0);
  });
});
