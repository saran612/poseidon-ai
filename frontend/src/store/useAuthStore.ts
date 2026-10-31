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

export const DEMO_USERS: Record<UserRole, User> = {
  Operator: {
    id: 'usr-op-01',
    name: 'K. Murugan',
    email: 'k.murugan@disaster.ap.gov.in',
    role: 'Operator',
    agency: 'Vijayawada State Emergency Operations Center (AP-SEOC)',
    token: 'mock-jwt-token-operator',
  },
  Supervisor: {
    id: 'usr-sup-01',
    name: 'Dr. Anita Roy, IAS',
    email: 'anita.roy@disaster.ap.gov.in',
    role: 'Supervisor',
    agency: 'Andhra Pradesh Disaster Management Authority (APSDMA - Vijayawada)',

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
  Public: {
    id: 'usr-pub-01',
    name: 'Citizen A. Raman',
    email: 'raman.citizen@publicnet.in',
    role: 'Public',
    agency: 'Citizen Emergency Portal',
    token: 'mock-jwt-token-public',
  },
  NGO: {
    id: 'usr-ngo-01',
    name: 'Priya Sundaram',
    email: 'priya@redcross-relief.org',
    role: 'NGO',
    agency: 'Indian Red Cross & Volunteer Network',
    token: 'mock-jwt-token-ngo',
  },
  Police: {
    id: 'usr-pol-01',
    name: 'Inspector S. Velu',
    email: 'velu.inspector@tnpolice.gov.in',
    role: 'Police',
    agency: 'City Traffic & Law Enforcement Wing',
    token: 'mock-jwt-token-police',
  },
  Hospital: {
    id: 'usr-hosp-01',
    name: 'Dr. Rajeshwari, MD',
    email: 'er.chief@gh-coimbatore.gov.in',
    role: 'Hospital',
    agency: 'Government Medical College & Trauma Center',
    token: 'mock-jwt-token-hospital',
  },
};

// Check if user has an active session in localStorage
const savedMobileRole = localStorage.getItem('poseidon-mobile-role') as UserRole | null;

export const useAuthStore = create<AuthState>((set) => ({
  user: savedMobileRole && DEMO_USERS[savedMobileRole] ? DEMO_USERS[savedMobileRole] : null,
  isAuthenticated: !!savedMobileRole,
  login: (role: UserRole) => {
    localStorage.setItem('poseidon-mobile-role', role);
    set({
      user: DEMO_USERS[role] || DEMO_USERS.Public,
      isAuthenticated: true,
      tokenWarning: false,
    });
  },
  logout: () => {
    localStorage.removeItem('poseidon-mobile-role');
    set({ user: null, isAuthenticated: false, tokenWarning: false });
  },
  tokenWarning: false,
  dismissTokenWarning: () => set({ tokenWarning: false }),
}));
