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
      const { data, error } = await buyerApi.getDashboard(user.id);
      if (error) throw error;
      return data;
    },
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
      buyerApi.submitReview(user.id, orderId, productId, rating, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
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

export function useAddAddress() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (addr) => buyerApi.addAddress(user.id, addr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      addToast('Address saved!');
    },
    onError: (err) => addToast(err.message || 'Failed to save address', 'error'),
  });
}

export function useDeleteAddress() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id) => buyerApi.deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerKeys.dashboard(user?.id) });
      addToast('Address removed', 'info');
    },
    onError: (err) => addToast(err.message || 'Failed to remove address', 'error'),
  });
}
