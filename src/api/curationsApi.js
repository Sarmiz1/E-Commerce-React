import { supabase } from "../lib/supabaseClient";
import { ProductsAPI } from "./productsApi";
import {
  CURATION_DEFINITIONS,
  CurationFetchLoaderAPI,
  fetchCurationProductsByIds,
  normalizeCurationSlug,
} from "./curationFetchLoader";

const CURATION_SELECT =
  "id, name, slug, description, is_active, created_at, showcase_tag, showcase_tag_color, showcase_sort_order";
const CURATION_SELECT_FALLBACK =
  "id, name, slug, description, is_active, created_at";
const CURATION_SLUG_ALIASES = {
  "flash-sale": "flash-deals",
  "flash-sales": "flash-deals",
  "recently-added": "new-arrivals",
  trending: "trending-products",
  "trending-now": "trending-products",
  lookbook: "lookbook-products",
};
const CURATION_MEMBERSHIP_PAGE_SIZE = 500;

export const resolveCurationSlug = (curationSlug) => {
  const normalizedSlug = normalizeCurationSlug(curationSlug);
  return CURATION_SLUG_ALIASES[normalizedSlug] || normalizedSlug;
};

const throwQueryError = (error) => {
  if (error) throw new Error(error.message);
};

const normalizeCuration = (curation = {}) => ({
  ...curation,
  slug: normalizeCurationSlug(curation.slug || curation.name),
  description: curation.description || "",
  showcaseTag: curation.showcase_tag || "",
  showcaseTagColor: curation.showcase_tag_color || "",
  showcaseSortOrder: curation.showcase_sort_order,
});

const titleFromSlug = (slug = "") =>
  String(slug)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const getDefinitionForSlug = (curationSlug) => {
  const resolvedSlug = resolveCurationSlug(curationSlug);
  return CURATION_DEFINITIONS.find((definition) =>
    definition.slugs.some((slug) => normalizeCurationSlug(slug) === resolvedSlug),
  );
};

const createFallbackCuration = (curationSlug) => {
  const resolvedSlug = resolveCurationSlug(curationSlug);
  const definition = getDefinitionForSlug(resolvedSlug);
  const slug = normalizeCurationSlug(definition?.slugs?.[0] || resolvedSlug);

  if (!slug) return null;

  return normalizeCuration({
    id: slug,
    name: titleFromSlug(slug),
    slug,
    description: "",
    is_active: true,
    created_at: null,
  });
};

