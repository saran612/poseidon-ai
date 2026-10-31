import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useRealtimeStore } from '@/store/useRealtimeStore';

export const ConnectionBanner: React.FC = () => {
  const { status, lastConnectedAt } = useRealtimeStore();

  if (status === 'connected') return null;

  const minutesAgo = lastConnectedAt
    ? Math.max(1, Math.floor((Date.now() - lastConnectedAt.getTime()) / 60000))
    : 2;

  return (
    <div
      role="alert"
      className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-between font-medium shadow-md transition-all sticky top-0 z-50 animate-in slide-in-from-top"
    >
      <div className="flex items-center gap-2">
        {status === 'reconnecting' ? (
          <Wifi className="w-4 h-4 animate-pulse text-amber-200" />
        ) : (
          <WifiOff className="w-4 h-4 text-rose-200" />
        )}
        <span>
          Showing data from {minutesAgo} min ago, reconnecting to real-time event pipeline...
        </span>
      </div>

      <span className="text-[11px] font-mono bg-amber-700/80 px-2 py-0.5 rounded uppercase tracking-wider">
        {status === 'reconnecting' ? 'Retrying WebSocket' : 'Offline'}
      </span>
    </div>
  );
};
