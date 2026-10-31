import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  Shield,
  HeartPulse,
  Smartphone,
  ArrowRight,
  Lock,
  Phone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types';

interface RoleOption {
  role: UserRole;
  title: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  defaultIdentifier: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'Public',
    title: 'Citizen / General Public',
    badge: 'Open Access',
    desc: 'Report flood distress, broadcast SOS, find nearby dry shelters & emergency dialers',
    icon: Users,
    accentColor: 'from-blue-600 to-indigo-600 border-blue-500/40 text-blue-600 dark:text-blue-400',
    defaultIdentifier: '+91 98401 23456 (Citizen Phone)',
  },
  {
    role: 'NGO',
    title: 'NGO / Relief Volunteer',
    badge: 'Field Partner',
    desc: 'Log food packet distribution, register water consignments & manage volunteer tasks',
    icon: Building,
    accentColor: 'from-emerald-600 to-teal-600 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    defaultIdentifier: 'ngo-partner@redcross.org',
  },
  {
    role: 'Police',
    title: 'Police & Traffic Control',
    badge: 'Law Enforcement',
    desc: 'Enforce road blockades, mark submerged underpasses & activate green corridors',
    icon: Shield,
    accentColor: 'from-amber-600 to-orange-600 border-amber-500/40 text-amber-600 dark:text-amber-400',
    defaultIdentifier: 'badge-42@tnpolice.gov.in',
  },
  {
    role: 'Hospital',
    title: 'Hospital & Trauma Center',
    badge: 'Emergency Medical',
    desc: 'Update ICU/ward bed availability, admit inbound 108 ambulances & track oxygen supply',
    icon: HeartPulse,
    accentColor: 'from-rose-600 to-pink-600 border-rose-500/40 text-rose-600 dark:text-rose-400',
    defaultIdentifier: 'er-chief@gh-coimbatore.gov.in',
  },
];

export const MobileLoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Public');
  const [phoneNumberOrId, setPhoneNumberOrId] = useState('');
  const [otpOrPin, setOtpOrPin] = useState('1234');
  const [loading, setLoading] = useState(false);

  const activeRoleOption = ROLES.find((r) => r.role === selectedRole) || ROLES[0];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const opt = ROLES.find((r) => r.role === role);
    if (opt) {
      setPhoneNumberOrId(opt.defaultIdentifier);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login(selectedRole);
      setLoading(false);
      navigate('/m');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Branding */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            <Shield className="w-4 h-4 fill-white" />
          </span>
          <div>
            <h1 className="font-black text-sm tracking-wider flex items-center gap-1.5">
              POSEIDON <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/30">MOBILE</span>
            </h1>
            <p className="text-[10px] text-slate-400">Emergency Relief & Operations Hub</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
          RBAC Gateway
        </span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-6 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">Select Your Access Portal</h2>
          <p className="text-xs text-slate-400">
            Sign in according to your agency or citizen role
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {ROLES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRoleSelect(item.role)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                    {item.badge}
                  </span>
                  <span className="font-bold text-xs text-white block mt-0.5">
                    {item.role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Role Info Card */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role: {activeRoleOption.title}</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {activeRoleOption.desc}
          </p>
        </div>

        {/* Quick Auth Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1 text-[11px]">
              {selectedRole === 'Public' ? 'Mobile Phone Number' : 'Agency Officer ID / Official Email'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={phoneNumberOrId || activeRoleOption.defaultIdentifier}
                onChange={(e) => setPhoneNumberOrId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 text-xs font-mono focus:border-blue-500 focus:outline-none transition-colors"
                placeholder={activeRoleOption.defaultIdentifier}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1 text-[11px]">
              {selectedRole === 'Public' ? 'SMS OTP Code' : 'Security PIN / Passcode'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={otpOrPin}
                onChange={(e) => setOtpOrPin(e.target.value)}
                required
                maxLength={6}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 text-xs font-mono tracking-widest focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Default demo passcode: 1234</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <>
                <span>Enter as {selectedRole}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 text-center pb-2 text-[10px] text-slate-500">
        <p>State Emergency Operations Center (SEOC) & Disaster Relief Portal</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-400 hover:underline mt-1 inline-block"
        >
          ← Return to Desktop Web Console
        </button>
      </div>
    </div>
  );
};
export default MobileLoginPage;

