import React, { useState } from 'react';
import {
  HeartPulse,
  Bed,
  Ambulance,
  AlertCircle,
  Plus,
  CheckCircle,
  PhoneCall,
  Activity,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/api';

export const MobileHospitalPortal: React.FC = () => {
  const { data: initialHospitals = [] } = useQuery({
    queryKey: ['hospitals'],
    queryFn: mockApi.getHospitals,
  });

  const [icuAvailable, setIcuAvailable] = useState(14);
  const [generalBedsAvailable, setGeneralBedsAvailable] = useState(48);
  const [oxygenCylinders, setOxygenCylinders] = useState(85);
  const [bloodUnitsO_Neg, setBloodUnitsO_Neg] = useState(12);
  const [triageStatus, setTriageStatus] = useState<'NORMAL' | 'ELEVATED' | 'CRITICAL_SURGE'>('ELEVATED');
  const [statusUpdated, setStatusUpdated] = useState(false);

  const [incomingAmbulances, setIncomingAmbulances] = useState([
    {
      id: 'AMB-108-04',
      etaMin: 7,
      cases: '2 Critical Hypothermia / Drowning',
      origin: 'Ukkadam Ward 14',
      paramedic: 'K. Senthil',
    },
    {
      id: 'AMB-108-09',
      etaMin: 18,
      cases: '1 Trauma / Wall Collapse',
      origin: 'Singanallur Ward 12',
      paramedic: 'M. Anand',
    },
  ]);

  const handleCapacityUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* Hospital Triage Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between border border-emerald-600">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-200 animate-pulse" />
            <h2 className="font-bold text-base md:text-lg">Hospital & Emergency Trauma Ward</h2>
          </div>
          <p className="text-xs text-emerald-100 mt-0.5">
            Government Medical College & Hospital — Emergency Wing
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
              triageStatus === 'CRITICAL_SURGE'
                ? 'bg-rose-500 text-white'
                : triageStatus === 'ELEVATED'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-emerald-400 text-slate-950'
            }`}
          >
            {triageStatus}
          </span>
        </div>
      </div>

      {/* Real-time Incoming Ambulances */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ambulance className="w-4 h-4 text-rose-500 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inbound Emergency Patients (108 Link)</h3>
          </div>
          <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full">
            {incomingAmbulances.length} En Route
          </span>
        </div>

        <div className="space-y-2">
          {incomingAmbulances.map((amb) => (
            <div
              key={amb.id}
              className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">{amb.id}</span>
                  <span className="font-bold text-slate-900 dark:text-white">ETA {amb.etaMin} mins</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">{amb.cases}</p>
                <p className="text-[10px] text-slate-500">From: {amb.origin} | Paramedic: {amb.paramedic}</p>
              </div>
              <button
                onClick={() => setIncomingAmbulances((prev) => prev.filter((a) => a.id !== amb.id))}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
              >
                Admit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Capacity & Resource Stock Registry */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Update Ward Bed & Critical Supply</h3>
          </div>
          <span className="text-[10px] text-slate-400">Syncs to Central Dispatch</span>
        </div>

        {statusUpdated && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Capacity broadcast to State SEOC and 108 Dispatchers!</span>
          </div>
        )}

        <form onSubmit={handleCapacityUpdate} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-500 font-semibold mb-1">Available ICU Beds</label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min={0}
                  value={icuAvailable}
                  onChange={(e) => setIcuAvailable(Number(e.target.value))}
                  className="w-16 p-1.5 font-bold text-base rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center"
                />
                <span className="text-[11px] text-emerald-600 font-bold">Ventilator ready</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-500 font-semibold mb-1">Available General Beds</label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min={0}
                  value={generalBedsAvailable}
                  onChange={(e) => setGeneralBedsAvailable(Number(e.target.value))}
                  className="w-16 p-1.5 font-bold text-base rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center"
                />
                <span className="text-[11px] text-slate-500 font-medium">Post-op / Ward</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-500 font-semibold mb-1">Medical Oxygen (Cylinders)</label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min={0}
                  value={oxygenCylinders}
                  onChange={(e) => setOxygenCylinders(Number(e.target.value))}
                  className="w-16 p-1.5 font-bold text-base rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center"
                />
                <span className="text-[11px] text-blue-600 font-medium">~36 hrs buffer</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-500 font-semibold mb-1">Emergency O-ve Blood</label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min={0}
                  value={bloodUnitsO_Neg}
                  onChange={(e) => setBloodUnitsO_Neg(Number(e.target.value))}
                  className="w-16 p-1.5 font-bold text-base rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center"
                />
                <span className="text-[11px] text-rose-500 font-medium">Universal Donor</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Triage Pressure:</span>
              <select
                value={triageStatus}
                onChange={(e) => setTriageStatus(e.target.value as any)}
                className="p-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="ELEVATED">ELEVATED</option>
                <option value="CRITICAL_SURGE">CRITICAL SURGE</option>
              </select>
            </div>

            <button
              type="submit"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors"
            >
              Push Real-time Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

