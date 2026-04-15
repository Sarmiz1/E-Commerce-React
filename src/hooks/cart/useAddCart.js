// src/hooks/useAddToCart.js
//
// One hook to rule them all.
// Combines: CartAPI call, context sync, fly-to-cart animation, loading state,
// error handling, and success feedback — in a single reusable hook.
//
// ── Usage ─────────────────────────────────────────────────────────────────────
//
//   import { useAddToCart } from "../../hooks/useAddToCart";
//
//   function MyProductCard({ product }) {
//     const { handleAdd, loading, success, error } = useAddToCart(product.id);
//
//     return (
//       <button
//         onClick={handleAdd}          // pass the click event directly
//         disabled={loading}
//       >
//         {success ? "Added! ✓" : loading ? "Adding…" : "Add to Cart"}
//       </button>
//     );
//   }
//
// The click event (MouseEvent) is forwarded to runFlyToCart so it can find
// the product image by walking up the DOM from the button — no extra props needed.
//
// ── If you need the animation without the API (e.g. preview / demo) ───────────
//
//   import { runFlyToCart }  from "../utils/cartAnimation";
  // import { useCartIconRef } from "../Context/CartAnimationContext";
//
//   const cartIconRef = useCartIconRef();
//   <button onClick={(e) => runFlyToCart(e, cartIconRef)}>Animate only</button>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

// import cartContext from "../Context/cartContext";     // legacy default export
import { postData } from "../../api/apiClients";
import { useCartActions } from "../../Context/cart/CartContext";    // new split-context actions
import { useCartIconRef } from "../../Context/cart/CartAnimationContext";
import { runFlyToCart } from "../../Utils/runFlyToCart";

// ── Safely get loadCart regardless of which context shape the app uses ─────────
// This handles both the old cartContext (default export with { loadCart }) and
// the new CartContext with useCartActions.
// function useSafeLoadCart() {
//   // Try the new context first (preferred)
//   try {
//     const { loadCart } = useCartActions();
//     return loadCart;
//   } catch {
//     // Fall back to the legacy default-export context
//     try {
//       // eslint-disable-next-line react-hooks/rules-of-hooks
//       const { loadCart } = useContext(cartContext);
//       return loadCart ?? (() => Promise.resolve());
//     } catch {
//       return () => Promise.resolve();
//     }
//   }
// }

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useAddToCart(productId, options?)
 *
 * @param {string|number} productId   The product to add.
 * @param {object}        [options]
 * @param {number}        [options.quantity=1]           Default quantity.
 * @param {number}        [options.successDuration=2500] Ms to show success state.
 *
 * @returns {{
 *   handleAdd : (event?: React.MouseEvent) => Promise<void>,
 *   loading   : boolean,
 *   success   : boolean,
 *   error     : string|null,
 *   reset     : () => void,
 * }}
 */
export function useAddToCart(productId, options = {}) {
  const { quantity = 1, successDuration = 2500 } = options;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { loadCart } = useCartActions();
  const cartIconRef = useCartIconRef();


  /** Reset all local state back to idle. Useful after showing an error. */
  const reset = useCallback(() => {
    setLoading(false);
    setSuccess(false);
    setError(null);
  }, []);

  /**
   * handleAdd(event?)
   *
   * Call this directly from an onClick handler. Passing the event is optional
   * but required for the fly animation to find the product image.
   *
   * @param {React.MouseEvent|Event} [event]
   */
  const handleAdd = useCallback(async (event) => {
    if (loading) return; // prevent double-submission


    // Trigger the fly animation immediately (before the API call)
    // so it feels instant regardless of network latency.
    if (event && cartIconRef) {
      runFlyToCart(event, cartIconRef);
    }

    setLoading(true);
    setError(null);

    try {
      await postData("/cart-items", { productId, quantity });
      await loadCart();

      setSuccess(true);
      setTimeout(() => setSuccess(false), successDuration);
    } catch (err) {
      setError(err?.message || "Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, productId, quantity, loadCart, cartIconRef, successDuration]);

  return { handleAdd, loading, success, error, reset };
}