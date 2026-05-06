import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../Store/useAuthStore";
import { useCartStore } from "../../Store/useCartStore";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";
import { trackEvent } from "../../api/track_events";
import { WishlistAPI } from "../../api/wishlistApi";
import { useToastStore } from "../../Store/useToastStore";

const toast = (msg, type = "success") =>
  useToastStore.getState().addToast(msg, type);

const wishlistKey = (userId) => ["wishlist", userId || "guest"];

function removeProductId(productIds, productId) {
  return (productIds || []).filter((id) => id && id !== productId);
}

/**
 * useAddToCart
 *
 * Universal hook for adding items to the cart.
 * Flow: Zustand optimistic → toast → TanStack mutation → hydrate / rollback.
 *
 * @param {string}  productId  – The product being added
 * @param {object}  opts
 * @param {string}  opts.variantId  – The product_variant ID to add
 * @param {number}  [opts.quantity=1] – Quantity to add
 *
 * Returns { handleAdd, loading, success, error, reset }
 */
export function useAddToCart(productId, { variantId, quantity = 1 } = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const store = useCartStore;

  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    // ── 1 & 2. Zustand optimistic update + toast (before server call) ──
    onMutate: async ({ overrideProductId, overrideOpts } = {}) => {
      await queryClient.cancelQueries({ queryKey: ["cart", user?.id] });
      const finalProductId = overrideProductId ?? productId;
      const finalVariantId = overrideOpts?.variantId ?? variantId;
      const finalQuantity = Math.max(Number(overrideOpts?.quantity ?? quantity) || 1, 1);

      // 1. Zustand instant update
      const snapshot = store.getState().addItemOptimistic({
        productId: finalProductId,
        variantId: finalVariantId,
        quantity: finalQuantity,
      });

      // 2. Toast
      toast("Added to cart! 🛒", "success");

      // Snapshot guest cart for rollback
      const guestSnapshot = !user?.id ? CartEngine.getGuestCart() : null;

      return { snapshot, guestSnapshot };
    },

    // ── 3. TanStack sends item to Supabase ──
    mutationFn: async ({ overrideProductId, overrideOpts } = {}) => {
      const finalProductId = overrideProductId ?? productId;
      const finalVariantId = overrideOpts?.variantId ?? variantId;
      const finalQuantity = Math.max(Number(overrideOpts?.quantity ?? quantity) || 1, 1);

      // ═══════════════════════════
      // 👤 GUEST FLOW (LOCAL ONLY)
      // ═══════════════════════════
      if (!user?.id) {
        const guest = CartEngine.getGuestCart();

        const existing = guest.find((i) => 
          (finalVariantId && i.variant_id === finalVariantId) || 
          (!finalVariantId && i.product_id === finalProductId)
        );

        const updated = existing
          ? guest.map((i) =>
              ((finalVariantId && i.variant_id === finalVariantId) || (!finalVariantId && i.product_id === finalProductId))
                ? { ...i, quantity: (Number(i.quantity) || 0) + finalQuantity }
                : i
            )
          : [
              ...guest,
              {
                product_id: finalProductId,
                variant_id: finalVariantId,
                quantity: finalQuantity,
              },
            ];

        CartEngine.setGuestCart(updated);
        return CartAPI.loadGuestCart(updated);
      }

      // 🔐 AUTH FLOW (SERVER)
      // ═══════════════════════════
      let activeCartId = store.getState().cartId;

      if (!activeCartId && user?.id) {
        const cachedCart = queryClient.getQueryData(["cart", user.id]);
        activeCartId = cachedCart?.cartId;
      }

      if (!activeCartId && user?.id) {
        const loaded = await CartAPI.load(user.id);
        activeCartId = loaded?.cartId;
      }

      if (!activeCartId) {
        throw new Error("Cart not loaded yet. Please try again in a moment.");
      }

      console.log("Adding to cart:", { activeCartId, finalProductId, finalVariantId, finalQuantity });
      
      const addRes = await CartAPI.add({
        cartId: activeCartId,
        productId: finalProductId,
        variantId: finalVariantId,
        quantity: finalQuantity,
      });
      console.log("CartAPI.add returned:", addRes);

      // Return full cart for hydration
      const loaded = await CartAPI.load(user.id);
      console.log("CartAPI.load returned:", loaded);
      return loaded;
    },

    // ── 4. On success: hydrate Zustand with server data ──
    onSuccess: async (data, variables = {}) => {
      const finalProductId = variables.overrideProductId ?? productId;
      const finalVariantId = variables.overrideOpts?.variantId ?? variantId;
      const finalQuantity = Math.max(Number(variables.overrideOpts?.quantity ?? quantity) || 1, 1);

      // Hydrate Zustand with authoritative server data
      store.getState().hydrate(data);

      trackEvent({
        eventType: "add_to_cart",
        productId: finalProductId,
        variantId: finalVariantId,
        quantity: finalQuantity,
        userId: user?.id || null,
      });

      // Show success state for 1.5s
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);

      // Invalidate cart query for any stale listeners
      const userId = user?.id;
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["cart", undefined] });
      }

      // ── Wishlist auto-removal ──
      if (!finalProductId) return;

      const currentWishlistKey = wishlistKey(user?.id);
      const cachedWishlist = queryClient.getQueryData(currentWishlistKey);
      const currentWishlist = cachedWishlist ?? (!user?.id ? WishlistAPI.getGuestWishlist() : []);
      const wasWishlisted = currentWishlist.includes(finalProductId);
      const nextWishlist = removeProductId(currentWishlist, finalProductId);

      if (wasWishlisted) {
        queryClient.setQueryData(currentWishlistKey, nextWishlist);
      }

      try {
        if (user?.id) {
          await WishlistAPI.remove(finalProductId);
          queryClient.invalidateQueries({ queryKey: currentWishlistKey });
        } else if (wasWishlisted) {
          WishlistAPI.setGuestWishlist(nextWishlist);
        }

        if (wasWishlisted) {
          trackEvent({
            eventType: "remove_from_wishlist",
            productId: finalProductId,
            userId: user?.id || null,
            metadata: {
              signal: "most_loved",
              reason: "added_to_cart",
            },
          });
        }
      } catch (wishlistError) {
        if (wasWishlisted) {
          queryClient.setQueryData(currentWishlistKey, currentWishlist);
        }
        console.warn("Failed to remove product from wishlist after adding to cart", wishlistError);
      }
    },

    // ── 5 & 6. On error: rollback Zustand + error toast ──
    onError: (error, _vars, context) => {
      // 5. Rollback Zustand
      if (context?.snapshot) store.getState().rollback(context.snapshot);
      if (!user?.id && context?.guestSnapshot) {
        CartEngine.setGuestCart(context.guestSnapshot);
      }

      // 6. Error toast
      const msg = error?.message?.includes("Cart not loaded")
        ? "Cart is loading — please try again in a moment."
        : "Couldn't add to cart. Please try again.";
      toast(msg, "error");
    },
  });

  const { mutate, isPending, error, reset } = mutation;

  const handleAdd = useCallback(
    (eOrProductId, opts) => {
      // It might be an event from a button click, or direct IDs from a manual call
      let overrideProductId;
      let overrideOpts = opts;

      if (eOrProductId?.stopPropagation) {
        eOrProductId.preventDefault?.();
        eOrProductId.stopPropagation();
      } else if (eOrProductId) {
        overrideProductId = eOrProductId;
      }

      mutate({ overrideProductId, overrideOpts });
    },
    [mutate]
  );

  return {
    handleAdd,
    mutate: handleAdd,  // alias for components that destructure `mutate`
    loading: isPending,
    isPending,
    success,
    isSuccess: success,
    error,
    reset,
  };
}
