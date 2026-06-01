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

const AVATAR_EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Authentication required');
  return data.user;
}

async function reauthenticateBuyer(password) {
  if (!password) throw new Error('Enter your account password to continue');

  const user = await getAuthenticatedUser();
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (error) throw new Error('Account password is incorrect');
}

async function uploadBuyerAvatar(userId, file) {
  const extension = AVATAR_EXTENSION_BY_TYPE[file.type];
  if (!extension) throw new Error('Photo must be a JPG, PNG, or WEBP image');
  if (file.size > 2 * 1024 * 1024) throw new Error('Photo must be 2MB or smaller');

  const path = `${userId}/avatar.${extension}`;
  const { error } = await supabase.storage
    .from('profile-images')
    .upload(path, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

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
  getAddresses: () => unwrap(supabase.rpc('get_buyer_addresses')),
  getPhoneNumbers: () => unwrap(supabase.rpc('get_buyer_phone_numbers')),
  getPaymentMethods: () => unwrap(supabase.rpc('get_buyer_payment_methods')),
  getReviewItems: () => unwrap(supabase.rpc('get_buyer_review_items')),
  getAccountSettings: () => unwrap(supabase.rpc('get_buyer_account_settings')),
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

  submitReview: ({ orderId, productId, rating, reviewText }) =>
    unwrap(supabase.rpc('submit_buyer_review', {
      p_order_id: orderId,
      p_product_id: productId,
      p_rating: rating,
      p_review_text: reviewText,
    })),

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

  addAddress: (addr) => unwrap(supabase.rpc('add_buyer_address', {
    p_label: addr.label,
    p_full_name: addr.name,
    p_line1: addr.line1,
    p_line2: addr.line2 || null,
    p_city: addr.city,
    p_state: addr.state || null,
    p_postal_code: addr.postalCode || null,
    p_country: addr.country || 'NG',
    p_phone: null,
    p_make_default: addr.isDefault || false,
  })),
  setDefaultAddress: (id) =>
    unwrap(supabase.rpc('set_buyer_default_address', { p_address_id: id })),
  deleteAddress: (id) =>
    unwrap(supabase.rpc('delete_buyer_address', { p_address_id: id })),
  addPhoneNumber: async (phone) => {
    await reauthenticateBuyer(phone.password);
    return unwrap(supabase.rpc('add_buyer_phone_number', {
      p_phone_number: phone.phoneNumber,
      p_make_default: phone.isDefault || false,
    }));
  },
  updatePhoneNumber: async (phone) => {
    await reauthenticateBuyer(phone.password);
    return unwrap(supabase.rpc('update_buyer_phone_number', {
      p_phone_id: phone.id,
      p_phone_number: phone.phoneNumber,
    }));
  },
  setDefaultPhoneNumber: async ({ id, password }) => {
    await reauthenticateBuyer(password);
    return unwrap(supabase.rpc('set_buyer_default_phone_number', { p_phone_id: id }));
  },
  deletePhoneNumber: async ({ id, password }) => {
    await reauthenticateBuyer(password);
    return unwrap(supabase.rpc('delete_buyer_phone_number', { p_phone_id: id }));
  },
  addPaymentMethod: async (method) => {
    await reauthenticateBuyer(method.password);
    const last4 = method.cardNumber.replace(/\D/g, '').slice(-4);
    return unwrap(supabase.rpc('add_buyer_payment_method', {
      p_cardholder_name: method.cardholderName,
      p_brand: method.brand,
      p_last4: last4,
      p_expiry: method.expiry,
      p_type: 'card',
      p_make_default: method.isDefault || false,
    }));
  },
  setDefaultPaymentMethod: async ({ id, password }) => {
    await reauthenticateBuyer(password);
    return unwrap(supabase.rpc('set_buyer_default_payment_method', { p_method_id: id }));
  },
  deletePaymentMethod: async ({ id, password }) => {
    await reauthenticateBuyer(password);
    return unwrap(supabase.rpc('delete_buyer_payment_method', { p_method_id: id }));
  },
  saveAccountSettings: async (settings) => {
    const user = await getAuthenticatedUser();
    let avatarUrl = settings.avatarUrl || null;

    if (settings.password) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: settings.password.current,
      });
      if (reauthError) throw new Error('Current password is incorrect');

      const { error: passwordError } = await supabase.auth.updateUser({
        password: settings.password.next,
      });
      if (passwordError) throw passwordError;
    }

    if (settings.avatarFile) {
      avatarUrl = await uploadBuyerAvatar(user.id, settings.avatarFile);
    }

    const savedSettings = await unwrap(supabase.rpc('save_buyer_account_settings', {
      p_full_name: settings.fullName,
      p_avatar_url: avatarUrl,
      p_ai_suggestions: settings.preferences.aiSuggestions,
      p_price_drop_alerts: settings.preferences.priceDropAlerts,
      p_order_status_updates: settings.preferences.orderStatusUpdates,
      p_promotions_deals: settings.preferences.promotionsDeals,
    }));

    const normalizedEmail = settings.email.trim().toLowerCase();
    const emailChanged = normalizedEmail !== user.email?.toLowerCase();
    const authUpdate = {
      data: {
        full_name: settings.fullName,
        avatar_url: avatarUrl,
      },
    };
    if (emailChanged) authUpdate.email = normalizedEmail;

    const { error: authError } = await supabase.auth.updateUser(authUpdate);
    if (authError) throw authError;

    return { settings: savedSettings, emailChangeRequested: emailChanged };
  },
  deleteAccount: async ({ confirmation, password }) => {
    await reauthenticateBuyer(password);
    const result = await unwrap(supabase.rpc('delete_buyer_account', {
      p_confirmation: confirmation,
    }));
    await supabase.auth.signOut();
    return result;
  },
};
