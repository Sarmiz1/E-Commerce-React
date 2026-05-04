// ─── Imports (all at top) ────────────────────────────────────────────────────
import { CARD_PATTERNS, SHIPPING_TIERS, TAX_RATE } from "./checkoutConstants";

// ─── Sanitization ─────────────────────────────────────────────────────────────

/**
 * Strips HTML tags and trims whitespace from user-supplied strings.
 * Prevents XSS if values are ever interpolated into the DOM.
 */
export function sanitizeString(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")  // strip HTML tags
    .replace(/[<>"'`]/g, "")  // strip remaining dangerous chars
    .trim();
}

// ─── Card type detection ──────────────────────────────────────────────────────

/**
 * Detects the card network from the card number prefix.
 * NOTE: This is for UI display only (e.g. showing a card logo).
 * Raw card numbers must NEVER be sent to your servers — use a
 * tokenization SDK (Stripe Elements, Braintree Hosted Fields, etc.)
 * so card data goes directly to the payment provider.
 */
export function detectCardType(number = "") {
  const normalized = String(number).replace(/\s/g, "");
  for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(normalized)) return type;
  }
  return null;
}

// ─── Cart item accessors ──────────────────────────────────────────────────────

export function getCartItemKey(item) {
  return (
    item?.id ??
    item?.variant_id ??
    item?.product_id ??
    item?.products?.id ??
    item?.productId
  );
}

export function getCartItemName(item) {
  return sanitizeString(
    item?.name ??
    item?.products?.name ??
    item?.product?.name ??
    item?.productId ??
    item?.product_id ??
    "Product"
  );
}

export function getCartItemImage(item) {
  return (
    item?.image ??
    item?.thumbnail ??
    item?.products?.image ??
    item?.product?.image ??
    ""
  );
}

/**
 * Resolves a cart item's unit price in cents.
 *
 * Priority (highest → lowest):
 *   1. item.products.price_cents  — normalized shape from a joined DB query
 *   2. item.variant.price_cents   — variant-level override
 *   3. item.product.price_cents   — flat product record
 *   4. item.price                 — legacy / already-normalized shape
 *   5. 0                          — safe fallback; server must validate before charge
 */
export function getCartItemUnitPrice(item) {
  return Number(
    item?.products?.price_cents ??
    item?.variant?.price_cents ??
    item?.product?.price_cents ??
    item?.price ??
    0
  );
}

export function getCartItemQuantity(item) {
  return Math.max(Number(item?.quantity) || 1, 1);
}

export function getCartItemLineTotal(item) {
  return getCartItemUnitPrice(item) * getCartItemQuantity(item);
}

// ─── Checkout totals ──────────────────────────────────────────────────────────

/**
 * ⚠️  CLIENT-SIDE ONLY — for display purposes.
 *
 * These totals MUST be recalculated and verified server-side before any
 * charge is made. Never trust the total sent from the browser.
 */

function resolveShippingPrice(selectedShipping, shippingOptions) {
  if (selectedShipping === "free") return 0;
  const tier = shippingOptions.find((o) => o.id === selectedShipping);
  return tier?.price ?? 499;
}

function applyCoupon(coupon, subtotal, shippingPrice) {
  if (!coupon) return 0;
  if (coupon.type === "percent") return Math.round((subtotal * coupon.value) / 100);
  if (coupon.type === "flat") return Math.min(coupon.value, subtotal); // can't discount below 0
  if (coupon.type === "ship") return shippingPrice;
  return 0;
}

function calcTax(taxableAmount) {
  return Math.round(Math.max(taxableAmount, 0) * TAX_RATE);
}

export function calculateCheckoutTotals(
  cart = [],
  selectedShipping = "standard",
  coupon = null,
  shippingOptions = SHIPPING_TIERS
) {
  const subtotal = cart.reduce((sum, item) => sum + getCartItemLineTotal(item), 0);
  const shippingPrice = resolveShippingPrice(selectedShipping, shippingOptions);
  const couponDiscount = applyCoupon(coupon, subtotal, shippingPrice);

  const taxable = Math.max(subtotal - couponDiscount, 0);
  const tax = calcTax(taxable);
  const shipping = coupon?.type === "ship" ? 0 : shippingPrice;
  const total = taxable + shipping + tax;

  return { subtotal, shipping, couponDiscount, taxable, tax, total };
}
