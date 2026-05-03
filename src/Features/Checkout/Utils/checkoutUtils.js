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

import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address required"),
  phone: z.string().min(7, "Valid phone number required"),
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(3, "ZIP / postal code required"),
  country: z.string().min(2, "Country is required"),
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
  cardName: z.string().min(2, "Cardholder name required"),
  cardNumber: z.string().transform(v => v.replace(/\s/g, "")).pipe(z.string().min(13, "Invalid card").max(16, "Invalid card")),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format MM/YY").refine((val) => {
    if (!val.includes("/")) return false;
    const [month, year] = val.split("/").map(Number);
    const now = new Date();
    const cardYear = 2000 + year;
    const cardMonth = month - 1;
    return cardYear > now.getFullYear() || (cardYear === now.getFullYear() && cardMonth >= now.getMonth());
  }, "Card has expired"),
  cvv: z.string().min(3, "CVV must be 3-4 digits").max(4, "CVV must be 3-4 digits"),
}).superRefine((data, ctx) => {
  if (!data.billingSameAsShipping) {
    if (!data.billingAddress || data.billingAddress.length < 5) {
      ctx.addIssue({ path: ["billingAddress"], message: "Billing address is required", code: z.ZodIssueCode.custom });
    }
    if (!data.billingCity || data.billingCity.length < 2) {
      ctx.addIssue({ path: ["billingCity"], message: "Billing city is required", code: z.ZodIssueCode.custom });
    }
    if (!data.billingZip || data.billingZip.length < 3) {
      ctx.addIssue({ path: ["billingZip"], message: "Billing ZIP required", code: z.ZodIssueCode.custom });
    }
    if (!data.billingCountry || data.billingCountry.length < 2) {
      ctx.addIssue({ path: ["billingCountry"], message: "Billing country required", code: z.ZodIssueCode.custom });
    }
  }
});

export function validateCheckoutForm(form) {
  try {
    checkoutSchema.parse(form);
    return EMPTY_ERRORS();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = EMPTY_ERRORS();
      error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      return errors;
    }
    return EMPTY_ERRORS();
  }
}

export function hasFormErrors(errors) {
  return Object.values(errors).some(Boolean);
}
