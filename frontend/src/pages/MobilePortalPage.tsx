import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { MobileLoginPage } from './mobile/MobileLoginPage';
import { MobilePublicPortal } from './mobile/MobilePublicPortal';
import { MobileNGOPortal } from './mobile/MobileNGOPortal';
import { MobilePolicePortal } from './mobile/MobilePolicePortal';
import { MobileHospitalPortal } from './mobile/MobileHospitalPortal';

export const MobilePortalWrapper: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  // If not logged in on mobile, display the Login Page with role selection
  if (!isAuthenticated || !user) {
    return <MobileLoginPage />;
  }

  const currentRole = user.role;

  switch (currentRole) {
    case 'Public':
      return <MobilePublicPortal />;
    case 'NGO':
      return <MobileNGOPortal />;
    case 'Police':
      return <MobilePolicePortal />;
    case 'Hospital':
      return <MobileHospitalPortal />;
    case 'Operator':
    case 'Supervisor':
    case 'Viewer':
    default:
      return <MobilePublicPortal />;
  }
};
export default MobilePortalWrapper;
