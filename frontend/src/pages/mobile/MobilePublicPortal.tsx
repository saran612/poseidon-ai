import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Send,
  CheckCircle,
  HelpCircle,
  Shield,
  LifeBuoy,
  FileText,
  Volume2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/api';

export const MobilePublicPortal: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [reportText, setReportText] = useState('');
  const [category, setCategory] = useState('stranded');
  const [waterLevel, setWaterLevel] = useState('Waist Level');
  const [peopleCount, setPeopleCount] = useState('2-4');

  const { data: shelters = [] } = useQuery({
    queryKey: ['shelters'],
    queryFn: mockApi.getShelters,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setReportText('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* SOS High Priority Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 shadow-lg border border-red-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-full animate-pulse">
              <LifeBuoy className="w-6 h-6 text-white" />
            </span>
            <div>
              <h2 className="font-bold text-base md:text-lg">Life-Threatening Emergency?</h2>
              <p className="text-xs text-rose-100">Direct link to 112 & State SDRF Response Hub</p>
            </div>
          </div>
          <button
            onClick={() => setSosActive(!sosActive)}
            className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all ${
              sosActive
                ? 'bg-amber-300 text-slate-900 animate-bounce'
                : 'bg-white text-red-600 hover:bg-rose-50'
            }`}
          >
            {sosActive ? 'SOS BROADCASTING' : 'TRIGGER SOS'}
          </button>
        </div>
        {sosActive && (
          <div className="mt-3 p-3 bg-red-950/80 rounded-xl text-xs space-y-1 text-red-200 border border-red-400/40">
            <p className="font-semibold text-white">🚨 Live GPS Beacon Sent to SDRF Dispatch Unit:</p>
            <p>Lat: 11.0168° N, Long: 76.9558° E (Ward 14, Ramanathapuram)</p>
            <p className="text-[11px] text-amber-300">Rescue Unit BOAT-01 has acknowledged your signal (ETA ~14 mins).</p>
          </div>
        )}
      </div>

      {/* Emergency Dialers Quick Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <a
          href="tel:112"
          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-1 hover:border-blue-500 transition-colors"
        >
          <PhoneCall className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100">112 Helpline</span>
          <span className="text-[10px] text-slate-500">Disaster Central</span>
        </a>
        <a
          href="tel:108"
          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-1 hover:border-emerald-500 transition-colors"
        >
          <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100">108 Ambulance</span>
          <span className="text-[10px] text-slate-500">Medical Critical</span>
        </a>
        <a
          href="tel:1077"
          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-1 hover:border-amber-500 transition-colors"
        >
          <PhoneCall className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100">1077 Relief</span>
          <span className="text-[10px] text-slate-500">District Control</span>
        </a>
      </div>

      {/* Citizen SOS & Incident Report Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Report Flood Hazard / Request Aid</h3>
            <p className="text-xs text-slate-500">Your report feeds Poseidon's Priority and Allocation Engine</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200">Incident Reported Successfully!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Ticket #TN-SOS-{Math.floor(1000 + Math.random() * 9000)} generated. Triage priority: HIGH.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Hazard Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="stranded">People Stranded / Trapped in Water</option>
                <option value="medical">Elderly / Infant Medical Emergency</option>
                <option value="food_water">Drinking Water & Food Shortage</option>
                <option value="road_blocked">Bridge / Road Blocked by Debris</option>
                <option value="power">Live Power Lines Submerged</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Flood Inundation Level</label>
                <select
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Ankle Level">Ankle Level (0.5 ft)</option>
                  <option value="Knee Level">Knee Level (1.5 ft)</option>
                  <option value="Waist Level">Waist Level (3.0 ft)</option>
                  <option value="Neck/Roof Level">Roof / 1st Floor Submerged (&gt;5 ft)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">People Trapped</label>
                <select
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="1">1 Person</option>
                  <option value="2-4">2 - 4 Persons</option>
                  <option value="5-10">5 - 10 Persons</option>
                  <option value="10+">10+ Persons (Community/Hostel)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Location Landmark & Specifics</label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                required
                rows={2}
                placeholder="e.g. Near Amman Kovil, 2nd Cross, Ukkadam. Ground floor fully submerged."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Emergency Report to Control Room</span>
            </button>
          </form>
        )}
      </div>

      {/* Safe Shelters Nearby */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Relief Shelters Near You</h3>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
            All Open & Stocked
          </span>
        </div>

        <div className="space-y-2">
          {shelters.slice(0, 3).map((shelter) => {
            const pct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
            return (
              <div
                key={shelter.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{shelter.name}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    <span>Contact: {shelter.contactPhone}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Food Kits: {shelter.foodKitsAvailable} | Water: {shelter.waterLitersAvailable}L | Power Backup: {shelter.powerBackup ? 'Active GenSet' : 'Grid'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${pct > 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {shelter.currentOccupancy}/{shelter.capacity}
                  </span>
                  <p className="text-[10px] text-slate-400">({pct}% full)</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
