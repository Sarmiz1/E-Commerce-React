// src/api/cartApi.js
import { supabase } from "../lib/supabaseClient";
import { getAnalyticsSessionId, getStoredAnalyticsEvents } from "./track_events";
import { WishlistAPI } from "./wishlistApi";

const RECOMMENDATION_PRODUCT_SELECT = `
  id,
  name,
  slug,
  price_cents,
  category_id,
  brand,
  keywords,
  rating_stars,
  rating_count,
  image,
  is_featured,
  created_at
`;

const RECOMMENDATION_EVENT_TYPES = [
  "product_click",
  "view_product",
  "product_detail_viewed",
  "quick_view_opened",
  "add_to_wishlist",
  "add_to_cart",
];

const EVENT_WEIGHTS = {
  product_click: 12,
  view_product: 8,
  product_detail_viewed: 10,
  quick_view_opened: 6,
  add_to_wishlist: 18,
  add_to_cart: 14,
};

const normalizeProductIds = (ids = []) => {
  const list = Array.isArray(ids) ? ids : [ids];
  return [...new Set(list.filter(Boolean).map(String))];
};

const normalizeTextValues = (values = []) => [
  ...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean)),
];

const keywordListFromProducts = (products = []) => [
  ...new Set(
    products
      .flatMap((product) => (Array.isArray(product?.keywords) ? product.keywords : []))
      .filter(Boolean)
      .map((keyword) => String(keyword).toLowerCase()),
  ),
];

const uniqueProducts = (groups = []) => {
  const byId = new Map();

  groups.flat().forEach((product) => {
    if (product?.id && !byId.has(product.id)) {
      byId.set(product.id, product);
    }
  });

  return [...byId.values()];
};

const countKeywordOverlap = (product, seedKeywords) => {
  if (!seedKeywords.size || !Array.isArray(product?.keywords)) return 0;

  return product.keywords.reduce(
    (count, keyword) => count + (seedKeywords.has(String(keyword).toLowerCase()) ? 1 : 0),
    0,
  );
};

const logScore = (value = 0, weight = 1) => Math.log(Number(value) + 1) * weight;

const getAveragePrice = (products = []) => {
  const prices = products
    .map((product) => Number(product?.price_cents))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (!prices.length) return null;
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
};

const getPriceAffinityScore = (product, averagePrice) => {
  if (!averagePrice) return 0;

  const price = Number(product?.price_cents);
  if (!Number.isFinite(price) || price <= 0) return 0;

  const distance = Math.abs(price - averagePrice) / averagePrice;
  return Math.max(0, 10 - distance * 20);
};

const daysSince = (date) => {
  if (!date) return Infinity;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return Infinity;
  return (Date.now() - time) / (1000 * 60 * 60 * 24);
};

async function getCurrentUserId() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

async function fetchProductsByIds(productIds = []) {
  const ids = normalizeProductIds(productIds);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("products")
    .select(RECOMMENDATION_PRODUCT_SELECT)
    .in("id", ids)
    .eq("is_active", true)
    .limit(ids.length);

  if (error) return [];
  return data || [];
}

async function fetchProductsByField(field, values = [], limit = 40) {
  const normalizedValues = normalizeTextValues(values);
  if (!normalizedValues.length) return [];

  const { data, error } = await supabase
    .from("products")
    .select(RECOMMENDATION_PRODUCT_SELECT)
    .eq("is_active", true)
    .in(field, normalizedValues)
    .limit(limit);

  if (error) return [];
  return data || [];
}

async function fetchProductsByKeywords(keywords = [], limit = 40) {
  const normalizedKeywords = normalizeTextValues(keywords).slice(0, 24);
  if (!normalizedKeywords.length) return [];

  const { data, error } = await supabase
    .from("products")
    .select(RECOMMENDATION_PRODUCT_SELECT)
    .eq("is_active", true)
    .overlaps("keywords", normalizedKeywords)
    .limit(limit);

  if (error) return [];
  return data || [];
}

