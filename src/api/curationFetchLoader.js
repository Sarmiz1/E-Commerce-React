import { supabase } from "../lib/supabaseClient";
import { normalizeSellableProduct } from "../utils/productAvailability";

const HOME_PRODUCT_SELECT = `
  id,
  slug,
  name,
  short_description,
  full_description,
  image,
  price_minor,
  sale_price_minor,
  sale_starts_at,
  sale_ends_at,
  rating_stars,
  rating_count,
  category_id,
  brand,
  seller_id,
  keywords,
  showcase_badge,
  is_featured,
  is_active,
  created_at,
  product_variants(*),
  product_images(*),
  category:categories!category_id (
    id,
    name,
    slug
  ),
  seller:seller_public!seller_id (
    id,
    full_name,
    avatar_url,
    store_name,
    store_slug,
    store_logo,
    rating,
    is_verified_store,
    trust_score,
    seller_badges
  )
`;

export const CURATION_DEFINITIONS = [
  { key: "heroFeatured", slugs: ["hero-featured", "hero_featured"], limit: 1 },
  { key: "trendingProducts", slugs: ["trending-products", "trending_products"], limit: 8 },
  { key: "bestSellers", slugs: ["best-sellers", "best_sellers"], limit: 8 },
  { key: "newArrivals", slugs: ["new-arrivals", "new_arrivals"], limit: 8 },
  { key: "flashDeals", slugs: ["flash-deals", "flash_deals"], limit: 8 },
  { key: "recommendedForUser", slugs: ["recommended-for-user", "recommended_for_user"], limit: 8 },
  { key: "continueShopping", slugs: ["continue-shopping", "continue_shopping"], limit: 8 },
  { key: "editorialCollections", slugs: ["editorial-collections", "editorial_collections"], limit: 8 },
  { key: "topSellers", slugs: ["top-sellers", "top_sellers"], limit: 8 },
  { key: "recentlyAddedStores", slugs: ["recently-added-stores", "recently_added_stores"], limit: 8 },
  { key: "hotRightNow", slugs: ["hot-right-now", "hot_right_now"], limit: 8 },
  { key: "mostLoved", slugs: ["most-loved", "most_loved"], limit: 8 },
  { key: "editorsPicks", slugs: ["editors-picks", "editors_picks"], limit: 8 },
  { key: "dealOfTheDay", slugs: ["deal-of-the-day", "deal_of_the_day"], limit: 1 },
  { key: "productScrollStrip", slugs: ["product-scroll-strip", "product_scroll_strip"], limit: 10 },
  { key: "bentoProducts", slugs: ["bento-products", "bento_products"], limit: 5 },
  { key: "filterGrid", slugs: ["filter-grid", "filter_grid"], limit: 12 },
  { key: "lookbook", slugs: ["lookbook-products", "lookbook_products", "lookbook"], limit: 4 },
  { key: "basedOnBrowsing", slugs: ["based-on-browsing", "based_on_browsing"], limit: 12 },
];

const EMPTY_HOME_CURATIONS = CURATION_DEFINITIONS.reduce(
  (feed, definition) => {
    feed[definition.key] = [];
    return feed;
  },
  {
    curations: [],
    curationCards: [],
    curationSections: [],
    unavailableFeeds: [],
  },
);

const normalizeSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeProduct = (item = {}) => {
  const productImages = item.product_images || item.images || [];
  const firstRelatedImage = Array.isArray(productImages)
    ? productImages.find(Boolean)
    : null;
  const relatedImageUrl =
    typeof firstRelatedImage === "string"
      ? firstRelatedImage
      : firstRelatedImage?.image_url || firstRelatedImage?.url;

  return {
    ...item,
    id: firstDefined(item.product_id, item.id),
    slug: firstDefined(item.product_slug, item.slug),
    name: firstDefined(item.product_name, item.name, item.title),
    description: firstDefined(item.short_description, item.full_description, item.product_description, item.description),
    image: firstDefined(
      item.product_image,
      item.image,
      item.image_url,
      item.thumbnail_url,
      relatedImageUrl,
    ),
    price_minor: firstDefined(item.price_minor, item.product_price_minor, item.price),
    rating_stars: firstDefined(item.rating_stars, item.rating, item.average_rating, 0),
    rating_count: firstDefined(item.rating_count, item.review_count, item.reviews_count, 0),
    product_variants: item.product_variants ?? item.variants ?? [],
    product_images: Array.isArray(productImages) ? productImages : [],
  };
};

