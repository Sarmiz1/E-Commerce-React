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
import { useShallow } from 'zustand/react/shallow';
import { useToast } from '../../../Store/useToastStore';
import { useAuth } from '../../../Store/useAuthStore';
import { useBuyerUIStore } from '../store/useBuyerUIStore';
import {
  useBuyerDashboard,
  useBuyerAddresses,
  useBuyerAccountSettings,
  useBuyerPhoneNumbers,
  useBuyerPaymentMethods,
  useBuyerReorders,
  useBuyerReviews,
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
  useUpdateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
  useAddPhoneNumber,
  useUpdatePhoneNumber,
  useSetDefaultPhoneNumber,
  useDeletePhoneNumber,
  useApprovePhoneNumberAction,
  useAddPaymentMethod,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
  useApproveSensitiveAction,
  useSaveBuyerAccountSettings,
  useUploadBuyerAccountAvatar,
  useRemoveBuyerAccountAvatar,
  useSaveBuyerAccountPreference,
  useRequestBuyerEmailChange,
  useApproveBuyerEmailChange,
  useRequestBuyerPasswordChange,
  useApproveBuyerPasswordChange,
  useDeactivateBuyerAccount,
} from '../hooks/useBuyerQueries';
import { buyerApi } from '../api/buyerApi';
import { useCart } from '../../../Store/cartContext';
import { useWishlist } from '../../../hooks/useWishlist';
import { useAllProducts } from '../../../hooks/product/useProducts';
import {
  getSaleOriginalPriceMinor,
  getSellablePriceMinor,
} from '../../../utils/productPricing';
import { normalizeAddressCountryCode } from '../../../utils/addressCountries';

