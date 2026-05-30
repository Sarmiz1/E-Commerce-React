// src/api/productsApi.js
import { supabase } from "../lib/supabaseClient";
import { createResourceApi } from "./createResourceApi";

// 🔥 Ultimate select string with explicit relationship hints
const PRODUCT_SELECT = `
  *,
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
  ),
  product_variants(*),
  product_images(*)
`;

// 🔥 Create base resources
export const productsResource = createResourceApi("products", PRODUCT_SELECT);

const PRODUCT_PAGE_SIZE = 500;
const SEARCH_RESULT_LIMIT = 8;
const SEARCH_DISCOVERY_LIMIT = 8;
const MAX_SEARCH_CANDIDATES = 1000;
const PRODUCT_SEARCH_CANDIDATE_SELECT = "id, click_score, rating_count";

const normalizeSearchTerm = (value = "") =>
  String(value)
    .trim()
    .replace(/[,().%_*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSearchVariants = (searchTerm) => {
  const tokens = normalizeSearchTerm(searchTerm)
    .toLowerCase()
    .split(" ")
    .filter((token) => token.length > 1);

  return [...new Set(tokens.flatMap((token) => [
    token,
    `${token[0].toUpperCase()}${token.slice(1)}`,
  ]))];
};

const getSearchCandidateLimit = (limit) =>
  Math.min(Math.max(Number(limit) || SEARCH_RESULT_LIMIT, 24), MAX_SEARCH_CANDIDATES);

const getActiveProductCandidatesQuery = () =>
  supabase
    .from("products")
    .select(PRODUCT_SEARCH_CANDIDATE_SELECT)
    .eq("is_active", true);

const orderSearchResults = (query) =>
  query
    .order("click_score", { ascending: false })
    .order("rating_count", { ascending: false })
    .order("created_at", { ascending: false });

const getQueryData = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchAllActiveProducts = async () => {
  const productsById = new Map();

  for (let from = 0; ; from += PRODUCT_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PRODUCT_PAGE_SIZE - 1);

    if (error) throw new Error(error.message);

    (data || []).forEach((product) => productsById.set(product.id, product));

    if (!data || data.length < PRODUCT_PAGE_SIZE) break;
  }

  return [...productsById.values()];
};

const fetchProductSearchResults = async (rawSearchTerm, limit = SEARCH_RESULT_LIMIT) => {
  const searchTerm = normalizeSearchTerm(rawSearchTerm);
  if (!searchTerm) return [];

  const candidateLimit = getSearchCandidateLimit(limit);
  const searchPattern = `*${searchTerm}*`;
  const slugPattern = `*${searchTerm.replace(/\s+/g, "-")}*`;
  const searchVariants = getSearchVariants(searchTerm);

  const [
    primaryProducts,
    detailProducts,
    keywordProducts,
    aiTagProducts,
    categories,
    sellers,
  ] = await Promise.all([
    getQueryData(
      orderSearchResults(
        getActiveProductCandidatesQuery().or([
          `name.ilike.${searchPattern}`,
          `slug.ilike.${slugPattern}`,
          `brand.ilike.${searchPattern}`,
        ].join(",")),
      ).limit(candidateLimit),
    ),
    getQueryData(
      orderSearchResults(
        getActiveProductCandidatesQuery().or([
          `short_description.ilike.${searchPattern}`,
          `full_description.ilike.${searchPattern}`,
          `ai_summary.ilike.${searchPattern}`,
        ].join(",")),
      ).limit(candidateLimit),
    ),
    searchVariants.length
      ? getQueryData(
          orderSearchResults(
            getActiveProductCandidatesQuery().overlaps("keywords", searchVariants),
          ).limit(candidateLimit),
        )
      : [],
    searchVariants.length
      ? getQueryData(
          orderSearchResults(
            getActiveProductCandidatesQuery().overlaps("ai_tags", searchVariants),
          ).limit(candidateLimit),
        )
      : [],
    getQueryData(
      supabase
        .from("categories")
        .select("id")
        .or(`name.ilike.${searchPattern},slug.ilike.${slugPattern}`)
        .limit(32),
    ),
    getQueryData(
      supabase
        .from("seller_public")
        .select("id")
        .or([
          `full_name.ilike.${searchPattern}`,
          `store_name.ilike.${searchPattern}`,
          `store_slug.ilike.${slugPattern}`,
        ].join(","))
        .limit(32),
    ),
  ]);

  const [categoryProducts, sellerProducts] = await Promise.all([
    categories.length
      ? getQueryData(
          orderSearchResults(
            getActiveProductCandidatesQuery().in("category_id", categories.map(({ id }) => id)),
          ).limit(candidateLimit),
        )
      : [],
    sellers.length
      ? getQueryData(
          orderSearchResults(
            getActiveProductCandidatesQuery().in("seller_id", sellers.map(({ id }) => id)),
          ).limit(candidateLimit),
        )
      : [],
  ]);

  const candidatesById = new Map();
  const addCandidates = (products, relevance) => {
    products.forEach((product) => {
      const current = candidatesById.get(product.id);
      if (!current || relevance > current.relevance) {
        candidatesById.set(product.id, { product, relevance });
      }
    });
  };

  addCandidates(primaryProducts, 60);
  addCandidates(keywordProducts, 50);
  addCandidates(aiTagProducts, 50);
  addCandidates(categoryProducts, 40);
  addCandidates(sellerProducts, 35);
  addCandidates(detailProducts, 20);

  const rankedCandidates = [...candidatesById.values()]
    .sort((a, b) =>
      b.relevance - a.relevance ||
      (Number(b.product.click_score) || 0) - (Number(a.product.click_score) || 0) ||
      (Number(b.product.rating_count) || 0) - (Number(a.product.rating_count) || 0),
    )
    .slice(0, Math.max(Number(limit) || SEARCH_RESULT_LIMIT, 1));

  if (!rankedCandidates.length) return [];

  const completeProducts = await getQueryData(
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .in("id", rankedCandidates.map(({ product }) => product.id)),
  );
  const completeProductsById = new Map(
    completeProducts.map((product) => [product.id, product]),
  );

  return rankedCandidates
    .map(({ product }) => completeProductsById.get(product.id))
    .filter(Boolean);
};

const fetchSearchDiscovery = async () => {
  const [categories, popularProducts] = await Promise.all([
    getQueryData(
      supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true })
        .limit(SEARCH_DISCOVERY_LIMIT),
    ),
    getQueryData(
      supabase
        .from("products")
        .select("name, keywords")
        .eq("is_active", true)
        .order("click_score", { ascending: false })
        .order("rating_count", { ascending: false })
        .limit(32),
    ),
  ]);

  const popularSearches = [...new Set(
    popularProducts
      .flatMap((product) => [...(product.keywords || []), product.name])
      .map(normalizeSearchTerm)
      .filter(Boolean),
  )].slice(0, SEARCH_DISCOVERY_LIMIT);

  return {
    popularSearches,
    categories: categories.map(({ id, name, slug }) => ({
      id,
      label: name,
      query: slug || name,
    })),
  };
};


