import { CARD_PATTERNS, EMPTY_ERRORS, SHIPPING_TIERS, TAX_RATE } from "./checkoutConstants";

export function detectCardType(number = "") {
  const normalized = String(number).replace(/\s/g, "");

  for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(normalized)) return type;
  }

  return null;
}

export function getCartItemKey(item) {
  return item?.id || item?.variant_id || item?.product_id || item?.products?.id || item?.productId;
}

export function getCartItemName(item) {
  return item?.name || item?.products?.name || item?.product?.name || item?.productId || item?.product_id || "Product";
}

export function getCartItemImage(item) {
  return item?.image || item?.thumbnail || item?.products?.image || item?.product?.image || "";
}

export function getCartItemUnitPrice(item) {
  return Number(
    item?.products?.price_cents ??
      item?.variant?.price_cents ??
      item?.product?.price_cents ??
      item?.price ??
      0,
  );
}

export function getCartItemQuantity(item) {
  return Math.max(Number(item?.quantity) || 1, 1);
}

export function getCartItemLineTotal(item) {
  return getCartItemUnitPrice(item) * getCartItemQuantity(item);
}

export function calculateCheckoutTotals(cart = [], selectedShipping = "standard", coupon = null, shippingOptions = SHIPPING_TIERS) {
  const subtotal = cart.reduce((sum, item) => sum + getCartItemLineTotal(item), 0);
  const selectedTier = shippingOptions.find((option) => option.id === selectedShipping);
  const shipPrice = selectedShipping === "free" ? 0 : selectedTier?.price ?? 499;

  const couponDiscount = (() => {
    if (!coupon) return 0;
    if (coupon.type === "percent") return Math.round((subtotal * coupon.value) / 100);
    if (coupon.type === "flat") return coupon.value;
    if (coupon.type === "ship") return shipPrice;
    return 0;
  })();

  const taxable = Math.max(subtotal - couponDiscount, 0);
  const tax = Math.round(taxable * TAX_RATE);
  const shipping = coupon?.type === "ship" ? 0 : shipPrice;
  const total = taxable + shipping + tax;

  return {
    subtotal,
    shipping,
    couponDiscount,
    taxable,
    tax,
    total,
  };
}

export function validateCheckoutForm(form) {
  const errors = EMPTY_ERRORS();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const rawCard = String(form.cardNumber || "").replace(/\s/g, "");

  if (!form.name.trim()) errors.name = "Full name is required";
  if (!emailPattern.test(form.email)) errors.email = "Valid email address required";
  if (!form.phone.trim() || form.phone.length < 7) errors.phone = "Valid phone number required";
  if (!form.address.trim()) errors.address = "Street address is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.zip.trim()) errors.zip = "ZIP / postal code required";
  if (!form.cardName.trim()) errors.cardName = "Cardholder name required";
  if (rawCard.length < 13 || rawCard.length > 16) errors.cardNumber = "Enter a valid 13-16 digit card number";

  if (!expiryPattern.test(form.expiry)) {
    errors.expiry = "Enter expiry as MM/YY";
  } else {
    const [month, year] = form.expiry.split("/").map(Number);
    const now = new Date();
    const cardYear = 2000 + year;
    const cardMonth = month - 1;

    if (cardYear < now.getFullYear() || (cardYear === now.getFullYear() && cardMonth < now.getMonth())) {
      errors.expiry = "Card has expired";
    }
  }

  if (form.cvv.length < 3) errors.cvv = "CVV must be 3-4 digits";

  return errors;
}

export function hasFormErrors(errors) {
  return Object.values(errors).some(Boolean);
}
