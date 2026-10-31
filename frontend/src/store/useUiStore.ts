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

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
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
  mapTileUrl: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  setMapTileUrl: (mapTileUrl) => set({ mapTileUrl }),
}));
