import { supabase } from '../../../lib/supabaseClient';

export const sellerApi = {
  getDashboard: async (sellerId) => {
    // 1. Ensure profile exists (auto-heal)
    const { data: profExists } = await supabase
      .from('seller_profiles')
      .select('user_id')
      .eq('user_id', sellerId)
      .single();

    if (!profExists) {
      await supabase.from('seller_profiles').insert([{ user_id: sellerId }]);
    }

    // 2. Fetch full dashboard payload via RPC
    const { data, error } = await supabase.rpc('get_seller_dashboard', {
      p_seller_id: sellerId
    });

    if (error) throw error;
    return data;
  },

  updateOrderStatus: async (orderId, status) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateReviewStatus: async (reviewId, isVerified) => {
    const { data, error } = await supabase
      .from('product_reviews')
      .update({ is_verified: isVerified })
      .eq('id', reviewId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteProduct: async (productId) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    return true;
  },

  saveSettings: async (sellerId, settings) => {
    const { error } = await supabase
      .from('seller_profiles')
      .upsert({
        user_id: sellerId,
        store_name: settings.storeName,
        store_description: settings.storeDescription,
        business_email: settings.businessEmail,
        business_phone: settings.businessPhone,
        bank_name: settings.bankName,
        account_number: settings.accountNumber,
        account_name: settings.accountName,
        notif_new_orders: settings.notifNewOrders,
        notif_low_stock: settings.notifLowStock,
        notif_payouts: settings.notifPayouts,
        notif_reviews: settings.notifReviews
      });
    if (error) throw error;
    return true;
  },

  requestWithdrawal: async (sellerId, amountCents, feeCents, description) => {
    const { data, error } = await supabase
      .from('seller_wallet')
      .insert([{
        seller_id: sellerId,
        type: 'payout',
        amount_cents: -amountCents,
        fee_cents: feeCents,
        net_cents: -(amountCents - feeCents),
        status: 'pending',
        description: description
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  markNotificationsRead: async (sellerId) => {
    const { error } = await supabase
      .from('seller_notifications')
      .update({ unread: false })
      .eq('seller_id', sellerId);
    if (error) throw error;
    return true;
  }
};
