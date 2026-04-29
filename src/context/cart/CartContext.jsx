/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";
import { queryClient } from "../../queries/queryClient";

const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

const getCartItemKey = (item) => item?.id || item?.variant_id || item?.product_id;

const matchesGuestCartItem = (item, productId, variantId) => {
  if (variantId) return item?.variant_id === variantId;
  return !item?.variant_id && item?.product_id === productId;
};

const normalizeCartAddition = (item) => {
  const productId = item?.productId ?? item?.product_id ?? item?.id ?? null;
  const variantId = item?.variantId ?? item?.variant_id ?? null;
  const quantity = Math.max(Number(item?.quantity) || 1, 1);

  if (!productId && !variantId) return null;

  return { productId, variantId, quantity };
};

const mergeGuestCartAdditions = (guestCart, additions) =>
  additions.reduce((currentCart, addition) => {
    const hasExistingItem = currentCart.some((item) =>
      matchesGuestCartItem(item, addition.productId, addition.variantId),
    );

    if (hasExistingItem) {
      return currentCart.map((item) =>
        matchesGuestCartItem(item, addition.productId, addition.variantId)
          ? {
              ...item,
              quantity: (Number(item.quantity) || 0) + addition.quantity,
            }
          : item,
      );
    }

    return [
      ...currentCart,
      {
        product_id: addition.productId,
        variant_id: addition.variantId,
        quantity: addition.quantity,
      },
    ];
  }, guestCart);

const matchesCartItem = (item, target) => {
  const targetId = typeof target === "object" ? getCartItemKey(target) : target;

  return (
    item?.id === targetId ||
    item?.variant_id === targetId ||
    item?.product_id === targetId ||
    item?.products?.id === targetId
  );
};

