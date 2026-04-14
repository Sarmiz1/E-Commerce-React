import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from "react";

import { CartAPI } from "../../api/cartApi";
import { CartStorage } from "./cartStorage";

/* =========================
   CONTEXTS
========================= */
const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

/* =========================
   PROVIDER
========================= */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => CartStorage.load());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     SYNC LOCAL STORAGE
  ========================= */
  useEffect(() => {
    CartStorage.save(cart);
  }, [cart]);

  /* =========================
     LOAD CART
  ========================= */
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await CartAPI.load();
      setCart(data);

    } catch (err) {
      setError(err.message || "Failed to load cart");
      setCart([]); // safe fallback

    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     ADD ITEM
  ========================= */
  const addItem = useCallback(async (productId, quantity = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === productId);

      if (exists) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { productId, quantity }];
    });

    try {
      await CartAPI.add(productId, quantity);
    } catch {
      await loadCart();
    }
  }, [loadCart]);

  /* =========================
     REMOVE ITEM
  ========================= */
  const removeItem = useCallback(async (productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId));

    try {
      await CartAPI.remove(productId);
    } catch {
      await loadCart();
    }
  }, [loadCart]);

  /* =========================
     UPDATE QUANTITY (FIXED + CLEAN)
  ========================= */
  const updateQuantity = useCallback(async (productId, quantity) => {
  if (quantity < 1) return;

  const previousCart = cart;

  // Optimistic update
  setCart(prev =>
    prev.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    )
  );

  try {
    await CartAPI.update(productId, quantity);

    // 🔥 Sync with server truth after success
    const freshCart = await CartAPI.load();
    setCart(freshCart);

  } catch {
    // Rollback on failure
    setCart(previousCart);
  }
}, [cart]);

  /* =========================
     UPDATE DELIVERY (NEW)
  ========================= */
  const updateDelivery = useCallback(async (deliveryData) => {
    try {
      setLoading(true);
      await CartAPI.updateDelivery(deliveryData);
      await loadCart(); // always sync fresh state
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  /* =========================
     CLEAR CART
  ========================= */
  const clearCart = useCallback(async () => {
    const previousCart = cart;

    setCart([]);

    try {
      await CartAPI.clear();
      CartStorage.clear();
    } catch {
      setCart(previousCart);
    }
  }, [cart]);

  /* =========================
     CONTEXT MEMOIZATION
  ========================= */
  const stateValue = useMemo(() => ({
    cart,
    loading,
    error
  }), [cart, loading, error]);

  const actionValue = useMemo(() => ({
    loadCart,
    addItem,
    removeItem,
    updateQuantity,
    updateDelivery,
    clearCart
  }), [
    loadCart,
    addItem,
    removeItem,
    updateQuantity,
    updateDelivery,
    clearCart
  ]);

  return (
    <CartStateContext.Provider value={stateValue}>
      <CartActionsContext.Provider value={actionValue}>
        {children}
      </CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
}

/* =========================
   HOOKS
========================= */
export const useCartState = () => {
  const ctx = useContext(CartStateContext);
  if (!ctx) throw new Error("useCartState must be used within CartProvider");
  return ctx;
};

export const useCartActions = () => {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error("useCartActions must be used within CartProvider");
  return ctx;
};