import { supabase } from "../lib/supabaseClient";
import {
  fetchCurationProductsByIds,
  normalizeCurationSlug,
} from "./curationFetchLoader";

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
});

const fetchCurationBySlug = async (curationSlug) => {
  const resolvedSlug = resolveCurationSlug(curationSlug);
  if (!resolvedSlug) return null;

  const { data, error } = await supabase
    .from("curations")
    .select("id, name, slug, description, is_active, created_at")
    .eq("slug", resolvedSlug)
    .eq("is_active", true)
    .maybeSingle();

  throwQueryError(error);

  return data
    ? normalizeCuration(data)
    : null;
};

const fetchRawActiveCurations = async () => {
  const { data: curations = [], error } = await supabase
    .from("curations")
    .select("id, name, slug, description, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

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

  return memberships
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
