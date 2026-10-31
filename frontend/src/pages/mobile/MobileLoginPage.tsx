import React, { useState } from 'react';
import {
  Users,
  Building,
  Shield,
  HeartPulse,
  Radio,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Lock,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types';

interface RoleCard {
  role: UserRole;
  title: string;
  tagline: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  themeColor: {
    bg: string;
    border: string;
    activeBorder: string;
    activeBg: string;
    iconBg: string;
    text: string;
    button: string;
  };
  sampleIdentity: string;
  credentialType: 'phone' | 'email';
}

const ROLES: RoleCard[] = [
  {
    role: 'Public',
    title: 'Citizen / Public',
    tagline: 'SOS Distress, Hazard Reports & Shelters',
    badge: 'Citizen',
    icon: Users,
    themeColor: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/40',
      activeBg: 'bg-blue-950/60',
      iconBg: 'bg-blue-600',
      text: 'text-blue-400',
      button: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
    },
    sampleIdentity: '+91 98401 23456',
    credentialType: 'phone',
  },
  {
    role: 'NGO',
    title: 'NGO / Volunteer',
    tagline: 'Ration Packets, Water Cans & Evac Support',
    badge: 'Relief Partner',
    icon: Building,
    themeColor: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/40',
      activeBg: 'bg-emerald-950/60',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-400',
      button: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
    },
    sampleIdentity: 'relief-lead@redcross.org',
    credentialType: 'email',
  },
  {
    role: 'Police',
    title: 'Police & Traffic',
    tagline: 'Inundation Barricades & Green Corridors',
    badge: 'Law Enforcement',
    icon: Shield,
    themeColor: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/40',
      activeBg: 'bg-amber-950/60',
      iconBg: 'bg-amber-600',
      text: 'text-amber-400',
      button: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
    },
    sampleIdentity: 'traffic-div3@tnpolice.gov.in',
    credentialType: 'email',
  },
  {
    role: 'Hospital',
    title: 'Hospital & ER',
    tagline: 'ICU Beds, Inbound Ambulances & Oxygen',
    badge: 'Trauma Hub',
    icon: HeartPulse,
    themeColor: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/40',
      activeBg: 'bg-rose-950/60',
      iconBg: 'bg-rose-600',
      text: 'text-rose-400',
      button: 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500',
    },
    sampleIdentity: 'trauma-er@gh-coimbatore.gov.in',
    credentialType: 'email',
  },
];

export const MobileLoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Public');
  const [identifier, setIdentifier] = useState(ROLES[0].sampleIdentity);
  const [otpOrPin, setOtpOrPin] = useState('1234');
  const [submitting, setSubmitting] = useState(false);

  const activeCard = ROLES.find((r) => r.role === selectedRole) || ROLES[0];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const card = ROLES.find((r) => r.role === role);
    if (card) {
      setIdentifier(card.sampleIdentity);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      login(selectedRole);
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-md mx-auto py-3 space-y-5">
      {/* App Header Badge */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-1">
          <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          <span>Role-Based Access Control (RBAC)</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Choose Your Portal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select who you are to access dedicated field tools
        </p>
      </div>

      {/* 4 Large Touch-Optimized Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedRole === r.role;
          return (
            <div
              key={r.role}
              onClick={() => handleRoleChange(r.role)}
              role="button"
              tabIndex={0}
              className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between relative overflow-hidden select-none active:scale-[0.98] ${
                isSelected
                  ? `${r.themeColor.activeBorder} ${r.themeColor.activeBg} shadow-lg shadow-black/20`
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm ${
                    isSelected ? r.themeColor.iconBg : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isSelected
                        ? `${r.themeColor.bg} ${r.themeColor.text}`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {r.badge}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{r.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{r.tagline}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Login Card for Selected Persona */}
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${activeCard.themeColor.iconBg}`} />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Sign In as <strong className={activeCard.themeColor.text}>{activeCard.title}</strong>
          </span>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">
              {activeCard.credentialType === 'phone'
                ? 'Mobile Phone Number'
                : 'Official Agency / Department Email'}
            </label>
            <div className="relative">
              <input
                type={activeCard.credentialType === 'phone' ? 'tel' : 'email'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                {activeCard.credentialType === 'phone' ? (
                  <Phone className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">
              {activeCard.credentialType === 'phone' ? 'SMS One-Time Password (OTP)' : 'Security Passcode / PIN'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                maxLength={6}
                value={otpOrPin}
                onChange={(e) => setOtpOrPin(e.target.value)}
                className="w-full p-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono tracking-widest text-xs focus:border-blue-500 focus:outline-none"
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Default demo passcode: 1234</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 bg-gradient-to-r ${activeCard.themeColor.button} text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-2 active:scale-98`}
          >
            {submitting ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <>
                <span>Enter {activeCard.role} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default MobileLoginPage;
