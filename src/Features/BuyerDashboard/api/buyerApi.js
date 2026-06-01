/**
 * buyerApi.js — Supabase API layer for the Buyer Dashboard.
 * All functions are pure async, user-id aware, no mock fallback needed.
 */
import { supabase } from '../../../lib/supabaseClient';

const unwrap = async (request) => {
  const { data, error } = await request;
  if (error) throw error;
  return data;
};

export const buyerApi = {
  // ─── Dashboard Aggregation (BFF) ─────────────────────────────────────────────
  getDashboard: () => supabase.rpc('get_buyer_dashboard'),
  getOrders: ({ page = 1, pageSize = 10, status = 'all' } = {}) =>
    unwrap(supabase.rpc('get_buyer_orders', {
      p_page: page,
      p_page_size: pageSize,
      p_status: status,
    })),
  getReceipt: (orderId) =>
    unwrap(supabase.rpc('get_paid_order_receipt', { p_order_id: orderId })),
  getSpending: () => unwrap(supabase.rpc('get_buyer_spending')),
  getReorders: (limit = 3) =>
    unwrap(supabase.rpc('get_buyer_reorder_suggestions', { p_limit: limit })),
  getWishlistAlerts: (userId) =>
    unwrap(
      supabase
        .from('wishlist_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),
    ),

  // ─── Mutations ─────────────────────────────────────────────────────────────
  addToWishlist: (userId, productId) =>
    unwrap(supabase.from('wishlists').insert([{ user_id: userId, product_id: productId }])),

  removeFromWishlist: (productId) =>
    unwrap(supabase.from('wishlists').delete().eq('product_id', productId)),

  submitReview: (userId, orderId, productId, rating, reviewText) =>
    unwrap(supabase.from('product_reviews').upsert([
      { user_id: userId, order_id: orderId, product_id: productId, rating, review_text: reviewText },
    ])),

  markAllNotifsRead: (userId) =>
    unwrap(supabase
      .from('notifications')
      .update({ unread: false })
      .eq('user_id', userId)),
  markNotificationRead: (notificationId) =>
    unwrap(
      supabase
        .from('notifications')
        .update({ unread: false })
        .eq('id', notificationId),
    ),
  dismissNotification: (notificationId) =>
    unwrap(supabase.from('notifications').delete().eq('id', notificationId)),
  setWishlistAlert: ({ userId, productId, alertType, enabled, targetPriceMinor = null }) => (
    enabled
      ? unwrap(
          supabase
            .from('wishlist_alerts')
            .upsert([{
              user_id: userId,
              product_id: productId,
              alert_type: alertType,
              target_price_minor: targetPriceMinor,
              is_active: true,
              updated_at: new Date().toISOString(),
            }], { onConflict: 'user_id,product_id,alert_type' }),
        )
      : unwrap(
          supabase
            .from('wishlist_alerts')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('alert_type', alertType),
        )
  ),

  addAddress: (userId, addr) =>
    unwrap(supabase.from('addresses').insert([{
      user_id: userId,
      full_name: addr.name,
      line1: addr.line1,
      line2: addr.line2 || null,
      city: addr.city || 'Lagos',
      state: addr.state || 'Lagos',
      postal_code: addr.postalCode || '100001',
      phone: addr.phone,
      is_default_shipping: addr.isDefault || false,
    }])),

  deleteAddress: (id) =>
    unwrap(supabase.from('addresses').delete().eq('id', id)),
};