const normalizeCuration = (curation = {}) => ({
  ...curation,
  slug: normalizeSlug(curation.slug || curation.name),
  name: curation.name || curation.title || "Curation",
  description: curation.description || "",
  showcaseTag: curation.showcase_tag || "",
  showcaseTagColor: curation.showcase_tag_color || "",
  showcaseSortOrder: curation.showcase_sort_order,
});

const createEmptyHomeCurations = () => ({
  ...EMPTY_HOME_CURATIONS,
  unavailableFeeds: [],
});

const sortMemberships = (a, b) => {
  const sortA = Number(a.sort_order ?? 9999);
  const sortB = Number(b.sort_order ?? 9999);
  if (sortA !== sortB) return sortA - sortB;
  return Number(b.score ?? 0) - Number(a.score ?? 0);
};

const buildCurationCards = (curations, membershipsByCurationId, productsById) =>
  curations.slice(0, 6).map((curation) => {
    const memberships = membershipsByCurationId.get(curation.id) || [];
    const availableProducts = memberships
      .map((membership) => productsById.get(membership.product_id))
      .filter(Boolean);
    const firstProduct = availableProducts[0];

    return {
      ...curation,
      label: curation.name,
      count: availableProducts.length ? `${availableProducts.length} picks` : "Curated",
      image: firstProduct?.image || curation.image || curation.image_url || "",
      path: "",
      bg: "from-indigo-500 to-violet-600",
    };
  });

async function fetchActiveCurations() {
  const { data, error } = await supabase
    .from("curations")
    .select("id, name, slug, description, is_active, created_at, showcase_tag, showcase_tag_color, showcase_sort_order")
    .eq("is_active", true)
    .order("showcase_sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      data: [],
      error: { table: "curations", message: error.message },
    };
  }

  return {
    data: (data || []).map(normalizeCuration),
    error: null,
  };
}

async function fetchCurationMemberships(curationIds) {
  if (!curationIds.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("curation_products")
    .select("curation_id, product_id, sort_order, score, source, metadata, created_at, updated_at")
    .in("curation_id", curationIds)
    .order("sort_order", { ascending: true })
    .order("score", { ascending: false });

  if (error) {
    return {
      data: [],
      error: { table: "curation_products", message: error.message },
    };
  }

  return { data: data || [], error: null };
}

async function fetchProducts(productIds) {
  const ids = [...new Set(productIds.filter(Boolean))];
  if (!ids.length) return { data: [], error: null };

  // Supabase .in() uses GET params — 1000+ UUIDs overflows the URL limit.
  // Batch into chunks of 50 to stay well under the threshold.
  const CHUNK_SIZE = 50;
  const allProducts = [];
  let firstError = null;

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase
      .from("products")
      .select(HOME_PRODUCT_SELECT)
      .in("id", chunk)
      .eq("is_active", true);

    if (error) {
      firstError = firstError || { table: "products", message: error.message };
      continue;
    }

    allProducts.push(...(data || []));
  }

  return {
    data: allProducts
      .map(normalizeProduct)
      .map(normalizeSellableProduct)
      .filter(Boolean),
    error: firstError,
  };
}

async function fetchProductSalesStats(productIds) {
  const ids = [...new Set(productIds.filter(Boolean))];
  if (!ids.length) return { data: new Map(), error: null };

  const { data, error } = await supabase.rpc("get_public_product_sales_stats", {
    p_product_ids: ids,
  });

  if (error) {
    return {
      data: new Map(),
      error: { table: "product_sales_stats", message: error.message },
    };
  }

  return {
    data: new Map(
      (data || []).map((stats) => [
        stats.product_id,
        {
          quantity_sold: Number(stats.quantity_sold || 0),
          sales_minor: Number(stats.sales_minor || 0),
          recent_quantity_sold: Number(stats.recent_quantity_sold || 0),
        },
      ]),
    ),
    error: null,
  };
}

function groupMemberships(memberships) {
  const grouped = new Map();

  memberships.forEach((membership) => {
    if (!grouped.has(membership.curation_id)) {
      grouped.set(membership.curation_id, []);
    }
    grouped.get(membership.curation_id).push(membership);
  });

  grouped.forEach((items) => items.sort(sortMemberships));
  return grouped;
}

