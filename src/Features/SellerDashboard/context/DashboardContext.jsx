import { createContext, useContext, useState } from 'react';
import { useSellerData } from '../hooks/useSellerData';

const DashboardContext = createContext(null);

// All navigation items for the sidebar
export const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',        icon: 'grid' },
  { id: 'ai_sales_assistant',   label: 'AI Sales Assistant',  icon: 'ai' },
  { id: 'orders',     label: 'Orders',          icon: 'package' },
  { id: 'products',   label: 'Products',        icon: 'box' },
  { id: 'analytics',  label: 'Analytics',       icon: 'bar-chart' },
  { id: 'customers',  label: 'Customers',       icon: 'users' },
  { id: 'wallet',     label: 'Wallet',          icon: 'wallet' },
  { id: 'plan',       label: 'Plan',            icon: 'crown' },
  { id: 'marketing',  label: 'Marketing',       icon: 'zap' },
  { id: 'reviews',    label: 'Reviews',         icon: 'star' },
  { id: 'settings',   label: 'Settings',        icon: 'settings' },
];

export function DashboardProvider({ children }) {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Live Supabase data (falls back to mock) ──
  const data = useSellerData();

  return (
    <DashboardContext.Provider value={{
      activePage, setActivePage,
      sidebarCollapsed, setSidebarCollapsed,
      mobileSidebarOpen, setMobileSidebarOpen,
      // Spread all live data + actions
      ...data,
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
