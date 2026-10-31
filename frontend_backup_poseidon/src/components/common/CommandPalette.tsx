import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map, ShieldAlert, Building2, Truck, Bell, Moon, Sun, ArrowRight, X } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const items = [
    { label: 'Overview Dashboard', path: '/', category: 'Navigation', icon: ShieldAlert },
    { label: 'Interactive Mission Map', path: '/map', category: 'Navigation', icon: Map },
    { label: 'Prioritization & Ward Ranking', path: '/priorities', category: 'Navigation', icon: ShieldAlert },
    { label: 'Resource Fleet & Units', path: '/resources', category: 'Navigation', icon: Truck },
    { label: 'Shelters & Hospitals', path: '/shelters', category: 'Navigation', icon: Building2 },
    { label: 'Routing & Dynamic Replanning', path: '/routing', category: 'Navigation', icon: Map },
    { label: 'Explainable Decisions Explorer', path: '/decisions', category: 'Navigation', icon: ShieldAlert },
    { label: 'Analytics & Fairness Metrics', path: '/analytics', category: 'Navigation', icon: ShieldAlert },
    { label: 'Audit Logs & Overrides', path: '/logs', category: 'Navigation', icon: Bell },
    { label: 'Settings & Telemetry', path: '/settings', category: 'Navigation', icon: ShieldAlert },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Input */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search commands, wards, units, routes (or press Esc to exit)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-400">No matching commands or destinations.</p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-400 flex justify-between">
          <span>Navigate with <strong>Enter</strong> or click</span>
          <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">⌘K</kbd></span>
        </div>
      </div>
    </div>
  );
};
