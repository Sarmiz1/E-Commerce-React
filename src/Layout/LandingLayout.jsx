import React, { lazy } from 'react';
import { Outlet } from 'react-router-dom'
const ModernFooter = lazy(() => import('../Features/Marketting/ModernLanding/SharedComponents/ModernFooter').then(module => ({ default: module.ModernFooter })));

const LandingLayout = () => {
  return (
    <div>
      <Outlet />
      <ModernFooter />
    </div>
  )
}

export default LandingLayout
