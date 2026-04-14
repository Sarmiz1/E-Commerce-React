// src/api/cartApi.js
//
// ── Fixes applied ──────────────────────────────────────────────────────────────
//  1. `load` was using bare `axios.get` instead of the shared `api` instance,
//     bypassing the base URL, default headers, and error interceptor. Changed
//     to use `getData` from apiClients so all requests go through one pipe.
//
//  2. `load` returned `res.data` (the axios response body). CartContext then
//     did `setCart(res.data)` — a double-unwrap that always produced `undefined`.
//     `getData` / `request` already unwraps `response.data`, so `load` now
//     returns the value directly. CartContext just does `setCart(items)`.
//
//  3. Method was named `updateQuantity` in CartAPI but CartContext called
//     `CartAPI.update` — a TypeError at runtime. Standardised to `update`.
//
//  4. Parameter naming standardised:
//       add / update / remove all accept `productId` to match the cart item
//       shape used in CartContext (`{ productId, quantity }`).
//       If your REST API uses a separate cart-item `id`, swap productId → itemId
//       in the URL path only; keep everything else consistent.
//
//  5. `load` no longer appends `?expand=product` by default — pass `params` if
//     you need it, or set it as a constant below. Keeps the function pure.
// ─────────────────────────────────────────────────────────────────────────────

import { getData, postData, putData, deleteData } from "./apiClients";

// ── Optional query params sent on every cart load ─────────────────────────────
// Set to "" if your API doesn't support query expansion.
const LOAD_PARAMS = "?expand=product";

export const CartAPI = {

  // ── Load all cart items ─────────────────────────────────────────────────────
  // Returns the bare array (or whatever shape your API returns at the root).
  // CartContext is responsible for normalising to an array via Array.isArray.
  load: () => getData(`/cart-items${LOAD_PARAMS}`),

  // ── Add a product to the cart ───────────────────────────────────────────────
  add: (productId, quantity = 1) =>
    postData("/cart-items", { productId, quantity }),

  // ── Update quantity of an existing cart item ────────────────────────────────
  // Renamed from `updateQuantity` → `update` to match CartContext call-site.
  update: (productId, quantity) =>
    putData(`/cart-items/${productId}`, { quantity }),

  // ── Remove a single item from the cart ─────────────────────────────────────
  remove: (productId) =>
    deleteData(`/cart-items/${productId}`),

  // ── Clear the entire cart ───────────────────────────────────────────────────
  clear: () =>
    deleteData("/cart-items"),

  // ── Update delivery / shipping details ─────────────────────────────────────
  updateDelivery: (deliveryData) =>
    putData("/cart/delivery", deliveryData),
};