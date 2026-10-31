import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  tokenWarning: boolean;
  dismissTokenWarning: () => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  Operator: {
    id: 'usr-op-01',
    name: 'K. Murugan',
    email: 'k.murugan@tnsdma.tn.gov.in',
    role: 'Operator',
    agency: 'State Emergency Operations Center (SEOC)',
    token: 'mock-jwt-token-operator',
  },
  Supervisor: {
    id: 'usr-sup-01',
    name: 'Dr. Anita Roy, IAS',
    email: 'anita.roy@tnsdma.tn.gov.in',
    role: 'Supervisor',
    agency: 'District Disaster Management Authority (DDMA)',
    token: 'mock-jwt-token-supervisor',
  },
  Viewer: {
    id: 'usr-view-01',
    name: 'Press / Media Observer',
    email: 'observer@presspool.gov.in',
    role: 'Viewer',
    agency: 'Public Information Bureau',
    token: 'mock-jwt-token-viewer',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USERS.Operator, // Default to Operator so demo is ready
  isAuthenticated: true,
  login: (role: UserRole) => {
    set({
      user: DEMO_USERS[role] || DEMO_USERS.Operator,
      isAuthenticated: true,
      tokenWarning: false,
    });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false, tokenWarning: false });
  },
  tokenWarning: false,
  dismissTokenWarning: () => set({ tokenWarning: false }),
}));
