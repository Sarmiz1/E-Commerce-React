import { z } from 'zod';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
import { STORE_TYPES, PHONE_REGEX, USERNAME_REGEX } from '../Utils/constraints'

// ─── PASSWORD ─────────────────────────────────────────────────────────────────

const passwordField = z
  .string({ message: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(28, 'Password must be under 28 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ─── ADDRESS ──────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  street: z
    .string({ message: 'Street address is required' })
    .trim()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be under 200 characters'),

  city: z
    .string({ message: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be under 100 characters'),

  state: z
    .string({ message: 'State / Province is required' })
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be under 100 characters'),

  country: z
    .string({ message: 'Country is required' })
    .trim()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be under 100 characters')
    .default('Nigeria'),

  zip_code: z
    .string({ message: 'Zip / Postal code is required' })
    .trim()
    .regex(/^[A-Za-z0-9\s-]{3,10}$/, 'Enter a valid zip / postal code')
    .optional(),
});



// ─── BASE USER ────────────────────────────────────────────────────────────────

const baseUserSchema = z
  .object({
    full_name: z
      .string({ message: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be under 100 characters'),

    username: z
      .string({ message: 'Username is required' })
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be under 20 characters')
      .regex(USERNAME_REGEX, 'Username can only contain letters, numbers, and underscores'),

    email: z
      .string({ message: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(254, 'Email must be under 254 characters'),

    password: passwordField,

    confirm_password: z.string({ message: 'Please confirm your password' }),

    agree_to_terms: z.literal(true, {
      message: 'You must agree to the Terms of Service',
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


  // EMPTY ADDRESS SCHEMA FOR SELLERS WHO CHOOSE SAME AS STORE

// ✅ Add this — was referenced but never defined
const emptyAddressSchema = z.object({
  street: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  zip_code: z.string().optional().default(""),
  country: z.string().optional().default("Nigeria"),
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
      .string({ message: 'Store name is required' })
      .trim()
      .min(2, 'Store name must be at least 2 characters')
      .max(100, 'Store name must be under 100 characters'),

    store_type: z.enum(STORE_TYPES, {
      message: 'Please select a valid store type',
    }),

    phone: z
      .string({ message: 'Phone number is required' })
      .trim()
      .regex(PHONE_REGEX, 'Enter a valid phone number (e.g. +2348012345678)'),

    business_description: z
      .string({ message: 'Business description is required' })
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

// ─── LOGIN SCHEMA ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

// ─── FORGOT PASSWORD SCHEMA ───────────────────────────────────────────────────

export const forgotSchema = z.object({
  email: z
    .string({ message: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
});

// ─── ADDRESS RESOLUTION HELPERS ───────────────────────────────────────────────
// Call these after successful parse to get the final resolved addresses before
// sending to your DB / API. Never store same_as_* flags in the database —
// always persist the resolved address directly.

/**
 * Returns the resolved { home_address } for a parsed buyer.
 * @param {z.infer<typeof buyerSchema>} buyer
 */
export function resolveBuyerAddresses(buyer) {
  return {
    home_address: buyer.home_address,
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