const BuyerCtx = createContext(null);
const EMPTY_ARRAY = [];
const EMPTY_RECORD = {};
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

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : EMPTY_ARRAY);
const asRecord = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : EMPTY_RECORD
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
const normalizeSpendingPeriods = periods => asArray(periods).map(period => ({
  ...asRecord(period),
  label: period?.label || period?.month || '',
  spend: asNumber(period?.spend),
}));
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
  const price = getSellablePriceMinor(product, variant)
    || asNumber(item?.price_minor ?? item?.price);

  return {
    ...item,
    products: product,
    variant,
    name: product.name || item?.name || 'Available product',
    image: product.image || item?.image || '',
    description: product.short_description
      || product.full_description
      || item?.description
      || item?.reason
      || 'Available now from the live catalog.',
    price,
    priceMinor: asNumber(product.price_minor ?? item?.price_minor ?? item?.price),
    salePriceMinor: asNumber(product.sale_price_minor),
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
  } = useBuyerUIStore(useShallow(state => ({
    page: state.page,
    setPage: state.setPage,
    sidebarOpen: state.sidebarOpen,
    setSidebarOpen: state.setSidebarOpen,
    toggleSidebar: state.toggleSidebar,
    collapsed: state.collapsed,
    setCollapsed: state.setCollapsed,
    toggleCollapsed: state.toggleCollapsed,
  })));

  const catalogEnabled = ['overview', 'ai', 'wishlist'].includes(page);
  const reordersEnabled = ['orders', 'wishlist'].includes(page);
  const addressesEnabled = page === 'addresses';
  const paymentsEnabled = page === 'payments';
  const reviewsEnabled = page === 'reviews';
  const settingsEnabled = page === 'settings';

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
  } = useBuyerSpending({ enabled: page === 'analytics' });
  const {
    data: reorderData,
    isLoading: reordersLoading,
    error: reordersError,
    refetch: refreshReorders,
  } = useBuyerReorders({ enabled: reordersEnabled });
  const {
    data: addressData,
    isLoading: addressesLoading,
    error: addressesError,
    refetch: refreshAddresses,
  } = useBuyerAddresses({ enabled: addressesEnabled });
  const {
    data: paymentMethodData,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refreshPayments,
  } = useBuyerPaymentMethods({ enabled: paymentsEnabled });
  const {
    data: phoneNumberData,
    isLoading: phoneNumbersLoading,
    error: phoneNumbersError,
    refetch: refreshPhoneNumbers,
  } = useBuyerPhoneNumbers({ enabled: addressesEnabled });
  const {
    data: reviewData,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refreshReviews,
  } = useBuyerReviews({ enabled: reviewsEnabled });
  const {
    data: accountSettingsData,
    isLoading: accountSettingsLoading,
    error: accountSettingsError,
    refetch: refreshAccountSettings,
  } = useBuyerAccountSettings({ enabled: settingsEnabled });
  const { data: wishlistAlertData } = useWishlistAlerts({ enabled: page === 'wishlist' });
  
  const data = useMemo(() => asRecord(dbData), [dbData]);
  const orders = useMemo(() => asArray(data.orders).map(order => {
    const safeOrder = asRecord(order);
    return {
      ...safeOrder,
      amount: asNumber(safeOrder.total_minor),
      date: formatOrderDate(safeOrder.created_at),
    };
  }), [data.orders]);
  const reviews = useMemo(() => asArray(reviewData || data.reviews).map(review => {
    const safeReview = asRecord(review);
    return {
      ...safeReview,
      id: safeReview.id || safeReview.product_id,
      product: safeReview.product || safeReview.products?.name || 'Purchased product',
      productId: safeReview.product_id || safeReview.products?.id,
      orderId: safeReview.order_id || safeReview.orderId,
      submitted: Boolean(safeReview.submitted || safeReview.review_id),
    };
  }), [data.reviews, reviewData]);
  const notifs = useMemo(() => asArray(data.notifications).map(notification => {
    const safeNotification = asRecord(notification);
    return {
      ...safeNotification,
      title: safeNotification.title || 'Account update',
      sub: safeNotification.sub || '',
      time: safeNotification.time || formatOrderDate(safeNotification.created_at),
    };
  }), [data.notifications]);
  const addresses = useMemo(() => asArray(addressData || data.addresses).map(address => {
    const safeAddress = asRecord(address);
    return {
      ...safeAddress,
      label: safeAddress.label || safeAddress.address_type || 'Address',
      name: safeAddress.name || safeAddress.full_name || 'Buyer',
      isDefault: Boolean(safeAddress.isDefault ?? safeAddress.is_default_shipping),
      postalCode: safeAddress.postalCode || safeAddress.postal_code || '',
      country: normalizeAddressCountryCode(safeAddress.country || 'NG'),
    };
  }), [addressData, data.addresses]);
  const payments = useMemo(() => asArray(paymentMethodData || data.payment_methods).map(method => {
    const safeMethod = asRecord(method);
    return {
      ...safeMethod,
      isDefault: Boolean(safeMethod.isDefault ?? safeMethod.is_default),
    };
  }), [data.payment_methods, paymentMethodData]);
  const phoneNumbers = useMemo(() => asArray(phoneNumberData).map(phone => {
    const safePhone = asRecord(phone);
    return {
      ...safePhone,
      isDefault: Boolean(safePhone.isDefault ?? safePhone.is_default),
    };
  }), [phoneNumberData]);
  const backendInsights = useMemo(() => asArray(data.insights).map(insight => {
    const safeInsight = asRecord(insight);
    return {
      ...safeInsight,
      color: safeInsight.color || '#667eea',
      icon: safeInsight.icon || 'sparkle',
      text: safeInsight.text || 'New shopping insight',
      sub: safeInsight.sub || '',
    };
  }), [data.insights]);

  const recommendations = useMemo(() => asArray(data.recommendations).map(recommendation => {
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
  }), [data.recommendations]);

  // ── Global Wishlist Sync ───────────────────────────────────────────────────
  const { productIds, wishlistCount } = useWishlist();
  const { data: allProducts = [], isLoading: productsLoading } = useAllProducts({
    enabled: catalogEnabled,
  });
  const safeProductIds = useMemo(() => asArray(productIds), [productIds]);
  const safeProducts = useMemo(() => asArray(allProducts).map(asRecord), [allProducts]);
  const { liveRecommendations, liveWishlist } = useMemo(() => {
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
    const positionById = new Map(safeProductIds.map((id, index) => [id, index]));
    const wishlist = safeProducts
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
    return {
      liveRecommendations: personalizedRecommendations.length
        ? personalizedRecommendations
        : catalogRecommendations,
      liveWishlist: wishlist,
    };
  }, [recommendations, safeProductIds, safeProducts]);
  
  const dataProfile = useMemo(() => asRecord(data.profile), [data.profile]);
  const accountSettings = useMemo(() => asRecord(accountSettingsData), [accountSettingsData]);
  const accountProfile = useMemo(() => asRecord(accountSettings.profile), [accountSettings.profile]);
  const profile = useMemo(() => {
    const nameCandidate = accountProfile.full_name
      || user?.user_metadata?.full_name
      || dataProfile.full_name
      || user?.user_metadata?.name;
    const rawName = typeof nameCandidate === 'string' && nameCandidate.trim()
      ? nameCandidate.trim()
      : 'Buyer';
    // Prefer the canonical first name returned by the account RPC. Fall back for legacy payloads.
    const firstNameCandidate = accountProfile.first_name || rawName;
    const firstName = firstNameCandidate.trim().split(/\s+/)[0].replace(/[0-9]/g, '') || 'Buyer';

    return {
      ...dataProfile,
      ...accountProfile,
      full_name: rawName,
      firstName,
      email: accountProfile.email || user?.email || dataProfile.email || '',
      phone: accountProfile.phone || user?.phone || dataProfile.phone || '',
      avatar_url: accountProfile.avatar_url || dataProfile.avatar_url || user?.user_metadata?.avatar_url || '',
    };
  }, [accountProfile, dataProfile, user?.email, user?.phone, user?.user_metadata]);
  const wallet = useMemo(() => {
    const walletData = asRecord(data.wallet);
    return {
      ...EMPTY_WALLET,
      ...walletData,
      balance: asNumber(walletData.balance),
      transactions: asArray(walletData.transactions).map(asRecord),
    };
  }, [data.wallet]);
  const aiCredits = useMemo(() => {
    const aiCreditsData = asRecord(data.ai_credits);
    return {
      ...EMPTY_AI_CREDITS,
      ...aiCreditsData,
      balance: asNumber(aiCreditsData.balance),
      totalPurchased: asNumber(aiCreditsData.totalPurchased),
      totalUsed: asNumber(aiCreditsData.totalUsed),
      history: asArray(aiCreditsData.history).map(asRecord),
    };
  }, [data.ai_credits]);

  // Use global cart from useCart hook
  const activeCart = cart;

  const { stats, snapshot, unreadCount, activityInsights } = useMemo(() => {
    const totalSpent = orders
      .filter(order => order.payment_status === 'paid' && order.status !== 'cancelled')
      .reduce((sum, order) => sum + asNumber(order.total_minor), 0);
    const delivered = orders.filter(order => order.status === 'delivered').length;
    const processing = orders.filter(order => ['processing', 'pending'].includes(order.status)).length;
    const shipped = orders.filter(order => order.status === 'shipped').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;
    const unread = notifs.filter(notification => notification.unread).length;
    const savedProducts = asNumber(wishlistCount);
    const availablePicks = liveRecommendations.length;

    return {
      stats: {
        totalOrders: orders.length,
        wishlistItems: savedProducts,
        totalSpent,
        rewardPoints: asNumber(profile.reward_points),
        savedAmount: asNumber(totals?.discount),
      },
      snapshot: { processing, shipped, delivered, cancelled },
      unreadCount: unread,
      activityInsights: [
        delivered > 0 && {
          color: '#059669',
          icon: 'check',
          text: `${delivered} delivered ${delivered === 1 ? 'order' : 'orders'}`,
          sub: 'Based on your order history',
        },
        savedProducts > 0 && {
          color: '#ec4899',
          icon: 'heart',
          text: `${savedProducts} saved ${savedProducts === 1 ? 'product' : 'products'}`,
          sub: 'From your current wishlist',
        },
        unread > 0 && {
          color: '#f59e0b',
          icon: 'bell',
          text: `${unread} unread ${unread === 1 ? 'notification' : 'notifications'}`,
          sub: 'Review your latest updates',
        },
        availablePicks > 0 && {
          color: '#667eea',
          icon: 'sparkle',
          text: `${availablePicks} available ${availablePicks === 1 ? 'pick' : 'picks'} for you`,
          sub: 'From the live sellable catalog',
        },
      ].filter(Boolean),
    };
  }, [liveRecommendations.length, notifs, orders, profile.reward_points, totals?.discount, wishlistCount]);
  const liveInsights = useMemo(
    () => (backendInsights.length ? backendInsights : activityInsights),
    [activityInsights, backendInsights],
  );

  const spending = useMemo(() => {
    const rawSpending = asRecord(spendingData);
    const rawSpendingTrends = asRecord(rawSpending.trends);
    const spendingCategories = asArray(rawSpending.categories);
    const totalCategorySpend = spendingCategories.reduce(
      (sum, category) => sum + asNumber(category.spend),
      0,
    );
    const monthlySpending = normalizeSpendingPeriods(rawSpendingTrends.monthly || rawSpending.monthly);

    return {
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
  }, [spendingData]);
  const reorders = useMemo(() => asArray(reorderData).map(withSelectedVariantPrice), [reorderData]);
  const wishlistAlerts = useMemo(() => asArray(wishlistAlertData).map(asRecord), [wishlistAlertData]);

  // ── Mutation hooks ───────────────────────────────────────────────────────────
  const { mutate: mutateRemoveFromWishlist } = useRemoveFromWishlist();
  const { mutate: mutateAddToWishlist } = useAddToWishlist();
  const { mutateAsync: mutateSubmitReview } = useSubmitReview();
  const { mutate: mutateMarkNotifsRead } = useMarkNotifsRead();
  const { mutate: mutateMarkNotifRead } = useMarkNotifRead();
  const { mutate: mutateDismissNotif } = useDismissNotif();
  const { mutateAsync: mutateSetWishlistAlert } = useSetWishlistAlert();
  const { mutateAsync: mutateAddAddress } = useAddAddress();
  const { mutateAsync: mutateUpdateAddress } = useUpdateAddress();
  const { mutateAsync: mutateSetDefaultAddress } = useSetDefaultAddress();
  const { mutateAsync: mutateDeleteAddress } = useDeleteAddress();
  const { mutateAsync: mutateAddPhoneNumber } = useAddPhoneNumber();
  const { mutateAsync: mutateUpdatePhoneNumber } = useUpdatePhoneNumber();
  const { mutateAsync: mutateSetDefaultPhone } = useSetDefaultPhoneNumber();
  const { mutateAsync: mutateDeletePhoneNumber } = useDeletePhoneNumber();
  const { mutateAsync: mutateApprovePhoneAction } = useApprovePhoneNumberAction();
  const { mutateAsync: mutateAddPaymentMethod } = useAddPaymentMethod();
  const { mutateAsync: mutateSetDefaultPayment } = useSetDefaultPaymentMethod();
  const { mutateAsync: mutateDeletePaymentMethod } = useDeletePaymentMethod();
  const { mutateAsync: mutateApproveSensitiveAction } = useApproveSensitiveAction();
  const { mutateAsync: mutateSaveBuyerAccountSettings } = useSaveBuyerAccountSettings();
  const { mutateAsync: mutateUploadBuyerAccountAvatar } = useUploadBuyerAccountAvatar();
  const { mutateAsync: mutateRemoveBuyerAccountAvatar } = useRemoveBuyerAccountAvatar();
  const { mutateAsync: mutateSaveBuyerAccountPreference } = useSaveBuyerAccountPreference();
  const { mutateAsync: mutateRequestBuyerEmailChange } = useRequestBuyerEmailChange();
  const { mutateAsync: mutateApproveBuyerEmailChange } = useApproveBuyerEmailChange();
  const { mutateAsync: mutateRequestBuyerPasswordChange } = useRequestBuyerPasswordChange();
  const { mutateAsync: mutateApproveBuyerPasswordChange } = useApproveBuyerPasswordChange();
  const { mutateAsync: mutateDeactivateBuyerAccount } = useDeactivateBuyerAccount();

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
  const safeCart = useMemo(() => asArray(activeCart).map(item => {
    const safeItem = asRecord(item);
    const product = asRecord(safeItem.product || safeItem.products);
    return {
      ...safeItem,
      name: safeItem.name || product.name || 'Cart item',
      price: asNumber(safeItem.price ?? product.price_minor),
      quantity: Math.max(asNumber(safeItem.quantity ?? safeItem.qty, 1), 1),
    };
  }), [activeCart]);
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

  const actions = useMemo(() => ({
    addToWishlist: product => product?.id && mutateAddToWishlist(product.id),
    removeFromWishlist: id => mutateRemoveFromWishlist(id),
    submitReview: (orderId, productId, rating, comment) =>
      mutateSubmitReview({ orderId, productId, rating, comment }),
    markAllNotifsRead: () => mutateMarkNotifsRead(),
    markNotifRead: id => mutateMarkNotifRead(id),
    dismissNotif: id => mutateDismissNotif(id),
    setWishlistAlert: variables => mutateSetWishlistAlert(variables),
    addAddress: address => mutateAddAddress(address),
    updateAddress: address => mutateUpdateAddress(address),
    setDefaultAddress: address => mutateSetDefaultAddress(address),
    deleteAddress: address => mutateDeleteAddress(address),
    addPhoneNumber: phone => mutateAddPhoneNumber(phone),
    updatePhoneNumber: phone => mutateUpdatePhoneNumber(phone),
    setDefaultPhoneNumber: phone => mutateSetDefaultPhone(phone),
    deletePhoneNumber: phone => mutateDeletePhoneNumber(phone),
    approvePhoneNumberAction: confirmation => mutateApprovePhoneAction(confirmation),
    addPaymentMethod: method => mutateAddPaymentMethod(method),
    setDefaultPaymentMethod: id => mutateSetDefaultPayment(id),
    deletePaymentMethod: id => mutateDeletePaymentMethod(id),
    approveSensitiveAction: confirmation => mutateApproveSensitiveAction(confirmation),
    saveAccountSettings: settings => mutateSaveBuyerAccountSettings(settings),
    uploadAccountAvatar: request => mutateUploadBuyerAccountAvatar(request),
    removeAccountAvatar: () => mutateRemoveBuyerAccountAvatar(),
    saveAccountPreference: preference => mutateSaveBuyerAccountPreference(preference),
    requestEmailChange: details => mutateRequestBuyerEmailChange(details),
    approveEmailChange: confirmation => mutateApproveBuyerEmailChange(confirmation),
    requestPasswordChange: details => mutateRequestBuyerPasswordChange(details),
    approvePasswordChange: confirmation => mutateApproveBuyerPasswordChange(confirmation),
    deactivateAccount: confirmation => mutateDeactivateBuyerAccount(confirmation),
  }), [
    mutateAddAddress,
    mutateAddPaymentMethod,
    mutateAddPhoneNumber,
    mutateAddToWishlist,
    mutateApproveBuyerEmailChange,
    mutateApproveBuyerPasswordChange,
    mutateApprovePhoneAction,
    mutateApproveSensitiveAction,
    mutateDeactivateBuyerAccount,
    mutateDeleteAddress,
    mutateDeletePaymentMethod,
    mutateDeletePhoneNumber,
    mutateDismissNotif,
    mutateMarkNotifRead,
    mutateMarkNotifsRead,
    mutateRemoveBuyerAccountAvatar,
    mutateRemoveFromWishlist,
    mutateRequestBuyerEmailChange,
    mutateRequestBuyerPasswordChange,
    mutateSaveBuyerAccountPreference,
    mutateSaveBuyerAccountSettings,
    mutateSetDefaultAddress,
    mutateSetDefaultPayment,
    mutateSetDefaultPhone,
    mutateSetWishlistAlert,
    mutateSubmitReview,
    mutateUpdateAddress,
    mutateUpdatePhoneNumber,
    mutateUploadBuyerAccountAvatar,
  ]);

  const value = useMemo(() => ({
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
    ...actions,
    wishlistAlerts,
    addressesLoading,
    addressesError,
    refreshAddresses,
    phoneNumbers,
    phoneNumbersLoading,
    phoneNumbersError,
    refreshPhoneNumbers,
    paymentsLoading,
    paymentsError,
    refreshPayments,
    reviewsLoading,
    reviewsError,
    refreshReviews,
    accountSettings,
    accountSettingsLoading,
    accountSettingsError,
    refreshAccountSettings,
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
    recommendationsLoading: isLoading || (catalogEnabled && productsLoading),
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
  }), [
    accountSettings,
    accountSettingsError,
    accountSettingsLoading,
    actions,
    addProductsToCart,
    addresses,
    addressesError,
    addressesLoading,
    aiCredits.balance,
    aiCredits.history,
    aiCredits.totalPurchased,
    aiCredits.totalUsed,
    buyCredits,
    cartTotal,
    catalogEnabled,
    collapsed,
    dashboardError,
    fundWallet,
    getReceipt,
    isFetching,
    isLoading,
    liveInsights,
    liveRecommendations,
    liveWishlist,
    notifs,
    orders,
    page,
    payments,
    paymentsError,
    paymentsLoading,
    phoneNumbers,
    phoneNumbersError,
    phoneNumbersLoading,
    productsLoading,
    profile,
    refetch,
    refreshAccountSettings,
    refreshAddresses,
    refreshPayments,
    refreshPhoneNumbers,
    refreshReorders,
    refreshReviews,
    refreshSpending,
    removeFromCart,
    reorders,
    reordersError,
    reordersLoading,
    reviews,
    reviewsError,
    reviewsLoading,
    safeCart,
    setCollapsed,
    setPage,
    setSidebarOpen,
    sidebarOpen,
    snapshot,
    spending,
    spendingError,
    spendingLoading,
    stats,
    toggleCollapsed,
    toggleSidebar,
    unreadCount,
    updateCartQty,
    wallet.balance,
    wallet.transactions,
    wishlistAlerts,
    withdrawWallet,
  ]);

  return <BuyerCtx.Provider value={value}>{children}</BuyerCtx.Provider>;
}

export function useBuyer() {
  const ctx = useContext(BuyerCtx);
  if (!ctx) throw new Error('useBuyer must be inside BuyerProvider');
  return ctx;
}
