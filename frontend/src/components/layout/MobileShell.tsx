import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Building,
  HeartPulse,
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUiStore } from '@/store/useUiStore';
import type { UserRole } from '@/types';

export const MobileShell: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();

  const currentRole = user?.role || 'Public';

  const roleTabs: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'Public', label: 'Public', icon: Users },
    { role: 'NGO', label: 'NGO', icon: Building },
    { role: 'Police', label: 'Police', icon: Shield },
    { role: 'Hospital', label: 'Hospital', icon: HeartPulse },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Web Command Center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              <Shield className="w-3.5 h-3.5 fill-white" />
            </span>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="font-black text-xs tracking-wide text-slate-900 dark:text-white">
                  POSEIDON
                </span>
                <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold px-1 py-0.2 rounded font-mono">
                  MOBILE
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isAuthenticated && user ? user.name : 'Please Sign In'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Controls: Theme + Auth Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-1 py-1 px-2.5 text-[11px] font-bold rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
              title="Logout / Change Role"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/m')}
              className="flex items-center gap-1 py-1 px-2.5 text-[11px] font-bold rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
              title="Sign In"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Main View Area (Optimized for Mobile Viewport) */}
      <main className="flex-1 w-full max-w-lg mx-auto p-3 sm:p-4 pb-24">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only when authenticated) */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-lg">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
            {roleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentRole === tab.role;
              return (
                <button
                  key={tab.role}
                  onClick={() => login(tab.role)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className="text-[10px] mt-0.5">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
export default MobileShell;