async function fetchPopularProducts(limit = 40) {
  const { data, error } = await supabase
    .from("products")
    .select(RECOMMENDATION_PRODUCT_SELECT)
    .eq("is_active", true)
    .order("rating_count", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

async function fetchSimilarProducts(productIds = [], limit = 24) {
  const ids = normalizeProductIds(productIds).slice(0, 4);
  if (!ids.length) return { products: [], scoreById: new Map() };

  const scoreById = new Map();
  const results = await Promise.allSettled(
    ids.map((targetId) =>
      supabase.rpc("get_ranked_similar_products", {
        target_id: targetId,
        limit_count: Math.max(4, Math.ceil(limit / ids.length)),
      }),
    ),
  );

  const products = results.flatMap((result) => {
    if (result.status !== "fulfilled" || result.value.error) return [];

    return (result.value.data || []).map((product) => {
      const rpcScore = Number(product.score) || 0;
      const existingScore = scoreById.get(product.id) || 0;
      scoreById.set(product.id, Math.max(existingScore, rpcScore));

      return product;
    });
  });

  return { products, scoreById };
}

async function fetchProductMetrics(productIds = []) {
  const ids = normalizeProductIds(productIds);
  if (!ids.length) return new Map();

  const { data, error } = await supabase
    .from("product_metrics")
    .select("product_id, view_count, purchase_count, search_count, wishlisted_count")
    .in("product_id", ids);

  if (error) return new Map();

  return new Map((data || []).map((metric) => [metric.product_id, metric]));
}

async function fetchWishlistProductIds(userId) {
  const guestIds = WishlistAPI.getGuestWishlist();

  if (!userId) return normalizeProductIds(guestIds);

  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id")
    .limit(200);

  if (error) return normalizeProductIds(guestIds);

  return normalizeProductIds([
    ...guestIds,
    ...(data || []).map((item) => item.product_id),
  ]);
}

async function fetchActivitySignals(userId) {
  const signalByProductId = new Map();

  const addSignal = ({ productId, eventType, quantity }) => {
    if (!productId || !RECOMMENDATION_EVENT_TYPES.includes(eventType)) return;

    const current = signalByProductId.get(productId) || 0;
    const quantityBoost = Math.max(Number(quantity) || 1, 1);
    signalByProductId.set(
      productId,
      current + (EVENT_WEIGHTS[eventType] || 1) * Math.min(quantityBoost, 5),
    );
  };

  getStoredAnalyticsEvents().forEach((event) => {
    addSignal({
      productId: event.productId,
      eventType: event.type,
      quantity: event.quantity,
    });
  });

  const sessionId = getAnalyticsSessionId();
  let query = supabase
    .from("events")
    .select("product_id, event_type, quantity, user_id, session_id")
    .not("product_id", "is", null)
    .in("event_type", RECOMMENDATION_EVENT_TYPES)
    .limit(200);

  if (userId) {
    query = query.or(`user_id.eq.${userId},session_id.eq.${sessionId}`);
  } else {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query;
  if (!error) {
    (data || []).forEach((event) => {
      addSignal({
        productId: event.product_id,
        eventType: event.event_type,
        quantity: event.quantity,
      });
    });
  }

  return signalByProductId;
}

function scoreRecommendation({
  product,
  cartProductIds,
  cartSeeds,
  wishlistProductIds,
  wishlistSeeds,
  activitySignals,
  activitySeeds,
  metricsById,
  similarScoreById,
}) {
  if (cartProductIds.has(product.id)) return Number.NEGATIVE_INFINITY;

  const cartCategories = new Set(cartSeeds.map((item) => item.category_id).filter(Boolean));
  const wishlistCategories = new Set(wishlistSeeds.map((item) => item.category_id).filter(Boolean));
  const activityCategories = new Set(activitySeeds.map((item) => item.category_id).filter(Boolean));
  const cartBrands = new Set(cartSeeds.map((item) => item.brand).filter(Boolean));
  const wishlistBrands = new Set(wishlistSeeds.map((item) => item.brand).filter(Boolean));
  const activityBrands = new Set(activitySeeds.map((item) => item.brand).filter(Boolean));
  const cartKeywords = new Set(keywordListFromProducts(cartSeeds));
  const wishlistKeywords = new Set(keywordListFromProducts(wishlistSeeds));
  const activityKeywords = new Set(keywordListFromProducts(activitySeeds));
  const averageCartPrice = getAveragePrice(cartSeeds);
  const metrics = metricsById.get(product.id) || {};

  let score = 0;

  if (similarScoreById.has(product.id)) {
    score += 38 + Math.min(Number(similarScoreById.get(product.id)) || 0, 24);
  }

  if (cartCategories.has(product.category_id)) score += 28;
  if (wishlistCategories.has(product.category_id)) score += 12;
  if (activityCategories.has(product.category_id)) score += 10;

  if (cartBrands.has(product.brand)) score += 14;
  if (wishlistBrands.has(product.brand)) score += 8;
  if (activityBrands.has(product.brand)) score += 6;

  score += countKeywordOverlap(product, cartKeywords) * 6;
  score += countKeywordOverlap(product, wishlistKeywords) * 4;
  score += countKeywordOverlap(product, activityKeywords) * 3;
  score += getPriceAffinityScore(product, averageCartPrice);

  if (wishlistProductIds.has(product.id)) score += 18;
  score += activitySignals.get(product.id) || 0;

  score += logScore(metrics.view_count, 1.8);
  score += logScore(metrics.search_count, 1.5);
  score += logScore(metrics.purchase_count, 4);
  score += logScore(metrics.wishlisted_count, 5);
  score += (Number(product.rating_stars) || 0) * 2;
  score += logScore(product.rating_count, 1.4);

  if (product.is_featured) score += 3;
  if (daysSince(product.created_at) <= 21) score += 2;

  return score;
}

export const CartAPI = {
  // =========================
  // 🧺 LOAD CART (FULL PRODUCT + IMAGE FIX)
  // =========================
  load: async (userId) => {
    // 1. get/create cart safely (handling multiple active carts gracefully)
    let { data: carts, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (cartError) throw cartError;

    let cart = carts?.[0];

    if (!cart) {
      const { data: newCarts, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: userId, status: "active" })
        .select("id")
        .limit(1);

      if (createError) throw createError;
      cart = newCarts?.[0];
    }

    // 2. Fetch cart items with full product + variant data
    const { data: items, error } = await supabase
      .from("cart_items")
      .select(`
      id,
      quantity,
      variant_id,
      product_id,

      product_variants!cart_items_variant_id_fkey (
        id,
        color,
        size,
        price_cents,
        stock_quantity,

        products!product_variants_product_id_fkey (
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
      const unitPriceCents = variant.price_cents ?? product.price_cents ?? 0;
      const quantity = Math.max(Number(row.quantity) || 1, 1);

      return {
        // ─ cart_item fields ─
        id: row.id,
        quantity,
        variant_id: row.variant_id,
        product_id: row.product_id,
        unit_price_cents: unitPriceCents,
        line_total_cents: unitPriceCents * quantity,

        // ─ nested objects (for CartPage / CartRow) ─
        products: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price_cents: unitPriceCents,
          rating_stars: product.rating_stars,
          rating_count: product.rating_count,
        },
        variant: {
          id: variant.id,
          color: variant.color,
          size: variant.size,
          price_cents: variant.price_cents,
          stock_quantity: variant.stock_quantity,
        },

        // ─ flat shortcuts (for CartDropdown / CartPreview) ─
        name: product.name,
        image: product.image,
        thumbnail: product.image,
        price: unitPriceCents,
      };
    });

    // 4. ═══ GET TOTALS (BACKEND) ═══
    let totals = null;
    try {
      const { data: rpcTotals, error: rpcError } = await supabase.rpc('get_cart_totals', { p_cart_id: cart.id });
      if (!rpcError && rpcTotals) {
        totals = rpcTotals;
      }
    } catch (e) {
      // Ignore RPC error, fallback to client calculation
    }

    // Fallback if RPC doesn't exist yet
    if (!totals) {
      const subtotal = normalized.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal >= 5000 ? 0 : 499;
      totals = {
        subtotal,
        discount: 0,
        shipping,
        total: subtotal + shipping,
        applied_promo: null
      };
    }

    return {
      cartId: cart.id,
      items: normalized,
      totals,
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
          id, color, size, price_cents, stock_quantity,
          products!product_variants_product_id_fkey ( id, name, slug, image, price_cents, rating_stars, rating_count )
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
      const unitPriceCents = v?.price_cents ?? product.price_cents ?? 0;
      const quantity = Math.max(Number(item.quantity) || 1, 1);
      
      return {
        id: `guest_${item.variant_id || item.product_id}`, // UI requires an id
        quantity,
        variant_id: item.variant_id,
        product_id: item.product_id,
        unit_price_cents: unitPriceCents,
        line_total_cents: unitPriceCents * quantity,

        products: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price_cents: unitPriceCents,
          rating_stars: product.rating_stars,
          rating_count: product.rating_count,
        },
        variant: {
          id: v?.id,
          color: v?.color,
          size: v?.size,
          price_cents: v?.price_cents,
          stock_quantity: v?.stock_quantity,
        },

        name: product.name,
        image: product.image,
        thumbnail: product.image,
        price: unitPriceCents,
      };
    });

    const subtotal = normalized.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 5000 ? 0 : 499;
    const totals = {
      subtotal,
      discount: 0,
      shipping,
      total: subtotal + shipping,
      applied_promo: null
    };

    return { cartId: null, items: normalized, totals };
  },

  // =========================
  // 🏷️ APPLY PROMO CODE (API)
  // =========================
  applyPromo: async (cartId, promoCode) => {
    if (!cartId) throw new Error("No active cart");
    const { data, error } = await supabase.rpc('get_cart_totals', { p_cart_id: cartId, p_promo_code: promoCode });
    if (error) throw error;
    
    // Check if promo was actually applied
    if (promoCode && !data.applied_promo) {
       throw new Error("Invalid or expired promo code, or order minimum not met.");
    }
    return data;
  },

  // =========================
  // ➕ ADD TO CART
  // =========================
  add: async ({ cartId, productId, variantId, quantity = 1 }) => {
    if (!cartId) throw new Error("No active cart ID provided to CartAPI.add");
    
    // Ensure we have a variant_id. If missing, fetch the first available variant for the product.
    let finalVariantId = variantId;
    
    if (!finalVariantId && productId) {
      const { data: variants, error: vError } = await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", productId)
        .limit(1);
      
      if (vError) console.error("Error fetching default variant:", vError);
      if (variants && variants.length > 0) {
        finalVariantId = variants[0].id;
      }
    }

    if (!finalVariantId) {
      throw new Error(`Could not add to cart: No variant found for product ${productId}`);
    }

    const { data, error } = await supabase.rpc("add_cart_items_bulk", {
      p_cart_id: cartId,
      p_items: [{
        product_id: productId,
        variant_id: finalVariantId,
        quantity: Math.max(quantity, 1),
      }],
    });

    if (error) {
      console.error("CartAPI.add error:", error);
      throw error;
    }
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
    queryKey: ["cart-recommendations", normalizeProductIds(productIDs), limit],

    queryFn: async () => {
      const cartProductIdsList = normalizeProductIds(productIDs);
      const cartProductIds = new Set(cartProductIdsList);
      const userId = await getCurrentUserId();

      const [wishlistIdsList, activitySignals] = await Promise.all([
        fetchWishlistProductIds(userId),
        fetchActivitySignals(userId),
      ]);

      const wishlistProductIds = new Set(wishlistIdsList);
      const activityProductIdsList = [...activitySignals.keys()];
      const seedProductIds = normalizeProductIds([
        ...cartProductIdsList,
        ...wishlistIdsList,
        ...activityProductIdsList,
      ]);
      const seedProducts = await fetchProductsByIds(seedProductIds);
      const cartSeeds = seedProducts.filter((product) => cartProductIds.has(product.id));
      const wishlistSeeds = seedProducts.filter((product) => wishlistProductIds.has(product.id));
      const activitySeeds = seedProducts.filter((product) => activitySignals.has(product.id));
      const intentSeeds = seedProducts.length ? seedProducts : cartSeeds;
      const categoryIds = normalizeProductIds(intentSeeds.map((product) => product.category_id));
      const brands = normalizeTextValues(intentSeeds.map((product) => product.brand));
      const keywords = keywordListFromProducts(intentSeeds);
      const candidateLimit = Math.max(limit * 10, 60);

      const [
        similarResult,
        categoryProducts,
        brandProducts,
        keywordProducts,
        popularProducts,
      ] = await Promise.all([
        fetchSimilarProducts(cartProductIdsList, candidateLimit),
        fetchProductsByField("category_id", categoryIds, candidateLimit),
        fetchProductsByField("brand", brands, candidateLimit),
        fetchProductsByKeywords(keywords, candidateLimit),
        fetchPopularProducts(candidateLimit),
      ]);

      const candidateProducts = uniqueProducts([
        seedProducts,
        similarResult.products,
        categoryProducts,
        brandProducts,
        keywordProducts,
        popularProducts,
      ]).filter((product) => !cartProductIds.has(product.id));
      const metricsById = await fetchProductMetrics(candidateProducts.map((product) => product.id));

      return candidateProducts
        .map((product) => ({
          ...product,
          recommendation_score: scoreRecommendation({
            product,
            cartProductIds,
            cartSeeds,
            wishlistProductIds,
            wishlistSeeds,
            activitySignals,
            activitySeeds,
            metricsById,
            similarScoreById: similarResult.scoreById,
          }),
        }))
        .filter((product) => Number.isFinite(product.recommendation_score))
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit);
    },
  }),
};
