import { createContext, useContext, useState } from 'react';

const DashboardContext = createContext(null);

// All navigation items for the sidebar
export const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',        icon: 'grid' },
  { id: 'orders',     label: 'Orders',          icon: 'package' },
  { id: 'products',   label: 'Products',        icon: 'box' },
  { id: 'analytics',  label: 'Analytics',       icon: 'bar-chart' },
  { id: 'customers',  label: 'Customers',       icon: 'users' },
  { id: 'wallet',     label: 'Wallet',          icon: 'wallet' },
  { id: 'marketing',  label: 'Marketing',       icon: 'zap' },
  { id: 'reviews',    label: 'Reviews',         icon: 'star' },
  { id: 'settings',   label: 'Settings',        icon: 'settings' },
];

export function DashboardProvider({ children }) {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <DashboardContext.Provider value={{
      activePage, setActivePage,
      sidebarCollapsed, setSidebarCollapsed,
      mobileSidebarOpen, setMobileSidebarOpen,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider');
  return ctx;
}
