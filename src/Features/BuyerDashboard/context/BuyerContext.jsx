import { createContext, useContext, useState } from 'react';
import { useBuyerData } from '../hooks/useBuyerData';

const BuyerCtx = createContext(null);

export const BUYER_NAV = [
  { id: 'overview',     label: 'Dashboard',       icon: 'home' },
  { id: 'ai',          label: 'My AI',           icon: 'ai',  badge: 'NEW' },
  { id: 'orders',      label: 'My Orders',       icon: 'package' },
  { id: 'wishlist',    label: 'Wishlist',        icon: 'heart' },
  { id: 'wallet',      label: 'Wallet',          icon: 'wallet' },
  { id: 'credits',     label: 'AI Power-Ups',    icon: 'zap', badge: '✦' },
  { id: 'analytics',   label: 'Spending',        icon: 'bar-chart' },
  { id: 'addresses',   label: 'Addresses',       icon: 'map-pin' },
  { id: 'payments',    label: 'Payment Methods', icon: 'credit-card' },
  { id: 'reviews',     label: 'My Reviews',      icon: 'star' },
  { id: 'notifs',      label: 'Notifications',   icon: 'bell' },
  { id: 'settings',    label: 'Account',         icon: 'user' },
];

export function BuyerProvider({ children }) {
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // ── Live Supabase data (graceful mock fallback) ──
  const data = useBuyerData();

  return (
    <BuyerCtx.Provider value={{
      page, setPage,
      sidebarOpen, setSidebarOpen,
      collapsed, setCollapsed,
      // Spread all live data + actions
      ...data,
    }}>
      {children}
    </BuyerCtx.Provider>
  );
}

export function useBuyer() {
  const ctx = useContext(BuyerCtx);
  if (!ctx) throw new Error('useBuyer must be inside BuyerProvider');
  return ctx;
}
