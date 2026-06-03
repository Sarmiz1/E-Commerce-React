import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { CartAPI } from "../../../api/cartApi";
import { useCartActions, useCartState } from "../../../Store/cartContext";
import { useAuth } from "../../../Store/useAuthStore";
import { useCartStore } from "../../../Store/useCartStore";
import { useToastStore } from "../../../Store/useToastStore";
import useShowErrorBoundary from "../../../hooks/useShowErrorBoundary";
import { queryClient } from "../../../queries/queryClient";
import {
  CART_TOTALS_FALLBACK,
  createCartAdditionFromItem,
  getCartItemName,
  getCartProductIds,
  readSavedForLater,
  validateCartForCheckout,
  writeSavedForLater,
} from "../utils/cartItemUtils";

const readGuestOrderNote = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("woosho_guest_cart_note") || "";
};
const toast = (message, type = "success") =>
  useToastStore.getState().addToast(message, type);

export default function useCartPageController() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const headingRef = useRef(null);
  const {
    updateQuantityAsync,
    removeItemAsync,
    addItemAsync,
    applyPromo,
  } = useCartActions();
  const { cart, cartId, totals, loading, error } = useCartState();

  useShowErrorBoundary(error);

  const cartItems = useMemo(() => (Array.isArray(cart) ? cart : []), [cart]);
  const cartRecommendationProductIds = useMemo(() => getCartProductIds(cartItems), [cartItems]);
  const {
    data: recommendations = [],
    isFetching: recommendationsFetching,
  } = useQuery({
    ...CartAPI.cartRecommendations(cartRecommendationProductIds, 8),
    enabled: !loading && cartRecommendationProductIds.length > 0,
    placeholderData: (previousData) => previousData ?? [],
  });

  const [undoItem, setUndoItem] = useState(null);
  const [guestSavedForLater, setGuestSavedForLater] = useState(() => readSavedForLater());
  const [orderNote, setOrderNote] = useState(readGuestOrderNote);
  const [noteStatus, setNoteStatus] = useState("");
  const [pendingItemActions, setPendingItemActions] = useState(() => new Set());
  const [undoPending, setUndoPending] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [displayRecommendations, setDisplayRecommendations] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const pendingItemActionsRef = useRef(new Set());
  const orderNoteDirtyRef = useRef(false);
  const {
    data: serverSavedForLater = [],
    refetch: refetchSavedForLater,
  } = useQuery({
    queryKey: ["saved-cart-items", user?.id],
    queryFn: CartAPI.loadSavedForLater,
    enabled: Boolean(user?.id),
    placeholderData: (previousData) => previousData ?? [],
  });
  const savedForLater = user?.id ? serverSavedForLater : guestSavedForLater;

  useEffect(() => {
    if (!user?.id) writeSavedForLater(guestSavedForLater);
  }, [guestSavedForLater, user?.id]);

  useEffect(() => {
    if (orderNoteDirtyRef.current) return;
    setOrderNote(totals?.order_note || "");
  }, [totals?.order_note]);

  useEffect(() => {
    if (loading || !orderNoteDirtyRef.current) return undefined;

    const timeoutId = window.setTimeout(async () => {
      setNoteStatus("Saving...");
      try {
        if (user?.id) {
          await CartAPI.updateOrderNote(cartId, orderNote);
        } else {
          window.localStorage.setItem("woosho_guest_cart_note", orderNote);
        }
        orderNoteDirtyRef.current = false;
        setNoteStatus("Saved");
      } catch {
        setNoteStatus("Could not save note");
        toast("Couldn't save the order note. Please try again.", "error");
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [cartId, loading, orderNote, user?.id]);

  const runItemAction = useCallback(async (scope, itemId, action) => {
    const key = `${scope}:${itemId}`;
    const itemKey = `item:${itemId}`;
    if (!itemId || pendingItemActionsRef.current.has(itemKey)) return false;

    pendingItemActionsRef.current.add(itemKey);
    pendingItemActionsRef.current.add(key);
    setPendingItemActions(new Set(pendingItemActionsRef.current));
    try {
      await action();
      return true;
    } finally {
      pendingItemActionsRef.current.delete(itemKey);
      pendingItemActionsRef.current.delete(key);
      setPendingItemActions(new Set(pendingItemActionsRef.current));
    }
  }, []);

  const isItemActionPending = useCallback(
    (scope, itemId) => pendingItemActions.has(`${scope}:${itemId}`),
    [pendingItemActions],
  );

  const syncAuthenticatedCart = useCallback(async () => {
    if (!user?.id) return;

    const nextCart = await CartAPI.load(user.id);
    useCartStore.getState().hydrate(nextCart);
    queryClient.setQueryData(["cart", user.id], nextCart);
    await queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
  }, [user?.id]);

  useEffect(() => {
    if (cartRecommendationProductIds.length === 0) {
      setDisplayRecommendations([]);
      return;
    }

    if (!recommendationsFetching) {
      setDisplayRecommendations(recommendations);
    }
  }, [cartRecommendationProductIds.length, recommendations, recommendationsFetching]);

  useEffect(() => {
    const handleQuickView = (event) => {
      if (event.detail) setQuickViewProduct(event.detail);
    };

    window.addEventListener("open-quickview", handleQuickView);
    return () => window.removeEventListener("open-quickview", handleQuickView);
  }, []);

  useEffect(() => {
    if (!headingRef.current) return undefined;

    const tween = gsap.fromTo(
      headingRef.current.querySelectorAll(".ct-head-item"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: "power3.out", clearProps: "all" },
    );

    return () => tween.kill();
  }, []);

  const {
    subtotal,
    discount,
    shipping,
    total,
    applied_promo: appliedPromo,
    applied_coupon: appliedCoupon,
    savings = 0,
    savings_ticker_message: savingsTickerMessage,
    shipping_progress: shippingProgress,
  } = totals || CART_TOTALS_FALLBACK;
  const promo = appliedPromo || appliedCoupon;

  const handleQtyChange = useCallback(
    async (itemId, newQty) => {
      if (newQty < 1 || newQty > 10) return;
      setCheckoutError("");
      try {
        await runItemAction("quantity", itemId, () =>
          updateQuantityAsync(itemId, newQty),
        );
      } catch {
        // The cart context reports the mutation error and restores the snapshot.
      }
    },
    [runItemAction, updateQuantityAsync],
  );

  const handleRemove = useCallback(
    async (item) => {
      await runItemAction("remove", item.id, async () => {
        setUndoItem({ id: item.id, name: getCartItemName(item), data: item });
        try {
          await removeItemAsync(item);
        } catch {
          setUndoItem(null);
        }
      });
    },
    [removeItemAsync, runItemAction],
  );

  const handleUndo = useCallback(async () => {
    if (!undoItem || undoPending) return;

    const itemToRestore = undoItem.data;
    setUndoItem(null);
    setUndoPending(true);

    try {
      const addition = createCartAdditionFromItem(itemToRestore);
      await addItemAsync(
        addition.productId,
        addition.variantId,
        addition.quantity,
        addition.product,
        addition.variant,
        { silentToast: true },
      );
      toast("Item restored.");
    } catch {
      setUndoItem(undoItem);
    } finally {
      setUndoPending(false);
    }
  }, [addItemAsync, undoItem, undoPending]);

  const handleSaveLater = useCallback(
    async (item) => {
      try {
        await runItemAction("save", item.id, async () => {
          if (user?.id) {
            await CartAPI.saveForLater(item.id);
            await Promise.all([syncAuthenticatedCart(), refetchSavedForLater()]);
            toast("Saved for later.");
            return;
          }

          setGuestSavedForLater((previous) =>
            previous.some((savedItem) => savedItem.id === item.id)
              ? previous
              : [...previous, item],
          );

          try {
            await removeItemAsync(item);
            toast("Saved for later.");
          } catch (error) {
            setGuestSavedForLater((previous) =>
              previous.filter((savedItem) => savedItem.id !== item.id),
            );
            throw error;
          }
        });
      } catch (error) {
        toast(error?.message || "Couldn't save that item for later.", "error");
      }
    },
    [refetchSavedForLater, removeItemAsync, runItemAction, syncAuthenticatedCart, user?.id],
  );

  const handleMoveToCart = useCallback(
    async (item) => {
      try {
        await runItemAction("move", item.id, async () => {
          if (user?.id) {
            await CartAPI.moveSavedToCart(item.id, cartId);
            await Promise.all([syncAuthenticatedCart(), refetchSavedForLater()]);
            toast("Moved to cart.");
            return;
          }

          setGuestSavedForLater((previous) =>
            previous.filter((savedItem) => savedItem.id !== item.id),
          );

          try {
            const addition = createCartAdditionFromItem(item);
            await addItemAsync(
              addition.productId,
              addition.variantId,
              addition.quantity,
              addition.product,
              addition.variant,
              { silentToast: true },
            );
            toast("Moved to cart.");
          } catch (error) {
            setGuestSavedForLater((previous) =>
              previous.some((savedItem) => savedItem.id === item.id)
                ? previous
                : [...previous, item],
            );
            throw error;
          }
        });
      } catch (error) {
        toast(error?.message || "Couldn't move that item to the cart.", "error");
      }
    },
    [addItemAsync, cartId, refetchSavedForLater, runItemAction, syncAuthenticatedCart, user?.id],
  );

  const handleOrderNoteChange = useCallback((value) => {
    orderNoteDirtyRef.current = true;
    setNoteStatus("");
    setOrderNote(value);
  }, []);

  const handleCheckout = useCallback(() => {
    const validationError = validateCartForCheckout(cartItems);
    if (validationError) {
      setCheckoutError(validationError);
      return;
    }

    setCheckoutError("");
    setIsCheckingOut(true);
    navigate("/checkout");
  }, [cartItems, navigate]);

  const handleRemovePromo = useCallback(() => {
    return applyPromo(null);
  }, [applyPromo]);

  const handleCloseQuickView = useCallback(() => setQuickViewProduct(null), []);

  return {
    addItemAsync,
    cartItems,
    checkoutError,
    discount,
    displayRecommendations,
    handleCheckout,
    handleCloseQuickView,
    handleMoveToCart,
    handleQtyChange,
    handleRemove,
    handleRemovePromo,
    handleSaveLater,
    handleUndo,
    headingRef,
    isCheckingOut,
    isEmpty: !loading && cartItems.length === 0,
    loading,
    navigate,
    orderNote,
    noteStatus,
    promo,
    quickViewProduct,
    recommendationsFetching,
    isItemActionPending,
    savedForLater,
    savings,
    savingsTickerMessage,
    shippingProgress,
    handleOrderNoteChange,
    setUndoItem,
    shipping,
    subtotal,
    total,
    undoItem,
    undoPending,
    applyPromo,
  };
}
