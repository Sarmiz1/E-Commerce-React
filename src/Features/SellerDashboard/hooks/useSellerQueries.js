import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '../api/sellerApi';
import { useAuthStore } from '../../../Store/useAuthStore';
import { useToast } from '../../../Store/useToastStore';

export function useSellerDashboard() {
  const { user, isMock } = useAuthStore();
  const sellerId = user?.id;

  return useQuery({
    queryKey: ['seller-dashboard', sellerId],
    queryFn: () => sellerApi.getDashboard(sellerId),
    enabled: !!sellerId && !isMock,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, status }) => sellerApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-dashboard', user?.id]);
      addToast('Order status updated successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to update order: ${err.message}`, 'error');
    }
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ reviewId, isVerified }) => sellerApi.updateReviewStatus(reviewId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-dashboard', user?.id]);
      addToast('Review updated successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to update review: ${err.message}`, 'error');
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (productId) => sellerApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-dashboard', user?.id]);
      addToast('Product deleted successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to delete product: ${err.message}`, 'error');
    }
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (settings) => sellerApi.saveSettings(user?.id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-dashboard', user?.id]);
      addToast('Settings saved successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to save settings: ${err.message}`, 'error');
    }
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ amountCents, feeCents, description }) => 
      sellerApi.requestWithdrawal(user?.id, amountCents, feeCents, description),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-dashboard', user?.id]);
      addToast('Withdrawal requested successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to request withdrawal: ${err.message}`, 'error');
    }
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => sellerApi.markNotificationsRead(user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-dashboard', user?.id]);
    }
  });
}
