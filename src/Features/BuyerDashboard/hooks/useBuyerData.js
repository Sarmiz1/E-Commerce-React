/**
 * @deprecated
 * useBuyerData.js is no longer used.
 *
 * Migration complete:
 *   - UI state  → src/Features/BuyerDashboard/store/useBuyerUIStore.js  (Zustand)
 *   - API layer → src/Features/BuyerDashboard/api/buyerApi.js            (pure Supabase)
 *   - Queries   → src/Features/BuyerDashboard/hooks/useBuyerQueries.js   (TanStack Query)
 *   - Context   → src/Features/BuyerDashboard/context/BuyerContext.jsx   (thin bridge)
 *
 * This file is kept as a reference only. Do not import from it.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from "../../../store/useToastStore";
import {
  BUYER_PROFILE, BUYER_STATS, ORDER_STATUS_SNAPSHOT,
  BUYER_ORDERS, WISHLIST, RECOMMENDATIONS,
  SMART_INSIGHTS, ADDRESSES, PAYMENT_METHODS,
  BUYER_NOTIFICATIONS, SPENDING_DATA, BUYER_REVIEWS,
  REORDER_SUGGESTIONS, WALLET_DATA, AI_CREDITS_DATA, CART_ITEMS,
} from '../data/buyerData';

const isMock = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

// In a real auth flow this comes from the session user
const DEMO_USER_EMAIL = BUYER_PROFILE.email;

function buildStats(orders = [], wishlistCount = 0) {
  const delivered  = orders.filter(o => o.status === 'delivered').length;
  const pending    = orders.filter(o => o.status === 'pending').length;
  const shipped    = orders.filter(o => o.status === 'shipped' || o.status === 'in_transit').length;
  const cancelled  = orders.filter(o => o.status === 'cancelled').length;
  const totalSpent = orders.reduce((s, o) => s + (o.amount || 0), 0);
  return {
    stats: {
      totalOrders:   orders.length,
      wishlistItems: wishlistCount,
      rewardPoints:  Math.min(Math.round(totalSpent / 100), 9999),
      savedAmount:   Math.round(totalSpent * 0.05),
    },
    snapshot: { pending, shipped, delivered, cancelled },
  };
}

function shapeOrder(o) {
  return {
    id:          o.id,
    product:     o.product_name || 'Product',
    image:       o.image_url    || null,
    amount:      o.amount       || 0,
    status:      o.status       || 'pending',
    date:        (o.created_at  || '').slice(0, 10),
    eta:         o.eta          || null,
    address:     o.address      || '',
    payment:     o.payment_method || 'Paystack',
    items:       o.items        ? JSON.parse(o.items) : [{ name: o.product_name, qty: 1, price: o.amount }],
    timeline:    o.timeline     ? JSON.parse(o.timeline) : ['ordered', 'confirmed'],
    currentStep: o.current_step ?? 1,
  };
}

export function useBuyerData() {
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [profile,     setProfile]     = useState(BUYER_PROFILE);
  const [stats,       setStats]       = useState(BUYER_STATS);
  const [snapshot,    setSnapshot]    = useState(ORDER_STATUS_SNAPSHOT);
  const [orders,      setOrders]      = useState(BUYER_ORDERS);
  const [wishlist,    setWishlist]    = useState(WISHLIST);
  const [reviews,     setReviews]     = useState(BUYER_REVIEWS);
  const [notifs,      setNotifs]      = useState(BUYER_NOTIFICATIONS);
  const [addresses,   setAddresses]   = useState(ADDRESSES);
  const [payments,    setPayments]    = useState(PAYMENT_METHODS);
  const [spending,    setSpending]    = useState(SPENDING_DATA);
  const [reorders,    setReorders]    = useState(REORDER_SUGGESTIONS);
  const [recommendations] = useState(RECOMMENDATIONS);
  const [insights]        = useState(SMART_INSIGHTS);
  const [unreadCount, setUnreadCount] = useState(3);

  // ── Wallet state ──
  const [walletBalance, setWalletBalance] = useState(WALLET_DATA.balance);
  const [walletTransactions, setWalletTransactions] = useState(WALLET_DATA.transactions);

  // ── AI Credits state ──
  const [aiCredits, setAiCredits] = useState(AI_CREDITS_DATA.balance);
  const [creditHistory, setCreditHistory] = useState(AI_CREDITS_DATA.history);
  const [totalCreditsPurchased, setTotalCreditsPurchased] = useState(AI_CREDITS_DATA.totalPurchased);
  const [totalCreditsUsed] = useState(AI_CREDITS_DATA.totalUsed);

  // ── Cart state ──
  const [cart, setCart] = useState(CART_ITEMS);

  const { addToast } = useToast();

  const fetchAll = useCallback(async () => {
    if (isMock) { setLoading(false); return; }

    try {
      setLoading(true);
      setError(null);

      const [
        { data: dbOrders,    error: oErr  },
        { data: dbWishlist,  error: wErr  },
        { data: dbReviews,   error: rErr  },
        { data: dbNotifs,    error: nErr  },
        { data: dbAddresses, error: aErr  },
      ] = await Promise.all([
        supabase.from('orders').select('*').eq('customer_email', DEMO_USER_EMAIL).order('created_at', { ascending: false }),
        supabase.from('wishlist').select('*').eq('user_email', DEMO_USER_EMAIL),
        supabase.from('buyer_reviews').select('*').eq('user_email', DEMO_USER_EMAIL).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_email', DEMO_USER_EMAIL).order('created_at', { ascending: false }).limit(20),
        supabase.from('buyer_addresses').select('*').eq('user_email', DEMO_USER_EMAIL),
      ]);

      if (oErr && oErr.code !== 'PGRST116') throw oErr;

      const liveOrders    = (dbOrders    || []).length ? dbOrders.map(shapeOrder) : BUYER_ORDERS;
      const liveWishlist  = (dbWishlist  || []).length ? dbWishlist : WISHLIST;
      const liveReviews   = (dbReviews   || []).length ? dbReviews.map(r => ({
        id: r.id, orderId: r.order_id, product: r.product_name,
        submitted: r.submitted, rating: r.rating, comment: r.comment || '',
      })) : BUYER_REVIEWS;
      const liveNotifs    = (dbNotifs    || []).length ? dbNotifs : BUYER_NOTIFICATIONS;
      const liveAddresses = (dbAddresses || []).length ? dbAddresses.map(a => ({
        id: a.id, label: a.label, name: a.full_name, line1: a.line1,
        line2: a.line2, phone: a.phone, isDefault: a.is_default,
      })) : ADDRESSES;

      setOrders(liveOrders);
      setWishlist(liveWishlist);
      setReviews(liveReviews);
      setAddresses(liveAddresses);
      setNotifs(liveNotifs);
      setUnreadCount((liveNotifs.filter(n => n.unread)).length);

      const { stats: s, snapshot: sn } = buildStats(liveOrders, liveWishlist.length);
      setStats(s);
      setSnapshot(sn);

      // Spending breakdown from live orders
      const catMap = {};
      liveOrders.forEach(o => {
        const cat = o.category || 'Others';
        catMap[cat] = (catMap[cat] || 0) + (o.amount || 0);
      });
      const total = Object.values(catMap).reduce((a, v) => a + v, 0) || 1;
      const cats  = Object.entries(catMap).map(([label, spend]) => ({
        label, spend, pct: Math.round((spend / total) * 100),
      }));
      if (cats.length) setSpending(prev => ({ ...prev, categories: cats }));

    } catch (err) {
      console.warn('[BuyerDashboard] Supabase fetch failed, using mock data:', err?.message);
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Live subscriptions ───────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();

    if (isMock) return;

    const ordersCh = supabase
      .channel('buyer-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAll)
      .subscribe();

    const notifCh = supabase
      .channel('buyer-notifs-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_email=eq.${DEMO_USER_EMAIL}` }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersCh);
      supabase.removeChannel(notifCh);
    };
  }, [fetchAll]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const addToWishlist = useCallback(async (product) => {
    if (isMock) {
      setWishlist(prev => [{ id: Date.now(), ...product, inStock: true, priceAlert: false }, ...prev]);
      addToast(`${product.name} added to wishlist!`);
      return { success: true };
    }
    const { error } = await supabase.from('wishlist').insert([{
      user_email: DEMO_USER_EMAIL, product_name: product.name,
      price: product.price, in_stock: true,
    }]);
    if (!error) {
      addToast(`${product.name} added to wishlist!`);
      fetchAll();
    } else {
      addToast(`Failed to add to wishlist: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  const removeFromWishlist = useCallback(async (id) => {
    if (isMock) {
      setWishlist(prev => prev.filter(w => w.id !== id));
      addToast('Removed from wishlist', 'info');
      return { success: true };
    }
    const { error } = await supabase.from('wishlist').delete().eq('id', id);
    if (!error) {
      addToast('Removed from wishlist', 'info');
      fetchAll();
    } else {
      addToast(`Failed to remove item: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  const submitReview = useCallback(async (orderId, productName, rating, comment) => {
    if (isMock) {
      setReviews(prev => prev.map(r =>
        r.orderId === orderId ? { ...r, submitted: true, rating, comment } : r
      ));
      addToast(`Review submitted for ${productName}!`);
      return { success: true };
    }
    const { error } = await supabase.from('buyer_reviews').upsert([{
      user_email: DEMO_USER_EMAIL, order_id: orderId, product_name: productName,
      rating, comment, submitted: true,
    }]);
    if (!error) {
      addToast(`Review submitted for ${productName}!`);
      fetchAll();
    } else {
      addToast(`Failed to submit review: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  const markAllNotifsRead = useCallback(async () => {
    if (isMock) {
      setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
      return;
    }
    const { error } = await supabase.from('notifications').update({ unread: false }).eq('user_email', DEMO_USER_EMAIL);
    if (error) {
      addToast(`Failed to update notifications: ${error.message}`, 'error');
    } else {
      fetchAll();
    }
  }, [fetchAll, addToast]);

  const addAddress = useCallback(async (addr) => {
    if (isMock) {
      setAddresses(prev => [{ id: Date.now(), ...addr, isDefault: !prev.length }, ...prev]);
      addToast('Address added successfully!');
      return { success: true };
    }
    const { error } = await supabase.from('buyer_addresses').insert([{
      user_email: DEMO_USER_EMAIL, label: addr.label,
      full_name: addr.name, line1: addr.line1, line2: addr.line2,
      phone: addr.phone, is_default: addr.isDefault || false,
    }]);
    if (!error) {
      addToast('Address added successfully!');
      fetchAll();
    } else {
      addToast(`Failed to add address: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  // ── Wallet actions ──
  const fundWallet = useCallback(async (amount) => {
    await new Promise(r => setTimeout(r, 1200));
    const txn = {
      id: `TXN-${Date.now().toString(36).toUpperCase()}`,
      type: 'fund', amount, date: new Date().toISOString().slice(0, 10),
      desc: 'Wallet Top-up', status: 'completed',
    };
    setWalletBalance(prev => prev + amount);
    setWalletTransactions(prev => [txn, ...prev]);
    addToast(`₦${amount.toLocaleString()} added to wallet!`);
    return { success: true };
  }, [addToast]);

  const withdrawWallet = useCallback(async (amount, password) => {
    if (!password || password.length < 6) return { success: false, error: 'Invalid password' };
    await new Promise(r => setTimeout(r, 1800));
    const fee = Math.round(amount * 0.10);
    const net = amount - fee;
    if (amount > walletBalance) return { success: false, error: 'Insufficient balance' };
    const txn = {
      id: `TXN-${Date.now().toString(36).toUpperCase()}`,
      type: 'withdraw', amount: -amount, fee,
      date: new Date().toISOString().slice(0, 10),
      desc: `Bank Withdrawal (10% fee: ₦${fee.toLocaleString()})`, status: 'completed',
    };
    setWalletBalance(prev => prev - amount);
    setWalletTransactions(prev => [txn, ...prev]);
    addToast(`₦${net.toLocaleString()} sent to your bank!`);
    return { success: true, fee, net };
  }, [walletBalance, addToast]);

  // ── AI Credits actions ──
  const buyCredits = useCallback(async (tier) => {
    if (tier.price > walletBalance) {
      addToast('Insufficient wallet balance. Fund your wallet first.', 'error');
      return { success: false, error: 'Insufficient balance' };
    }
    await new Promise(r => setTimeout(r, 1200));
    setWalletBalance(prev => prev - tier.price);
    setAiCredits(prev => prev + tier.credits);
    setTotalCreditsPurchased(prev => prev + tier.credits);
    const txn = {
      id: `TXN-${Date.now().toString(36).toUpperCase()}`,
      type: 'credit', amount: -tier.price,
      date: new Date().toISOString().slice(0, 10),
      desc: `AI Power-Up: ${tier.name} Pack`, status: 'completed',
    };
    setWalletTransactions(prev => [txn, ...prev]);
    addToast(`${tier.credits} AI credits added! You now have ${aiCredits + tier.credits} credits.`);
    return { success: true };
  }, [walletBalance, aiCredits, addToast]);

  // ── Cart actions ──
  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    addToast('Item removed from cart', 'info');
  }, [addToast]);

  const updateCartQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return {
    loading, error,
    profile, stats, snapshot, orders, wishlist,
    reviews, notifs, addresses, payments,
    spending, reorders, recommendations, insights,
    unreadCount,
    // Wallet
    walletBalance, walletTransactions, fundWallet, withdrawWallet,
    // AI Credits
    aiCredits, creditHistory, totalCreditsPurchased, totalCreditsUsed, buyCredits,
    // Cart
    cart, cartTotal, removeFromCart, updateCartQty,
    // Actions
    addToWishlist, removeFromWishlist, submitReview,
    markAllNotifsRead, addAddress,
    refresh: fetchAll,
  };
}
