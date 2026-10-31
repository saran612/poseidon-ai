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
BrainCircuit,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { SimulationControls } from '@/components/common/SimulationControls';
import { ConnectionBanner } from '@/components/common/ConnectionBanner';
import { DispatchQueueDrawer } from '@/components/common/DispatchQueueDrawer';
import { DecisionCardModal } from '@/components/common/DecisionCardModal';
import { ReplanDiffModal } from '@/components/common/ReplanDiffModal';
import { CommandPalette } from '@/components/common/CommandPalette';
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
    { label: '📱 Open Mobile App', path: '/m', icon: Smartphone, highlight: true },
    { label: t('nav.overview'), path: '/', icon: LayoutDashboard },
    { label: t('nav.map'), path: '/map', icon: Map },
    { label: t('nav.weather'), path: '/weather', icon: CloudRain },
    { label: t('nav.priorities'), path: '/priorities', icon: SlidersHorizontal },
    { label: t('nav.resources'), path: '/resources', icon: Truck },
    { label: t('nav.shelters'), path: '/shelters', icon: Building2 },
    { label: t('nav.routing'), path: '/routing', icon: Navigation },
    { label: t('nav.decisions'), path: '/decisions', icon: HelpCircle },
    { label: t('nav.analytics'), path: '/analytics', icon: BarChart3 },
    { label: 'AI Intelligence', path: '/ml-intelligence', icon: BrainCircuit },
    { label: t('nav.logs'), path: '/logs', icon: ListOrdered },
    { label: t('nav.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Connection & Network Drop Banner */}
      <ConnectionBanner />

      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between gap-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              <Shield className="w-4 h-4 fill-white" />
            </span>
            <div className="leading-tight hidden sm:block">
              <span className="font-black tracking-wider text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                POSEIDON <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono px-1.5 py-0.2 rounded font-bold">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">Disaster Relief Operations</span>
            </div>
          </div>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search commands or wards...</span>
            <kbd className="text-[10px] bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Center: Realtime Simulation Controls */}
        <div className="hidden lg:block">
          <SimulationControls />
        </div>

        {/* Right: Actions, Language, Role Selector, User Menu */}
        <div className="flex items-center gap-2">
          {/* Dispatch Queue Trigger Button */}
          <button
            onClick={toggleDispatchQueue}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Open Persistent Dispatch Queue"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dispatch Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-mono font-bold text-[10px] rounded-full animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Role switcher for demo */}
          <select
            value={user?.role || 'Operator'}
            onChange={(e) => login(e.target.value as any)}
            className="p-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            title="Switch RBAC Role"
          >
            <option value="Operator">Role: Operator</option>
            <option value="Supervisor">Role: Supervisor</option>
            <option value="Public">Role: Public (Citizen)</option>
            <option value="NGO">Role: NGO / Volunteer</option>
            <option value="Police">Role: Police / Traffic</option>
            <option value="Hospital">Role: Hospital / Trauma</option>
            <option value="Viewer">Role: Viewer (Read-only)</option>
          </select>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-56'
          } border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between transition-all duration-200 select-none z-20`}
        >
          {/* Navigation Links */}
          <div className="p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                        : item.highlight
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {!sidebarCollapsed && user && (
              <div className="px-2 py-1 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">{user.agency}</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="w-full p-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
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
export default AppShell;
