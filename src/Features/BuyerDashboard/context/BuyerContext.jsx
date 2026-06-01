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
import { createContext, useContext, useCallback } from 'react';
import { useToast } from '../../../Store/useToastStore';
import { useAuth } from '../../../Store/useAuthStore';
import { useBuyerUIStore } from '../store/useBuyerUIStore';
import {
  useBuyerDashboard,
  useBuyerReorders,
  useBuyerSpending,
  useWishlistAlerts,
  useRemoveFromWishlist,
  useAddToWishlist,
  useSubmitReview,
  useMarkNotifsRead,
  useMarkNotifRead,
  useDismissNotif,
  useSetWishlistAlert,
  useAddAddress,
  useDeleteAddress,
} from '../hooks/useBuyerQueries';
import { buyerApi } from '../api/buyerApi';
import { useCart } from '../../../Store/cartContext';
import { useWishlist } from '../../../hooks/useWishlist';
import { useAllProducts } from '../../../hooks/product/useProducts';
import {
  getSaleOriginalPriceMinor,
  getSellablePriceMinor,
} from '../../../utils/productPricing';

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
const getProductVariants = (item) => {
  const product = asRecord(item?.products || item?.product || item);
  return asArray(product.product_variants || item?.product_variants);
};
const getSellableVariant = (item) => {
  const explicitVariant = asRecord(item?.variant || item?.product_variants);
  if (explicitVariant.id && asNumber(explicitVariant.stock_quantity, 1) > 0) {
    return explicitVariant;
  }
  return getProductVariants(item).find(variant =>
    variant?.id && variant?.is_active !== false && asNumber(variant?.stock_quantity) > 0
  );
};
const withSelectedVariantPrice = (item) => {
  const variant = getSellableVariant(item);
  const product = asRecord(item?.products || item?.product || item);

  return {
    ...item,
    variant,
    price: getSellablePriceMinor(product, variant) || asNumber(item?.price_minor ?? item?.price),
    originalPrice: getSaleOriginalPriceMinor(product),
  };
};
const toCartAddition = (item) => {
  const safeItem = asRecord(item);
  const product = asRecord(safeItem.products || safeItem.product || safeItem);
  const variant = getSellableVariant(safeItem);
  const productId = safeItem.product_id || safeItem.productId || product.id;
  const variantId = safeItem.variant_id || safeItem.variantId || variant?.id;

  if (!productId || !variantId) return null;
  return {
    productId,
    variantId,
    quantity: Math.max(asNumber(safeItem.quantity, 1), 1),
    product,
    variant,
  };
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
    updateQuantity: updateCartQty,
    addItems: addCartItems,
  } = useCart();

  // ── Server data from TanStack Query (BFF Pattern) ───────────────────────────
  const {
    data: dbData,
    isLoading,
    isFetching,
    error: dashboardError,
    refetch,
  } = useBuyerDashboard();
  const {
    data: spendingData,
    isLoading: spendingLoading,
    error: spendingError,
    refetch: refreshSpending,
  } = useBuyerSpending();
  const {
    data: reorderData,
    isLoading: reordersLoading,
    error: reordersError,
    refetch: refreshReorders,
  } = useBuyerReorders();
  const { data: wishlistAlertData } = useWishlistAlerts();
  
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
  const notifs = asArray(data.notifications).map(notification => {
    const safeNotification = asRecord(notification);
    return {
      ...safeNotification,
      title: safeNotification.title || 'Account update',
      sub: safeNotification.sub || '',
      time: safeNotification.time || formatOrderDate(safeNotification.created_at),
    };
  });
  const addresses = asArray(data.addresses).map(asRecord);
  const payments = asArray(data.payment_methods).map(asRecord);
  const backendInsights = asArray(data.insights).map(insight => {
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
    };
  });

  // ── Global Wishlist Sync ───────────────────────────────────────────────────
  const { productIds, wishlistCount } = useWishlist();
  const { data: allProducts = [], isLoading: productsLoading } = useAllProducts();
  const safeProductIds = asArray(productIds);
  const safeProducts = asArray(allProducts).map(asRecord);
  const productsById = new Map(safeProducts.map(product => [product.id, product]));
  const personalizedRecommendations = recommendations
    .map(recommendation => {
      const catalogProduct = productsById.get(
        recommendation.products?.id || recommendation.product_id || recommendation.id,
      ) || {};
      return withSelectedVariantPrice({
        ...recommendation,
        ...catalogProduct,
        products: { ...recommendation.products, ...catalogProduct },
        name: catalogProduct.name || recommendation.name,
        budgetFit: recommendation.budgetFit ?? recommendation.budget_fit ?? false,
      });
    })
    .filter(recommendation => recommendation.variant?.id);
  const catalogRecommendations = safeProducts.slice(0, 5).map(product => (
    withSelectedVariantPrice({
      ...product,
      products: product,
      name: product.name || 'Available product',
      category: product.category?.name || product.category || 'Other',
      image: product.image || '',
      reason: product.ai_summary || 'Available now from the live catalog.',
      budgetFit: false,
    })
  ));
  const liveRecommendations = personalizedRecommendations.length
    ? personalizedRecommendations
    : catalogRecommendations;

  const liveWishlist = (() => {
    const positionById = new Map(safeProductIds.map((id, index) => [id, index]));
    return safeProducts
      .filter(p => positionById.has(p.id))
      .map(p => {
        const stock = getProductVariants(p).reduce(
          (total, variant) => total + asNumber(variant.stock_quantity),
          0,
        );
        return {
          id: p.id,
          products: p, // Compatibility
          ...p,
          price: getSellablePriceMinor(p),
          originalPrice: getSaleOriginalPriceMinor(p),
          image: p.image,
          tag: stock > 0 ? 'Price Drop' : 'Out of Stock',
          aiNote: p.ai_summary || 'Saved product from your wishlist.',
          inStock: stock > 0,
          stock,
        };
      })
      .sort((a, b) => positionById.get(a.id) - positionById.get(b.id));
  })();
  
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
  const totalSpentCents = orders
    .filter(order => order.payment_status === 'paid' && order.status !== 'cancelled')
    .reduce((s, o) => s + asNumber(o.total_minor), 0);
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
  const activityInsights = [
    delivered > 0 && {
      color: '#059669',
      icon: 'check',
      text: `${delivered} delivered ${delivered === 1 ? 'order' : 'orders'}`,
      sub: 'Based on your order history',
    },
    asNumber(wishlistCount) > 0 && {
      color: '#ec4899',
      icon: 'heart',
      text: `${asNumber(wishlistCount)} saved ${asNumber(wishlistCount) === 1 ? 'product' : 'products'}`,
      sub: 'From your current wishlist',
    },
    unreadCount > 0 && {
      color: '#f59e0b',
      icon: 'bell',
      text: `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`,
      sub: 'Review your latest updates',
    },
    liveRecommendations.length > 0 && {
      color: '#667eea',
      icon: 'sparkle',
      text: `${liveRecommendations.length} available ${liveRecommendations.length === 1 ? 'pick' : 'picks'} for you`,
      sub: 'From the live sellable catalog',
    },
  ].filter(Boolean);
  const liveInsights = backendInsights.length ? backendInsights : activityInsights;

  const rawSpending = asRecord(spendingData);
  const rawSpendingTrends = asRecord(rawSpending.trends);
  const normalizeSpendingPeriods = periods => asArray(periods).map(period => ({
    ...asRecord(period),
    label: period?.label || period?.month || '',
    spend: asNumber(period?.spend),
  }));
  const spendingCategories = asArray(rawSpending.categories);
  const totalCategorySpend = spendingCategories.reduce(
    (sum, category) => sum + asNumber(category.spend),
    0,
  );
  const monthlySpending = normalizeSpendingPeriods(rawSpendingTrends.monthly || rawSpending.monthly);
  const spending = {
    totalSpend: asNumber(rawSpending.lifetimeSpend ?? rawSpending.lifetime_spend, totalCategorySpend),
    categories: spendingCategories.map(category => ({
      ...category,
      spend: asNumber(category.spend),
      pct: totalCategorySpend > 0
        ? Math.round((asNumber(category.spend) / totalCategorySpend) * 100)
        : 0,
    })),
    trends: {
      daily: normalizeSpendingPeriods(rawSpendingTrends.daily),
      weekly: normalizeSpendingPeriods(rawSpendingTrends.weekly),
      monthly: monthlySpending,
      yearly: normalizeSpendingPeriods(rawSpendingTrends.yearly),
    },
    monthly: monthlySpending,
  };
  const reorders = asArray(reorderData).map(withSelectedVariantPrice);
  const wishlistAlerts = asArray(wishlistAlertData).map(asRecord);

  // ── Mutation hooks ───────────────────────────────────────────────────────────
  const removeFromWishlistMut = useRemoveFromWishlist();
  const addToWishlistMut      = useAddToWishlist();
  const submitReviewMut       = useSubmitReview();
  const markNotifsReadMut     = useMarkNotifsRead();
  const markNotifReadMut      = useMarkNotifRead();
  const dismissNotifMut       = useDismissNotif();
  const setWishlistAlertMut   = useSetWishlistAlert();
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
      quantity: Math.max(asNumber(safeItem.quantity ?? safeItem.qty, 1), 1),
    };
  });
  const addProductsToCart = useCallback(async (items) => {
    const additions = asArray(Array.isArray(items) ? items : [items])
      .map(toCartAddition)
      .filter(Boolean);

    if (!additions.length) {
      const error = 'This product is currently unavailable.';
      addToast(error, 'info');
      return { success: false, error };
    }

    try {
      await addCartItems(additions);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [addCartItems, addToast]);
  const getReceipt = useCallback(async (orderId) => {
    try {
      return await buyerApi.getReceipt(orderId);
    } catch (error) {
      addToast(error.message || 'Receipt could not be generated.', 'error');
      throw error;
    }
  }, [addToast]);

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
    markNotifRead: (id) => markNotifReadMut.mutate(id),
    dismissNotif: (id) => dismissNotifMut.mutate(id),
    setWishlistAlert: (variables) => setWishlistAlertMut.mutateAsync(variables),
    wishlistAlerts,
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
    addProductsToCart,
    getReceipt,
    
    // Misc dynamic data
    recommendations: liveRecommendations,
    insights: liveInsights,
    recommendationsLoading: isLoading || productsLoading,
    reorders,
    reordersLoading,
    reordersError,
    refreshReorders,
    spending,
    spendingLoading,
    spendingError,
    refreshSpending,
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
