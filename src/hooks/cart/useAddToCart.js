import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../Context/auth/AuthContext";
import { useCartState } from "../../Context/cart/CartContext";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";

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
      const finalQuantity = overrideOpts?.quantity ?? quantity;

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
                ? { ...i, quantity: i.quantity + finalQuantity }
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

        queryClient.setQueryData(["cart", undefined], {
          items: updated,
          cartId: null,
        });

        return updated;
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

    onSuccess: () => {
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

  const handleAdd = useCallback(
    (eOrProductId, opts) => {
      // It might be an event from a button click, or direct IDs from a manual call
      let overrideProductId;
      let overrideOpts;

      if (eOrProductId?.stopPropagation) {
        eOrProductId.stopPropagation();
      } else if (eOrProductId) {
        overrideProductId = eOrProductId;
        overrideOpts = opts;
      }

      mutation.mutate({ overrideProductId, overrideOpts });
    },
    [mutation]
  );

  return {
    handleAdd,
    mutate: handleAdd,  // alias for components that destructure `mutate`
    loading: mutation.isPending,
    isPending: mutation.isPending,
    success,
    isSuccess: success,
    error: mutation.error,
    reset: mutation.reset,
  };
}