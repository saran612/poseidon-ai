import React from 'react';
import { Compass } from 'lucide-react';
import type { Bridge } from '../types';

interface BridgeCardsProps {
  bridges: Bridge[];
  selectedBridgeId: string | null;
  onSelectBridge: (bridge: Bridge) => void;
  onSimulateCut: (bridgeId: string) => void;
}

export const BridgeCards: React.FC<BridgeCardsProps> = ({
  bridges,
  selectedBridgeId,
  onSelectBridge,
  onSimulateCut,
}) => {
  return (
    <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
            Noyyal River Corridor Candidate Bridges & Structural Crossings
          </h3>
          <p className="text-[11px] text-[#64748B]">
            Click any bridge card to inspect geographic location, dependent routes, or simulate flood severance.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#94A3B8]">
          {bridges.filter(b => b.status === 'CLOSED').length} of {bridges.length} Bridges Severed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {bridges.map(b => {
          const isClosed = b.status === 'CLOSED';
          const isSelected = b.bridge_id === selectedBridgeId;

          return (
            <div
              key={b.bridge_id}
              onClick={() => onSelectBridge(b)}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]'
                  : isClosed
                  ? 'bg-[#FEF2F2] border-[#FCA5A5] hover:border-[#F87171]'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-extrabold text-[#172B4D] font-mono tracking-tight">{b.bridge_id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                      isClosed
                        ? 'bg-[#DC2626] text-white shadow-2xs'
                        : 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                    }`}
                  >
                    {isClosed ? 'SEVERED' : 'OPERATIONAL'}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#172B4D] leading-tight line-clamp-1">{b.name}</div>
                <div className="text-[10px] text-[#2563EB] font-medium mt-0.5">
                  Waterway: {b.crosses_waterway}
                </div>

                <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-1 text-[10px] text-[#64748B]">
                  <div className="truncate">
                    <strong>Zones:</strong> {b.connected_zones?.join(', ') || 'Corridor Link'}
                  </div>
                  <div className="line-clamp-2 text-[#475569]">
                    <strong>Dependency:</strong> {b.route_dependency || 'Arterial bridge'}
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#94A3B8] pt-1">
                    <span>Verified: {b.last_verified || 'Active PWD'}</span>
                    <span>Conf: {b.confidence ? `${Math.round(b.confidence * 100)}%` : '92%'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#64748B]">
                  {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSimulateCut(b.bridge_id);
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    isClosed
                      ? 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                      : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                  }`}
                >
                  {isClosed ? 'Reopen Bridge' : 'Simulate Cut'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
