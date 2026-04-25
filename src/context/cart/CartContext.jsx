import { createContext, useContext, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";

const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ─── Cart query ───────────────────────────────────────────────────────────
  const { data } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (user?.id) {
        return CartAPI.load(user.id);
      } else {
        const guestItems = CartEngine.getGuestCart();
        return CartAPI.loadGuestCart(guestItems);
      }
    },
    // We always want this to run to hydrate the UI with product data
    enabled: true,
  });

  const cart = data?.items || [];
  const cartId = data?.cartId || null;

  // ─── Mutations ────────────────────────────────────────────────────────────

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => CartAPI.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }) =>
      CartAPI.update({ cartItemId: itemId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => CartAPI.clear(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ variantId, quantity }) =>
      CartAPI.add({ cartId, variantId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  // ─── Stable action callbacks ──────────────────────────────────────────────

  const removeItem = useCallback(
    (itemId) => removeItemMutation.mutate(itemId),
    [removeItemMutation]
  );

  const updateQuantity = useCallback(
    (itemId, quantity) => updateQuantityMutation.mutate({ itemId, quantity }),
    [updateQuantityMutation]
  );

  const clearCart = useCallback(
    () => clearCartMutation.mutate(),
    [clearCartMutation]
  );

  const addItem = useCallback(
    (productId, variantId, quantity = 1) =>
      addItemMutation.mutate({ variantId, quantity }),
    [addItemMutation]
  );

  // ─── Context values ──────────────────────────────────────────────────────

  const state = useMemo(
    () => ({
      cart,
      cartId,
      cartCount: cart.reduce((a, b) => a + (b.quantity || 0), 0),
    }),
    [cart, cartId]
  );

  const actions = useMemo(
    () => ({
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [addItem, removeItem, updateQuantity, clearCart]
  );

  return (
    <CartStateContext.Provider value={state}>
      <CartActionsContext.Provider value={actions}>
        {children}
      </CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useCartState = () => {
  const ctx = useContext(CartStateContext);
  if (!ctx) throw new Error("useCartState must be inside <CartProvider>");
  return ctx;
};

export const useCartActions = () => {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error("useCartActions must be inside <CartProvider>");
  return ctx;
};

// Combined convenience hook
export const useCart = () => ({ ...useCartState(), ...useCartActions() });