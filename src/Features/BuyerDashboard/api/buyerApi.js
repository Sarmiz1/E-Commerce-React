/**
 * buyerApi.js — Supabase API layer for the Buyer Dashboard.
 * All functions are pure async, user-id aware, no mock fallback needed.
 */
import { supabase } from '../../../lib/supabaseClient';

export const buyerApi = {
  // ─── Dashboard Aggregation (BFF) ─────────────────────────────────────────────
  getDashboard: async (userId) => {
    let res = await supabase.rpc('get_buyer_dashboard', { buyer_id: userId });
    
    // Auto-heal: If the user doesn't have a profile yet, create one!
    if (res.data && !res.data.profile) {
      const { data: { user } } = await supabase.auth.getUser();
      const emailName = user?.email ? user.email.split('@')[0] : 'Buyer';
      const capitalized = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      
      // Insert default profile
      await supabase.from('buyer_profiles').upsert({
        user_id: userId,
        full_name: capitalized,
        reward_points: 2840
      });
      
      // Insert starter wallet balance & AI credits
      await supabase.from('wallet_ledger').insert({
        user_id: userId, type: 'fund', amount: 150000, description: 'Welcome Bonus'
      });
      await supabase.from('ai_credits_ledger').insert({
        user_id: userId, type: 'grant', amount: 500, description: 'Welcome Bonus'
      });
      
      // Refetch the complete dashboard data
      res = await supabase.rpc('get_buyer_dashboard', { buyer_id: userId });
    }
    
    return res;
  },

  // ─── Mutations ─────────────────────────────────────────────────────────────
  addToWishlist: (userId, productId) =>
    supabase.from('wishlist').insert([{ user_id: userId, product_id: productId }]),

  removeFromWishlist: (id) =>
    supabase.from('wishlist').delete().eq('id', id),

  submitReview: (userId, orderId, productId, rating, comment) =>
    supabase.from('reviews').upsert([
      { user_id: userId, order_id: orderId, product_id: productId, rating, comment },
    ]),

  markAllNotifsRead: (userId) =>
    supabase
      .from('notifications')
      .update({ unread: false })
      .eq('user_id', userId),

  addAddress: (userId, addr) =>
    supabase.from('buyer_addresses').insert([{
      user_id: userId,
      label: addr.label,
      full_name: addr.name,
      line1: addr.line1,
      line2: addr.line2 || null,
      phone: addr.phone,
      is_default: addr.isDefault || false,
    }]),

  deleteAddress: (id) =>
    supabase.from('buyer_addresses').delete().eq('id', id),
};
