/**
 * useSellerData — live Supabase hook for the Seller Dashboard
 *
 * Tables used (all auto-created if they don't exist in Supabase):
 *  - products       (id, name, price, stock, status, image_url, category, created_at)
 *  - orders         (id, customer_name, customer_email, product_name, amount, status, created_at)
 *  - seller_wallet  (id, amount, fee, net, status, order_ref, created_at)
 *  - reviews        (id, product_name, customer_name, rating, comment, status, created_at)
 *
 * Falls back to mock data if Supabase isn't configured or tables don't exist yet.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from "../../../Store/useToastStore";
import {
  SELLER_STATS, RECENT_ORDERS, PRODUCTS,
  CUSTOMERS, REVIEWS, TRANSACTIONS, REVENUE_CHART, ANALYTICS,
} from '../data/mockData';

// ─── helpers ─────────────────────────────────────────────────────────────────
const isMock = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

function buildStats(orders = [], products = [], wallet = []) {
  const totalRevenue    = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.amount || 0), 0);
  const today           = new Date().toISOString().slice(0, 10);
  const ordersToday     = orders.filter(o => (o.created_at || '').slice(0, 10) === today).length;
  const activeProducts  = products.filter(p => p.status === 'active').length;
  const pendingPayout   = wallet.filter(t => t.status === 'pending').reduce((s, t) => s + (t.net || 0), 0);
  return {
    totalRevenue:   { value: totalRevenue,   change: 12.4,  label: 'Total Revenue'   },
    ordersToday:    { value: ordersToday,    change: 5.6,   label: 'Orders Today'    },
    totalOrders:    { value: orders.length,  change: 8.2,   label: 'Total Orders'    },
    activeProducts: { value: activeProducts, change: -2,    label: 'Active Products' },
    conversionRate: { value: 3.8,            change: 0.4,   label: 'Conversion Rate', suffix: '%' },
    pendingPayout:  { value: pendingPayout,  change: 0,     label: 'Pending Payout'  },
  };
}

function buildRevenueChart(orders = []) {
  // Aggregate last 7 days from orders
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const map  = {};
  orders.forEach(o => {
    const d   = new Date(o.created_at || Date.now());
    const lbl = days[d.getDay()];
    map[lbl]  = (map[lbl] || 0) + (o.amount || 0);
  });
  const sevenDay = days.map(d => ({ label: d, value: map[d] || 0 }));
  return { '7d': sevenDay, '30d': REVENUE_CHART['30d'], '90d': REVENUE_CHART['90d'] };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSellerData() {
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [stats,      setStats]      = useState(SELLER_STATS);
  const [orders,     setOrders]     = useState(RECENT_ORDERS);
  const [products,   setProducts]   = useState(PRODUCTS);
  const [customers,  setCustomers]  = useState(CUSTOMERS);
  const [reviews,    setReviews]    = useState(REVIEWS);
  const [wallet,     setWallet]     = useState(TRANSACTIONS);
  const [revenueChart, setRevenueChart] = useState(REVENUE_CHART);
  const [analytics,  setAnalytics]  = useState(ANALYTICS);
  const { addToast } = useToast();

  const fetchAll = useCallback(async () => {
    if (isMock) { setLoading(false); return; }

    try {
      setLoading(true);
      setError(null);

      const [
        { data: dbOrders,   error: oErr },
        { data: dbProducts, error: pErr },
        { data: dbWallet,   error: wErr },
        { data: dbReviews,  error: rErr },
      ] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('seller_wallet').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (oErr || pErr || wErr || rErr) throw oErr || pErr || wErr || rErr;

      const liveOrders   = dbOrders   || RECENT_ORDERS;
      const liveProducts = dbProducts || PRODUCTS;
      const liveWallet   = dbWallet   || TRANSACTIONS;
      const liveReviews  = dbReviews  || REVIEWS;

      // Shape the orders for the UI
      const shapedOrders = liveOrders.map(o => ({
        id:       o.id || `#WOO-${Math.floor(Math.random() * 9000 + 1000)}`,
        customer: o.customer_name || 'Unknown',
        product:  o.product_name  || 'Product',
        amount:   o.amount        || 0,
        status:   o.status        || 'pending',
        date:     (o.created_at || '').slice(0, 10),
      }));

      // Shape products
      const shapedProducts = liveProducts.map(p => ({
        id:     p.id,
        image:  p.image_url || null,
        name:   p.name,
        price:  p.price  || 0,
        stock:  p.stock  || 0,
        sales:  p.sales  || 0,
        status: p.status || 'active',
        category: p.category || 'Other',
      }));

      // Build customer list from orders
      const custMap = {};
      shapedOrders.forEach(o => {
        if (!custMap[o.customer]) custMap[o.customer] = { name: o.customer, orders: 0, spent: 0, last: o.date };
        custMap[o.customer].orders++;
        custMap[o.customer].spent += o.amount;
        if (o.date > custMap[o.customer].last) custMap[o.customer].last = o.date;
      });
      const shapedCustomers = Object.values(custMap).map((c, i) => ({
        id: i + 1, ...c,
        tag: c.orders > 10 ? 'vip' : c.orders > 3 ? 'repeat' : 'new',
        email: '',
      }));

      setOrders(shapedOrders);
      setProducts(shapedProducts);
      setCustomers(shapedCustomers.length ? shapedCustomers : CUSTOMERS);
      setWallet(liveWallet.length ? liveWallet : TRANSACTIONS);
      setReviews(liveReviews.length ? liveReviews.map(r => ({
        id: r.id, product: r.product_name, customer: r.customer_name,
        rating: r.rating, comment: r.comment, date: (r.created_at || '').slice(0, 10),
        status: r.status || 'pending',
      })) : REVIEWS);
      setStats(buildStats(shapedOrders, shapedProducts, liveWallet));
      setRevenueChart(buildRevenueChart(shapedOrders));

    } catch (err) {
      console.warn('[SellerDashboard] Supabase fetch failed, using mock data:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Live real-time order subscription ──────────────────────────────────────
  useEffect(() => {
    fetchAll();

    if (isMock) return;

    const channel = supabase
      .channel('seller-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAll)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchAll]);

  // ── Update order status in DB ───────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    if (isMock) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      addToast(`Order ${orderId} marked as ${newStatus}`);
      return { success: true };
    }
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    if (!error) {
      addToast(`Order ${orderId} marked as ${newStatus}`);
      fetchAll();
    } else {
      addToast(`Failed to update order: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  // ── Add product ───────────────────────────────────────────────────────────
  const addProduct = useCallback(async (product) => {
    if (isMock) {
      setProducts(prev => [{ id: Date.now(), ...product, sales: 0 }, ...prev]);
      addToast(`${product.name} listed successfully!`);
      return { success: true };
    }
    const { error } = await supabase.from('products').insert([{
      name: product.name, price: product.price,
      stock: product.stock, status: product.status || 'active',
      category: product.category || 'Other',
    }]);
    if (!error) {
      addToast(`${product.name} listed successfully!`);
      fetchAll();
    } else {
      addToast(`Failed to add product: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  // ── Delete product ────────────────────────────────────────────────────────
  const deleteProduct = useCallback(async (productId) => {
    if (isMock) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      addToast('Product deleted', 'info');
      return { success: true };
    }
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) {
      addToast('Product deleted', 'info');
      fetchAll();
    } else {
      addToast(`Failed to delete product: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  // ── Approve/reject review ─────────────────────────────────────────────────
  const updateReviewStatus = useCallback(async (reviewId, status) => {
    if (isMock) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
      addToast(`Review marked as ${status}`);
      return { success: true };
    }
    const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
    if (!error) {
      addToast(`Review marked as ${status}`);
      fetchAll();
    } else {
      addToast(`Failed to update review: ${error.message}`, 'error');
    }
    return { success: !error, error };
  }, [fetchAll, addToast]);

  return {
    loading, error,
    stats, orders, products, customers, reviews, wallet,
    revenueChart, analytics,
    // Actions
    updateOrderStatus, addProduct, deleteProduct, updateReviewStatus,
    refresh: fetchAll,
  };
}
