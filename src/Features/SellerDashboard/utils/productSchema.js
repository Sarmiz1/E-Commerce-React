import { z } from 'zod';

export const CATEGORIES = [
  'Fashion',
  'Electronics',
  'Home & Garden',
  'Beauty & Health',
  'Sports & Outdoors',
  'Automotive',
  'Books & Audible',
  'Gaming',
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'N/A'];

export const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR'];

// ── Variant sub-schema ────────────────────────────────────────────────────────
export const variantSchema = z.object({
  sku: z.string().max(50, 'SKU too long').optional().or(z.literal('')),
  color: z.string().max(30, 'Color too long').optional().or(z.literal('')),
  size: z.string().optional().or(z.literal('')),
  price_override: z
    .union([z.number().positive('Must be positive'), z.nan(), z.undefined()])
    .optional()
    .or(z.literal('')),
  stock: z
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(999_999),
});

// ── Master product schema ─────────────────────────────────────────────────────
export const productSchema = z.object({
  // ── Core ──────────────────────────────────────
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(120, 'Product name is too long'),

  brand: z.string().max(60, 'Brand name is too long').optional().or(z.literal('')),

  category: z.string().min(1, 'Please select a category'),

  currency: z.string().default('NGN'),

  is_featured: z.boolean().default(false),

  // ── Pricing ────────────────────────────────────
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(10_000_000, 'Price seems too large'),

  sale_price: z
    .union([z.number().positive('Must be positive'), z.nan(), z.undefined()])
    .optional()
    .or(z.literal('')),

  // ── Images ────────────────────────────────────
  // thumbnailFile: uploaded File object for the main product thumbnail
  thumbnailFile: z.any().optional(),
  // additionalFiles: array of File objects for product_images gallery
  additionalFiles: z.any().optional(),

  // ── Variants ──────────────────────────────────
  // At least one variant is required
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),

  // ── Descriptions ──────────────────────────────
  shortDescription: z
    .string()
    .max(200, 'Short description max 200 characters')
    .optional()
    .or(z.literal('')),

  fullDescription: z
    .string()
    .max(5000, 'Full description max 5000 characters')
    .optional()
    .or(z.literal('')),

  // ── Features ──────────────────────────────────
  // Comma-separated list that becomes a JSON array
  features: z.string().max(1000).optional().or(z.literal('')),

  // ── Meta ──────────────────────────────────────
  keywords: z
    .string()
    .max(300, 'Keywords too long — separate with commas')
    .optional()
    .or(z.literal('')),
});

/** Empty variant row */
export const emptyVariant = {
  sku: '',
  color: '',
  size: '',
  price_override: '',
  stock: 0,
};

/** Default form values */
export const productDefaults = {
  name: '',
  brand: '',
  category: '',
  currency: 'NGN',
  is_featured: false,
  price: '',
  sale_price: '',
  thumbnailFile: null,
  additionalFiles: [],
  variants: [{ ...emptyVariant }],
  shortDescription: '',
  fullDescription: '',
  features: '',
  keywords: '',
};