const fetchCurationBySlug = async (curationSlug) => {
  const resolvedSlug = resolveCurationSlug(curationSlug);
  if (!resolvedSlug) return null;

  let { data, error } = await supabase
    .from("curations")
    .select(CURATION_SELECT)
    .eq("slug", resolvedSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error?.message?.includes("showcase_")) {
    const fallback = await supabase
      .from("curations")
      .select(CURATION_SELECT_FALLBACK)
      .eq("slug", resolvedSlug)
      .eq("is_active", true)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  throwQueryError(error);

  return data
    ? normalizeCuration(data)
    : createFallbackCuration(resolvedSlug);
};

const fetchRawActiveCurations = async () => {
  let { data: curations = [], error } = await supabase
    .from("curations")
    .select(CURATION_SELECT)
    .eq("is_active", true)
    .order("showcase_sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error?.message?.includes("showcase_")) {
    const fallback = await supabase
      .from("curations")
      .select(CURATION_SELECT_FALLBACK)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    curations = fallback.data || [];
    error = fallback.error;
  }

  throwQueryError(error);

  return curations.map(normalizeCuration);
};

const fetchActiveCurations = async () => {
  const curations = await fetchRawActiveCurations();
  const memberships = await fetchCurationMemberships(
    curations.map((curation) => curation.id),
  );

  const productCounts = memberships.reduce((counts, membership) => {
    counts.set(membership.curation_id, (counts.get(membership.curation_id) || 0) + 1);
    return counts;
  }, new Map());

  return curations.map((curation) => ({
    ...curation,
    productCount: productCounts.get(curation.id) || 0,
  }));
};

const fetchCurationMemberships = async (curationIdOrIds) => {
  const memberships = [];
  const curationIds = Array.isArray(curationIdOrIds)
    ? curationIdOrIds.filter(Boolean)
    : [];

  for (let from = 0; ; from += CURATION_MEMBERSHIP_PAGE_SIZE) {
    let query = supabase
      .from("curation_products")
      .select("curation_id, product_id, sort_order, score, source, metadata");

    if (curationIds.length) {
      query = query.in("curation_id", curationIds);
    } else if (curationIdOrIds) {
      query = query.eq("curation_id", curationIdOrIds);
    }

    const { data = [], error } = await query
      .order("sort_order", { ascending: true })
      .order("score", { ascending: false })
      .range(from, from + CURATION_MEMBERSHIP_PAGE_SIZE - 1);

    throwQueryError(error);
    memberships.push(...data);

    if (data.length < CURATION_MEMBERSHIP_PAGE_SIZE) break;
  }

  return memberships;
};

const groupCurationMemberships = (memberships = []) =>
  memberships.reduce((groups, membership) => {
    if (!groups.has(membership.curation_id)) {
      groups.set(membership.curation_id, []);
    }
    groups.get(membership.curation_id).push(membership);
    return groups;
  }, new Map());

const fetchCurationsWithProducts = async () => {
  const curations = await fetchRawActiveCurations();
  const curationIds = curations.map((curation) => curation.id);
  if (!curationIds.length) return [];

  const memberships = await fetchCurationMemberships(curationIds);
  const productsResult = await fetchCurationProductsByIds(
    memberships.map((membership) => membership.product_id),
  );

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  const productsById = new Map(
    productsResult.data.map((product) => [product.id, product]),
  );
  const membershipsByCuration = groupCurationMemberships(memberships);

  return curations
    .map((curation) => {
      const curationMemberships = membershipsByCuration.get(curation.id) || [];
      const products = curationMemberships
        .map((membership) => {
          const product = productsById.get(membership.product_id);
          if (!product) return null;

          return {
            ...product,
            curation: {
              sortOrder: membership.sort_order,
              score: membership.score,
              source: membership.source,
              metadata: membership.metadata,
            },
          };
        })
        .filter(Boolean);

      return {
        ...curation,
        productCount: products.length,
        products,
      };
    })
    .filter((curation) => curation.products.length);
};

const fetchProductsForCuration = async (curationSlug) => {
  const curation = await fetchCurationBySlug(curationSlug);
  if (!curation) return [];

  const memberships = await fetchCurationMemberships(curation.id);

  const productsResult = await fetchCurationProductsByIds(
    memberships.map((membership) => membership.product_id),
  );

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  const productsById = new Map(
    productsResult.data.map((product) => [product.id, product]),
  );

  const membershipProducts = memberships
    .map((membership) => {
      const product = productsById.get(membership.product_id);
      if (!product) return null;

      return {
        ...product,
        curation: {
          sortOrder: membership.sort_order,
          score: membership.score,
          source: membership.source,
          metadata: membership.metadata,
        },
      };
    })
    .filter(Boolean);

  if (membershipProducts.length) return membershipProducts;

  return fetchFallbackProductsForCuration(curation.slug);
};

const isSaleProduct = (product) => {
  const price = Number(product?.price_minor) || 0;
  const salePrice = Number(product?.sale_price_minor) || 0;
  const compareAt = Number(product?.compare_at_price_minor) || 0;
  const now = Date.now();
  const startsAt = product?.sale_starts_at ? new Date(product.sale_starts_at).getTime() : null;
  const endsAt = product?.sale_ends_at ? new Date(product.sale_ends_at).getTime() : null;

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;
  return (salePrice > 0 && salePrice < price) || (compareAt > price && price > 0);
};

const byNewest = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);
const byRating = (a, b) =>
  (Number(b.rating_stars || 0) * 10 + Number(b.rating_count || 0)) -
  (Number(a.rating_stars || 0) * 10 + Number(a.rating_count || 0));

const fetchFallbackProductsForCuration = async (curationSlug) => {
  const resolvedSlug = resolveCurationSlug(curationSlug);
  const products = await ProductsAPI.getAll().queryFn();
  let filtered = [...products];

  if (resolvedSlug === "new-arrivals") {
    filtered.sort(byNewest);
  } else if (resolvedSlug === "flash-deals" || resolvedSlug === "deal-of-the-day") {
    filtered = filtered.filter(isSaleProduct).sort(byNewest);
  } else if (
    resolvedSlug === "best-sellers" ||
    resolvedSlug === "trending-products" ||
    resolvedSlug === "hot-right-now" ||
    resolvedSlug === "most-loved"
  ) {
    filtered.sort(byRating);
  } else {
    const feed = await CurationFetchLoaderAPI.getHomeCurations({
      scope: "curation-detail-fallback",
      includeAllSections: true,
      includeSalesStats: true,
      includeStores: false,
      includeBrands: false,
    }).queryFn();
    const definition = getDefinitionForSlug(resolvedSlug);
    const feedProducts =
      feed[definition?.key] ||
      feed.curationSections?.find((section) => section.slug === resolvedSlug)?.products ||
      [];

    if (feedProducts.length) return feedProducts;
    filtered.sort(byNewest);
  }

  return filtered.slice(0, 60);
};

export const CurationsAPI = {
  getAll: () => ({
    queryKey: ["curations"],
    queryFn: fetchActiveCurations,
  }),
  getBySlug: (curationSlug) => ({
    queryKey: ["curation", curationSlug],
    queryFn: () => fetchCurationBySlug(curationSlug),
  }),
  getProducts: (curationSlug) => ({
    queryKey: ["curation-products", curationSlug],
    queryFn: () => fetchProductsForCuration(curationSlug),
  }),
  getIndexSections: () => ({
    queryKey: ["curation-index-sections"],
    queryFn: fetchCurationsWithProducts,
  }),
};