export const ProductsAPI = {
  getAll: () => ({
    queryKey: ["products", "complete-catalog-v1"],
    queryFn: fetchAllActiveProducts,
  }),

  getById: (id) => ({
    queryKey: ["product", id],
    queryFn: () => productsResource.get(supabase, id),
  }),

  getBySlug: (slug) => ({
    queryKey: ["product", slug],
    queryFn: async () => {
      const data = await productsResource.list(supabase, [
        ["slug", "eq", slug],
        ["is_active", "eq", true],
      ]);

      if (!data?.length) {
        throw new Error("Product not found");
      }

      return data[0];
    },
  }),

  getByKeywords: (keywordsArray) => ({
    queryKey: ["products", keywordsArray],
    queryFn: () =>
      productsResource.list(supabase, [
        ["is_active", "eq", true],
        ["keywords", "overlaps", keywordsArray],
        ["created_at", "order", { ascending: false }],
      ]),
  }),

  search: (searchTerm, limit = SEARCH_RESULT_LIMIT) => ({
    queryKey: ["product-search", normalizeSearchTerm(searchTerm), limit],
    queryFn: () => fetchProductSearchResults(searchTerm, limit),
  }),

  getSearchDiscovery: () => ({
    queryKey: ["product-search-discovery"],
    queryFn: fetchSearchDiscovery,
  }),

  recommendations: (productID, limit = 8) => ({
    queryKey: ["product-recommendations", productID, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_ranked_similar_products",
        {
          target_id: productID,
          limit_count: limit,
        }
      );

      if (error) {
        throw new Error(
          error.message || "Failed to fetch recommendations"
        );
      }

      return data ?? [];
    },
  }),
};

// Also keep storeApi logic here for backward compatibility if needed
export const storeApi = {
  getMyStore: async (userId) => {
    const { data, error } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  getDashboardStats: async (userId) => {
    const { data, error } = await supabase
      .from("seller_dashboard_stats")
      .select("*")
      .eq("seller_id", userId)
      .single();

    if (error) throw error;
    return data;
  },
};
