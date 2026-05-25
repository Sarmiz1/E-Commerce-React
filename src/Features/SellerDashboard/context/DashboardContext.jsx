import { createContext, useContext, useMemo } from 'react';
import { useSellerUIStore } from '../store/useSellerUIStore';
import {
  useSellerDashboard,
  useUpdateOrderStatus,
  useUpdateReviewStatus,
  useDeleteProduct,
  useSaveSettings,
  useRequestWithdrawal,
  useMarkNotificationsRead
} from '../hooks/useSellerQueries';

const DashboardContext = createContext(null);

export const NAV_ITEMS = [
  { id: 'overview',           label: 'Dashboard',    icon: 'layout' },
  { id: 'ai_sales_assistant', label: 'AI Assistant', icon: 'zap' },
  { id: 'orders',             label: 'Orders',       icon: 'shopping-cart' },
  { id: 'products',           label: 'Products',     icon: 'box' },
  { id: 'analytics',          label: 'Analytics',    icon: 'bar-chart' },
  { id: 'customers',          label: 'Customers',    icon: 'users' },
  { id: 'wallet',             label: 'Wallet',       icon: 'wallet' },
  { id: 'plan',               label: 'Subscription', icon: 'credit-card' },
  { id: 'marketing',          label: 'Marketing',    icon: 'trending-up' },
  { id: 'reviews',            label: 'Reviews',      icon: 'star' },
  { id: 'settings',           label: 'Settings',     icon: 'settings' },
];

export function DashboardProvider({ children }) {
  // ── UI state from Zustand ────────────────────────────────────────────────────
  const {
    page, setPage,
    sidebarCollapsed, setSidebarCollapsed,
    mobileSidebarOpen, setMobileSidebarOpen
  } = useSellerUIStore();

  // ── Server data from TanStack Query (BFF Pattern) ───────────────────────────
  const { data: dbData, isLoading } = useSellerDashboard();
  
  const data = dbData || {};
  
  const profile = data.profile || {
    storeName: '',
    storeDescription: '',
    businessEmail: '',
    businessPhone: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    notifs: { newOrders: true, lowStock: true, payouts: true, reviews: false }
  };
  
  const stats = data.stats || {
    revenue: 0,
    totalOrders: 0,
    ordersToday: 0,
    activeProducts: 0,
    totalProducts: 0,
    customers: 0
  };
  
  const wallet = data.wallet || {
    balance: 0,
    pendingPayout: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    transactions: []
  };

  const orders = data.orders || [];
  const products = data.products || [];
  const reviews = data.reviews || [];
  const notifications = data.notifications || [];
  
  const analytics = data.analytics || {
    peakHours: [],
    categoryRevenue: [],
    trafficSources: [],
    metrics: [],
    performance: { bestSeller: null, needsAttention: null }
  };

  // Compute unread count
  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  // ── Mutation hooks ───────────────────────────────────────────────────────────
  const updateOrderStatusMut     = useUpdateOrderStatus();
  const updateReviewStatusMut    = useUpdateReviewStatus();
  const deleteProductMut         = useDeleteProduct();
  const saveSettingsMut          = useSaveSettings();
  const requestWithdrawalMut     = useRequestWithdrawal();
  const markNotificationsReadMut = useMarkNotificationsRead();

  const value = {
    // UI
    activePage: page, setActivePage: setPage,
    sidebarCollapsed, setSidebarCollapsed,
    mobileSidebarOpen, setMobileSidebarOpen,
    loading: isLoading,
    
    // Server data
    profile,
    stats,
    wallet,
    orders,
    products,
    reviews,
    notifications,
    analytics,
    unreadCount,
    
    // Mutations (exposed directly for components to use)
    updateOrderStatus: (orderId, status) => updateOrderStatusMut.mutateAsync({ orderId, status }),
    updateReviewStatus: (reviewId, isVerified) => updateReviewStatusMut.mutateAsync({ reviewId, isVerified }),
    deleteProduct: (productId) => deleteProductMut.mutateAsync(productId),
    saveSettings: (settings) => saveSettingsMut.mutateAsync(settings),
    requestWithdrawal: (amount, fee, desc) => requestWithdrawalMut.mutateAsync({ amountCents: amount, feeCents: fee, description: desc }),
    markAllNotifsRead: () => markNotificationsReadMut.mutateAsync(),
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
