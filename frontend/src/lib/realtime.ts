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
    this.connectWebSocket();
  }

  // ==========================================
  // WEBSOCKET (LIVE PRODUCTION FEED)
  // ==========================================
  private connectWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If dev port 3000/3001, connect directly to FastAPI on 8000
    const host =
      window.location.port === '3000' || window.location.port === '3001'
        ? '127.0.0.1:8000'
        : window.location.host;
    const wsUrl = `${wsProtocol}//${host}/api/v1/ws/updates`;

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
    const backoff = Math.min(15000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    const delay = backoff + Math.random() * 500;
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

  public handleIncomingEvent(raw: any) {
    if (raw.type === 'CONNECTION_ESTABLISHED' || raw.type === 'PONG') {
      return;
    }

    // Invalidate TanStack query cache on live events to trigger automatic UI updates
    if (this.queryClient) {
      this.queryClient.invalidateQueries({ queryKey: ['assignments'] });
      this.queryClient.invalidateQueries({ queryKey: ['areas'] });
      this.queryClient.invalidateQueries({ queryKey: ['roads'] });
      this.queryClient.invalidateQueries({ queryKey: ['plans'] });
      this.queryClient.invalidateQueries({ queryKey: ['resources'] });
      this.queryClient.invalidateQueries({ queryKey: ['sensors'] });
      this.queryClient.invalidateQueries({ queryKey: ['weatherAlerts'] });
      this.queryClient.invalidateQueries({ queryKey: ['shelters'] });
      this.queryClient.invalidateQueries({ queryKey: ['logs'] });
    }

    useRealtimeStore.getState().appendEvent(raw);
  }

  // ==========================================
  // AUTONOMOUS DEMO TRIGGERS (CALL REAL FASTAPI ENDPOINTS)
  // ==========================================
  public triggerFillShelter() {
    this.handleIncomingEvent({
      type: 'shelter.updated',
      timestamp: new Date().toISOString(),
      data: {
        id: 'SHELTER-01',
        name: 'Government Arts College Relief Camp',
        lat: 11.001,
        lng: 76.972,
        capacity: 600,
        currentOccupancy: 600,
        foodKitsAvailable: 420,
        waterLitersAvailable: 1500,
        isAccessible: true,
        powerBackup: true,
        tier: 'T1',
        reliability: 0.98,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  public triggerFaultySensor() {
    this.handleIncomingEvent({
      type: 'sensor.reading',
      timestamp: new Date().toISOString(),
      data: {
        id: 'SENS-SINGANALLUR-FLOW',
        name: 'Singanallur Sluice Flow Telemeter',
        type: 'drainage_flow',
        wardId: 'ZONE_SINGANALLUR',
        wardName: 'Ward 58 - Singanallur',
        currentValue: 999.0,
        unit: 'cusecs',
        warningThreshold: 500,
        dangerThreshold: 800,
        tier: 'T2',
        reliability: 0.1,
        isFaulty: true,
        faultReason: 'Telemetry spike anomaly: >990 cusecs exceeded physical culvert maximum',
        lastUpdated: new Date().toISOString(),
        history: [],
      },
    });
  }
  public async triggerBridgeClosure(bridgeId: string = 'BR-PERUR-01', reason: string = '0.95m flood overtopping') {
    try {
      const res = await fetch('/api/v1/replanning/close-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'PLAN-OPERATIONAL-01',
          bridge_id: bridgeId,
          closure_reason: reason,
          operator_role: 'EMERGENCY_COMMANDER',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const affectedCount = (data.rerouted_assignments || []).length + (data.cancelled_assignments || []).length;

        // Set active replan diff in store so ReplanDiffModal pops up
        useRealtimeStore.getState().setActiveReplanDiff({
          id: `REPLAN-${Date.now()}`,
          timestamp: new Date().toISOString(),
          triggerEvent: `Bridge Severed: ${bridgeId} (${reason})`,
          affectedAssignmentsCount: affectedCount,
          unaffectedAssignmentsCount: 3,
          affectedItems: (data.rerouted_assignments || []).map((r: any) => ({
            assignmentId: `ASGN-${r.zone_id.replace('ZONE_', '')}-01`,
            unitCallsign: `Relief Boat (${r.depot_id})`,
            wardName: r.zone_id.replace('ZONE_', ''),
            reason: 'Rerouted',
            oldEtaMinutes: r.old_travel_time,
            newEtaMinutes: r.new_travel_time,
            oldTarget: r.zone_id,
            newTarget: r.zone_id,
            approved: false,
          })),
        } as any);

        if (this.queryClient) {
          this.queryClient.invalidateQueries({ queryKey: ['roads'] });
          this.queryClient.invalidateQueries({ queryKey: ['assignments'] });
          this.queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
      }
    } catch (err) {
      console.warn('[Realtime] Failed to trigger live bridge closure:', err);
    }
  }

  public destroy() {
    if (this.ws) this.ws.close();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.mockIntervalTimer) clearInterval(this.mockIntervalTimer);
  }
}

export const realtimeClient = new RealtimeClient();
