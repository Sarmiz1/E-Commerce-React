import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { CartAPI } from "../../../api/cartApi";
import { useCartActions, useCartState } from "../../../Context/cart/CartContext";
import useShowErrorBoundary from "../../../Hooks/useShowErrorBoundary";
import {
  CART_TOTALS_FALLBACK,
  createCartAdditionFromItem,
  getCartItemName,
  getCartItemProductId,
  getCartItemVariantId,
  getCartProductIds,
  getCartSavingsCents,
  readSavedForLater,
  validateCartForCheckout,
  writeSavedForLater,
} from "../Utils/cartItemUtils";

export default function useCartPageController() {
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const {
    updateQuantity,
    removeItemAsync,
    addItemAsync,
    applyPromo,
    removingItemId,
    updatingQuantityItemId,
  } = useCartActions();
  const { cart, totals, loading, error } = useCartState();

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
  const [savedForLater, setSavedForLater] = useState(() => readSavedForLater());
  const [orderNote, setOrderNote] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [displayRecommendations, setDisplayRecommendations] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    writeSavedForLater(savedForLater);
  }, [savedForLater]);

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
    applied_promo: promo,
  } = totals || CART_TOTALS_FALLBACK;
  const savings = getCartSavingsCents({ subtotal, discount, shipping, promo });

  const handleQtyChange = useCallback(
    (itemId, newQty) => {
      if (newQty < 1 || newQty > 10) return;
      setCheckoutError("");
      updateQuantity(itemId, newQty);
    },
    [updateQuantity],
  );

  const handleRemove = useCallback(
    async (item) => {
      setUndoItem({ id: item.id, name: getCartItemName(item), data: item });
      try {
        await removeItemAsync(item);
      } catch {
        setUndoItem(null);
      }
    },
    [removeItemAsync],
  );

  const handleUndo = useCallback(async () => {
    if (!undoItem) return;

    const itemToRestore = undoItem.data;
    setUndoItem(null);

    try {
      await addItemAsync(
        getCartItemProductId(itemToRestore),
        getCartItemVariantId(itemToRestore),
        itemToRestore.quantity,
      );
    } catch {
      setUndoItem(undoItem);
    }
  }, [addItemAsync, undoItem]);

  const handleSaveLater = useCallback(
    async (item) => {
      setSavedForLater((previous) =>
        previous.some((savedItem) => savedItem.id === item.id) ? previous : [...previous, item],
      );

      try {
        await removeItemAsync(item);
      } catch {
        setSavedForLater((previous) => previous.filter((savedItem) => savedItem.id !== item.id));
      }
    },
    [removeItemAsync],
  );

  const handleMoveToCart = useCallback(
    async (item) => {
      setSavedForLater((previous) => previous.filter((savedItem) => savedItem.id !== item.id));

      try {
        const addition = createCartAdditionFromItem(item);
        await addItemAsync(addition.productId, addition.variantId, addition.quantity);
      } catch {
        setSavedForLater((previous) =>
          previous.some((savedItem) => savedItem.id === item.id) ? previous : [...previous, item],
        );
      }
    },
    [addItemAsync],
  );

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
    applyPromo(null).catch(() => {});
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
    promo,
    quickViewProduct,
    recommendationsFetching,
    removingItemId,
    savedForLater,
    savings,
    setOrderNote,
    setUndoItem,
    shipping,
    subtotal,
    total,
    undoItem,
    updatingQuantityItemId,
    applyPromo,
  };
}
