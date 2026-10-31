import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  HeartPulse,
  Phone,
  Bed,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { ReliabilityBar } from '@/comp/common/ReliabilityBar';
import { TierBadge } from '@/comp/common/TierBadge';
import { StaleBadge } from '@/comp/common/StaleBadge';
import { useUiStore } from '@/store/useUiStore';

export const SheltersHospitalsPage: React.FC = () => {
  const { openDecisionCard } = useUiStore();
  const [tab, setTab] = useState<'shelters' | 'hospitals'>('shelters');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('ZONE_UKKADAM');

  const { data: shelters = [] } = useQuery({ queryKey: ['shelters'], queryFn: mockApi.getShelters });
  const { data: hospitals = [] } = useQuery({ queryKey: ['hospitals'], queryFn: mockApi.getHospitals });
  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: mockApi.getAreas });

  // Intelligent Recommendation Engine (Top choice + Alternative with score breakdown)
  const topShelter = shelters[0];
  const altShelter = shelters[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Relief Shelters & Hospital Capacity
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time occupancy tracking, ICU/trauma readiness, and load-balanced recommendations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-200/80 dark:bg-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('shelters')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              tab === 'shelters'
                ? 'bg-white dark:bg-black text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Shelters ({shelters.length})</span>
          </button>
          <button
            onClick={() => setTab('hospitals')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              tab === 'hospitals'
                ? 'bg-white dark:bg-black text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Hospitals ({hospitals.length})</span>
          </button>
        </div>
      </div>

      {/* Autonomous Recommendation Panel */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Optimal Facility Recommendation Engine
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Patient / Evacuee Origin:</span>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="p-1 rounded border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-black text-xs font-medium"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Top + Alternative Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {topShelter && (
            <div className="p-3 bg-white dark:bg-black rounded-lg border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                  Top Recommended Pick
                </span>
                <span className="font-mono text-emerald-600 font-bold">Match Score: 96.4</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">{topShelter.name}</h4>
              <p className="text-slate-600 dark:text-slate-300">
                Score breakdown: Capacity (0.35) • Reachability (0.30) • Accessibility (0.20) • Rations (0.15)
              </p>
            </div>
          )}

          {altShelter && (
            <div className="p-3 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                  Alternative Choice (Load Balance)
                </span>
                <span className="font-mono text-slate-600 font-bold">Match Score: 88.1</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">{altShelter.name}</h4>
              <p className="text-slate-600 dark:text-slate-300">
                Maintains secondary reserve buffer to prevent bottlenecking primary Arts College campus.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Tables */}
      {tab === 'shelters' ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-black shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3">Shelter Name</th>
                <th className="p-3 text-right">Occupancy / Capacity</th>
                <th className="p-3 text-center">Accessibility & Power</th>
                <th className="p-3 text-right">Food Rations</th>
                <th className="p-3 text-right">Clean Water</th>
                <th className="p-3">Contact & Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {shelters.map((s) => {
                const occPct = Math.round((s.currentOccupancy / s.capacity) * 100);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <TierBadge tier={s.tier} />
                          <ReliabilityBar score={s.reliability} size="sm" className="w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {s.currentOccupancy} / {s.capacity} ({occPct}%)
                        </span>
                        <div className="h-1.5 w-24 ml-auto bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${occPct > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${occPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        {s.isAccessible ? '♿ Ramped' : 'Non-ramped'} • {s.powerBackup ? '⚡ GenSet' : 'No GenSet'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {s.foodKitsAvailable} kits
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {s.waterLitersAvailable} L
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <span className="text-slate-600 dark:text-slate-400 block font-mono">
                          {s.contactPhone}
                        </span>
                        <StaleBadge lastUpdated={s.lastUpdated} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-black shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3">Hospital Name</th>
                <th className="p-3 text-right">Free Beds</th>
                <th className="p-3 text-right">Free ICU Beds</th>
                <th className="p-3 text-center">Trauma Level</th>
                <th className="p-3 text-right">Oxygen Reserves</th>
                <th className="p-3">Accepted Patient Types</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{h.name}</span>
                    <StaleBadge lastUpdated={h.lastUpdated} />
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600">
                    {h.freeBeds} / {h.totalBeds}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-rose-600">
                    {h.freeIcuBeds} ICU
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                      {h.traumaCenterLevel}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">
                    {h.oxygenAvailableDays} days
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {h.acceptedPatientTypes.map((t) => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