export function CartProvider({ children }) {
  const { user } = useAuth();

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

  const cart = useMemo(() => data?.items || [], [data?.items]);
  const cartId = data?.cartId || null;

  // ─── Mutations ────────────────────────────────────────────────────────────

  const removeItemMutation = useMutation({
    mutationFn: async (itemRef) => {
      const cartItem = typeof itemRef === "object"
        ? itemRef
        : cart.find((item) => matchesCartItem(item, itemRef));
      const itemId = cartItem?.id || itemRef;

      if (user?.id) {
        return CartAPI.remove(itemId);
      }

      const guestCart = CartEngine.getGuestCart();
      const normalizedGuestId = typeof itemId === "string" && itemId.startsWith("guest_")
        ? itemId.slice("guest_".length)
        : itemId;
      const targetVariantId = cartItem?.variant_id || normalizedGuestId;
      const targetProductId = cartItem?.product_id || normalizedGuestId;

      const updatedGuestCart = guestCart.filter((item) => {
        if (cartItem?.variant_id) return item.variant_id !== targetVariantId;
        if (cartItem?.product_id) return item.product_id !== targetProductId;

        return item.variant_id !== normalizedGuestId && item.product_id !== normalizedGuestId;
      });

      CartEngine.setGuestCart(updatedGuestCart);

      return {
        cartId: null,
        items: cart.filter((item) => !matchesCartItem(item, itemRef)),
      };
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        return;
      }

      queryClient.setQueryData(["cart", undefined], data);
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
    mutationFn: async ({ productId, variantId, quantity = 1 }) => {
      if (user?.id) {
        return CartAPI.add({ cartId, productId, variantId, quantity });
      }

      if (!productId && !variantId) {
        throw new Error("Missing product information.");
      }

      const safeQuantity = Math.max(Number(quantity) || 1, 1);
      const guestCart = CartEngine.getGuestCart();
      const hasExistingItem = guestCart.some((item) => matchesGuestCartItem(item, productId, variantId));
      const updatedGuestCart = hasExistingItem
        ? guestCart.map((item) =>
            matchesGuestCartItem(item, productId, variantId)
              ? { ...item, quantity: (Number(item.quantity) || 0) + safeQuantity }
              : item,
          )
        : [
            ...guestCart,
            {
              product_id: productId,
              variant_id: variantId,
              quantity: safeQuantity,
            },
          ];

      CartEngine.setGuestCart(updatedGuestCart);
      return CartAPI.loadGuestCart(updatedGuestCart);
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        return;
      }

      queryClient.setQueryData(["cart", undefined], data);
    },
  });

  const addItemsMutation = useMutation({
    mutationFn: async (items = []) => {
      const additions = (Array.isArray(items) ? items : [items])
        .map(normalizeCartAddition)
        .filter(Boolean);

      if (user?.id) {
        let activeCartId = cartId;

        if (!activeCartId) {
          const loadedCart = await CartAPI.load(user.id);
          activeCartId = loadedCart?.cartId;
        }

        if (!activeCartId) {
          throw new Error("Cart not loaded yet. Please try again.");
        }

        await Promise.all(
          additions.map(({ productId, variantId, quantity }) =>
            CartAPI.add({
              cartId: activeCartId,
              productId,
              variantId,
              quantity,
            }),
          ),
        );

        return CartAPI.load(user.id);
      }

      const guestCart = CartEngine.getGuestCart();
      const updatedGuestCart = mergeGuestCartAdditions(guestCart, additions);

      CartEngine.setGuestCart(updatedGuestCart);
      return CartAPI.loadGuestCart(updatedGuestCart);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart", user?.id], data);

      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      }
    },
  });

  const {
    mutate: removeItemMutate,
    isPending: removingItem,
    isSuccess: removeItemSuccess,
    error: removeItemError,
  } = removeItemMutation;
  const {
    mutate: updateQuantityMutate,
    isPending: updatingQuantity,
    isSuccess: updateQuantitySuccess,
    error: updateQuantityError,
  } = updateQuantityMutation;
  const {
    mutate: clearCartMutate,
    isPending: clearingCart,
    isSuccess: clearCartSuccess,
    error: clearCartError,
  } = clearCartMutation;
  const {
    mutate: addItemMutate,
    isPending: addingItem,
    isSuccess: addItemSuccess,
    error: addItemError,
  } = addItemMutation;
  const {
    mutateAsync: addItemsMutateAsync,
    isPending: addingItems,
    isSuccess: addItemsSuccess,
    error: addItemsError,
  } = addItemsMutation;

  // ─── Stable action callbacks ──────────────────────────────────────────────

  const removeItem = useCallback(
    (itemId) => removeItemMutate(itemId),
    [removeItemMutate],
  );

  const updateQuantity = useCallback(
    (itemId, quantity) => updateQuantityMutate({ itemId, quantity }),
    [updateQuantityMutate],
  );

  const clearCart = useCallback(
    () => clearCartMutate(),
    [clearCartMutate],
  );

  const addItem = useCallback(
    (productId, variantId, quantity = 1) =>
      addItemMutate({ productId, variantId, quantity }),
    [addItemMutate],
  );

  const addItems = useCallback(
    (items) => addItemsMutateAsync(items),
    [addItemsMutateAsync],
  );

  // ─── Context values ──────────────────────────────────────────────────────

  const state = useMemo(
    () => ({
      cart,
      cartId,
      cartCount: cart.reduce((a, b) => a + (b.quantity || 0), 0),
    }),
    [cart, cartId],
  );

  const actions = useMemo(
  () => ({
    addItem,
    addItems,
    removeItem,
    updateQuantity,
    clearCart,

    addingItem,
    addItemSuccess,
    addItemError,

    addingItems,
    addItemsSuccess,
    addItemsError,

    removingItem,
    removeItemSuccess,
    removeItemError,

    updatingQuantity,
    updateQuantitySuccess,
    updateQuantityError,

    clearingCart,
    clearCartSuccess,
    clearCartError,
  }),
  [
    addItem,
    addItems,
    removeItem,
    updateQuantity,
    clearCart,
    addingItem,
    addItemSuccess,
    addItemError,
    addingItems,
    addItemsSuccess,
    addItemsError,
    removingItem,
    removeItemSuccess,
    removeItemError,
    updatingQuantity,
    updateQuantitySuccess,
    updateQuantityError,
    clearingCart,
    clearCartSuccess,
    clearCartError,
  ],
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
