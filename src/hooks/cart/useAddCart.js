// src/hooks/useAddToCart.js
import { useState, useCallback } from "react";
import { useCartActions, useCartState } from "../../Context/cart/CartContext";
import { useCartIconRef } from "../../Context/cart/CartAnimationContext";
import { runFlyToCart } from "../../Utils/runFlyToCart";
import { CartAPI } from "../../api/cartApi";

/**
 * useAddToCart(productId, options?)
 *
 * @param {string|number} productId   The product to add.
 * @param {object}        [options]
 * @param {string}        [options.variantId]            Specific variant to add.
 * @param {number}        [options.quantity=1]           Default quantity.
 * @param {number}        [options.successDuration=2500] Ms to show success state.
 */
export function useAddToCart(productId, options = {}) {
  const { quantity = 1, successDuration = 2500, variantId = null } = options;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { loadCart } = useCartActions();
  const { cartId } = useCartState();
  const cartIconRef = useCartIconRef();

  const reset = useCallback(() => {
    setLoading(false);
    setSuccess(false);
    setError(null);
  }, []);

  const handleAdd = useCallback(async (event) => {
    if (loading) return;

    if (event && cartIconRef) {
      runFlyToCart(event, cartIconRef);
    }

    if (!cartId) {
      setError("Please log in to add items to your cart.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the actual Supabase CartAPI
      await CartAPI.add(cartId, productId, variantId, quantity);
      
      // Refresh context state
      await loadCart();

      setSuccess(true);
      setTimeout(() => setSuccess(false), successDuration);
    } catch (err) {
      setError(err?.message || "Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, productId, variantId, quantity, loadCart, cartId, cartIconRef, successDuration]);

  return { handleAdd, loading, success, error, reset };
}