export const CART_TOTALS_FALLBACK = {
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  applied_promo: null,
};

export const CART_SAVED_FOR_LATER_KEY = "woosho_saved_for_later";

export const getCartItemProductId = (item) =>
  item?.product_id || item?.products?.id || item?.product?.id || null;

export const getCartItemVariantId = (item) =>
  item?.variant_id || item?.variant?.id || null;

export const getCartItemName = (item) =>
  item?.products?.name || item?.product?.name || item?.name || "Product";

export const getCartItemUnitPriceCents = (item) =>
  Number(
    item?.unit_price_cents ??
      item?.price_cents ??
      item?.price ??
      item?.variant?.price_cents ??
      item?.products?.price_cents ??
      0,
  ) || 0;

export const getCartItemLineTotalCents = (item) =>
  Number(item?.line_total_cents) || getCartItemUnitPriceCents(item) * (Number(item?.quantity) || 0);

export const getCartProductIds = (cartItems = []) =>
  [...new Set(cartItems.map((item) => getCartItemProductId(item)).filter(Boolean))];

export const getCartSavingsCents = ({ subtotal = 0, discount = 0, shipping = 0, promo = null }) =>
  discount + (subtotal >= 5000 && shipping === 0 && (!promo || promo.type !== "shipping") ? 499 : 0);

export const createCartAdditionFromItem = (item) => ({
  productId: getCartItemProductId(item),
  variantId: getCartItemVariantId(item),
  quantity: Math.max(Number(item?.quantity) || 1, 1),
  product: item?.products || item?.product || null,
  variant: item?.variant || null,
});

export const validateCartForCheckout = (items = []) => {
  if (!items.length) return "Your cart is empty.";

  const invalidStockItem = items.find((item) => {
    const stock = item?.variant?.stock_quantity;
    return stock != null && Number(stock) >= 0 && Number(item?.quantity) > Number(stock);
  });

  if (invalidStockItem) {
    return `${getCartItemName(invalidStockItem)} only has ${invalidStockItem.variant.stock_quantity} available.`;
  }

  return "";
};

export const cartTrustBadges = [
  { icon: "lock", title: "Secure Checkout", sub: "256-bit SSL" },
  { icon: "returns", title: "Free 30-Day Returns", sub: "No questions" },
  { icon: "delivery", title: "Fast Dispatch", sub: "Within 24h" },
];

export const readSavedForLater = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(CART_SAVED_FOR_LATER_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const writeSavedForLater = (items = []) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_SAVED_FOR_LATER_KEY, JSON.stringify(items.filter(Boolean)));
};
