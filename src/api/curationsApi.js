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
    ? {
        ...data,
        slug: normalizeCurationSlug(data.slug || data.name),
        description: data.description || "",
      }
    : null;
};

const fetchActiveCurations = async () => {
  const { data: curations = [], error } = await supabase
    .from("curations")
    .select("id, name, slug, description, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  throwQueryError(error);

  const memberships = await fetchCurationMemberships();

  const productCounts = memberships.reduce((counts, membership) => {
    counts.set(membership.curation_id, (counts.get(membership.curation_id) || 0) + 1);
    return counts;
  }, new Map());

  return curations.map((curation) => ({
    ...curation,
    slug: normalizeCurationSlug(curation.slug || curation.name),
    description: curation.description || "",
    productCount: productCounts.get(curation.id) || 0,
  }));
};

const fetchCurationMemberships = async (curationId) => {
  const memberships = [];

  for (let from = 0; ; from += CURATION_MEMBERSHIP_PAGE_SIZE) {
    let query = supabase
      .from("curation_products")
      .select("curation_id, product_id, sort_order, score, source, metadata");

    if (curationId) {
      query = query.eq("curation_id", curationId);
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
};
