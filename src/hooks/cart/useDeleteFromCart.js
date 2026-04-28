import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../Context/auth/AuthContext";
import { useCartState } from "../../Context/cart/CartContext";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";
import { trackEvent } from "../../Utils/analytics";

/**
 * useDeleteFromCart
 *
 * A universal hook that encapsulates the logic for removing items from the
 * shopping cart. It mirrors the behaviour of `useAddToCart` but handles
 * deletion instead of addition. The hook transparently switches between
 * guest mode (for users who are not authenticated) and authenticated
 * server‑side mode. In guest mode it manipulates a locally stored cart
 * (via `CartEngine`), whereas in authenticated mode it uses the
 * `CartAPI.remove` method to persist changes to the backend. After
 * performing a removal the hook will invalidate the cart query so that
 * components depending on cart data re‑fetch fresh information.
 *
 * The hook returns a handler function which can be bound directly to
 * UI elements (e.g. delete buttons) or called imperatively. It also
 * exposes loading/error state flags and an optional success state which
 * briefly toggles true after a successful removal, useful for simple
 * animations or notifications. The API is intentionally symmetric with
 * `useAddToCart` so that consumers can switch between add/remove flows
 * without changing how they consume the hook.
 *
 * ### Parameters
 *
 * @param {string} productId – The primary product ID being removed; used
 *   when no specific variant is provided. This allows deletion of
 *   simple products without variants from a guest cart. When called
 *   imperatively the product ID can be overridden via the first
 *   argument to `handleRemove`.
 * @param {Object} [opts] – Options object for specifying a variant.
 * @param {string} opts.variantId – The ID of a particular product variant
 *   to remove. If provided the hook will target that variant rather
 *   than the base product. Variants are optional; omit this property
 *   when dealing with products without variants.
 *
 * ### Usage
 *
 * ```jsx
 * const { handleRemove, loading, error, success } =
 *   useDeleteFromCart("productId", { variantId: "variantId" });
 *
 * // Attach to a delete button
 * <button onClick={handleRemove} disabled={loading}>Remove</button>
 *
 * // Or call manually
 * handleRemove("anotherProductId", { variantId: "anotherVariantId" });
 * ```
 */
export function useDeleteFromCart(productId, { variantId } = {}) {
  const { user } = useAuth();
  const { cartId } = useCartState();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    /**
     * mutationFn orchestrates the actual removal operation. It
     * gracefully handles both guest and authenticated flows by
     * examining the presence of `user.id`. Variants and products are
     * resolved using overrides passed to the handler or the original
     * parameters.
     */
    mutationFn: async ({ overrideProductId, overrideOpts } = {}) => {
      const finalProductId = overrideProductId ?? productId;
      const finalVariantId = overrideOpts?.variantId ?? variantId;

      // ═══════════════════════════
      // 👤 GUEST FLOW (LOCAL ONLY)
      // ═══════════════════════════
      // If the user is not authenticated, operate entirely on
      // local storage via CartEngine. This keeps guest carts
      // independent of the backend.
      if (!user?.id) {
        const guest = CartEngine.getGuestCart();

        // Remove the matching item(s) from the guest cart. We target
        // either a specific variant or the base product depending on
        // provided identifiers. Note that we do not attempt to
        // decrement quantity here—removing means deleting the line item.
        const updated = guest.filter((i) => {
          if (finalVariantId) {
            return i.variant_id !== finalVariantId;
          }
          return i.product_id !== finalProductId;
        });

        CartEngine.setGuestCart(updated);

        // Manually update the React Query cache for guest carts. We
        // mimic the structure of the server response so components
        // reading from the cache see the updated list of items.
        queryClient.setQueryData(["cart", undefined], {
          items: updated,
          cartId: null,
        });
        return updated;
      }

      // ═══════════════════════════
      // 🔐 AUTH FLOW (SERVER)
      // ═══════════════════════════
      // When the user is authenticated we delegate to the API. The
      // presence of a cartId is required; if it is missing the UI
      // should prompt the user to refresh or load their cart first.
      if (!cartId) {
        throw new Error("Cart not loaded yet. Please try again.");
      }

      // The CartAPI is expected to implement a `.remove` method that
      // accepts an object with `cartId`, `productId` and `variantId`
      // properties and removes the matching item(s) from the cart.
      // If your API uses a different method name, adjust this call
      // accordingly. It should return the updated cart or an array of
      // removed items.
      const result = await CartAPI.remove({
        cartId,
        productId: finalProductId,
        variantId: finalVariantId,
      });
      return result;
    },

    /**
     * onSuccess is called after a successful removal. It resets
     * success state, tracks analytics, and forces a refetch of the
     * cart from the server for authenticated users. This ensures
     * components display fresh data.
     */
    onSuccess: (_data, variables = {}) => {
      const finalProductId = variables.overrideProductId ?? productId;
      const finalVariantId = variables.overrideOpts?.variantId ?? variantId;
      trackEvent("remove_from_cart", {
        productId: finalProductId,
        variantId: finalVariantId,
        userId: user?.id || null,
      });

      // Briefly show success state to allow UI feedback (e.g. toast).
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);

      // Refetch from server only when authenticated so we pull the
      // latest cart contents from Supabase or your backend.
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      }
    },
  });

  const { mutate, isPending, error, reset } = mutation;

  /**
   * handleRemove is the exposed callback for consumers. It supports
   * attaching directly to event handlers (click events) and an
   * imperative API for overriding the initial product/variant. If an
   * event object is passed it will be sanitized; otherwise the
   * provided arguments are forwarded into the mutation.
   *
   * @param {Event|string} eOrProductId Either a click event or a
   *   product ID string. Passing an event allows the function to be
   *   used as a direct handler on a button; passing a string allows
   *   callers to remove a different product or variant imperatively.
   * @param {Object} [opts] Optional variant override when called
   *   imperatively. Should contain a `variantId` when targeting a
   *   specific variant.
   */
  const handleRemove = useCallback(
    (eOrProductId, opts) => {
      let overrideProductId;
      let overrideOpts;

      // If the first argument is an event (e.g. from onClick), stop
      // propagation so parent elements don't handle the click.
      if (eOrProductId?.stopPropagation) {
        eOrProductId.stopPropagation();
      } else if (eOrProductId) {
        // Otherwise treat the first argument as an override for the
        // product ID and the second argument as an options override.
        overrideProductId = eOrProductId;
        overrideOpts = opts;
      }
      mutate({ overrideProductId, overrideOpts });
    },
    [mutate]
  );

  return {
    /**
     * Call this function to remove an item from the cart. It can be
     * assigned directly to an event handler or called manually. See
     * usage examples in the JSDoc above.
     */
    handleRemove,

    // Alias for convenience when destructuring from the hook result.
    mutate: handleRemove,

    /** Indicates whether the removal is currently in progress. */
    loading: isPending,
    isPending,

    /** Indicates whether the last removal was successful. */
    success,
    isSuccess: success,

    /** Contains an Error object if the last operation failed. */
    error,

    /** Resets the mutation state (loading/error) back to idle. */
    reset,
  };
}