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
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
    }
  });
}

// ─── Mock Hooks for simulated backend ───

export function useAddProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (productData) => sellerApi.addProduct(user?.id, productData),
    onSuccess: (newProduct) => {
      // 1. Immediately inject the new product into the cached dashboard data
      //    so it appears in the Products tab without waiting for a refetch.
      queryClient.setQueryData(['seller-dashboard', user?.id], (old) => {
        if (!old) return old;
        const optimisticEntry = {
          id: newProduct.id,
          name: newProduct.name,
          image: newProduct.image || null,
          price: newProduct.price_cents,
          stock: 0,   // variants just inserted; stock will sync on refetch
          sales: 0,
          rating: null,
          status: newProduct.is_active ? 'active' : 'inactive',
        };
        return {
          ...old,
          products: [optimisticEntry, ...(old.products || [])],
        };
      });

      // 2. Force a real refetch in the background to sync accurate stock/sales.
      queryClient.refetchQueries({ queryKey: ['seller-dashboard', user?.id] });

      addToast('Product added successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to add product: ${err.message}`, 'error');
    }
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (planId) => sellerApi.updateSubscription(user?.id, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
      addToast('Subscription updated successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to update subscription: ${err.message}`, 'error');
    }
  });
}

export function useUpdateMarketing() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (marketingData) => sellerApi.updateMarketing(user?.id, marketingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
      // Note: Components might handle their own success toasts for marketing tasks, so we keep this quiet or minimal.
    },
    onError: (err) => {
      addToast(`Failed to update marketing: ${err.message}`, 'error');
    }
  });
}

export function useReplyReview() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ reviewId, replyText }) => sellerApi.replyReview(reviewId, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard', user?.id] });
      addToast('Reply submitted successfully', 'success');
    },
    onError: (err) => {
      addToast(`Failed to submit reply: ${err.message}`, 'error');
    }
  });
}
