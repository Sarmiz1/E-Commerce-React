import { z } from 'zod';

export const cartItemSchema = z.object({
  id: z.string().uuid("Invalid item ID"), // Usually the unique entry ID in the cart
  product_id: z.string().min(1, "Product ID is required"),
  variant_id: z.string().optional().nullable(),
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be greater than zero"),
  quantity: z.number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99 per item"),
  image: z.string().url("Invalid image URL").optional().nullable(),
  slug: z.string().min(1, "Product slug is required"),
  
  // Metadata for SKU/Stock checks
  sku: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  
  // Timestamps
  added_at: z.string().datetime().default(() => new Date().toISOString()),
});

export const addToCartSchema = cartItemSchema.pick({
  product_id: true,
  variant_id: true,
  quantity: true,
});

/**
 * Validates a full cart array
 */
export const cartSchema = z.array(cartItemSchema);
