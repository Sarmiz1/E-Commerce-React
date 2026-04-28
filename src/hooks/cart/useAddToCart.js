import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../Context/auth/AuthContext";
import { useCartState } from "../../Context/cart/CartContext";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";
import { trackEvent } from "../../Utils/analytics";

/**
 * useAddToCart
 *
 * Universal hook for adding items to the cart.
 * Handles both guest (localStorage) and authenticated (Supabase) flows.
 *
 * @param {string}  productId  – The product being added (for reference / guest cart)
 * @param {object}  opts
 * @param {string}  opts.variantId  – The product_variant ID to add
 * @param {number}  [opts.quantity=1] – Quantity to add
 *
 * Returns { handleAdd, loading, success, error, reset }
 */
export function useAddToCart(productId, { variantId, quantity = 1 } = {}) {
  const { user } = useAuth();
  const { cartId } = useCartState();
  const queryClient = useQueryClient();

  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
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

        const normalizedCart = await CartAPI.loadGuestCart(updated);
        queryClient.setQueryData(["cart", undefined], normalizedCart);

        return normalizedCart;
      }

      // ═══════════════════════════
      // 🔐 AUTH FLOW (SERVER)
      // ═══════════════════════════
      if (!cartId) {
        throw new Error("Cart not loaded yet. Please try again.");
      }

      const result = await CartAPI.add({
        cartId,
        productId: finalProductId,
        variantId: finalVariantId,
        quantity: finalQuantity,
      });

      return result;
    },

    onSuccess: (_data, variables = {}) => {
      const finalProductId = variables.overrideProductId ?? productId;
      const finalVariantId = variables.overrideOpts?.variantId ?? variantId;
      const finalQuantity = Math.max(Number(variables.overrideOpts?.quantity ?? quantity) || 1, 1);

      trackEvent("add_to_cart", {
        productId: finalProductId,
        variantId: finalVariantId,
        quantity: finalQuantity,
        userId: user?.id || null,
      });

      // Show success state for 1.5s
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);

      // Refetch cart from server to get full product data
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["cart", user.id],
        });
      }
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
