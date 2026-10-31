import { create } from 'zustand';
import type { RealtimeEvent, ReplanDiff } from '@/types';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface RealtimeStore {
  status: ConnectionStatus;
  lastConnectedAt: Date | null;
  lastEventAt: Date | null;
  eventBuffer: RealtimeEvent[];
  unreadAlertsCount: number;
  simSpeed: 1 | 2 | 5;
  isPaused: boolean;
  simTime: Date;
  activeReplanDiff: ReplanDiff | null;
  
  setStatus: (status: ConnectionStatus) => void;
  appendEvent: (event: RealtimeEvent) => void;
  clearUnreadAlerts: () => void;
  setSimSpeed: (speed: 1 | 2 | 5) => void;
  togglePause: () => void;
  advanceSimTime: (deltaSeconds: number) => void;
  setActiveReplanDiff: (diff: ReplanDiff | null) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set) => ({
  status: 'connected',
  lastConnectedAt: new Date(),
  lastEventAt: new Date(),
  eventBuffer: [],
  unreadAlertsCount: 2,
  simSpeed: 1,
  isPaused: false,
  simTime: new Date(),
  activeReplanDiff: null,

  setStatus: (status) =>
    set({
      status,
      lastConnectedAt: status === 'connected' ? new Date() : undefined,
    }),

  appendEvent: (event) =>
    set((state) => {
      const isCritical =
        event.type === 'weather.alert' ||
        (event.type === 'incident.updated' && event.data.priorityBand === 'CRITICAL') ||
        event.type === 'replan.diff';

      return {
        eventBuffer: [event, ...state.eventBuffer].slice(0, 200), // Keep last 200
        lastEventAt: new Date(),
        unreadAlertsCount: isCritical ? state.unreadAlertsCount + 1 : state.unreadAlertsCount,
      };
    }),

  clearUnreadAlerts: () => set({ unreadAlertsCount: 0 }),
  setSimSpeed: (simSpeed) => set({ simSpeed }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  advanceSimTime: (deltaSeconds) =>
    set((state) => ({
      simTime: new Date(state.simTime.getTime() + deltaSeconds * 1000),
    })),
  setActiveReplanDiff: (activeReplanDiff) => set({ activeReplanDiff }),
}));
