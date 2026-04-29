import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "../../../../Context/theme/ThemeContext";
import {
  getDominantColor,
  injectDynamicTheme,
} from "../../../../Utils/dynamicTheme";
import {
  getSeedReviews,
  hasPriceAlert,
  loadReviews,
  saveReviews,
} from "../Utils/productHelpers";
import { useWishlist } from "../../../../Hooks/useWishlist";

export function useProductDetail(product) {
  const productId = product?.id;
  const { isDark } = useTheme();

  const user = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("WooSho-user");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }, []);

  const { isWishlisted: wishlisted, toggleWishlist } = useWishlist(productId);
  const [reviews, setReviews] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [hasAlert, setHasAlert] = useState(() => hasPriceAlert(productId));

  useEffect(() => {
    if (!product) return;
    const storedReviews = loadReviews(product.id);
    setReviews(
      storedReviews.length > 0 ? storedReviews : getSeedReviews(product),
    );
  }, [product?.id]);

  const handleAddReview = useCallback(
    (review) => {
      setReviews((previousReviews) => {
        const updatedReviews = [review, ...previousReviews];
        if (product) saveReviews(product.id, updatedReviews);
        return updatedReviews;
      });
    },
    [product?.id, product],
  );

  useEffect(() => {
    if (!product?.image) return;
    getDominantColor(product.image).then((color) => injectDynamicTheme(color));
  }, [product?.image]);

  return {
    isDark,
    user,
    wishlisted,
    reviews,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    alertOpen,
    setAlertOpen,
    hasAlert,
    setHasAlert,
    toggleWishlist,
    handleAddReview,
  };
}
