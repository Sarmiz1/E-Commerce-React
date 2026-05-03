/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../store/useAuthStore";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";
import { queryClient } from "../../queries/queryClient";
import { useToastStore } from "../../store/useToastStore";
import {
  useCartStore,
  selectCartCount,
  getItemKey,
} from "../../store/useCartStore";

const toast = (msg, type = "success") =>
  useToastStore.getState().addToast(msg, type);

const normalizeCartAddition = (item) => {
  const product = item?.product ?? item?.products ?? null;
  const variants = product?.product_variants || product?.variants || [];
  const variantId =
    item?.variantId ??
    item?.variant_id ??
    item?.variant?.id ??
    variants.find((v) => v?.id)?.id ??
    null;
  const variant =
    item?.variant ??
    variants.find((c) => c?.id === variantId) ??
    null;
  const productId =
    item?.productId ?? item?.product_id ?? product?.id ?? item?.id ?? null;
  const quantity = Math.max(Number(item?.quantity) || 1, 1);

  if (!productId || !variantId) return null;
  return { productId, variantId, quantity, product, variant };
};

const CartActionsContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }) {
  const { user } = useAuth();
  const store = useCartStore;

  // ─── 1. TanStack Query — fetch cart & hydrate Zustand ─────────────────────
  const { data, isLoading, isFetching, error, status } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      return user?.id
        ? await CartAPI.load(user.id)
        : await CartAPI.loadGuestCart(CartEngine.getGuestCart());
    },
    enabled: true,
  });

  // Sync server data into Zustand
  useEffect(() => {
    if (data) store.getState().hydrate(data);
  }, [data, store]);

  // Sync loading/fetching flags into Zustand
  useEffect(() => { store.getState().setLoading(isLoading); }, [isLoading, store]);
  useEffect(() => { store.getState().setFetching(isFetching); }, [isFetching, store]);
  useEffect(() => {
    if (error) store.getState().setError(error);
  }, [error, store]);

  // ─── 2. Mutations — Zustand optimistic → TanStack server sync ─────────────

  // ── ADD ITEM ──────────────────────────────────────────────────────────────
  const addItemMutation = useMutation({
    onMutate: async ({ productId, variantId, quantity = 1, product, variant }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", user?.id] });
      // 1. Zustand optimistic update (instant UI)
      const snapshot = store.getState().addItemOptimistic({
        productId, variantId, quantity, product, variant,
      });
      // 2. Toast
      toast("Added to cart! 🛒", "success");
      // Also snapshot guest cart for rollback
      const guestSnapshot = !user?.id ? CartEngine.getGuestCart() : null;
      return { snapshot, guestSnapshot };
    },

    mutationFn: async ({ productId, variantId, quantity = 1 }) => {
      // 3. TanStack sends to Supabase
      if (user?.id) {
        let activeCartId = store.getState().cartId;
        if (!activeCartId) {
          const loaded = await CartAPI.load(user.id);
          activeCartId = loaded?.cartId;
        }
        if (!activeCartId) throw new Error("Could not initialize cart.");
        await CartAPI.add({ cartId: activeCartId, productId, variantId, quantity });
        return CartAPI.load(user.id);
      }

      // Guest flow — persist to localStorage + hydrate product data
      const safeQuantity = Math.max(Number(quantity) || 1, 1);
      const guestCart = CartEngine.getGuestCart();
      const exists = guestCart.some((i) =>
        variantId
          ? i.variant_id === variantId
          : !i.variant_id && i.product_id === productId,
      );
      const updated = exists
        ? guestCart.map((i) =>
            (variantId ? i.variant_id === variantId : !i.variant_id && i.product_id === productId)
              ? { ...i, quantity: (Number(i.quantity) || 0) + safeQuantity }
              : i,
          )
        : [...guestCart, { product_id: productId, variant_id: variantId, quantity: safeQuantity }];

      CartEngine.setGuestCart(updated);
      return CartAPI.loadGuestCart(updated);
    },

    onSuccess: (data) => {
      // 4. Hydrate Zustand with authoritative server data
      store.getState().hydrate(data);
      // Invalidate so any stale queries also refetch
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },

    onError: (_error, _vars, context) => {
      // 5. Rollback Zustand
      if (context?.snapshot) store.getState().rollback(context.snapshot);
      if (!user?.id && context?.guestSnapshot) {
        CartEngine.setGuestCart(context.guestSnapshot);
      }
      // 6. Error toast
      toast("Couldn't add to cart. Please try again.", "error");
    },
  });

  // ── REMOVE ITEM ───────────────────────────────────────────────────────────
  const removeItemMutation = useMutation({
    onMutate: async (itemRef) => {
      await queryClient.cancelQueries({ queryKey: ["cart", user?.id] });
      const snapshot = store.getState().removeItemOptimistic(itemRef);
      const guestSnapshot = !user?.id ? CartEngine.getGuestCart() : null;
      return { snapshot, guestSnapshot };
    },

    mutationFn: async (itemRef) => {
      const cart = store.getState().cart;
      const cartItem =
        typeof itemRef === "object"
          ? itemRef
          : cart.find((i) =>
              i?.id === itemRef || i?.variant_id === itemRef || i?.product_id === itemRef,
            );
      const itemId = cartItem?.id || itemRef;

      if (user?.id) {
        await CartAPI.remove(itemId);
        return CartAPI.load(user.id);
      }

      // Guest flow
      const guestCart = CartEngine.getGuestCart();
      const targetVariantId = cartItem?.variant_id;
      const targetProductId = cartItem?.product_id;

      const updatedGuest = guestCart.filter((i) => {
        if (targetVariantId) return i.variant_id !== targetVariantId;
        if (targetProductId) return i.product_id !== targetProductId;
        return true;
      });
      CartEngine.setGuestCart(updatedGuest);
      return CartAPI.loadGuestCart(updatedGuest);
    },

    onSuccess: (data) => {
      store.getState().hydrate(data);
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },

    onError: (_error, _itemRef, context) => {
      if (context?.snapshot) store.getState().rollback(context.snapshot);
      if (!user?.id && context?.guestSnapshot) {
        CartEngine.setGuestCart(context.guestSnapshot);
      }
    },
  });

  // ── UPDATE QUANTITY ───────────────────────────────────────────────────────
  const updateQuantityMutation = useMutation({
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", user?.id] });
      const safeQty = Math.max(Number(quantity) || 1, 1);
      const snapshot = store.getState().updateQuantityOptimistic(itemId, safeQty);
      const guestSnapshot = !user?.id ? CartEngine.getGuestCart() : null;
      return { snapshot, guestSnapshot };
    },

    mutationFn: async ({ itemId, quantity }) => {
      const safeQty = Math.max(Number(quantity) || 1, 1);
      const cart = store.getState().cart;
      const cartItem =
        typeof itemId === "object"
          ? itemId
          : cart.find((i) =>
              i?.id === itemId || i?.variant_id === itemId || i?.product_id === itemId,
            );
      const resolvedId = getItemKey(cartItem) || itemId;

      if (user?.id) {
        await CartAPI.update({ cartItemId: resolvedId, quantity: safeQty });
        return CartAPI.load(user.id);
      }

      // Guest flow
      const guestCart = CartEngine.getGuestCart();
      const targetVariantId = cartItem?.variant_id;
      const targetProductId = cartItem?.product_id;

      const updatedGuest = guestCart.map((i) => {
        const isMatch = targetVariantId
          ? i.variant_id === targetVariantId
          : targetProductId
            ? i.product_id === targetProductId
            : false;
        return isMatch ? { ...i, quantity: safeQty } : i;
      });
      CartEngine.setGuestCart(updatedGuest);
      return CartAPI.loadGuestCart(updatedGuest);
    },

    onSuccess: (data) => {
      store.getState().hydrate(data);
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },

    onError: (_error, _vars, context) => {
      if (context?.snapshot) store.getState().rollback(context.snapshot);
      if (!user?.id && context?.guestSnapshot) {
        CartEngine.setGuestCart(context.guestSnapshot);
      }
    },
  });

  // ── CLEAR CART ────────────────────────────────────────────────────────────
  const clearCartMutation = useMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart", user?.id] });
      const snapshot = store.getState().clearCartOptimistic();
      const guestSnapshot = !user?.id ? CartEngine.getGuestCart() : null;
      return { snapshot, guestSnapshot };
    },

    mutationFn: async () => {
      if (user?.id) {
        const cartId = store.getState().cartId;
        await CartAPI.clear(cartId);
        return CartAPI.load(user.id);
      }
      CartEngine.setGuestCart([]);
      return { cartId: null, items: [], totals: { subtotal: 0, discount: 0, shipping: 0, total: 0, applied_promo: null } };
    },

    onSuccess: (data) => {
      store.getState().hydrate(data);
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },

    onError: (_error, _vars, context) => {
      if (context?.snapshot) store.getState().rollback(context.snapshot);
      if (!user?.id && context?.guestSnapshot) {
        CartEngine.setGuestCart(context.guestSnapshot);
      }
    },
  });

  // ── ADD ITEMS (BULK) ──────────────────────────────────────────────────────
  const addItemsMutation = useMutation({
    onMutate: async (items = []) => {
      await queryClient.cancelQueries({ queryKey: ["cart", user?.id] });
      const additions = (Array.isArray(items) ? items : [items])
        .map(normalizeCartAddition)
        .filter(Boolean);

      // Optimistic — add each item to Zustand
      let snapshot = null;
      for (const addition of additions) {
        snapshot = store.getState().addItemOptimistic(addition);
      }
      const guestSnapshot = !user?.id ? CartEngine.getGuestCart() : null;
      return { snapshot, guestSnapshot };
    },

    mutationFn: async (items = []) => {
      const additions = (Array.isArray(items) ? items : [items])
        .map(normalizeCartAddition)
        .filter(Boolean);

      if (!additions.length) throw new Error("No valid cart items to add.");

      if (user?.id) {
        let activeCartId = store.getState().cartId;
        if (!activeCartId) {
          const loaded = await CartAPI.load(user.id);
          activeCartId = loaded?.cartId;
        }
        if (!activeCartId) throw new Error("Cart not loaded yet. Please try again.");

        await CartAPI.addBulk({ cartId: activeCartId, items: additions });
        return CartAPI.load(user.id);
      }

      // Guest bulk add
      const guestCart = CartEngine.getGuestCart();
      const updated = additions.reduce((cart, addition) => {
        const exists = cart.some((i) =>
          addition.variantId
            ? i.variant_id === addition.variantId
            : !i.variant_id && i.product_id === addition.productId,
        );
        if (exists) {
          return cart.map((i) =>
            (addition.variantId ? i.variant_id === addition.variantId : !i.variant_id && i.product_id === addition.productId)
              ? { ...i, quantity: (Number(i.quantity) || 0) + addition.quantity }
              : i,
          );
        }
        return [...cart, { product_id: addition.productId, variant_id: addition.variantId, quantity: addition.quantity }];
      }, guestCart);

      CartEngine.setGuestCart(updated);
      return CartAPI.loadGuestCart(updated);
    },

    onSuccess: (data) => {
      store.getState().hydrate(data);
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },

    onError: (_error, _items, context) => {
      if (context?.snapshot) store.getState().rollback(context.snapshot);
      if (!user?.id && context?.guestSnapshot) {
        CartEngine.setGuestCart(context.guestSnapshot);
      }
      toast("Couldn't add items to cart. Please try again.", "error");
    },
  });

  // ── APPLY PROMO ───────────────────────────────────────────────────────────
  const applyPromoMutation = useMutation({
    mutationFn: async (promoCode) => {
      const cartId = store.getState().cartId;
      if (!user?.id) throw new Error("Log in to apply promo codes.");
      return CartAPI.applyPromo(cartId, promoCode);
    },
    onSuccess: (totalsData) => {
      store.getState().setTotals(totalsData);
    },
  });

  // ─── Destructure mutation state ───────────────────────────────────────────

  const { mutate: addItemMutate, mutateAsync: addItemMutateAsync, isPending: addingItem, isSuccess: addItemSuccess, error: addItemError } = addItemMutation;
  const { mutate: removeItemMutate, mutateAsync: removeItemMutateAsync, isPending: removingItem, variables: removeItemVariables, isSuccess: removeItemSuccess, error: removeItemError } = removeItemMutation;
  const { mutate: updateQuantityMutate, mutateAsync: updateQuantityMutateAsync, isPending: updatingQuantity, variables: updateQuantityVariables, isSuccess: updateQuantitySuccess, error: updateQuantityError } = updateQuantityMutation;
  const { mutate: clearCartMutate, isPending: clearingCart, isSuccess: clearCartSuccess, error: clearCartError } = clearCartMutation;
  const { mutateAsync: addItemsMutateAsync, isPending: addingItems, isSuccess: addItemsSuccess, error: addItemsError } = addItemsMutation;
  const { mutateAsync: applyPromoMutateAsync, isPending: applyingPromo } = applyPromoMutation;

  // ─── Stable action callbacks ──────────────────────────────────────────────

  const addItem = useCallback(
    (productId, variantId, quantity = 1) =>
      addItemMutate({ productId, variantId, quantity }),
    [addItemMutate],
  );
  const addItemAsync = useCallback(
    (productId, variantId, quantity = 1) =>
      addItemMutateAsync({ productId, variantId, quantity }),
    [addItemMutateAsync],
  );
  const removeItem = useCallback((id) => removeItemMutate(id), [removeItemMutate]);
  const removeItemAsync = useCallback((id) => removeItemMutateAsync(id), [removeItemMutateAsync]);
  const updateQuantity = useCallback(
    (itemId, quantity) => updateQuantityMutate({ itemId, quantity }),
    [updateQuantityMutate],
  );
  const updateQuantityAsync = useCallback(
    (itemId, quantity) => updateQuantityMutateAsync({ itemId, quantity }),
    [updateQuantityMutateAsync],
  );
  const clearCart = useCallback(() => clearCartMutate(), [clearCartMutate]);
  const addItems = useCallback(
    (items) => addItemsMutateAsync(items),
    [addItemsMutateAsync],
  );
  const applyPromo = useCallback(
    (promoCode) => applyPromoMutateAsync(promoCode),
    [applyPromoMutateAsync],
  );

  // ─── Derived IDs for "which item is being mutated" ────────────────────────
  const removingItemId = getItemKey(removeItemVariables);
  const updatingQuantityItemId = getItemKey(updateQuantityVariables?.itemId);

  // ─── Actions context value ────────────────────────────────────────────────
  const actions = useMemo(
    () => ({
      addItem,
      addItemAsync,
      addItems,
      removeItem,
      removeItemAsync,
      updateQuantity,
      updateQuantityAsync,
      clearCart,
      applyPromo,

      addingItem,
      addItemSuccess,
      addItemError,

      addingItems,
      addItemsSuccess,
      addItemsError,

      removingItem: removingItem ? removingItemId || true : false,
      removingItemId,
      removeItemSuccess,
      removeItemError,

      updatingQuantity,
      updatingQuantityItemId,
      updateQuantitySuccess,
      updateQuantityError,

      clearingCart,
      clearCartSuccess,
      clearCartError,

      applyingPromo,
    }),
    [
      addItem, addItemAsync, addItems, removeItem, removeItemAsync,
      updateQuantity, updateQuantityAsync, clearCart, applyPromo,
      addingItem, addItemSuccess, addItemError,
      addingItems, addItemsSuccess, addItemsError,
      removingItem, removingItemId, removeItemSuccess, removeItemError,
      updatingQuantity, updatingQuantityItemId, updateQuantitySuccess, updateQuantityError,
      clearingCart, clearCartSuccess, clearCartError, applyingPromo,
    ],
  );

  return (
    <CartActionsContext.Provider value={actions}>
      {children}
    </CartActionsContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** State hook — reads from Zustand (single source of truth) */
export const useCartState = () => {
  const cart = useCartStore((s) => s.cart);
  const cartId = useCartStore((s) => s.cartId);
  const totals = useCartStore((s) => s.totals);
  const loading = useCartStore((s) => s.loading);
  const fetching = useCartStore((s) => s.fetching);
  const error = useCartStore((s) => s.error);
  const status = useCartStore((s) => s.status);

  return useMemo(
    () => ({
      cart,
      cartId,
      totals,
      cartCount: cart.reduce((a, b) => a + (b.quantity || 0), 0),
      loading,
      fetching,
      error,
      status,
    }),
    [cart, cartId, totals, loading, fetching, error, status],
  );
};

/** Actions hook — reads from context (mutation wrappers) */
export const useCartActions = () => {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error("useCartActions must be inside <CartProvider>");
  return ctx;
};

/** Combined convenience hook */
export const useCart = () => ({ ...useCartState(), ...useCartActions() });
