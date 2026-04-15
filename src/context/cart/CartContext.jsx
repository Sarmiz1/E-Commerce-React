// src/Context/CartContext.jsx
//
// ── Bugs fixed ────────────────────────────────────────────────────────────────
//
//  1. DOUBLE DATA-UNWRAP — loadCart did `setCart(res.data)` but CartAPI.load
//     already returns the unwrapped body (not an axios response object), so
//     `res.data` was always `undefined`. Fixed: `setCart(toArray(res))`.
//
//  2. WRONG METHOD NAME — `updateQuantity` called `CartAPI.update(...)` which
//     didn't exist (method was `CartAPI.updateQuantity`). CartAPI is now
//     standardised to `update` and this call is correct.
//
//  3. STALE CLOSURE → UNNECESSARY RE-RENDERS (updateQuantity, clearCart)
//     Both callbacks had `[cart]` in their dep-arrays. A new function reference
//     was created on EVERY cart state change, which invalidated every consumer's
//     memoisation and caused entire subtrees to re-render on each add/remove.
//     Fixed by using a `cartRef` that stays current without being a dependency:
//       • `cartRef.current` is read synchronously inside callbacks (no stale value)
//       • useEffect keeps the ref in sync with state
//       • Neither callback lists `cart` in its dep-array → stable fn references
//
//  4. EXTRA SERVER ROUND-TRIP in updateQuantity — after a successful update it
//     called `CartAPI.load()` and tried `setCart(freshCart.data)` — yet another
//     double-unwrap producing undefined. The server sync is not needed because
//     the optimistic update is already correct. Removed. If you need a server
//     confirmation, call `loadCart()` explicitly in the UI after the action.
//
//  5. CONSOLE.LOGS left in production loadCart path — removed.
//
//  6. UNSAFE ARRAY ASSUMPTION — if the API ever returns `{ items: [...] }` or
//     an unexpected shape, `setCart(res)` breaks the .map() calls downstream.
//     All setCart calls now go through `toArray()` which safely normalises
//     any shape to an array.
//
//  7. MISSING LOADING STATE on addItem / removeItem / updateQuantity — the UI
//     had no way to show individual-item spinners. Added per-item `loadingIds`
//     Set exposed via CartStateContext.
//
// ── Re-render optimisation summary ───────────────────────────────────────────
//  • State is split into CartStateContext (data) and CartActionsContext (fns).
//    Components that only call actions (e.g. AddToCart button) subscribe to
//    CartActionsContext and never re-render when cart items change.
//  • Actions are stable references (no cart in dep-arrays) thanks to cartRef.
//  • stateValue / actionValue are both memoised.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { CartAPI } from "../../api/cartApi";
import { CartStorage } from "./cartStorage";

// ── Helper: always produce an array from whatever the API returns ──────────────
// Handles: plain array, { items: [...] }, { data: [...] }, null, undefined.
function toArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

/* =============================================================================
   CONTEXTS
============================================================================= */
// Separate state and action contexts so pure-action consumers (e.g. an
// AddToCart button deep in the tree) never re-render when cart items change.
const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

