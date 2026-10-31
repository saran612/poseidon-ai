import { QueryClient } from '@tanstack/react-query';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { RealtimeEventSchema, type RealtimeEvent } from '@/types';

class RealtimeClient {
  private ws: WebSocket | null = null;
  private queryClient: QueryClient | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private mockIntervalTimer: any = null;
  private sinceCursor: string | null = null;

  public init(queryClient: QueryClient) {
    this.queryClient = queryClient;
    const isMock = import.meta.env.VITE_API_MODE !== 'live';

    if (isMock) {
      this.initMockSimulation();
    } else {
      this.connectWebSocket();
    }
  }

  // ==========================================
  // WEBSOCKET (LIVE MODE)
  // ==========================================
  private connectWebSocket() {
    if (this.ws) {
      this.ws.close();
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/updates${
      this.sinceCursor ? `?since=${this.sinceCursor}` : ''
    }`;

    try {
      this.ws = new WebSocket(wsUrl);
      useRealtimeStore.getState().setStatus('reconnecting');

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        useRealtimeStore.getState().setStatus('connected');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          this.handleIncomingEvent(raw);
        } catch (err) {
          console.warn('[Realtime] Failed to parse message', err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        useRealtimeStore.getState().setStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        useRealtimeStore.getState().setStatus('reconnecting');
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    // Exponential backoff with jitter: min 1s, max 30s
    const backoff = Math.min(30000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    const jitter = Math.random() * 1000;
    const delay = backoff + jitter;
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }

  // ==========================================
  // MOCK SIMULATION TIMELINE
  // ==========================================
  private initMockSimulation() {
    useRealtimeStore.getState().setStatus('connected');
    let timelineTick = 0;

    // Simulate 3 hours compressed into 10 minutes (1 tick every 2 seconds = ~600 seconds total)
    this.mockIntervalTimer = setInterval(() => {
      const { isPaused, simSpeed } = useRealtimeStore.getState();
      if (isPaused) return;

      timelineTick += 1 * simSpeed;
      useRealtimeStore.getState().advanceSimTime(2 * simSpeed);

      // Scripted event sequence
      if (timelineTick === 6) {
        // T+12s: Duplicate incident report
        this.handleIncomingEvent({
          type: 'report.created',
          timestamp: new Date().toISOString(),
          data: {
            id: `REP-DUP-${Date.now()}`,
            timestamp: new Date().toISOString(),
            wardId: 'ZONE_UKKADAM',
            wardName: 'Sector 14 - Musi Riverbank',
            tier: 'T3',
            reliability: 0.65,
            source: 'citizen_app',
            text: 'Duplicate alert: Musi flood water entering lane #4 near riverside temple.',
            lat: 17.362,
            lng: 78.475,
            category: 'flood',
            verified: true,
            isRumour: false,
            duplicateOf: 'INC-2026-081',
          },
        });
      } else if (timelineTick === 14) {
        // T+28s: Conflicting road report
        this.handleIncomingEvent({
          type: 'log.entry',
          timestamp: new Date().toISOString(),
          data: {
            id: `LOG-CONF-${Date.now()}`,
            timestamp: new Date().toISOString(),
            severity: 'warning',
            type: 'CONFLICTING_REPORT',
            actor: 'Verification Engine',
            entity: 'ROAD-TRICHY-RD',
            summary: 'Conflicting road status: Citizen app reported "passable", IoT water sensor reports 25cm overflow.',
            reliability: 0.74,
          },
        });
      } else if (timelineTick === 24) {
        // T+48s: Rumour blocked
        this.handleIncomingEvent({
          type: 'log.entry',
          timestamp: new Date().toISOString(),
          data: {
            id: `LOG-RUMOUR-${Date.now()}`,
            timestamp: new Date().toISOString(),
            severity: 'warning',
            type: 'RUMOUR_FILTERED',
            actor: 'Misinformation Filter',
            entity: 'ZONE_PEELAMEDU',
            summary: 'Unverified social media panic claim: "Main power grid dam collapse" debunked and blocked.',
            reliability: 0.12,
          },
        });
      } else if (timelineTick === 40) {
        // T+80s: Sensor reading anomaly
        this.handleIncomingEvent({
          type: 'sensor.reading',
          timestamp: new Date().toISOString(),
          data: {
            id: 'SENS-NOYYAL-01',
            name: 'Bhadrachalam Godavari River Gauge',
            type: 'river_gauge',
            wardId: 'ZONE_PERUR',
            wardName: 'Sector 23 - Warangal Waddepally',
            currentValue: 5.1, // Rising past 5m!
            unit: 'meters depth',
            warningThreshold: 3.5,
            dangerThreshold: 4.5,
            tier: 'T2',
            reliability: 0.95,
            isFaulty: false,
            lastUpdated: new Date().toISOString(),
            history: [
              { time: '11:00', value: 4.4 },
              { time: '11:30', value: 4.8 },
              { time: '11:45', value: 5.1 },
            ],
          },
        });
      }
    }, 2000);
  }

  // ==========================================
  // EVENT DISPATCH & CACHE PATCHING
  // ==========================================
  public handleIncomingEvent(rawEvent: any) {
    const parseResult = RealtimeEventSchema.safeParse(rawEvent);
    if (!parseResult.success) {
      console.warn('[Realtime] Payload schema validation error:', parseResult.error.format());
      return;
    }

    const event: RealtimeEvent = parseResult.data;
    this.sinceCursor = event.timestamp;

    // Buffer in Zustand
    useRealtimeStore.getState().appendEvent(event);

    // Direct TanStack Query cache patching (No full refetch!)
    if (!this.queryClient) return;

    switch (event.type) {
      case 'incident.updated':
        this.queryClient.setQueryData(['incidents'], (old: any[] = []) => {
          const index = old.findIndex((item) => item.id === event.data.id);
          if (index >= 0) {
            const next = [...old];
            next[index] = event.data;
            return next;
          }
          return [event.data, ...old];
        });
        break;

      case 'priority.updated':
        this.queryClient.setQueryData(['areas'], (old: any[] = []) => {
          const index = old.findIndex((item) => item.id === event.data.id);
          if (index >= 0) {
            const next = [...old];
            next[index] = event.data;
            return next.sort((a, b) => b.scoreP - a.scoreP);
          }
          return [...old, event.data].sort((a, b) => b.scoreP - a.scoreP);
        });
        break;

      case 'assignment.proposed':
      case 'assignment.approved':
      case 'assignment.updated':
        this.queryClient.setQueryData(['assignments'], (old: any[] = []) => {
          const index = old.findIndex((item) => item.id === event.data.id);
          if (index >= 0) {
            const next = [...old];
            next[index] = event.data;
            return next;
          }
          return [event.data, ...old];
        });
        break;

      case 'road.status':
        this.queryClient.setQueryData(['roads'], (old: any[] = []) => {
          return old.map((road) => (road.id === event.data.id ? event.data : road));
        });
        break;

      case 'shelter.updated':
        this.queryClient.setQueryData(['shelters'], (old: any[] = []) => {
          return old.map((shelter) => (shelter.id === event.data.id ? event.data : shelter));
        });
        break;

      case 'resource.updated':
        this.queryClient.setQueryData(['resources'], (old: any[] = []) => {
          return old.map((res) => (res.id === event.data.id ? event.data : res));
        });
        break;

      case 'sensor.reading':
        this.queryClient.setQueryData(['sensors'], (old: any[] = []) => {
          return old.map((s) => (s.id === event.data.id ? event.data : s));
        });
        break;

      case 'replan.diff':
        useRealtimeStore.getState().setActiveReplanDiff(event.data);
        break;

      case 'log.entry':
        this.queryClient.setQueryData(['logs'], (old: any[] = []) => {
          return [event.data, ...old].slice(0, 500);
        });
        break;
    }
  }

  // ==========================================
  // INJECTION CONTROLS (SIMULATION)
  // ==========================================
  public triggerBridgeClosure() {
    // 1. Close the Musi River Corridor Bridge (BR-PERUR-01)
    const closedBridge = {
      id: 'BR-PERUR-01',
      name: 'Puranapul Musi River Bridge (BR-PERUR-01)',
      startCoord: [17.364, 78.468] as [number, number],
      endCoord: [17.368, 78.472] as [number, number],
      polyline: [
        [17.364, 78.468] as [number, number],
        [17.366, 78.470] as [number, number],
        [17.368, 78.472] as [number, number],
      ],
      status: 'closed' as const,
      waterDepthCm: 95,
      tier: 'T1' as const,
      reliability: 0.98,
      lastVerified: new Date().toISOString(),
      closureReason: 'Musi flood water overtopping roadway by 0.95m; structural safety threshold breached.',
      isBridge: true,
      alternativeRouteId: 'ROAD-SUNDARAPURAM-LINK',
    };

    this.handleIncomingEvent({
      type: 'road.status',
      timestamp: new Date().toISOString(),
      data: closedBridge,
    });

    // 2. Generate Replan Diff for affected assignment ASGN-PROPOSED-01 (or ASGN-01)
    // IMPORTANT: Shows ONLY affected assignments, leaving untouched assignments unchanged!
    const diff = {
      id: `DIFF-${Date.now()}`,
      triggerEvent: 'Bridge Closure: Puranapul Musi River Bridge (BR-PERUR-01) submerged',
      timestamp: new Date().toISOString(),
      totalAssignmentsCount: 4,
      unaffectedAssignmentsCount: 3,
      affectedItems: [
        {
          assignmentId: 'ASGN-PROPOSED-01',
          unitCallsign: 'TG Fire & Rescue High-Clearance 2',
          wardName: 'Sector 23 - Warangal Waddepally',
          reason: 'Rerouted' as const,
          oldEtaMinutes: 16,
          newEtaMinutes: 31,
          oldTarget: 'Direct corridor via Musi Bridge',
          newTarget: 'Detour via South Ring Bypass Link',
          explanation: 'Puranapul Musi Bridge closed. Rerouted via South Ring bypass. ETA increased by 15 mins (+93%).',
          affectedEdge: 'BR-PERUR-01',
          approved: false,
        },
      ],
      status: 'pending_review' as const,
    };

    this.handleIncomingEvent({
      type: 'replan.diff',
      timestamp: new Date().toISOString(),
      data: diff,
    });

    // Log the event
    this.handleIncomingEvent({
      type: 'log.entry',
      timestamp: new Date().toISOString(),
      data: {
        id: `LOG-REPLAN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'critical',
        type: 'BRIDGE_CLOSED_REPLAN',
        actor: 'Autonomous Replanner',
        entity: 'BR-PERUR-01',
        summary: 'Puranapul Musi Bridge closed due to 0.95m flood overtopping. Generated Replan Diff for 1 affected unit (3 units unaffected).',
        reliability: 0.98,
      },
    });
  }

  public triggerFillShelter() {
    this.handleIncomingEvent({
      type: 'shelter.updated',
      timestamp: new Date().toISOString(),
      data: {
        id: 'SHELTER-01',
        name: 'Government City College Relief Camp (Hyderabad)',
        lat: 17.368,
        lng: 78.471,
        capacity: 600,
        currentOccupancy: 600, // 100% capacity!
        foodKitsAvailable: 420,
        waterLitersAvailable: 1500,
        isAccessible: true,
        powerBackup: true,
        tier: 'T1',
        reliability: 0.99,
        lastUpdated: new Date().toISOString(),
        contactPhone: '+91 40 2345 1122',
      },
    });
  }

  public triggerFaultySensor() {
    this.handleIncomingEvent({
      type: 'sensor.reading',
      timestamp: new Date().toISOString(),
      data: {
        id: 'SENS-SINGANALLUR-FLOW',
        name: 'Bhadrachalam Sluice Flow Telemeter',
        type: 'drainage_flow',
        wardId: 'ZONE_SINGANALLUR',
        wardName: 'Sector 08 - Bhadrachalam',
        currentValue: 999.0,
        unit: 'cusecs',
        warningThreshold: 500,
        dangerThreshold: 800,
        tier: 'T2',
        reliability: 0.1,
        isFaulty: true,
        faultReason: 'Acoustic transducer sensor failure: pegged at max value (999 cusecs).',
        lastUpdated: new Date().toISOString(),
        history: [{ time: '11:45', value: 999 }],
      },
    });
  }

  public destroy() {
    if (this.ws) this.ws.close();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.mockIntervalTimer) clearInterval(this.mockIntervalTimer);
  }
}

export const realtimeClient = new RealtimeClient();
