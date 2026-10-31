import React, { useState } from 'react';
import {
  Users,
  PackageCheck,
  Truck,
  MapPin,
  CheckCircle,
  PlusCircle,
  Phone,
  Clock,
  HeartHandshake,
} from 'lucide-react';

interface VolunteerTask {
  id: string;
  zone: string;
  taskType: 'Food Packets' | 'Drinking Water' | 'Blankets & Kits' | 'Elderly Evacuation Assist';
  quantityNeeded: string;
  assignedNGO: string;
  status: 'Pending Dispatch' | 'In Transit' | 'Delivered';
  contactPerson: string;
  phone: string;
}

export const MobileNGOPortal: React.FC = () => {
  const [tasks, setTasks] = useState<VolunteerTask[]>([
    {
      id: 'TASK-NGO-101',
      zone: 'Ward 12 (Singanallur Shelter 2)',
      taskType: 'Food Packets',
      quantityNeeded: '450 Packets',
      assignedNGO: 'Red Cross Coimbatore',
      status: 'In Transit',
      contactPerson: 'S. Kaliappan',
      phone: '+91 98402 11920',
    },
    {
      id: 'TASK-NGO-102',
      zone: 'Ward 14 (Ukkadam Community Hall)',
      taskType: 'Drinking Water',
      quantityNeeded: '1,200 Litres (20L Cans)',
      assignedNGO: 'Rotary Club City',
      status: 'Pending Dispatch',
      contactPerson: 'M. Vasanth',
      phone: '+91 97901 44521',
    },
    {
      id: 'TASK-NGO-103',
      zone: 'Ward 08 (RS Puram Primary Center)',
      taskType: 'Blankets & Kits',
      quantityNeeded: '150 Dry Kits',
      assignedNGO: 'Seva Relief Volunteers',
      status: 'Delivered',
      contactPerson: 'Dr. V. Kavitha',
      phone: '+91 94431 88200',
    },
  ]);

  const [newLog, setNewLog] = useState({
    zone: 'Ward 12 (Singanallur)',
    type: 'Food Packets' as const,
    qty: '',
    donor: 'Red Cross Relief',
  });

  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus =
            t.status === 'Pending Dispatch'
              ? 'In Transit'
              : t.status === 'In Transit'
              ? 'Delivered'
              : 'Pending Dispatch';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleRegisterSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.qty) return;

    const newTask: VolunteerTask = {
      id: `TASK-NGO-${Math.floor(100 + Math.random() * 900)}`,
      zone: newLog.zone,
      taskType: newLog.type,
      quantityNeeded: `${newLog.qty} Units`,
      assignedNGO: newLog.donor,
      status: 'Pending Dispatch',
      contactPerson: 'On-duty Field Lead',
      phone: '+91 98940 00123',
    };

    setTasks([newTask, ...tasks]);
    setNewLog({ ...newLog, qty: '' });
    setRegisteredSuccess(true);
    setTimeout(() => setRegisteredSuccess(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-200" />
            <h2 className="font-bold text-base md:text-lg">NGO & Volunteer Coordination</h2>
          </div>
          <p className="text-xs text-teal-100 mt-0.5">
            Synchronized with State Emergency Operations Center (SEOC)
          </p>
        </div>
        <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-mono font-bold">
          32 Active Volunteers
        </span>
      </div>

      {/* Register Aid Delivery */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Register Dispatched Relief Consignment</h3>
        </div>

        {registeredSuccess && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Consignment dispatched and logged into SEOC real-time register!</span>
          </div>
        )}

        <form onSubmit={handleRegisterSupply} className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Target Ward / Shelter</label>
              <select
                value={newLog.zone}
                onChange={(e) => setNewLog({ ...newLog, zone: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Ward 12 (Singanallur Shelter 2)">Ward 12 (Singanallur)</option>
                <option value="Ward 14 (Ukkadam Community)">Ward 14 (Ukkadam)</option>
                <option value="Ward 08 (RS Puram Center)">Ward 08 (RS Puram)</option>
                <option value="Ward 03 (Peelamedu Relief Hub)">Ward 03 (Peelamedu)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Supply Category</label>
              <select
                value={newLog.type}
                onChange={(e) => setNewLog({ ...newLog, type: e.target.value as any })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Food Packets">Cooked Food / Ration</option>
                <option value="Drinking Water">Drinking Water (Cans)</option>
                <option value="Blankets & Kits">Blankets & Hygiene Kits</option>
                <option value="Elderly Evacuation Assist">Volunteer Evac Squad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Quantity / Batches</label>
              <input
                type="text"
                placeholder="e.g. 300 meals, 50 cans"
                value={newLog.qty}
                onChange={(e) => setNewLog({ ...newLog, qty: e.target.value })}
                required
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">NGO Unit Name</label>
              <input
                type="text"
                value={newLog.donor}
                onChange={(e) => setNewLog({ ...newLog, donor: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors mt-2"
          >
            Dispatch & Notify Ward Camp Officer
          </button>
        </form>
      </div>

      {/* Live Volunteer Aid Tasks */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Volunteer Missions</h3>
          </div>
          <span className="text-[11px] text-slate-500">Tap status to advance stage</span>
        </div>

        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                    {t.id}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{t.taskType}</span>
                  <span className="text-slate-500 text-[11px] ml-1">({t.quantityNeeded})</span>
                </div>
                <button
                  onClick={() => toggleStatus(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    t.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : t.status === 'In Transit'
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {t.status} ↻
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-700/60 pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {t.zone}
                </span>
                <a
                  href={`tel:${t.phone}`}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  {t.contactPerson}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

