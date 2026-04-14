import { useState, useCallback, useContext } from "react";
import axios from "axios";
import { CartActionsContext } from "../Context/cartContext222"; 

export function useAddCart() {
  const { loadCart } = useContext(CartActionsContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      await axios.post("/api/cart-items", {
        productId,
        quantity,
      });

      await loadCart();
    } catch {
      setError("Failed to add item to cart.");
      throw new Error("Add to cart failed"); // 👈 important
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  return { addToCart, loading, error };
}