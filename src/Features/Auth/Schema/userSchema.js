import { z } from 'zod';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
import { STORE_TYPES, PHONE_REGEX, USERNAME_REGEX } from '../Utils/constraints'

// ─── PASSWORD ─────────────────────────────────────────────────────────────────

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(28, 'Password must be under 28 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ─── ADDRESS ──────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be under 200 characters'),

  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be under 100 characters'),

  state: z
    .string()
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be under 100 characters'),

  country: z
    .string()
    .trim()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be under 100 characters')
    .default('Nigeria'),

  zip_code: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9\s\-]{3,10}$/, 'Enter a valid zip / postal code')
    .optional(),
});

// An address that is not yet filled in — all fields optional.
// Used when same_as_* is true so the second address block is skipped entirely.
const emptyAddressSchema = addressSchema.partial();

// ─── BASE USER ────────────────────────────────────────────────────────────────

const baseUserSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be under 100 characters'),

    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be under 20 characters')
      .regex(USERNAME_REGEX, 'Username can only contain letters, numbers, and underscores'),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(254, 'Email must be under 254 characters'),

    password: passwordField,

    confirm_password: z.string(),

    agree_to_terms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirm_password'],
      });
    }
  });

// ─── BUYER SCHEMA ─────────────────────────────────────────────────────────────
//
// home_address        — always required
// shipping_address    — required only when same_as_home is false
// same_as_home        — when true, home_address is used for shipping at save time
//
// Why superRefine here and not .refine()?
// .refine() wraps the schema in ZodEffects and breaks .shape access and
// discriminated union narrowing. superRefine keeps the schema intact.

export const buyerSchema = baseUserSchema
  .extend({
    role: z.literal('buyer'),

    home_address: addressSchema,

    same_as_home: z.boolean().default(false),

    // Always present in the payload but fields only validated when same_as_home
    // is false. Partial prevents Zod errors on an empty/omitted block.
    shipping_address: emptyAddressSchema.default({}),
  })
  .superRefine((data, ctx) => {
    if (!data.same_as_home) {
      // Manually run full addressSchema validation on shipping_address and
      // re-attach any errors under the shipping_address path so the form
      // field errors surface correctly.
      const result = addressSchema.safeParse(data.shipping_address);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: ['shipping_address', ...issue.path],
          });
        }
      }
    }
  });

// ─── SELLER SCHEMA ────────────────────────────────────────────────────────────
//
// store_address       — always required (business / KYC address)
// home_address        — required only when same_as_store is false
// same_as_store       — when true, store_address is used as home address at save time

export const sellerSchema = baseUserSchema
  .extend({
    role: z.literal('seller'),

    store_name: z
      .string()
      .trim()
      .min(2, 'Store name must be at least 2 characters')
      .max(100, 'Store name must be under 100 characters'),

    store_type: z.enum(STORE_TYPES, {
      errorMap: () => ({ message: 'Please select a valid store type' }),
    }),

    phone: z
      .string()
      .trim()
      .regex(PHONE_REGEX, 'Enter a valid phone number (e.g. +2348012345678)'),

    business_description: z
      .string()
      .trim()
      .min(10, 'Business description must be at least 10 characters')
      .max(1000, 'Business description must be under 1000 characters'),

    store_address: addressSchema,

    same_as_store: z.boolean().default(false),

    home_address: emptyAddressSchema.default({}),
  })
  .superRefine((data, ctx) => {
    if (!data.same_as_store) {
      const result = addressSchema.safeParse(data.home_address);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: ['home_address', ...issue.path],
          });
        }
      }
    }
  });

// ─── DISCRIMINATED UNION ──────────────────────────────────────────────────────

export const userSchema = z.discriminatedUnion('role', [
  buyerSchema,
  sellerSchema,
]);

// ─── ADDRESS RESOLUTION HELPERS ───────────────────────────────────────────────
// Call these after successful parse to get the final resolved addresses before
// sending to your DB / API. Never store same_as_* flags in the database —
// always persist the resolved address directly.

/**
 * Returns the resolved { home_address, shipping_address } for a parsed buyer.
 * @param {z.infer<typeof buyerSchema>} buyer
 */
export function resolveBuyerAddresses(buyer) {
  return {
    home_address: buyer.home_address,
    shipping_address: buyer.same_as_home
      ? buyer.home_address
      : buyer.shipping_address,
  };
}

/**
 * Returns the resolved { store_address, home_address } for a parsed seller.
 * @param {z.infer<typeof sellerSchema>} seller
 */
export function resolveSellerAddresses(seller) {
  return {
    store_address: seller.store_address,
    home_address: seller.same_as_store
      ? seller.store_address
      : seller.home_address,
  };
}