const withMembershipMerchandising = (product, membership, stats) => ({
  ...product,
  curation: {
    sortOrder: membership.sort_order,
    score: membership.score,
    source: membership.source,
    metadata: membership.metadata || {},
  },
  badge: membership.metadata?.badge || membership.metadata?.tag || product.showcase_badge || product.badge,
  tag: membership.metadata?.tag || product.tag,
  velocity: membership.metadata?.velocity || product.velocity,
  reason: membership.metadata?.reason || product.reason,
  note: membership.metadata?.note || product.note,
  timeLeft: membership.metadata?.timeLeft || membership.metadata?.time_left || product.timeLeft,
  stock: Number(membership.metadata?.stock || product.stock || product.stock_quantity || 0),
  sold: Number(
    membership.metadata?.quantity_sold ||
    membership.metadata?.sold ||
    stats?.quantity_sold ||
    product.quantity_sold ||
    product.sold ||
    0
  ),
  quantity_sold: Number(stats?.quantity_sold || membership.metadata?.quantity_sold || product.quantity_sold || 0),
  recent_quantity_sold: Number(stats?.recent_quantity_sold || product.recent_quantity_sold || 0),
  sales_minor: Number(stats?.sales_minor || membership.metadata?.sales_minor || product.sales_minor || 0),
});

function buildHomeFeed({ curations, memberships, products, salesStatsByProductId = new Map() }) {
  const feed = createEmptyHomeCurations();
  const curationBySlug = new Map(curations.map((curation) => [curation.slug, curation]));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const membershipsByCurationId = groupMemberships(memberships);

  feed.curations = curations;
  feed.curationCards = buildCurationCards(curations, membershipsByCurationId, productsById);
  feed.curationSections = curations
    .map((curation) => {
      const curationMemberships = membershipsByCurationId.get(curation.id) || [];
      const productsForCuration = curationMemberships
        .map((membership) => {
          const product = productsById.get(membership.product_id);
          if (!product) return null;
          return withMembershipMerchandising(
            product,
            membership,
            salesStatsByProductId.get(membership.product_id),
          );
        })
        .filter(Boolean);

      return {
        ...curation,
        products: productsForCuration,
        productCount: productsForCuration.length,
      };
    })
    .filter((curation) => curation.products.length);

  CURATION_DEFINITIONS.forEach((definition) => {
    const curation = definition.slugs
      .map(normalizeSlug)
      .map((slug) => curationBySlug.get(slug))
      .find(Boolean);

    if (!curation) return;

    feed[definition.key] = (membershipsByCurationId.get(curation.id) || [])
      .map((membership) => {
        const product = productsById.get(membership.product_id);
        if (!product) return null;
        return withMembershipMerchandising(
          product,
          membership,
          salesStatsByProductId.get(membership.product_id),
        );
      })
      .filter(Boolean)
      .slice(0, definition.limit);
  });

  return feed;
}

export const CurationFetchLoaderAPI = {
  getHomeCurations: () => ({
    queryKey: ["home-curations"],
    queryFn: async () => {
      const feed = createEmptyHomeCurations();
      const curationsResult = await fetchActiveCurations();

      if (curationsResult.error) {
        return {
          ...feed,
          unavailableFeeds: [curationsResult.error],
        };
      }

      const curations = curationsResult.data;
      const membershipsResult = await fetchCurationMemberships(
        curations.map((curation) => curation.id),
      );
      const productsResult = await fetchProducts(
        membershipsResult.data.map((membership) => membership.product_id),
      );
      const salesStatsResult = await fetchProductSalesStats(
        membershipsResult.data.map((membership) => membership.product_id),
      );

      return {
        ...buildHomeFeed({
          curations,
          memberships: membershipsResult.data,
          products: productsResult.data,
          salesStatsByProductId: salesStatsResult.data,
        }),
        unavailableFeeds: [
          membershipsResult.error,
          productsResult.error,
          salesStatsResult.error,
        ].filter(Boolean),
      };
    },
  }),
};

export {
  createEmptyHomeCurations,
  fetchProducts as fetchCurationProductsByIds,
  normalizeSlug as normalizeCurationSlug,
};
