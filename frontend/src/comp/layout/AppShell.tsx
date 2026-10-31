import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  CloudRain,
  SlidersHorizontal,
  Truck,
  Building2,
  Navigation,
  HelpCircle,
  BarChart3,
  ListOrdered,
  Settings,
  Send,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radio,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { ConnectionBanner } from '@/comp/common/ConnectionBanner';

import { DispatchQueueDrawer } from '@/comp/common/DispatchQueueDrawer';
import { DecisionCardModal } from '@/comp/common/DecisionCardModal';
import { ReplanDiffModal } from '@/comp/common/ReplanDiffModal';
import { CommandPalette } from '@/comp/common/CommandPalette';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/api';

export const AppShell: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    theme,
    toggleTheme,
    sidebarCollapsed,
    toggleSidebar,
    toggleDispatchQueue,
    setCommandPaletteOpen,
  } = useUiStore();
  const { user, logout, login } = useAuthStore();
  const { unreadAlertsCount, clearUnreadAlerts } = useRealtimeStore();

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: mockApi.getAssignments,
  });

  const pendingCount = assignments.filter((a) => a.state === 'proposed').length;

  const navItems = [
    { label: t('nav.overview'), path: '/', icon: LayoutDashboard },
    { label: t('nav.map'), path: '/map', icon: Map },
    { label: t('nav.weather'), path: '/weather', icon: CloudRain },
    { label: t('nav.priorities'), path: '/priorities', icon: SlidersHorizontal },
    { label: t('nav.resources'), path: '/resources', icon: Truck },
    { label: t('nav.shelters'), path: '/shelters', icon: Building2 },
    { label: t('nav.routing'), path: '/routing', icon: Navigation },
    { label: t('nav.decisions'), path: '/decisions', icon: HelpCircle },
    { label: t('nav.analytics'), path: '/analytics', icon: BarChart3 },
    { label: t('nav.logs'), path: '/logs', icon: ListOrdered },
    { label: t('nav.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 transition-colors">
      {/* Connection & Network Drop Banner */}
      <ConnectionBanner />

      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-30 px-5 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              <Shield className="w-5 h-5 fill-white" />
            </span>
            <div className="leading-tight hidden sm:block">
              <span className="font-black tracking-wider text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                POSEIDON <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono px-2 py-0.5 rounded font-bold">AI</span>
              </span>
              <span className="text-xs text-slate-500 font-medium block">Disaster Relief Operations</span>
            </div>
          </div>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search commands or wards...</span>
            <kbd className="text-xs bg-white dark:bg-black px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>


        {/* Right: Actions, Language, Role Selector, User Menu */}
        <div className="flex items-center gap-3">
          {/* Dispatch Queue Trigger Button */}
          <button
            onClick={toggleDispatchQueue}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
            title="Open Persistent Dispatch Queue"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Dispatch Queue</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-full animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Role switcher for demo */}
          <select
            value={user?.role || 'Operator'}
            onChange={(e) => login(e.target.value as any)}
            className="p-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            title="Switch Demo Role"
          >
            <option value="Operator">Role: Operator</option>
            <option value="Supervisor">Role: Supervisor</option>
            <option value="Viewer">Role: Viewer (Read-only)</option>
          </select>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-64'
          } border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-black flex flex-col justify-between transition-all duration-200 select-none z-20`}
        >
          {/* Navigation Links */}
          <div className="p-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {!sidebarCollapsed && user && (
              <div className="px-2 py-1 text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 truncate block">{user.agency}</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="w-full p-2.5 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </aside>

        {/* Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black p-5 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Persistent Global Modals & Drawers */}
      <DispatchQueueDrawer />
      <DecisionCardModal />
      <ReplanDiffModal />
      <CommandPalette />
    </div>
  );
};
