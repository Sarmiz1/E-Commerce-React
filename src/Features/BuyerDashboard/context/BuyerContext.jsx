/* eslint-disable react-refresh/only-export-components */
/**
 * BuyerContext.jsx
 *
 * Architecture:
 *   UI State   → Zustand (useBuyerUIStore)
 *   Server Data → TanStack Query (useBuyerQueries.js)
 *
 * BuyerProvider is now a thin bridge that exposes everything
 * via a single useBuyer() hook for backward-compatibility with
 * all existing child components.
 */
import { createContext, useContext, useCallback, useMemo } from 'react';
import { useToast } from '../../../Store/useToastStore';
import { useAuth } from '../../../Store/useAuthStore';
import { useBuyerUIStore } from '../store/useBuyerUIStore';
import {
  useBuyerDashboard,
  useRemoveFromWishlist,
  useAddToWishlist,
  useSubmitReview,
  useMarkNotifsRead,
  useAddAddress,
  useDeleteAddress,
} from '../hooks/useBuyerQueries';
import { useCart } from '../../../Store/cartContext';
import { useWishlist } from '../../../hooks/useWishlist';
import { useAllProducts } from '../../../hooks/product/useProducts';

const BuyerCtx = createContext(null);
const EMPTY_WALLET = {
  balance: 0,
  totalFunded: 0,
  totalWithdrawn: 0,
  totalSpent: 0,
  transactions: [],
};
const EMPTY_AI_CREDITS = {
  balance: 0,
  totalPurchased: 0,
  totalUsed: 0,
  history: [],
};

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const asRecord = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);
const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const formatOrderDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const BUYER_NAV = [
  { id: 'overview',     label: 'Dashboard',       icon: 'layout' },
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
  const { addToast } = useToast();
  const { user } = useAuth();

  // ── UI state from Zustand ────────────────────────────────────────────────────
  const {
    page, setPage,
    sidebarOpen, setSidebarOpen, toggleSidebar,
    collapsed, setCollapsed, toggleCollapsed,
  } = useBuyerUIStore();

  const { 
    cart, 
    totals, 
    removeItem: removeFromCart, 
    updateQuantity: updateCartQty 
  } = useCart();

  // ── Server data from TanStack Query (BFF Pattern) ───────────────────────────
  const {
    data: dbData,
    isLoading,
    isFetching,
    error: dashboardError,
    refetch,
  } = useBuyerDashboard();
  
  const data = asRecord(dbData);
  const orders = asArray(data.orders).map(order => {
    const safeOrder = asRecord(order);
    return {
      ...safeOrder,
      amount: asNumber(safeOrder.total_minor),
      date: formatOrderDate(safeOrder.created_at),
    };
  });
  const reviews = asArray(data.reviews).map(asRecord);
  const notifs = asArray(data.notifications).map(asRecord);
  const addresses = asArray(data.addresses).map(asRecord);
  const payments = asArray(data.payment_methods).map(asRecord);
  const insights = asArray(data.insights).map(insight => {
    const safeInsight = asRecord(insight);
    return {
      ...safeInsight,
      color: safeInsight.color || '#667eea',
      icon: safeInsight.icon || 'sparkle',
      text: safeInsight.text || 'New shopping insight',
      sub: safeInsight.sub || '',
    };
  });

  const recommendations = asArray(data.recommendations).map(recommendation => {
    const safeRecommendation = asRecord(recommendation);
    const product = asRecord(safeRecommendation.products);

    return {
      ...safeRecommendation,
      ...product,
      products: product,
      name: product.name || safeRecommendation.name || 'Recommended product',
      category: product.category || safeRecommendation.category || 'Other',
      price: asNumber(product.price_minor ?? safeRecommendation.price_minor ?? safeRecommendation.price),
      image: product.image || safeRecommendation.image || '',
    }}
  );

  // ── Global Wishlist Sync ───────────────────────────────────────────────────
  const { productIds, wishlistCount } = useWishlist();
  const { data: allProducts = [] } = useAllProducts();
  const safeProductIds = asArray(productIds);
  const safeProducts = asArray(allProducts).map(asRecord);

  const liveWishlist = useMemo(() => {
    const positionById = new Map(safeProductIds.map((id, index) => [id, index]));
    return safeProducts
      .filter(p => positionById.has(p.id))
      .map(p => ({
        id: p.id,
        products: p, // Compatibility
        ...p,
        price: p.price_minor || 0,
        originalPrice: p.sale_price_minor || p.price_minor || 0,
        image: p.image,
        tag: p.ai_tags?.[0] || 'Price Drop',
        aiNote: p.ai_summary || 'Top rated pick based on your style.',
        inStock: (p.stock_quantity || 0) > 0,
        stock: p.stock_quantity || 0
      }))
      .sort((a, b) => positionById.get(a.id) - positionById.get(b.id));
  }, [safeProducts, safeProductIds]);
  
  const dataProfile = asRecord(data.profile);
  const nameCandidate = user?.user_metadata?.full_name || dataProfile.full_name || user?.user_metadata?.name;
  const rawName = typeof nameCandidate === 'string' && nameCandidate.trim()
    ? nameCandidate.trim()
    : 'Buyer';
  // Strip numbers and pick first word for the greeting
  const firstName = rawName.split(' ')[0].replace(/[0-9]/g, '') || 'Buyer';

  const profile = {
    ...dataProfile,
    full_name: rawName,
    firstName: firstName,
    email: user?.email || dataProfile.email || '',
    phone: user?.phone || dataProfile.phone || '',
  };
  const walletData = asRecord(data.wallet);
  const wallet = {
    ...EMPTY_WALLET,
    ...walletData,
    balance: asNumber(walletData.balance),
    transactions: asArray(walletData.transactions).map(asRecord),
  };
  const aiCreditsData = asRecord(data.ai_credits);
  const aiCredits = {
    ...EMPTY_AI_CREDITS,
    ...aiCreditsData,
    balance: asNumber(aiCreditsData.balance),
    totalPurchased: asNumber(aiCreditsData.totalPurchased),
    totalUsed: asNumber(aiCreditsData.totalUsed),
    history: asArray(aiCreditsData.history).map(asRecord),
  };

  // Use global cart from useCart hook
  const activeCart = cart;

  // Compute stats on the fly
  const totalSpentCents = orders.reduce((s, o) => s + asNumber(o.total_minor), 0);
  const delivered  = orders.filter((o) => o.status === 'delivered').length;
  const processing = orders.filter((o) => ['processing', 'pending'].includes(o.status)).length;
  const shipped    = orders.filter((o) => o.status === 'shipped').length;
  const cancelled  = orders.filter((o) => o.status === 'cancelled').length;
  const unreadCount = notifs.filter((n) => n.unread).length;

  const stats = {
    totalOrders: orders.length,
    wishlistItems: asNumber(wishlistCount),
    totalSpent: totalSpentCents,
    rewardPoints: asNumber(profile.reward_points),
    savedAmount: asNumber(totals?.discount),
  };
  const snapshot = { processing, shipped, delivered, cancelled };

  // Spending structure for BuyerAnalytics
  const spending = {
    categories: [], // Compute or pull from DB
    monthly: []
  };

  // ── Mutation hooks ───────────────────────────────────────────────────────────
  const removeFromWishlistMut = useRemoveFromWishlist();
  const addToWishlistMut      = useAddToWishlist();
  const submitReviewMut       = useSubmitReview();
  const markNotifsReadMut     = useMarkNotifsRead();
  const addAddressMut         = useAddAddress();
  const deleteAddressMut      = useDeleteAddress();

  // ── Actions (TODO: Move wallet/ai mutations to DB) ─────────────────────────
  const fundWallet = useCallback(async () => {
    const error = 'Wallet funding is not available yet.';
    addToast(error, 'info');
    return { success: false, error };
  }, [addToast]);

  const withdrawWallet = useCallback(async () => {
    const error = 'Wallet withdrawals are not available yet.';
    addToast(error, 'info');
    return { success: false, error };
  }, [addToast]);

  const buyCredits = useCallback(async () => {
    const error = 'AI credit purchases are not available yet.';
    addToast(error, 'info');
    return { success: false, error };
  }, [addToast]);

  const cartTotal = asNumber(totals?.total);
  const safeCart = asArray(activeCart).map(item => {
    const safeItem = asRecord(item);
    const product = asRecord(safeItem.product || safeItem.products);
    return {
      ...safeItem,
      name: safeItem.name || product.name || 'Cart item',
      price: asNumber(safeItem.price ?? product.price_minor),
    };
  });

  const value = {
    // UI
    page, setPage,
    sidebarOpen, setSidebarOpen, toggleSidebar,
    collapsed, setCollapsed, toggleCollapsed,
    loading: isLoading,
    refreshing: isFetching,
    loadError: dashboardError,
    
    // Server data mapping
    profile,
    orders, wishlist: liveWishlist, reviews, notifs, addresses,
    stats, snapshot, unreadCount,
    
    // Mutations
    addToWishlist: (product) => product?.id && addToWishlistMut.mutate(product.id),
    removeFromWishlist: (id) => removeFromWishlistMut.mutate(id),
    submitReview: (orderId, productName, rating, comment, productId) =>
      submitReviewMut.mutateAsync({ orderId, productId, rating, comment }),
    markAllNotifsRead: () => markNotifsReadMut.mutate(),
    addAddress: (addr) => addAddressMut.mutateAsync(addr),
    deleteAddress: (id) => deleteAddressMut.mutate(id),
    
    // Wallet mapping
    walletBalance: wallet.balance,
    walletTransactions: wallet.transactions,
    fundWallet, withdrawWallet,
    
    // AI Credits mapping
    aiCredits: aiCredits.balance,
    creditHistory: aiCredits.history,
    totalCreditsPurchased: aiCredits.totalPurchased,
    totalCreditsUsed: aiCredits.totalUsed,
    buyCredits,
    
    // Cart
    cart: safeCart,
    cartTotal,
    removeFromCart, 
    updateCartQty,
    
    // Misc dynamic data
    recommendations,
    insights,
    reorders: [], // Computed from orders if needed
    spending,
    payments,
    refresh: refetch,
  };

  return <BuyerCtx.Provider value={value}>{children}</BuyerCtx.Provider>;
}

export function useBuyer() {
  const ctx = useContext(BuyerCtx);
  if (!ctx) throw new Error('useBuyer must be inside BuyerProvider');
  return ctx;
}
