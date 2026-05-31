/**
 * buyerApi.js — Supabase API layer for the Buyer Dashboard.
 * All functions are pure async, user-id aware, no mock fallback needed.
 */
import { supabase } from '../../../lib/supabaseClient';

export const buyerApi = {
  // ─── Dashboard Aggregation (BFF) ─────────────────────────────────────────────
  getDashboard: () => supabase.rpc('get_buyer_dashboard'),

  // ─── Mutations ─────────────────────────────────────────────────────────────
  addToWishlist: (userId, productId) =>
    supabase.from('wishlists').insert([{ user_id: userId, product_id: productId }]),

  removeFromWishlist: (productId) =>
    supabase.from('wishlists').delete().eq('product_id', productId),

  submitReview: (userId, orderId, productId, rating, reviewText) =>
    supabase.from('product_reviews').upsert([
      { user_id: userId, order_id: orderId, product_id: productId, rating, review_text: reviewText },
    ]),

  markAllNotifsRead: (userId) =>
    supabase
      .from('notifications')
      .update({ unread: false })
      .eq('user_id', userId),

  addAddress: (userId, addr) =>
    supabase.from('addresses').insert([{
      user_id: userId,
      full_name: addr.name,
      line1: addr.line1,
      line2: addr.line2 || null,
      city: addr.city || 'Lagos',
      state: addr.state || 'Lagos',
      postal_code: addr.postalCode || '100001',
      phone: addr.phone,
      is_default_shipping: addr.isDefault || false,
    }]),

  deleteAddress: (id) =>
    supabase.from('addresses').delete().eq('id', id),
};
