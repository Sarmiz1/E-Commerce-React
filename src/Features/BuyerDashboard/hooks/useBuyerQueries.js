/**
 * useBuyerQueries.js — TanStack Query hooks for Buyer Dashboard server state.
 * Uses the BFF RPC pattern for unified data fetching.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../Store/useAuthStore';
import { useToast } from '../../../Store/useToastStore';
import { buyerApi } from '../api/buyerApi';

// ── Query key factory ─────────────────────────────────────────────────────────
export const buyerKeys = {
  dashboard: (userId) => ['buyer', 'dashboard', userId],
  orders: (userId, page, status, pageSize) => ['buyer', 'orders', userId, page, status, pageSize],
  spending: (userId) => ['buyer', 'spending', userId],
  reorders: (userId) => ['buyer', 'reorders', userId],
  addresses: (userId) => ['buyer', 'addresses', userId],
  phoneNumbers: (userId) => ['buyer', 'phone-numbers', userId],
  paymentMethods: (userId) => ['buyer', 'payment-methods', userId],
  reviews: (userId) => ['buyer', 'reviews', userId],
  accountSettings: (userId) => ['buyer', 'account-settings', userId],
  wishlistAlerts: (userId) => ['buyer', 'wishlist-alerts', userId],
};

const QUERY_DEFAULTS = {
  staleTime: 30_000,
  retry: false,
  networkMode: 'offlineFirst',
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED DASHBOARD HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function useBuyerDashboard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.dashboard(user?.id),
    queryFn: async () => {
      const { data, error } = await buyerApi.getDashboard();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerOrders(page, status = 'all', pageSize = 10) {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.orders(user?.id, page, status, pageSize),
    queryFn: () => buyerApi.getOrders({ page, pageSize, status }),
    enabled: !!user?.id,
    placeholderData: (previousData) => previousData,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerSpending() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.spending(user?.id),
    queryFn: () => buyerApi.getSpending(),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerReorders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.reorders(user?.id),
    queryFn: () => buyerApi.getReorders(),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerAddresses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.addresses(user?.id),
    queryFn: () => buyerApi.getAddresses(),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerPaymentMethods() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.paymentMethods(user?.id),
    queryFn: () => buyerApi.getPaymentMethods(),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerPhoneNumbers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.phoneNumbers(user?.id),
    queryFn: () => buyerApi.getPhoneNumbers(),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerReviews() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.reviews(user?.id),
    queryFn: () => buyerApi.getReviewItems(),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useBuyerAccountSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.accountSettings(user?.id),
    queryFn: () => buyerApi.getAccountSettings(),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

export function useWishlistAlerts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: buyerKeys.wishlistAlerts(user?.id),
    queryFn: () => buyerApi.getWishlistAlerts(user.id),
    enabled: !!user?.id,
    ...QUERY_DEFAULTS,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS (Invalidate dashboard on success)
// ─────────────────────────────────────────────────────────────────────────────
export function useRemoveFromWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id) => buyerApi.removeFromWishlist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: ["wishlist", user?.id || "guest"] });
      addToast('Removed from wishlist', 'info');
    },
    onError: (err) => addToast(err.message || 'Failed to remove item', 'error'),
  });
}

export function useAddToWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (productId) => buyerApi.addToWishlist(user.id, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: ["wishlist", user?.id || "guest"] });
      addToast('Added to wishlist!');
    },
    onError: (err) => addToast(err.message || 'Failed to add to wishlist', 'error'),
  });
}

export function useSubmitReview() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: ({ orderId, productId, rating, comment }) =>
      buyerApi.submitReview({ orderId, productId, rating, reviewText: comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.reviews(user?.id) });
      addToast('Review submitted!');
    },
    onError: (err) => addToast(err.message || 'Failed to submit review', 'error'),
  });
}

export function useMarkNotifsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => buyerApi.markAllNotifsRead(user.id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) }),
  });
}

export function useMarkNotifRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => buyerApi.markNotificationRead(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) }),
  });
}

export function useDismissNotif() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => buyerApi.dismissNotification(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) }),
  });
}

export function useSetWishlistAlert() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: ({ productId, alertType, enabled, targetPriceMinor }) =>
      buyerApi.setWishlistAlert({
        userId: user.id,
        productId,
        alertType,
        enabled,
        targetPriceMinor,
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: buyerKeys.wishlistAlerts(user?.id) });
      addToast(
        variables.enabled ? 'Product alert enabled.' : 'Product alert disabled.',
        'info',
      );
    },
    onError: (err) => addToast(err.message || 'Failed to update alert', 'error'),
  });
}

export function useAddAddress() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (addr) => buyerApi.addAddress(addr),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to save address', 'error'),
  });
}

export function useUpdateAddress() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (addr) => buyerApi.updateAddress(addr),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to update address', 'error'),
  });
}

export function useDeleteAddress() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (address) => buyerApi.deleteAddress(address),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to remove address', 'error'),
  });
}

export function useSetDefaultAddress() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (address) => buyerApi.setDefaultAddress(address),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to update default address', 'error'),
  });
}

export function useAddPhoneNumber() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (phone) => buyerApi.addPhoneNumber(phone),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to save phone number', 'error'),
  });
}

export function useUpdatePhoneNumber() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (phone) => buyerApi.updatePhoneNumber(phone),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to update phone number', 'error'),
  });
}

export function useSetDefaultPhoneNumber() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (phone) => buyerApi.setDefaultPhoneNumber(phone),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to update phone number', 'error'),
  });
}

export function useDeletePhoneNumber() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (phone) => buyerApi.deletePhoneNumber(phone),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to remove phone number', 'error'),
  });
}

export function useApprovePhoneNumberAction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (confirmation) => buyerApi.approvePhoneNumberAction(confirmation),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.phoneNumbers(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.accountSettings(user?.id) });
      addToast('Phone-number change confirmed.');
    },
    onError: (err) => addToast(err.message || 'Failed to confirm phone-number change', 'error'),
  });
}

export function useAddPaymentMethod() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (method) => buyerApi.addPaymentMethod(method),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to save payment method', 'error'),
  });
}

export function useSetDefaultPaymentMethod() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (method) => buyerApi.setDefaultPaymentMethod(method),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to update payment method', 'error'),
  });
}

export function useDeletePaymentMethod() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (method) => buyerApi.deletePaymentMethod(method),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to remove payment method', 'error'),
  });
}

export function useApproveSensitiveAction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (confirmation) => buyerApi.approveSensitiveAction(confirmation),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.addresses(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.phoneNumbers(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.paymentMethods(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.accountSettings(user?.id) });
      if (result.resourceType !== 'account') {
        addToast('Secured account change confirmed.');
      }
    },
    onError: (err) => addToast(err.message || 'Failed to confirm secured account change', 'error'),
  });
}

export function useSaveBuyerAccountSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (settings) => buyerApi.saveAccountSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.accountSettings(user?.id) });
      addToast('Account settings saved.');
    },
    onError: (err) => addToast(err.message || 'Failed to save account settings', 'error'),
  });
}

function patchAvatarUrl(data, avatarUrl) {
  if (!data) return data;

  return {
    ...data,
    profile: {
      ...(data.profile || {}),
      avatar_url: avatarUrl,
    },
  };
}

export function useUploadBuyerAccountAvatar() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (request) => buyerApi.uploadAccountAvatar(request),
    onSuccess: ({ avatarUrl }) => {
      qc.setQueryData(
        buyerKeys.accountSettings(user?.id),
        (settings) => patchAvatarUrl(settings, avatarUrl),
      );
      qc.setQueryData(
        buyerKeys.dashboard(user?.id),
        (dashboard) => patchAvatarUrl(dashboard, avatarUrl),
      );
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.accountSettings(user?.id) });
      addToast('Profile photo updated.');
    },
    onError: (err) => addToast(err.message || 'Failed to upload profile photo', 'error'),
  });
}

export function useRemoveBuyerAccountAvatar() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: () => buyerApi.removeAccountAvatar(),
    onSuccess: () => {
      qc.setQueryData(
        buyerKeys.accountSettings(user?.id),
        (settings) => patchAvatarUrl(settings, ''),
      );
      qc.setQueryData(
        buyerKeys.dashboard(user?.id),
        (dashboard) => patchAvatarUrl(dashboard, ''),
      );
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.accountSettings(user?.id) });
      addToast('Profile photo removed.', 'info');
    },
    onError: (err) => addToast(err.message || 'Failed to remove profile photo', 'error'),
  });
}

export function useSaveBuyerAccountPreference() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (preference) => buyerApi.saveAccountPreference(preference),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.accountSettings(user?.id) });
      addToast('Preference updated.');
    },
    onError: (err) => addToast(err.message || 'Failed to update preference', 'error'),
  });
}

export function useRequestBuyerEmailChange() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (details) => buyerApi.requestEmailChange(details),
    onSuccess: () => {
      addToast('Confirmation code sent to your current account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to start email change', 'error'),
  });
}

export function useApproveBuyerEmailChange() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (confirmation) => buyerApi.approveEmailChange(confirmation),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      qc.invalidateQueries({ queryKey: buyerKeys.accountSettings(user?.id) });
      addToast('Identity confirmed. Check your new email address to finish the change.');
    },
    onError: (err) => addToast(err.message || 'Failed to confirm email change', 'error'),
  });
}

export function useRequestBuyerPasswordChange() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (details) => buyerApi.requestPasswordChange(details),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to start password change', 'error'),
  });
}

export function useApproveBuyerPasswordChange() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (confirmation) => buyerApi.approvePasswordChange(confirmation),
    onSuccess: () => {
      addToast('Password updated.');
    },
    onError: (err) => addToast(err.message || 'Failed to confirm password change', 'error'),
  });
}

export function useDeactivateBuyerAccount() {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (confirmation) => buyerApi.deactivateAccount(confirmation),
    onSuccess: () => {
      addToast('Confirmation code sent to your account email.');
    },
    onError: (err) => addToast(err.message || 'Failed to deactivate account', 'error'),
  });
}