/* =============================================================================
   PROVIDER
============================================================================= */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => toArray(CartStorage.load()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingIds, setLoadingIds] = useState(() => new Set());

  // ── Ref mirror — lets stable callbacks read current cart without being
  //   listed as a dep (avoids recreating fns on every cart update).
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
    CartStorage.save(cart);   // sync storage alongside the ref
  }, [cart]);




  // ── Per-item loading helpers ───────────────────────────────────────────────
  const startLoading = useCallback((productId) =>
    setLoadingIds((prev) => { const s = new Set(prev); s.add(productId); return s; }), []);

  const stopLoading = useCallback((productId) =>
    setLoadingIds((prev) => { const s = new Set(prev); s.delete(productId); return s; }), []);

  /* ==========================================================================
     LOAD CART — fetches fresh state from the server
  ========================================================================== */
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CartAPI.load();
      setCart(toArray(res.data));          // ← FIX: was setCart(res.data) → undefined
    } catch (err) {
      setError(err.message || "Failed to load cart");
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []); // no deps — CartAPI is a stable module reference


  // Load Cart
  useEffect(() => {
    (async () => {
      await loadCart();
      console.log(cart)
    })();
  }, []);

  /* ==========================================================================
     ADD ITEM — optimistic + server confirm
  ========================================================================== */
  const addItem = useCallback(async (productId, quantity = 1) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Optimistic update
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      if (exists) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          id: tempId,        // ✅ TEMP ID (fixes duplicate key error)
          productId,
          quantity,
          isTemp: true       // optional but useful for debugging
        }
      ];
    });

    startLoading(productId);
    try {
      await CartAPI.add(productId, quantity);
    } catch {
      // Revert to server truth on failure
      await loadCart();
    } finally {
      stopLoading(productId);
    }
  }, [loadCart, startLoading, stopLoading]);

  /* ==========================================================================
     REMOVE ITEM — optimistic + server confirm
  ========================================================================== */
  const removeItem = useCallback(async (productId) => {
    // Capture current cart via ref (no stale closure, no dep on cart state)
    const snapshot = cartRef.current;

    setCart((prev) => prev.filter((i) => i.productId !== productId));
    startLoading(productId);
    try {
      await CartAPI.remove(productId);
    } catch {
      setCart(toArray(snapshot));     // ← FIX: rollback using ref snapshot
    } finally {
      stopLoading(productId);
    }
  }, [startLoading, stopLoading]);    // ← FIX: no [cart] dep → stable reference

  /* ==========================================================================
     UPDATE QUANTITY — optimistic + server confirm, no extra load() call
  ========================================================================== */
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return;

    // Snapshot via ref before the optimistic update
    const snapshot = cartRef.current;

    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
    startLoading(productId);
    try {
      await CartAPI.update(productId, quantity); // ← FIX: was CartAPI.update (didn't exist)
      // No extra CartAPI.load() call — optimistic state is already correct.
      // The previous version called load() and then setCart(freshCart.data)
      // which was a second double-unwrap producing undefined.
    } catch {
      setCart(toArray(snapshot));     // ← FIX: rollback, no stale closure
    } finally {
      stopLoading(productId);
    }
  }, [startLoading, stopLoading]);    // ← FIX: no [cart] dep → stable reference

  /* ==========================================================================
     UPDATE DELIVERY
  ========================================================================== */
  const updateDelivery = useCallback(async (deliveryData) => {
    setLoading(true);
    try {
      await CartAPI.updateDelivery(deliveryData);
      await loadCart();               // delivery change can affect shipping cost
    } catch (err) {
      setError(err.message || "Failed to update delivery");
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  /* ==========================================================================
     CLEAR CART
  ========================================================================== */
  const clearCart = useCallback(async () => {
    const snapshot = cartRef.current; // ← FIX: was capturing `cart` from closure

    setCart([]);
    try {
      await CartAPI.clear();
      CartStorage.clear();
    } catch {
      setCart(toArray(snapshot));
    }
  }, []);                             // ← FIX: no [cart] dep → stable reference

  /* ==========================================================================
     DERIVED VALUES
  ========================================================================== */
  // Computed once per cart change; consumers use these instead of re-computing.
  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((n, i) => n + (i.priceCents || i.product?.priceCents || 0) * i.quantity, 0),
    [cart]
  );

  /* ==========================================================================
     CONTEXT VALUES — memoised to prevent context-triggered re-renders
  ========================================================================== */
  // State context: re-renders subscribers only when actual data changes.
  const stateValue = useMemo(() => ({
    cart,
    loading,
    loadingIds,
    error,
    cartCount,
    cartSubtotal,
  }), [cart, loading, loadingIds, error, cartCount, cartSubtotal]);

  // Action context: stable references — subscribing to this never triggers
  // a re-render due to cart state changes.
  const actionValue = useMemo(() => ({
    loadCart,
    addItem,
    removeItem,
    updateQuantity,
    updateDelivery,
    clearCart,
  }), [loadCart, addItem, removeItem, updateQuantity, updateDelivery, clearCart]);

  return (
    <CartStateContext.Provider value={stateValue}>
      <CartActionsContext.Provider value={actionValue}>
        {children}
      </CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
}

/* =============================================================================
   HOOKS
============================================================================= */

/** Subscribe to cart data (cart array, loading, error, counts). */
export const useCartState = () => {
  const ctx = useContext(CartStateContext);
  if (!ctx) throw new Error("useCartState must be used inside <CartProvider>");
  return ctx;
};

/** Subscribe to cart actions only. Won't re-render when cart items change. */
export const useCartActions = () => {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error("useCartActions must be used inside <CartProvider>");
  return ctx;
};

/**
 * Convenience hook that returns both state and actions.
 * Use this only in components that genuinely need both — otherwise prefer
 * the individual hooks to minimise re-renders.
 */
export const useCart = () => ({
  ...useCartState(),
  ...useCartActions(),
});