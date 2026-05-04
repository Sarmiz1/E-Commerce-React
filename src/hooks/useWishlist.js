import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../store/useAuthStore";
import { WishlistAPI } from "../api/wishlistApi";
import { trackEvent } from "../api/track_events";
import { useToastStore } from "../store/useToastStore";

const toast = (msg, type = "success") =>
  useToastStore.getState().addToast(msg, type);

const wishlistKey = (userId) => ["wishlist", userId || "guest"];

function applyWishlistChange(productIds, productId, nextLiked) {
  const current = new Set((productIds || []).filter(Boolean));

  if (nextLiked) current.add(productId);
  else current.delete(productId);

  return [...current];
}

export function useWishlist(productId, { initialLiked = false } = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = wishlistKey(user?.id);

  const {
    data: productIds = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) return WishlistAPI.getGuestWishlist();

      const guestProductIds = WishlistAPI.getGuestWishlist();
      if (guestProductIds.length) {
        await Promise.allSettled(
          guestProductIds.map((guestProductId) => WishlistAPI.add(guestProductId)),
        );
        WishlistAPI.clearGuestWishlist();
      }

      return WishlistAPI.load();
    },
    initialData: () => {
      if (user?.id) return undefined;
      return WishlistAPI.getGuestWishlist();
    },
  });

  const isWishlisted = productId
    ? productIds.includes(productId)
    : Boolean(initialLiked);

  const mutation = useMutation({
    mutationFn: async ({ nextLiked }) => {
      if (!productId) return productIds;

      if (user?.id) {
        if (nextLiked) await WishlistAPI.add(productId);
        else await WishlistAPI.remove(productId);
        return applyWishlistChange(
          queryClient.getQueryData(queryKey) || productIds,
          productId,
          nextLiked,
        );
      }

      const nextProductIds = applyWishlistChange(productIds, productId, nextLiked);
      WishlistAPI.setGuestWishlist(nextProductIds);
      return nextProductIds;
    },
    onMutate: async ({ nextLiked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProductIds = queryClient.getQueryData(queryKey) || [];
      const optimisticProductIds = productId
        ? applyWishlistChange(previousProductIds, productId, nextLiked)
        : previousProductIds;

      queryClient.setQueryData(queryKey, optimisticProductIds);

      return { previousProductIds };
    },
    onError: (_error, _variables, context) => {
      toast("Couldn't update wishlist. Please try again.", "error");
      if (context?.previousProductIds) {
        queryClient.setQueryData(queryKey, context.previousProductIds);
      }
    },
    onSuccess: (nextProductIds, variables) => {
      queryClient.setQueryData(queryKey, nextProductIds || []);
      
      // Sync with Buyer Dashboard
      queryClient.invalidateQueries({ queryKey: ["buyer", "dashboard", user?.id] });
      
      toast(
        variables?.nextLiked ? "Added to wishlist! ♥️" : "Removed from wishlist.",
        "success"
      );

      if (productId) {
        trackEvent({
          eventType: variables?.nextLiked ? "add_to_wishlist" : "remove_from_wishlist",
          productId,
          userId: user?.id || null,
          metadata: {
            signal: "most_loved",
          },
        });
      }
    },
  });

  const setWishlisted = useCallback(
    (nextLiked) => {
      if (!productId) return;
      mutation.mutate({ nextLiked: Boolean(nextLiked) });
    },
    [mutation, productId],
  );

  const toggleWishlist = useCallback(() => {
    setWishlisted(!isWishlisted);
  }, [isWishlisted, setWishlisted]);

  return {
    productIds,
    wishlistCount: productIds.length,
    isWishlisted,
    setWishlisted,
    toggleWishlist,
    isLoading,
    isPending: mutation.isPending,
    error: mutation.error || queryError,
  };
}
