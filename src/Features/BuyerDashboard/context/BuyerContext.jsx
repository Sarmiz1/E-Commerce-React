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
import { createContext, useContext, useCallback } from 'react';
import { useToast } from '../../../store/useToastStore';
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
import { useCart } from '../../../Context/cart/CartContext';
import { useWishlist } from '../../../Hooks/useWishlist';
import { useAllProducts } from '../../../Hooks/product/useProducts';
import { useMemo } from 'react';

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
  const { addToast } = useToast();

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
  const { data: dbData, isLoading } = useBuyerDashboard();
  
  const data = dbData || {};
  const orders = (data.orders || []).map(o => ({
    ...o,
    amount: o.total_cents || 0,
    date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }));
  const reviews = data.reviews || [];
  const notifs = data.notifications || [];
  const addresses = data.addresses || [];
  const payments = data.payment_methods || [];
  const insights = data.insights || [];
  const recommendations = (data.recommendations || []).map(r => ({
    ...r,
    ...r.products,
    price: r.products?.price_cents || 0,
    image: r.products?.image || r.image
  }));

  // ── Global Wishlist Sync ───────────────────────────────────────────────────
  const { productIds, wishlistCount } = useWishlist();
  const { data: allProducts = [] } = useAllProducts();

  const liveWishlist = useMemo(() => {
    const positionById = new Map(productIds.map((id, index) => [id, index]));
    return allProducts
      .filter(p => positionById.has(p.id))
      .map(p => ({
        id: p.id,
        products: p, // Compatibility
        ...p,
        price: p.price_cents || 0,
        originalPrice: p.sale_price_cents || p.price_cents || 0,
        image: p.image,
        tag: p.ai_tags?.[0] || 'Price Drop',
        aiNote: p.ai_summary || 'Top rated pick based on your style.',
        inStock: (p.stock_quantity || 0) > 0,
        stock: p.stock_quantity || 0
      }))
      .sort((a, b) => positionById.get(a.id) - positionById.get(b.id));
  }, [allProducts, productIds]);
  
  const profile = data.profile || {};
  const wallet = data.wallet || { balance: 0, totalFunded: 0, totalWithdrawn: 0, totalSpent: 0, transactions: [] };
  const aiCredits = data.ai_credits || { balance: 0, totalPurchased: 0, totalUsed: 0, history: [] };

  // Use global cart from useCart hook
  const activeCart = cart;

  // Compute stats on the fly
  const totalSpentCents = orders.reduce((s, o) => s + (o.total_cents || 0), 0);
  const delivered  = orders.filter((o) => o.status === 'delivered').length;
  const processing = orders.filter((o) => ['processing', 'pending'].includes(o.status)).length;
  const shipped    = orders.filter((o) => o.status === 'shipped').length;
  const cancelled  = orders.filter((o) => o.status === 'cancelled').length;
  const unreadCount = notifs.filter((n) => n.unread).length;

  const stats = {
    totalOrders: orders.length,
    wishlistItems: wishlistCount,
    totalSpent: totalSpentCents,
    rewardPoints: profile.reward_points || 0,
    savedAmount: totals.discount || 0,
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
  const fundWallet = useCallback(async (amount) => {
    addToast('Wallet funding requires backend mutation hook!');
    return { success: false };
  }, [addToast]);

  const withdrawWallet = useCallback(async (amount, password) => {
    addToast('Wallet withdraw requires backend mutation hook!');
    return { success: false };
  }, [addToast]);

  const buyCredits = useCallback(async (tier) => {
    addToast('Credit purchase requires backend mutation hook!');
    return { success: false };
  }, [addToast]);

  const cartTotal = totals.total;

  const value = {
    // UI
    page, setPage,
    sidebarOpen, setSidebarOpen, toggleSidebar,
    collapsed, setCollapsed, toggleCollapsed,
    loading: isLoading,
    
    // Server data mapping
    profile,
    orders, wishlist: liveWishlist, reviews, notifs, addresses,
    stats, snapshot, unreadCount,
    
    // Mutations
    addToWishlist: (product) => addToWishlistMut.mutate(product.id),
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
    cart: (activeCart || []).map(i => ({ ...i, price: i.price || 0 })), 
    cartTotal: cartTotal || 0,
    removeFromCart, 
    updateCartQty,
    
    // Misc dynamic data
    recommendations,
    insights,
    reorders: [], // Computed from orders if needed
    spending,
    payments,
    refresh: () => {}, // no-op
  };

  return <BuyerCtx.Provider value={value}>{children}</BuyerCtx.Provider>;
}

export function useBuyer() {
  const ctx = useContext(BuyerCtx);
  if (!ctx) throw new Error('useBuyer must be inside BuyerProvider');
  return ctx;
}
