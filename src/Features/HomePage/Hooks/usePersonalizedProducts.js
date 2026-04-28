import { useMemo } from "react";
import { getStoredAnalyticsEvents } from "../../../Utils/analytics";
import { useRecentlyViewed } from "../../Product/Hooks/useRecentlyViewed";

function productTokens(product) {
  return [
    product.name,
    product.category,
    product.description,
    product.seller?.store_name,
    ...(Array.isArray(product.keywords) ? product.keywords : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

export function usePersonalizedProducts(products) {
  const { recentlyViewed } = useRecentlyViewed();

  return useMemo(() => {
    const events = getStoredAnalyticsEvents();
    const recentIds = [
      ...recentlyViewed.map((item) => item.id),
      ...events.map((event) => event.productId).filter(Boolean),
    ];

    const intentTokens = new Set();
    const idBoost = new Map();

    recentIds.forEach((id, index) => {
      idBoost.set(id, (idBoost.get(id) || 0) + Math.max(1, 16 - index));
      const match = products.find((product) => product.id === id);
      productTokens(match || {}).forEach((token) => intentTokens.add(token));
    });

    const scored = products
      .map((product) => {
        const tokens = productTokens(product);
        const intentScore = tokens.reduce(
          (score, token) => score + (intentTokens.has(token) ? 3 : 0),
          0,
        );
        const popularityScore =
          (product.rating_stars || 0) * 2 + Math.log((product.rating_count || 0) + 1);
        const recencyScore = product.created_at ? 1 : 0;

        return {
          product,
          score: intentScore + popularityScore + recencyScore + (idBoost.get(product.id) || 0),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);

    const continueShopping = recentIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean)
      .filter((product, index, self) => self.findIndex((item) => item.id === product.id) === index)
      .slice(0, 6);

    return {
      forYou: scored.slice(0, 8),
      basedOnBrowsing: scored.filter((product) => !continueShopping.some((item) => item.id === product.id)).slice(0, 12),
      continueShopping,
      hasSignals: recentIds.length > 0,
    };
  }, [products, recentlyViewed]);
}
