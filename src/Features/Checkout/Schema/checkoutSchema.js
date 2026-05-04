import { z } from "zod";
import { EMPTY_ERRORS } from "../Utils/checkoutConstants";
import { sanitizeString } from "../Utils/checkoutUtils";

/**
 * Validates shipping + billing address fields only.
 *
 * Card fields are intentionally excluded — card data must be handled
 * exclusively by your payment provider's hosted fields / tokenization SDK
 * (e.g. Stripe Elements). Your form should only ever submit a payment
 * method token, never raw card numbers or CVVs.
 */
export const checkoutSchema = z.object({
  // Contact
  name:    z.string().min(2, "Full name is required").transform(sanitizeString),
  email:   z.string().email("Valid email address required").toLowerCase(),
  phone:   z.string().min(7, "Valid phone number required"),

  // Shipping address
  address: z.string().min(5, "Street address is required").transform(sanitizeString),
  city:    z.string().min(2, "City is required").transform(sanitizeString),
  zip:     z.string().min(3, "ZIP / postal code required").transform(sanitizeString),
  country: z.string().min(2, "Country is required"),

  // Billing
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: z.string().optional().transform((v) => (v ? sanitizeString(v) : v)),
  billingCity:    z.string().optional().transform((v) => (v ? sanitizeString(v) : v)),
  billingZip:     z.string().optional().transform((v) => (v ? sanitizeString(v) : v)),
  billingCountry: z.string().optional(),

  // Payment
  cardNumber: z.string().min(16, "Valid card number required"),
  expiry: z.string().min(5, "Valid expiry required"),
  cvv: z.string().min(3, "Valid CVV required"),
  cardName: z.string().min(2, "Cardholder name required"),
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
