/**
 * useBuyerData — live Supabase hook for the Buyer Dashboard
 *
 * Tables used:
 *  - orders         (id, customer_email, product_name, amount, status, created_at, address, payment_method)
 *  - wishlist       (id, user_email, product_id, product_name, price, original_price, in_stock, image_url)
 *  - buyer_reviews  (id, user_email, order_id, product_name, rating, comment, submitted, created_at)
 *  - notifications  (id, user_email, type, title, sub, time, unread, created_at)
 *
 * Falls back to mock data when Supabase is not configured.
 * For a fully auth'd app, replace DEMO_USER_EMAIL with the logged-in user's email.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from '../../../Context/toast/ToastContext';
import {
  BUYER_PROFILE, BUYER_STATS, ORDER_STATUS_SNAPSHOT,
  BUYER_ORDERS, WISHLIST, RECOMMENDATIONS,
  SMART_INSIGHTS, ADDRESSES, PAYMENT_METHODS,
  BUYER_NOTIFICATIONS, SPENDING_DATA, BUYER_REVIEWS,
  REORDER_SUGGESTIONS,
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

  return {
    loading, error,
    profile, stats, snapshot, orders, wishlist,
    reviews, notifs, addresses, payments,
    spending, reorders, recommendations, insights,
    unreadCount,
    // Actions
    addToWishlist, removeFromWishlist, submitReview,
    markAllNotifsRead, addAddress,
    refresh: fetchAll,
  };
}
