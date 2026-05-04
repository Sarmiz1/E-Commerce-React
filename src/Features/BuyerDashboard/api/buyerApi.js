/**
 * buyerApi.js — Supabase API layer for the Buyer Dashboard.
 * All functions are pure async, user-id aware, no mock fallback needed.
 */
import { supabase } from '../../../lib/supabaseClient';

export const buyerApi = {
  // ─── Dashboard Aggregation (BFF) ─────────────────────────────────────────────
  getDashboard: async (userId) => {
    let res = await supabase.rpc('get_buyer_dashboard', { buyer_id: userId });
    
    // Auto-heal: If the user doesn't have a dashboard profile yet, create one!
    if (res.data && !res.data.profile) {
      // 1. Try to get name from master profiles table first
      const { data: masterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      let finalName = masterProfile?.full_name;

      // 2. Fallback to email handle if no master profile name
      if (!finalName) {
        const { data: { user } } = await supabase.auth.getUser();
        const emailName = user?.email ? user.email.split('@')[0] : 'Buyer';
        // Clean up handle (remove numbers, capitalize)
        finalName = emailName.replace(/[0-9]/g, ' ').trim().split(' ')[0];
        finalName = finalName.charAt(0).toUpperCase() + finalName.slice(1);
      }
      
      // Insert default dashboard profile
      await supabase.from('buyer_profiles').upsert({
        user_id: userId,
        full_name: finalName || 'Buyer',
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
