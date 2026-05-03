import { supabase } from "../lib/supabaseClient";

const HOME_PRODUCT_SELECT = `
  id,
  slug,
  name,
  short_description,
  full_description,
  image,
  price_cents,
  sale_price_cents,
  rating_stars,
  rating_count,
  category_id,
  brand,
  seller_id,
  keywords,
  is_featured,
  created_at,
  product_variants(*),
  product_images(*),
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
    price_cents: firstDefined(item.price_cents, item.product_price_cents, item.price),
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
    const firstProduct = memberships
      .map((membership) => productsById.get(membership.product_id))
      .find(Boolean);

    return {
      ...curation,
      label: curation.name,
      count: memberships.length ? `${memberships.length} picks` : "Curated",
      image: firstProduct?.image || curation.image || curation.image_url || "",
      path: "",
      bg: "from-indigo-500 to-violet-600",
    };
  });

async function fetchActiveCurations() {
  const { data, error } = await supabase
    .from("curations")
    .select("id, name, slug, description, is_active, created_at")
    .eq("is_active", true)
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

  if (firstError && !allProducts.length) {
    return { data: [], error: firstError };
  }

  return {
    data: allProducts.map(normalizeProduct),
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

function buildHomeFeed({ curations, memberships, products }) {
  const feed = createEmptyHomeCurations();
  const curationBySlug = new Map(curations.map((curation) => [curation.slug, curation]));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const membershipsByCurationId = groupMemberships(memberships);

  feed.curations = curations;
  feed.curationCards = buildCurationCards(curations, membershipsByCurationId, productsById);

  CURATION_DEFINITIONS.forEach((definition) => {
    const curation = definition.slugs
      .map(normalizeSlug)
      .map((slug) => curationBySlug.get(slug))
      .find(Boolean);

    if (!curation) return;

    feed[definition.key] = (membershipsByCurationId.get(curation.id) || [])
      .map((membership) => productsById.get(membership.product_id))
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

      return {
        ...buildHomeFeed({
          curations,
          memberships: membershipsResult.data,
          products: productsResult.data,
        }),
        unavailableFeeds: [
          membershipsResult.error,
          productsResult.error,
        ].filter(Boolean),
      };
    },
  }),
};

export { createEmptyHomeCurations };
