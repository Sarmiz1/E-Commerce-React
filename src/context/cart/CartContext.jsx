/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../../Cart/cartEngine";
import { queryClient } from "../../queries/queryClient";

const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

const getCartItemKey = (item) => {
  if (!item || typeof item !== "object") return item;
  return item?.id || item?.variant_id || item?.product_id;
};

const matchesGuestCartItem = (item, productId, variantId) => {
  if (variantId) return item?.variant_id === variantId;
  return !item?.variant_id && item?.product_id === productId;
};

const normalizeCartAddition = (item) => {
  const product = item?.product ?? item?.products ?? null;
  const variants = product?.product_variants || product?.variants || [];
  const variantId =
    item?.variantId ??
    item?.variant_id ??
    item?.variant?.id ??
    variants.find((variant) => variant?.id)?.id ??
    null;
  const variant =
    item?.variant ??
    variants.find((candidate) => candidate?.id === variantId) ??
    null;
  const productId =
    item?.productId ??
    item?.product_id ??
    product?.id ??
    item?.id ??
    null;
  const quantity = Math.max(Number(item?.quantity) || 1, 1);

  if (!productId || !variantId) return null;

  return { productId, variantId, quantity, product, variant };
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

const mergeCartAdditions = (cartItems, additions) =>
  additions.reduce((currentCart, addition) => {
    const existingItem = currentCart.find((item) =>
      matchesGuestCartItem(item, addition.productId, addition.variantId),
    );

    if (existingItem) {
      return currentCart.map((item) =>
        matchesGuestCartItem(item, addition.productId, addition.variantId)
          ? {
              ...item,
              quantity: (Number(item.quantity) || 0) + addition.quantity,
            }
          : item,
      );
    }

    const product = addition.product || {};
    const variant = addition.variant || {};
    const price = variant.price_cents ?? product.price_cents ?? 0;

    return [
      ...currentCart,
      {
        id: `optimistic_${addition.variantId}`,
        quantity: addition.quantity,
        variant_id: addition.variantId,
        product_id: addition.productId,
        products: {
          id: addition.productId,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price_cents: price,
          rating_stars: product.rating_stars,
          rating_count: product.rating_count,
        },
        variant: {
          id: addition.variantId,
          color: variant.color,
          size: variant.size,
          price_cents: price,
        },
        name: product.name,
        image: product.image,
        thumbnail: product.image,
        price,
        optimistic: true,
      },
    ];
  }, cartItems);

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
  const { data, isLoading, isFetching, error, status } = useQuery({
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
    onMutate: async (itemRef) => {
      const cartQueryKey = ["cart", user?.id];

      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);
      const previousGuestCart = !user?.id ? CartEngine.getGuestCart() : null;
      const currentItems = previousCart?.items || cart;

      queryClient.setQueryData(cartQueryKey, {
        cartId: previousCart?.cartId ?? cartId,
        items: currentItems.filter((item) => !matchesCartItem(item, itemRef)),
      });

      return { cartQueryKey, previousCart, previousGuestCart };
    },
    onError: (_error, _itemRef, context) => {
      if (context?.cartQueryKey) {
        queryClient.setQueryData(
          context.cartQueryKey,
          context.previousCart || { cartId, items: cart },
        );
      }

      if (!user?.id && context?.previousGuestCart) {
        CartEngine.setGuestCart(context.previousGuestCart);
      }
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
    mutationFn: async ({ itemId, quantity }) => {
      const safeQuantity = Math.max(Number(quantity) || 1, 1);
      const cartItem = typeof itemId === "object"
        ? itemId
        : cart.find((item) => matchesCartItem(item, itemId));
      const resolvedItemId = getCartItemKey(cartItem) || itemId;

      if (user?.id) {
        return CartAPI.update({ cartItemId: resolvedItemId, quantity: safeQuantity });
      }

      const guestCart = CartEngine.getGuestCart();
      const normalizedGuestId = typeof resolvedItemId === "string" && resolvedItemId.startsWith("guest_")
        ? resolvedItemId.slice("guest_".length)
        : resolvedItemId;
      const targetVariantId = cartItem?.variant_id || normalizedGuestId;
      const targetProductId = cartItem?.product_id || normalizedGuestId;

      const updatedGuestCart = guestCart.map((item) => {
        const isMatch = cartItem?.variant_id
          ? item.variant_id === targetVariantId
          : cartItem?.product_id
            ? item.product_id === targetProductId
            : item.variant_id === normalizedGuestId || item.product_id === normalizedGuestId;

        return isMatch ? { ...item, quantity: safeQuantity } : item;
      });

      CartEngine.setGuestCart(updatedGuestCart);
      return CartAPI.loadGuestCart(updatedGuestCart);
    },
    onMutate: async ({ itemId, quantity }) => {
      const cartQueryKey = ["cart", user?.id];
      const safeQuantity = Math.max(Number(quantity) || 1, 1);

      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);
      const previousGuestCart = !user?.id ? CartEngine.getGuestCart() : null;
      const currentItems = previousCart?.items || cart;

      queryClient.setQueryData(cartQueryKey, {
        cartId: previousCart?.cartId ?? cartId,
        items: currentItems.map((item) =>
          matchesCartItem(item, itemId)
            ? { ...item, quantity: safeQuantity }
            : item,
        ),
      });

      return { cartQueryKey, previousCart, previousGuestCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.cartQueryKey) {
        queryClient.setQueryData(
          context.cartQueryKey,
          context.previousCart || { cartId, items: cart },
        );
      }

      if (!user?.id && context?.previousGuestCart) {
        CartEngine.setGuestCart(context.previousGuestCart);
      }
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        return;
      }

      queryClient.setQueryData(["cart", undefined], data);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (user?.id) return CartAPI.clear(cartId);

      CartEngine.setGuestCart([]);
      return { cartId: null, items: [] };
    },
    onMutate: async () => {
      const cartQueryKey = ["cart", user?.id];

      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);
      const previousGuestCart = !user?.id ? CartEngine.getGuestCart() : null;

      queryClient.setQueryData(cartQueryKey, {
        cartId: previousCart?.cartId ?? cartId,
        items: [],
      });

      return { cartQueryKey, previousCart, previousGuestCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.cartQueryKey) {
        queryClient.setQueryData(
          context.cartQueryKey,
          context.previousCart || { cartId, items: cart },
        );
      }

      if (!user?.id && context?.previousGuestCart) {
        CartEngine.setGuestCart(context.previousGuestCart);
      }
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        return;
      }

      queryClient.setQueryData(["cart", undefined], data);
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

      if (!additions.length) {
        throw new Error("No valid cart items to add.");
      }

      if (user?.id) {
        let activeCartId = cartId;

        if (!activeCartId) {
          const loadedCart = await CartAPI.load(user.id);
          activeCartId = loadedCart?.cartId;
        }

        if (!activeCartId) {
          throw new Error("Cart not loaded yet. Please try again.");
        }

        await CartAPI.addBulk({
          cartId: activeCartId,
          items: additions,
        });

        return CartAPI.load(user.id);
      }

      const guestCart = CartEngine.getGuestCart();
      const updatedGuestCart = mergeGuestCartAdditions(guestCart, additions);

      CartEngine.setGuestCart(updatedGuestCart);
      return CartAPI.loadGuestCart(updatedGuestCart);
    },
    onMutate: async (items = []) => {
      const additions = (Array.isArray(items) ? items : [items])
        .map(normalizeCartAddition)
        .filter(Boolean);
      const cartQueryKey = ["cart", user?.id];

      if (!additions.length) return { cartQueryKey };

      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);
      const previousGuestCart = !user?.id ? CartEngine.getGuestCart() : null;
      const currentItems = previousCart?.items || cart;

      queryClient.setQueryData(cartQueryKey, {
        cartId: previousCart?.cartId ?? cartId,
        items: mergeCartAdditions(currentItems, additions),
      });

      return { cartQueryKey, previousCart, previousGuestCart };
    },
    onError: (_error, _items, context) => {
      if (context?.cartQueryKey) {
        queryClient.setQueryData(
          context.cartQueryKey,
          context.previousCart || { cartId, items: cart },
        );
      }

      if (!user?.id && context?.previousGuestCart) {
        CartEngine.setGuestCart(context.previousGuestCart);
      }
    },
    onSuccess: (data, _items, context) => {
      queryClient.setQueryData(context?.cartQueryKey || ["cart", user?.id], data);
    },
  });

  const {
    mutate: removeItemMutate,
    isPending: removingItem,
    variables: removeItemVariables,
    isSuccess: removeItemSuccess,
    error: removeItemError,
  } = removeItemMutation;
  const {
    mutate: updateQuantityMutate,
    isPending: updatingQuantity,
    variables: updateQuantityVariables,
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
      loading: isLoading,
      fetching: isFetching,
      error,
      status,
    }),
    [cart, cartId, error, isFetching, isLoading, status],
  );

  const removingItemId = getCartItemKey(removeItemVariables);
  const updatingQuantityItemId = getCartItemKey(updateQuantityVariables?.itemId);

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
