// src/api/cartApi.js
import { supabase } from "../supabaseClient";

export const CartAPI = {
  // =========================
  // 🧺 LOAD CART (FULL PRODUCT + IMAGE FIX)
  // =========================
  load: async (userId) => {
    // 1. get/create cart
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (cartError && cartError.code !== "PGRST116") throw cartError;

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: userId, status: "active" })
        .select("id")
        .single();

      if (createError) throw createError;
      cart = newCart;
    }

    // 2. Fetch cart items with full product + variant data
    const { data: items, error } = await supabase
      .from("cart_items")
      .select(`
      id,
      quantity,
      variant_id,
      product_id,

      product_variants (
        id,
        color,
        size,
        price_cents,

        products (
          id,
          name,
          slug,
          image,
          price_cents,
          rating_stars,
          rating_count
        )
      )
    `)
      .eq("cart_id", cart.id);

    if (error) throw error;

    // 3. ═══ NORMALIZE ═══
    // Flatten the nested Supabase joins into a shape every consumer expects:
    //   item.products  → { id, name, slug, image, price_cents, ... }
    //   item.variant   → { id, color, size, price_cents }
    //   item.name      → shortcut
    //   item.image     → shortcut
    //   item.price     → shortcut (variant price_cents)
    const normalized = (items || []).map((row) => {
      const variant = row.product_variants || {};
      const product = variant.products || {};

      return {
        // ─ cart_item fields ─
        id: row.id,
        quantity: row.quantity,
        variant_id: row.variant_id,
        product_id: row.product_id,

        // ─ nested objects (for CartPage / CartRow) ─
        products: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price_cents: variant.price_cents ?? product.price_cents ?? 0,
          rating_stars: product.rating_stars,
          rating_count: product.rating_count,
        },
        variant: {
          id: variant.id,
          color: variant.color,
          size: variant.size,
          price_cents: variant.price_cents,
        },

        // ─ flat shortcuts (for CartDropdown / CartPreview) ─
        name: product.name,
        image: product.image,
        thumbnail: product.image,
        price: variant.price_cents ?? product.price_cents ?? 0,
      };
    });

    return {
      cartId: cart.id,
      items: normalized,
    };
  },

  // =========================
  // 🧺 LOAD GUEST CART DETAILS
  // =========================
  loadGuestCart: async (guestItems) => {
    if (!guestItems || guestItems.length === 0) {
      return { cartId: null, items: [] };
    }

    const variantIds = guestItems.map((i) => i.variant_id).filter(Boolean);
    const productIds = guestItems.filter(i => !i.variant_id).map((i) => i.product_id).filter(Boolean);

    if (variantIds.length === 0 && productIds.length === 0) {
      return { cartId: null, items: guestItems };
    }

    let variantsData = [];
    if (variantIds.length > 0) {
      const { data, error } = await supabase
        .from("product_variants")
        .select(`
          id, color, size, price_cents,
          products ( id, name, slug, image, price_cents, rating_stars, rating_count )
        `)
        .in("id", variantIds);
      if (error) throw error;
      variantsData = data;
    }

    let productsData = [];
    if (productIds.length > 0) {
      const { data, error } = await supabase
        .from("products")
        .select(`id, name, slug, image, price_cents, rating_stars, rating_count`)
        .in("id", productIds);
      if (error) throw error;
      productsData = data;
    }

    const normalized = guestItems.map((item) => {
      let product = {};
      let v = null;

      if (item.variant_id) {
        v = variantsData.find((d) => d.id === item.variant_id);
        product = v?.products || {};
      } else if (item.product_id) {
        product = productsData.find((d) => d.id === item.product_id) || {};
      }
      
      return {
        id: `guest_${item.variant_id || item.product_id}`, // UI requires an id
        quantity: item.quantity,
        variant_id: item.variant_id,
        product_id: item.product_id,

        products: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price_cents: v?.price_cents ?? product.price_cents ?? 0,
          rating_stars: product.rating_stars,
          rating_count: product.rating_count,
        },
        variant: {
          id: v?.id,
          color: v?.color,
          size: v?.size,
          price_cents: v?.price_cents,
        },

        name: product.name,
        image: product.image,
        thumbnail: product.image,
        price: v?.price_cents ?? product.price_cents ?? 0,
      };
    });

    return { cartId: null, items: normalized };
  },

  // =========================
  // ➕ ADD TO CART
  // =========================
  add: async ({ cartId, productId, variantId, quantity = 1 }) => {
    // If we only have product_id, we should try to fetch the default variant_id first 
    // to satisfy the cart_items (cart_id, variant_id) unique constraint.
    let finalVariantId = variantId;
    
    if (!finalVariantId && productId) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", productId)
        .limit(1);
      
      if (variants && variants.length > 0) {
        finalVariantId = variants[0].id;
      }
    }

    const { data, error } = await supabase
      .from("cart_items")
      .upsert(
        {
          cart_id: cartId,
          product_id: productId,
          variant_id: finalVariantId,
          quantity,
        },
        {
          onConflict: "cart_id, variant_id",
        }
      )
      .select();

    if (error) throw error;
    return data;
  },

  addBulk: async ({ cartId, items = [] }) => {
    const payload = items
      .map((item) => ({
        product_id: item.productId ?? item.product_id,
        variant_id: item.variantId ?? item.variant_id,
        quantity: Math.max(Number(item.quantity) || 1, 1),
      }))
      .filter((item) => item.product_id && item.variant_id);

    if (!cartId || payload.length === 0) return [];

    const { data, error } = await supabase.rpc("add_cart_items_bulk", {
      p_cart_id: cartId,
      p_items: payload,
    });

    if (error) throw error;
    return data || [];
  },

  // =========================
  // 🔁 UPDATE ITEM
  // =========================
  update: async ({ cartItemId, quantity, variantId }) => {
    const payload = {};

    if (quantity !== undefined) payload.quantity = quantity;
    if (variantId !== undefined) payload.variant_id = variantId;

    const { data, error } = await supabase
      .from("cart_items")
      .update(payload)
      .eq("id", cartItemId)
      .select();

    if (error) throw error;
    return data;
  },

  // =========================
  // ❌ REMOVE ITEM
  // =========================
  remove: async (cartItemId) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) throw error;
    return true;
  },

  // =========================
  // 🧹 CLEAR CART
  // =========================
  clear: async (cartId) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) throw error;
    return true;
  },

  // =========================
  // 📦 RECOMMENDATIONS
  // =========================
  cartRecommendations: (productIDs = [], limit = 8) => ({
    queryKey: ["cart-recommendations", productIDs, limit],

    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_cart_recommendations",
        {
          target_ids: productIDs,
          limit_count: limit,
        }
      );

      if (error) {
        throw new Error(error.message || "Failed to fetch cart recommendations");
      }

      return data;
    },
  }),
};
