import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Truck,
  Shield,
  Fuel,
  Users,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { ReliabilityBar } from '@/components/common/ReliabilityBar';
import { StaleBadge } from '@/components/common/StaleBadge';
import { KpiCard } from '@/components/common/KpiCard';
import type { ResourceType } from '@/types';

export const ResourcesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>('UNIT-BOAT-01');

  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: mockApi.getResources,
  });

  const filtered = resources.filter(
    (u) => selectedType === 'ALL' || u.type === selectedType
  );

  const selectedUnit = resources.find((u) => u.id === selectedUnitId);

  const totalUnits = resources.length;
  const reserveCount = resources.filter((u) => u.isReserve).length;
  const reservePct = totalUnits ? Math.round((reserveCount / totalUnits) * 100) : 0;
  const enRouteCount = resources.filter((u) => u.status === 'en_route').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Resource Inventory & Fleet Readiness
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking boats, high-clearance rescue vehicles, ambulances, and dewatering pumps
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'boat', 'ambulance', 'land_rescue', 'relief_truck', 'engineering'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                selectedType === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reserve Protocol Bar (15% reserve bar rule) */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Mandatory 15% Reserve Cushion Protocol
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Emergency reserve buffer retained for secondary catastrophic surges. Currently{' '}
            <strong>{reserveCount} units ({reservePct}%)</strong> designated as protected reserves.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-700 dark:text-slate-300">
            <span>Reserve: {reservePct}%</span>
            <span>Target: 15% Min</span>
          </div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${reservePct >= 15 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${reservePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Units List + Selected Unit History/Route */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Unit Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((unit) => {
            const isSelected = selectedUnitId === unit.id;
            return (
              <div
                key={unit.id}
                onClick={() => setSelectedUnitId(unit.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {unit.callsign}
                    </h4>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      {unit.type.replace('_', ' ')} • {unit.assignedBase}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      unit.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : unit.status === 'en_route'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>Cap: {unit.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Fuel className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fuel: {unit.fuelPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Idle: {unit.idleTimeMinutes}m</span>
                  </div>
                </div>

                {unit.isReserve && (
                  <div className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    Tier-1 Strategic Reserve Asset
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Col: Unit Details & Audit History */}
        <div className="space-y-4">
          {selectedUnit ? (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedUnit.callsign}
                  </h3>
                  <span className="font-mono text-slate-400">{selectedUnit.id}</span>
                </div>
                <StaleBadge lastUpdated={selectedUnit.lastUpdated} />
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Recent Operational History
                </span>
                <div className="space-y-2">
                  {selectedUnit.history.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-0.5"
                    >
                      <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                        <span>{h.time}</span>
                        <span>{h.location}</span>
                      </div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{h.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
              Select any unit to inspect its deployment history and operational telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
