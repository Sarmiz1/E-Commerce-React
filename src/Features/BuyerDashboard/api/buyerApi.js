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

const invokeEdgeFunction = async (name, body) => {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return data;

  let message = data?.error || error.message;
  if (error.context) {
    try {
      const details = await error.context.json();
      message = details?.error || message;
    } catch {
      // Keep the Edge Function error when its response body is not JSON.
    }
  }

  throw new Error(message);
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

const requestBuyerSensitiveAction = ({
  resourceType,
  actionType,
  resourceId = null,
  payload = {},
  password,
}) => invokeEdgeFunction('buyer-account-confirmation', {
  resourceType,
  actionType,
  resourceId,
  payload,
  password,
});

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

  addAddress: (addr) => requestBuyerSensitiveAction({
    resourceType: 'address',
    actionType: 'add',
    password: addr.password,
    payload: {
      label: addr.label,
      fullName: addr.name,
      line1: addr.line1,
      line2: addr.line2 || null,
      city: addr.city,
      state: addr.state || null,
      postalCode: addr.postalCode || null,
      country: addr.country || 'NG',
      makeDefault: addr.isDefault || false,
    },
  }),
  updateAddress: (addr) => requestBuyerSensitiveAction({
    resourceType: 'address',
    actionType: 'update',
    resourceId: addr.id,
    password: addr.password,
    payload: {
      label: addr.label,
      fullName: addr.name,
      line1: addr.line1,
      line2: addr.line2 || null,
      city: addr.city,
      state: addr.state || null,
      postalCode: addr.postalCode || null,
      country: addr.country || 'NG',
    },
  }),
  setDefaultAddress: ({ id, password }) => requestBuyerSensitiveAction({
    resourceType: 'address',
    actionType: 'set_default',
    resourceId: id,
    password,
  }),
  deleteAddress: ({ id, password }) => requestBuyerSensitiveAction({
    resourceType: 'address',
    actionType: 'delete',
    resourceId: id,
    password,
  }),
  addPhoneNumber: (phone) => invokeEdgeFunction('buyer-phone-confirmation', {
    actionType: 'add',
    countryCode: phone.countryCode,
    phoneNumber: phone.phoneNumber,
    password: phone.password,
    isDefault: phone.isDefault || false,
  }),
  updatePhoneNumber: (phone) => invokeEdgeFunction('buyer-phone-confirmation', {
    actionType: 'update',
    phoneId: phone.id,
    countryCode: phone.countryCode,
    phoneNumber: phone.phoneNumber,
    password: phone.password,
  }),
  setDefaultPhoneNumber: ({ id, password }) => requestBuyerSensitiveAction({
    resourceType: 'phone',
    actionType: 'set_default',
    resourceId: id,
    password,
  }),
  deletePhoneNumber: ({ id, password }) =>
    invokeEdgeFunction('buyer-phone-confirmation', {
      actionType: 'delete',
      phoneId: id,
      password,
    }),
  approvePhoneNumberAction: async ({ requestId, confirmationCode }) => {
    const result = await unwrap(supabase.rpc('approve_buyer_phone_number_action', {
      p_request_id: requestId,
      p_confirmation_code: confirmationCode,
    }));
    if (!result?.success) {
      throw new Error(result?.error || 'Unable to confirm the phone-number change');
    }
    return result.phoneNumbers;
  },
  approveSensitiveAction: async ({ requestId, confirmationCode }) => {
    const result = await unwrap(supabase.rpc('approve_buyer_sensitive_action', {
      p_request_id: requestId,
      p_confirmation_code: confirmationCode,
    }));
    if (!result?.success) {
      throw new Error(result?.error || 'Unable to confirm the secured account change');
    }
    if (result.resourceType === 'account' && result.actionType === 'delete') {
      await supabase.auth.signOut();
    }
    return result;
  },
  addPaymentMethod: (method) => requestBuyerSensitiveAction({
    resourceType: 'payment',
    actionType: 'add',
    password: method.password,
    payload: {
      cardholderName: method.cardholderName,
      brand: method.brand,
      last4: method.cardNumber.replace(/\D/g, '').slice(-4),
      expiry: method.expiry,
      makeDefault: method.isDefault || false,
    },
  }),
  setDefaultPaymentMethod: ({ id, password }) => requestBuyerSensitiveAction({
    resourceType: 'payment',
    actionType: 'set_default',
    resourceId: id,
    password,
  }),
  deletePaymentMethod: ({ id, password }) => requestBuyerSensitiveAction({
    resourceType: 'payment',
    actionType: 'delete',
    resourceId: id,
    password,
  }),
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
  deleteAccount: ({ confirmation, password }) => requestBuyerSensitiveAction({
    resourceType: 'account',
    actionType: 'delete',
    password,
    payload: { confirmation },
  }),
};
