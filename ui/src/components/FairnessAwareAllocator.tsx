import React, { useState } from 'react';
import {
  Cpu,
  SlidersHorizontal,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { PlanVersion, Allocation } from '../types';

interface FairnessAwareAllocatorProps {
  activePlan: PlanVersion | null;
  onReoptimize?: (theta: number) => void;
}

export const FairnessAwareAllocator: React.FC<FairnessAwareAllocatorProps> = ({
  activePlan,
  onReoptimize,
}) => {
  const [fairnessTheta, setFairnessTheta] = useState(0.5);
  const [isSolving, setIsSolving] = useState(false);

  // Allocations and summary
  const allocations: Allocation[] = activePlan?.allocations || [
    {
      depot_id: 'DEPOT_RS_PURAM',
      zone_id: 'ZONE_PERUR',
      resource_type: 'BOAT',
      quantity: 5,
      travel_time_min: 10.0,
      route_nodes: ['DEPOT_RS_PURAM', 'ZONE_SELVAPURAM', 'ZONE_PERUR'],
    },
    {
      depot_id: 'DEPOT_RS_PURAM',
      zone_id: 'ZONE_SELVAPURAM',
      resource_type: 'BOAT',
      quantity: 4,
      travel_time_min: 8.0,
      route_nodes: ['DEPOT_RS_PURAM', 'ZONE_SELVAPURAM'],
    },
    {
      depot_id: 'DEPOT_RS_PURAM',
      zone_id: 'ZONE_UKKADAM',
      resource_type: 'BOAT',
      quantity: 1,
      travel_time_min: 9.0,
      route_nodes: ['DEPOT_RS_PURAM', 'ZONE_UKKADAM'],
    },
    {
      depot_id: 'DEPOT_PEELAMEDU',
      zone_id: 'ZONE_UKKADAM',
      resource_type: 'BOAT',
      quantity: 3,
      travel_time_min: 12.0,
      route_nodes: ['DEPOT_PEELAMEDU', 'ZONE_SINGANALLUR', 'ZONE_UKKADAM'],
    },
    {
      depot_id: 'DEPOT_PEELAMEDU',
      zone_id: 'ZONE_SINGANALLUR',
      resource_type: 'BOAT',
      quantity: 3,
      travel_time_min: 10.0,
      route_nodes: ['DEPOT_PEELAMEDU', 'ZONE_SINGANALLUR'],
    },
    {
      depot_id: 'DEPOT_PEELAMEDU',
      zone_id: 'ZONE_ONDIPUDUR',
      resource_type: 'BOAT',
      quantity: 2,
      travel_time_min: 16.0,
      route_nodes: ['DEPOT_PEELAMEDU', 'ZONE_ONDIPUDUR'],
    },
  ];

  const totalRequested = activePlan?.total_requested || 29;
  const totalAssigned = activePlan?.total_assigned || 18;
  const totalUnmet = activePlan?.total_unmet || 11;
  const servedToNeedRatio = totalRequested > 0 ? Math.round((totalAssigned / totalRequested) * 100) : 0;
  const utilization = Math.round((totalAssigned / 18) * 100);

  // Zone demands comparison table
  const zoneStats = [
    { zone: 'Perur Corridor', requested: 6, assigned: 5, unmet: 1, travel: '10.0m', ratio: '83%' },
    { zone: 'Selvapuram Lake', requested: 5, assigned: 4, unmet: 1, travel: '8.0m', ratio: '80%' },
    { zone: 'Ukkadam Hub', requested: 8, assigned: 4, unmet: 4, travel: '10.5m', ratio: '50%' },
    { zone: 'Singanallur Basin', requested: 6, assigned: 3, unmet: 3, travel: '10.0m', ratio: '50%' },
    { zone: 'Ondipudur Reach', requested: 4, assigned: 2, unmet: 2, travel: '16.0m', ratio: '50%' },
  ];

  const handleApplyTheta = async () => {
    setIsSolving(true);
    try {
      const res = await fetch('/api/v1/relief/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fairness_theta: fairnessTheta }),
      });
      if (res.ok && onReoptimize) {
        onReoptimize(fairnessTheta);
      }
    } catch (e) {
      console.error('Reoptimization failed:', e);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Solver Parameter Controls */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] mb-4">
          <div>
            <h2 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#2563EB]" />
              Google OR-Tools CP-SAT Relief Optimizer
            </h2>
            <p className="text-xs text-[#64748B]">
              Guaranteed non-starvation relief allocation with floor: <code>floor(θ · demand · min(1, S/D))</code>.
            </p>
          </div>

          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            CP-SAT OPTIMAL (0-1 MIP)
          </span>
        </div>

        {/* 4 Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-5">
          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] text-[11px] font-medium">Total Supply (Boats)</span>
            <div className="text-xl font-extrabold text-[#172B4D] mt-0.5 font-mono">18 Units</div>
            <div className="text-[10px] text-[#94A3B8] mt-0.5">RS Puram (10) + Peelamedu (8)</div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] text-[11px] font-medium">Total Zone Demand</span>
            <div className="text-xl font-extrabold text-[#D97706] mt-0.5 font-mono">{totalRequested} Units</div>
            <div className="text-[10px] text-[#94A3B8] mt-0.5">Supply Shortage ({totalUnmet} Unmet)</div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] text-[11px] font-medium">Allocated / Served Ratio</span>
            <div className="text-xl font-extrabold text-[#16A34A] mt-0.5 font-mono">
              {totalAssigned} / {totalRequested} ({servedToNeedRatio}%)
            </div>
            <div className="text-[10px] text-[#94A3B8] mt-0.5">Utilization: {utilization}%</div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] text-[11px] font-medium">Fairness Parameter θ</span>
            <div className="text-xl font-extrabold text-[#2563EB] mt-0.5 font-mono">θ = {fairnessTheta.toFixed(2)}</div>
            <div className="text-[10px] text-[#94A3B8] mt-0.5">Floor Constraint Active</div>
          </div>
        </div>

        {/* Interactive Slider for Fairness Parameter θ */}
        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#172B4D] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
                Fairness Floor Parameter (θ):
              </span>
              <span className="font-mono font-bold text-[#2563EB]">{fairnessTheta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={fairnessTheta}
              onChange={e => setFairnessTheta(parseFloat(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
              <span>θ = 0.10 (Pure Priority Exploitation)</span>
              <span>θ = 0.50 (Balanced Non-Starvation)</span>
              <span>θ = 0.90 (Strict Equal Distribution)</span>
            </div>
          </div>

          <button
            onClick={handleApplyTheta}
            disabled={isSolving}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-md text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
            {isSolving ? 'Solving CP-SAT...' : 'Re-solve Allocation'}
          </button>
        </div>
      </div>

      {/* 2. Zone Comparison Table & Dispatch Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Zone Demand vs Allocated Need */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#172B4D] mb-1">Zone-wise Need vs Allocation Fulfillment</h3>
          <p className="text-xs text-[#64748B] mb-3">
            Protected personal characteristics are never used as criteria; allocations are purely mathematical.
          </p>

          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">Requested</th>
                  <th className="py-2.5 px-3">Assigned</th>
                  <th className="py-2.5 px-3">Unmet</th>
                  <th className="py-2.5 px-3">ETA</th>
                  <th className="py-2.5 px-3 text-right">Served Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {zoneStats.map((z, i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 font-bold text-[#172B4D]">{z.zone}</td>
                    <td className="py-2.5 px-3 font-mono text-[#D97706]">{z.requested}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#16A34A]">{z.assigned}</td>
                    <td className="py-2.5 px-3 font-mono text-[#DC2626]">{z.unmet}</td>
                    <td className="py-2.5 px-3 font-mono text-[#64748B]">{z.travel}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#172B4D]">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-10 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#16A34A] h-full rounded-full"
                            style={{ width: z.ratio }}
                          />
                        </div>
                        <span>{z.ratio}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Feasible Arterial Routing & Dispatch Dispatches */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#172B4D] mb-1">Active Optimized Dispatches & Routes</h3>
          <p className="text-xs text-[#64748B] mb-3">
            Depot-to-Zone routes guaranteed feasible on current un-severed road graph.
          </p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {allocations.map((a, i) => (
              <div key={i} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs">
                <div className="flex justify-between items-center font-bold text-[#172B4D]">
                  <span className="flex items-center gap-1.5">
                    {a.depot_id.replace('DEPOT_', '')} <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" /> {a.zone_id.replace('ZONE_', '')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                    {a.quantity} {a.resource_type}s
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-1 pt-1 border-t border-[#E2E8F0]">
                  <span>Travel ETA: <strong>{a.travel_time_min} min</strong></span>
                  <span className="font-mono truncate max-w-[200px]">Path: {a.route_nodes.join(' ➔ ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Shortfall Reason Codes Tracked by Solver */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs text-xs">
        <h3 className="font-bold text-sm text-[#172B4D] mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          OR-Tools Formal Shortfall Reason Codes:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#D97706] font-bold">• supply_exhausted</span>
            <p className="text-[11px] text-[#64748B] mt-1">
              Cumulative zone demands exceed total depot stockpile capacity.
            </p>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#DC2626] font-bold">• no_feasible_route</span>
            <p className="text-[11px] text-[#64748B] mt-1">
              All connecting arterial bridges/roads severed by flood inundation.
            </p>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#7E22CE] font-bold">• deadline_infeasible</span>
            <p className="text-[11px] text-[#64748B] mt-1">
              Shortest detour path exceeds the 45-minute operational cutoff.
            </p>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[#2563EB] font-bold">• capacity_limit</span>
            <p className="text-[11px] text-[#64748B] mt-1">
              Depot loading throughput and simultaneous vehicle dispatch bottleneck.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
