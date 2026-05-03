/**
 * useCartStore — Zustand global cart store
 *
 * Single source of truth for cart UI state.
 * TanStack Query hydrates this store via `hydrate()`.
 * Optimistic helpers return snapshots for rollback on error.
 *
 * Usage:
 *   import { useCartStore } from "@/store/useCartStore";
 *   const cart = useCartStore((s) => s.cart);
 */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getItemKey = (item) => {
  if (!item || typeof item !== "object") return item;
  return item?.id || item?.variant_id || item?.product_id;
};

const matchesItem = (item, target) => {
  const id = typeof target === "object" ? getItemKey(target) : target;
  return (
    item?.id === id ||
    item?.variant_id === id ||
    item?.product_id === id ||
    item?.products?.id === id
  );
};

const matchesByVariantOrProduct = (item, productId, variantId) => {
  if (variantId) return item?.variant_id === variantId;
  return !item?.variant_id && item?.product_id === productId;
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCartStore = create(
  devtools(
    immer((set, get) => ({
      cart: [],
      cartId: null,
      totals: {
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        applied_promo: null,
      },
      loading: true,
      fetching: false,
      error: null,
      status: "pending",

      // ─── Hydrate from server data ──────────────────────────────────────
      hydrate: (data) =>
        set((s) => {
          if (data?.cartId !== undefined) s.cartId = data.cartId;
          if (data?.items) s.cart = data.items;
          if (data?.totals) s.totals = data.totals;
          s.loading = false;
          s.error = null;
          s.status = "success";
        }),

      setLoading: (v) => set((s) => { s.loading = v; }),
      setFetching: (v) => set((s) => { s.fetching = v; }),
      setError: (e) => set((s) => { s.error = e; s.status = "error"; s.loading = false; }),

      // ─── Optimistic: Add ───────────────────────────────────────────────
      // Returns a snapshot of the previous cart for rollback.
      addItemOptimistic: ({ productId, variantId, quantity = 1, product, variant }) => {
        const snapshot = get().cart.map((i) => ({ ...i }));

        set((s) => {
          const idx = s.cart.findIndex((i) =>
            matchesByVariantOrProduct(i, productId, variantId),
          );

          if (idx >= 0) {
            s.cart[idx].quantity = (s.cart[idx].quantity || 0) + quantity;
          } else {
            const price = variant?.price_cents ?? product?.price_cents ?? 0;
            s.cart.push({
              id: `optimistic_${variantId || productId}_${Date.now()}`,
              product_id: productId,
              variant_id: variantId,
              quantity,
              unit_price_cents: price,
              line_total_cents: price * quantity,
              products: {
                id: productId,
                name: product?.name,
                slug: product?.slug,
                image: product?.image,
                price_cents: price,
                rating_stars: product?.rating_stars,
                rating_count: product?.rating_count,
              },
              variant: {
                id: variantId,
                color: variant?.color,
                size: variant?.size,
                price_cents: variant?.price_cents,
              },
              name: product?.name,
              image: product?.image,
              thumbnail: product?.image,
              price,
              optimistic: true,
            });
          }
        });

        return snapshot;
      },

      // ─── Optimistic: Remove ────────────────────────────────────────────
      removeItemOptimistic: (itemRef) => {
        const snapshot = get().cart.map((i) => ({ ...i }));
        set((s) => {
          s.cart = s.cart.filter((i) => !matchesItem(i, itemRef));
        });
        return snapshot;
      },

      // ─── Optimistic: Update Quantity ───────────────────────────────────
      updateQuantityOptimistic: (itemId, quantity) => {
        const snapshot = get().cart.map((i) => ({ ...i }));
        set((s) => {
          const item = s.cart.find((i) => matchesItem(i, itemId));
          if (item) item.quantity = Math.max(Number(quantity) || 1, 1);
        });
        return snapshot;
      },

      // ─── Optimistic: Clear ─────────────────────────────────────────────
      clearCartOptimistic: () => {
        const snapshot = get().cart.map((i) => ({ ...i }));
        set((s) => { s.cart = []; });
        return snapshot;
      },

      // ─── Rollback ──────────────────────────────────────────────────────
      rollback: (snapshot) =>
        set((s) => { s.cart = snapshot; }),

      // ─── Update totals only (for promo codes) ──────────────────────────
      setTotals: (totals) =>
        set((s) => { s.totals = totals; }),
    })),
    { name: "CartStore" },
  ),
);

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectCartCount = (s) =>
  s.cart.reduce((a, b) => a + (b.quantity || 0), 0);

// Re‑export helpers so mutations can reuse them
export { matchesItem, getItemKey };
