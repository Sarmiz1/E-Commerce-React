import { useCallback, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { rankProductsBySemanticQuery } from "../../../utils/semanticProductSearch";

const DAY_MS = 24 * 60 * 60 * 1000;
const NEW_ARRIVAL_WINDOW_MS = 90 * DAY_MS;
const LISTING_ENDPOINTS = new Set(["brands", "categories", "collections", "curations"]);
const SPECIAL_FILTERS = new Set(["brands", "new", "new-arrivals", "sale"]);
const CURATION_FILTERS = new Set([
  "flash-deals",
  "flash-sales",
  "new",
  "new-arrivals",
  "sale",
  "trending",
  "trending-now",
]);
const SEARCH_STOP_WORDS = new Set(["and"]);

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const slugToText = (value = "") => {
  try {
    return normalizeText(decodeURIComponent(value).replace(/-/g, " "));
  } catch {
    return normalizeText(String(value).replace(/-/g, " "));
  }
};

const getProductCorpus = (product) =>
  normalizeText([
    product.name,
    product.description,
    product.short_description,
    product.full_description,
    typeof product.brand === "string" ? product.brand : product.brand?.name,
    typeof product.category === "string" ? product.category : product.category?.name,
    typeof product.category === "object" ? product.category?.slug : "",
    product.category_name,
    product.seller?.store_name,
    ...(Array.isArray(product.keywords) ? product.keywords : []),
    ...(Array.isArray(product.ai_tags) ? product.ai_tags : []),
  ].filter(Boolean).join(" "));

const matchesTerm = (product, term) => {
  const corpus = getProductCorpus(product);
  const words = slugToText(term)
    .split(" ")
    .filter((word) => word.length > 1 && !SEARCH_STOP_WORDS.has(word));

  return words.some((word) => corpus.includes(word));
};

export const isSaleProduct = (product) => {
  const price = Number(product?.price_minor) || 0;
  const salePrice = Number(product?.sale_price_minor) || 0;
  const originalPrice = Number(product?.compare_at_price_minor || product?.original_price_minor) || 0;
  const now = Date.now();
  const saleStartsAt = product?.sale_starts_at ? new Date(product.sale_starts_at).getTime() : null;
  const saleEndsAt = product?.sale_ends_at ? new Date(product.sale_ends_at).getTime() : null;
  const saleWindowIsActive =
    (!saleStartsAt || saleStartsAt <= now) &&
    (!saleEndsAt || saleEndsAt >= now);

  return (
    (saleWindowIsActive && salePrice > 0 && salePrice < price) ||
    (price > 0 && originalPrice > price)
  );
};

export const getListingContext = (pathname, rawFilter) => {
  const segments = pathname.split("/").filter(Boolean);
  const productsIndex = segments.indexOf("products");
  const routeSegments = productsIndex >= 0 ? segments.slice(productsIndex + 1) : [];
  let [endpoint, ...slugs] = routeSegments;

  if (!LISTING_ENDPOINTS.has(endpoint)) {
    endpoint = "";
    slugs = [];
  }

  if (endpoint === "curations" && slugs[0] === "brands") {
    endpoint = "brands";
    slugs = slugs.slice(1);
  }

  const queryFilter = slugToText(rawFilter);
  const normalizedSlugs = slugs.map(slugToText);
  const curationFilters = endpoint === "curations"
    ? normalizedSlugs.map((slug) => slug.replace(/\s+/g, "-"))
    : [];
  const routeTerms =
    endpoint === "curations"
      ? slugs.filter((slug) => !CURATION_FILTERS.has(slug)).slice(-1)
      : slugs.slice(-1);
  const queryTerms =
    routeTerms.length === 0 &&
    queryFilter &&
    !SPECIAL_FILTERS.has(queryFilter.replace(/\s+/g, "-"))
      ? [queryFilter]
      : [];
  const terms = [...new Set([...routeTerms, ...queryTerms].map(slugToText).filter(Boolean))];

  return {
    endpoint,
    terms,
    isNewArrival:
      queryFilter === "new" ||
      queryFilter === "new arrivals" ||
      curationFilters.some((filter) => filter === "new" || filter === "new-arrivals"),
    isSale:
      queryFilter === "sale" ||
      curationFilters.some((filter) => filter === "sale" || filter === "flash-deals" || filter === "flash-sales"),
    isTrending:
      queryFilter === "trending" ||
      curationFilters.some((filter) => filter === "trending" || filter === "trending-now"),
  };
};

const setOrDelete = (params, key, value, shouldSet = Boolean(value)) => {
  if (shouldSet) params.set(key, String(value));
  else params.delete(key);
};

export function useProductsFilter(allProducts) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const maxBudget = useMemo(
    () => allProducts.length
      ? Math.max(...allProducts.map((product) => product.price_minor || 0), 1000)
      : 10000,
    [allProducts],
  );

  const filters = useMemo(() => ({
    sort: searchParams.get("sort") || "default",
    rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : null,
    inStock: searchParams.get("stock") === "1",
    onSale: searchParams.get("sale") === "1",
    budget: searchParams.get("budget") ? Number(searchParams.get("budget")) : maxBudget,
    search: searchParams.get("search") || "",
  }), [maxBudget, searchParams]);
  const selectedCategory = searchParams.get("category") || "All";

  const writeFilters = useCallback((nextFilters, nextCategory) => {
    const next = new URLSearchParams(searchParamsKey);

    setOrDelete(next, "category", nextCategory, nextCategory && nextCategory !== "All");
    setOrDelete(next, "sort", nextFilters.sort, nextFilters.sort && nextFilters.sort !== "default");
    setOrDelete(next, "rating", nextFilters.rating, nextFilters.rating !== null);
    setOrDelete(next, "stock", "1", nextFilters.inStock);
    setOrDelete(next, "sale", "1", nextFilters.onSale);
    setOrDelete(next, "search", nextFilters.search?.trim(), nextFilters.search?.trim());
    setOrDelete(next, "budget", nextFilters.budget, nextFilters.budget < maxBudget);

    if (next.toString() !== searchParamsKey) {
      setSearchParams(next, { replace: true });
    }
  }, [maxBudget, searchParamsKey, setSearchParams]);

  const setFilters = useCallback((update) => {
    const nextFilters = typeof update === "function" ? update(filters) : update;
    writeFilters(nextFilters, selectedCategory);
  }, [filters, selectedCategory, writeFilters]);

  const setSelectedCategory = useCallback((update) => {
    const nextCategory = typeof update === "function" ? update(selectedCategory) : update;
    writeFilters(filters, nextCategory);
  }, [filters, selectedCategory, writeFilters]);

  const listingContext = useMemo(
    () => getListingContext(location.pathname, searchParams.get("filter")),
    [location.pathname, searchParams],
  );

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (listingContext.isNewArrival) {
      const newestTimestamp = Math.max(
        ...products.map((product) => new Date(product.created_at || 0).getTime()),
        0,
      );
      if (newestTimestamp) {
        products = products.filter((product) =>
          new Date(product.created_at || 0).getTime() >= newestTimestamp - NEW_ARRIVAL_WINDOW_MS,
        );
      }
    }

    if (listingContext.terms.length) {
      products = products.filter((product) =>
        listingContext.terms.some((term) => matchesTerm(product, term)),
      );
    }

    if (selectedCategory !== "All") {
      products = products.filter((product) => matchesTerm(product, selectedCategory));
    }

    products = products.filter((product) => (product.price_minor || 0) <= filters.budget);
    if (filters.rating !== null) {
      products = products.filter((product) => (product.rating_stars || 0) >= filters.rating);
    }
    if (filters.inStock) products = products.filter((product) => (product.price_minor || 0) > 0);
    if (filters.onSale || listingContext.isSale) products = products.filter(isSaleProduct);

    if (filters.search?.trim()) {
      const ranked = rankProductsBySemanticQuery(products, filters.search);
      products = ranked.length
        ? ranked
        : products.filter((product) => matchesTerm(product, filters.search));
    }

    const sort = filters.sort;
    if (sort === "price-asc") products.sort((a, b) => (a.price_minor || 0) - (b.price_minor || 0));
    else if (sort === "price-desc") products.sort((a, b) => (b.price_minor || 0) - (a.price_minor || 0));
    else if (sort === "rating" || (sort === "default" && listingContext.isTrending)) {
      products.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
    } else if (sort === "newest" || (sort === "default" && listingContext.isNewArrival)) {
      products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sort === "recommended") {
      products.sort((a, b) =>
        ((b.rating_stars || 0) * 5 + Math.log((b.rating_count || 0) + 1)) -
        ((a.rating_stars || 0) * 5 + Math.log((a.rating_count || 0) + 1)),
      );
    }

    return products;
  }, [allProducts, filters, listingContext, selectedCategory]);

  return {
    filters,
    setFilters,
    selectedCategory,
    setSelectedCategory,
    maxBudget,
    filteredProducts,
  };
}
