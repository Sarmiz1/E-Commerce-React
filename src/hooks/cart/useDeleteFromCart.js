import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";
import { trackEvent } from "../../api/track_events";
import { useToastStore } from "../../store/useToastStore";

const toast = (msg, type = "success") =>
  useToastStore.getState().addToast(msg, type);

/**
 * useDeleteFromCart
 *
 * Universal hook for removing items from the cart.
 * Flow: Zustand optimistic → TanStack mutation → hydrate / rollback.
 *
 * @param {string} productId – The product being removed
 * @param {object} [opts]
 * @param {string} opts.variantId – The variant ID to remove
 *
 * Returns { handleRemove, loading, success, error, reset }
 */
export function useDeleteFromCart(productId, { variantId } = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const store = useCartStore;

  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    // ── Zustand optimistic removal ──
    onMutate: async ({ overrideProductId, overrideOpts } = {}) => {
      await queryClient.cancelQueries({ queryKey: ["cart", user?.id] });
      const finalProductId = overrideProductId ?? productId;
      const finalVariantId = overrideOpts?.variantId ?? variantId;

      // Find the matching item to build a proper ref
      const cart = store.getState().cart;
      const itemRef = cart.find((i) =>
        (finalVariantId && i.variant_id === finalVariantId) ||
        (!finalVariantId && i.product_id === finalProductId),
      );

      const snapshot = store.getState().removeItemOptimistic(
        itemRef || finalVariantId || finalProductId,
      );
      const guestSnapshot = !user?.id ? CartEngine.getGuestCart() : null;

      return { snapshot, guestSnapshot };
    },

    mutationFn: async ({ overrideProductId, overrideOpts } = {}) => {
      const finalProductId = overrideProductId ?? productId;
      const finalVariantId = overrideOpts?.variantId ?? variantId;

      // ═══════════════════════════
      // 👤 GUEST FLOW
      // ═══════════════════════════
      if (!user?.id) {
        const guest = CartEngine.getGuestCart();
        const updated = guest.filter((i) => {
          if (finalVariantId) return i.variant_id !== finalVariantId;
          return i.product_id !== finalProductId;
        });
        CartEngine.setGuestCart(updated);
        return CartAPI.loadGuestCart(updated);
      }

      // ═══════════════════════════
      // 🔐 AUTH FLOW
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

      // Find the cart_item row ID from the current cached cart
      const cachedCart = queryClient.getQueryData(["cart", user.id]);
      const cartItems = cachedCart?.items || store.getState().cart;
      const itemToDelete = cartItems.find((i) =>
        (finalVariantId && i.variant_id === finalVariantId) ||
        (!finalVariantId && i.product_id === finalProductId),
      );

      if (!itemToDelete) throw new Error("Item not found in cart.");

      await CartAPI.remove(itemToDelete.id);
      return CartAPI.load(user.id);
    },

    onSuccess: (data, variables = {}) => {
      const finalProductId = variables.overrideProductId ?? productId;
      const finalVariantId = variables.overrideOpts?.variantId ?? variantId;

      // Hydrate Zustand with server data
      store.getState().hydrate(data);

      toast("Item removed from cart.", "success");

      trackEvent({
        eventType: "remove_from_cart",
        productId: finalProductId,
        variantId: finalVariantId,
        userId: user?.id || null,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);

      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      }
    },

    onError: (error, _vars, context) => {
      // Rollback Zustand
      if (context?.snapshot) store.getState().rollback(context.snapshot);
      if (!user?.id && context?.guestSnapshot) {
        CartEngine.setGuestCart(context.guestSnapshot);
      }

      const msg = error?.message?.includes("not found")
        ? "This item is no longer in your cart."
        : error?.message?.includes("Cart not loaded")
        ? "Cart is loading — please try again in a moment."
        : "Couldn't remove item. Please try again.";
      toast(msg, "error");
    },
  });

  const { mutate, isPending, error, reset } = mutation;

  const handleRemove = useCallback(
    (eOrProductId, opts) => {
      let overrideProductId;
      let overrideOpts;

      if (eOrProductId?.stopPropagation) {
        eOrProductId.stopPropagation();
      } else if (eOrProductId) {
        overrideProductId = eOrProductId;
        overrideOpts = opts;
      }
      mutate({ overrideProductId, overrideOpts });
    },
    [mutate],
  );

  return {
    handleRemove,
    mutate: handleRemove,
    loading: isPending,
    isPending,
    success,
    isSuccess: success,
    error,
    reset,
  };
}
