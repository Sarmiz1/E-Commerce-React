import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "woosho_recently_viewed";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addProduct = useCallback((product) => {
    if (!product?.id) return;
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const entry = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price_cents: product.price_cents,
        rating_stars: product.rating_stars,
      };
      return [entry, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  return { recentlyViewed: items, addProduct };
}
