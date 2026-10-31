import { create } from 'zustand';

interface UiState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  dispatchQueueOpen: boolean;
  setDispatchQueueOpen: (open: boolean) => void;
  toggleDispatchQueue: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  selectedDecisionId: string | null;
  openDecisionCard: (id: string) => void;
  closeDecisionCard: () => void;
  audioAlertsEnabled: boolean;
  toggleAudioAlerts: () => void;
  mapTileUrl: string;
  setMapTileUrl: (url: string) => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem('poseidon-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const useUiStore = create<UiState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('poseidon-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({
      theme,
      mapTileUrl:
        theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('poseidon-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return {
        theme: next,
        mapTileUrl:
          next === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      };
    });
  },
  language: 'en',
  setLanguage: (language) => set({ language }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  dispatchQueueOpen: false,
  setDispatchQueueOpen: (dispatchQueueOpen) => set({ dispatchQueueOpen }),
  toggleDispatchQueue: () => set((state) => ({ dispatchQueueOpen: !state.dispatchQueueOpen })),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  selectedDecisionId: null,
  openDecisionCard: (id) => set({ selectedDecisionId: id }),
  closeDecisionCard: () => set({ selectedDecisionId: null }),
  audioAlertsEnabled: true,
  toggleAudioAlerts: () => set((state) => ({ audioAlertsEnabled: !state.audioAlertsEnabled })),
  mapTileUrl: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  setMapTileUrl: (mapTileUrl) => set({ mapTileUrl }),
}));
