import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ProductsAPI } from "../../../api/productsApi";
import { useDebounce } from "../../../Hooks/useDebounce";

const PRODUCT_SEARCH_LIMIT = 1000;
const PRODUCT_SEARCH_DEBOUNCE_MS = 250;
const VALID_SORTS = new Set([
  "default",
  "recommended",
  "price-asc",
  "price-desc",
  "rating",
  "newest",
]);

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeCategory = (value = "") => {
  try {
    return normalizeText(decodeURIComponent(value).replace(/-/g, " "));
  } catch {
    return normalizeText(String(value).replace(/-/g, " "));
  }
};

const getProductCategoryValues = (product) => {
  const category = product?.category;

  return [
    typeof category === "string" ? category : "",
    category?.id,
    category?.name,
    category?.slug,
    product?.category_name,
  ].filter(Boolean);
};

const hasActiveSalePrice = (product) => {
  const price = Number(product?.price_minor) || 0;
  const salePrice = Number(product?.sale_price_minor) || 0;
  const now = Date.now();
  const saleStartsAt = product?.sale_starts_at ? new Date(product.sale_starts_at).getTime() : null;
  const saleEndsAt = product?.sale_ends_at ? new Date(product.sale_ends_at).getTime() : null;
  const saleWindowIsActive =
    (!saleStartsAt || saleStartsAt <= now) &&
    (!saleEndsAt || saleEndsAt >= now);

  return saleWindowIsActive && salePrice > 0 && salePrice < price;
};

export const getEffectivePriceMinor = (product) =>
  hasActiveSalePrice(product)
    ? Number(product.sale_price_minor)
    : Number(product?.price_minor) || 0;

export const isSaleProduct = (product) => {
  const price = Number(product?.price_minor) || 0;
  const originalPrice = Number(product?.compare_at_price_minor || product?.original_price_minor) || 0;

  return hasActiveSalePrice(product) || (price > 0 && originalPrice > price);
};

export const isInStockProduct = (product) => {
  const variants = product?.product_variants || product?.variants || [];

  if (variants.length) {
    return variants.some((variant) => Number(variant?.stock_quantity) > 0);
  }

  return Number(product?.stock_quantity) > 0;
};

export const matchesProductCategory = (product, selectedCategory) => {
  const normalizedSelection = normalizeCategory(selectedCategory);
  if (!normalizedSelection || normalizedSelection === "all") return true;

  return getProductCategoryValues(product).some(
    (value) => normalizeCategory(value) === normalizedSelection,
  );
};

export const getProductCategoryOptions = (products = []) => {
  const categoriesByValue = new Map();

  products.forEach((product) => {
    const category = product?.category;
    const label = typeof category === "string" ? category : category?.name;
    const value = typeof category === "string" ? category : category?.slug || category?.name;
    if (!label || !value) return;

    const normalizedValue = normalizeCategory(value);
    if (categoriesByValue.has(normalizedValue)) return;

    categoriesByValue.set(normalizedValue, {
      id: category?.id || normalizedValue,
      label,
      value,
      image: product?.image || product?.product_images?.[0]?.image_url || "",
    });
  });

  return [
    { id: "all", label: "All", value: "All", image: "" },
    ...[...categoriesByValue.values()].sort((a, b) => a.label.localeCompare(b.label)),
  ];
};

const getNumericParam = (value, fallback) => {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const setOrDelete = (params, key, value, shouldSet = Boolean(value)) => {
  if (shouldSet) params.set(key, String(value));
  else params.delete(key);
};

export function useProductsFilter(allProducts) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const categoryOptions = useMemo(
    () => getProductCategoryOptions(allProducts),
    [allProducts],
  );
  const maxBudget = useMemo(
    () => allProducts.length
      ? Math.max(...allProducts.map(getEffectivePriceMinor), 1000)
      : 10000,
    [allProducts],
  );

  const filters = useMemo(() => {
    const requestedSort = searchParams.get("sort") || "default";
    const requestedRating = searchParams.get("rating");
    const rating = requestedRating === null
      ? null
      : getNumericParam(requestedRating, null);
    const requestedBudget = getNumericParam(searchParams.get("budget"), maxBudget);

    return {
      sort: VALID_SORTS.has(requestedSort) ? requestedSort : "default",
      rating: rating !== null && rating >= 0 && rating <= 5 ? rating : null,
      inStock: searchParams.get("stock") === "1",
      onSale: searchParams.get("sale") === "1",
      budget: Math.min(Math.max(requestedBudget, 0), maxBudget),
      search: searchParams.get("search") || "",
    };
  }, [maxBudget, searchParams]);
  const selectedCategory = searchParams.get("category") || "All";
  const selectedCategoryOption = categoryOptions.find(
    (category) => normalizeCategory(category.value) === normalizeCategory(selectedCategory),
  );
  const selectedCategoryLabel = selectedCategoryOption?.label || selectedCategory;
  const selectedCategoryValue = selectedCategoryOption?.value || selectedCategory;
  const searchTerm = filters.search.trim();
  const debouncedSearchTerm = useDebounce(searchTerm, PRODUCT_SEARCH_DEBOUNCE_MS);
  const isSearchDebouncing = Boolean(searchTerm && searchTerm !== debouncedSearchTerm);
  const {
    data: backendSearchProducts = [],
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isError: isSearchError,
  } = useQuery({
    ...ProductsAPI.search(debouncedSearchTerm, PRODUCT_SEARCH_LIMIT),
    enabled: Boolean(debouncedSearchTerm),
  });

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

  const filteredProducts = useMemo(() => {
    let products = searchTerm && !isSearchDebouncing
      ? [...backendSearchProducts]
      : searchTerm
        ? []
        : [...allProducts];

    if (selectedCategory !== "All") {
      products = products.filter((product) =>
        matchesProductCategory(product, selectedCategory),
      );
    }

    products = products.filter((product) => getEffectivePriceMinor(product) <= filters.budget);
    if (filters.rating !== null) {
      products = products.filter((product) => (product.rating_stars || 0) >= filters.rating);
    }
    if (filters.inStock) products = products.filter(isInStockProduct);
    if (filters.onSale) products = products.filter(isSaleProduct);

    const sort = filters.sort;
    if (sort === "price-asc") products.sort((a, b) => getEffectivePriceMinor(a) - getEffectivePriceMinor(b));
    else if (sort === "price-desc") products.sort((a, b) => getEffectivePriceMinor(b) - getEffectivePriceMinor(a));
    else if (sort === "rating") {
      products.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
    } else if (sort === "newest") {
      products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sort === "recommended") {
      products.sort((a, b) =>
        ((b.rating_stars || 0) * 5 + Math.log((b.rating_count || 0) + 1)) -
        ((a.rating_stars || 0) * 5 + Math.log((a.rating_count || 0) + 1)),
      );
    }

    return products;
  }, [allProducts, backendSearchProducts, filters, isSearchDebouncing, searchTerm, selectedCategory]);

  return {
    filters,
    setFilters,
    selectedCategory,
    selectedCategoryLabel,
    selectedCategoryValue,
    setSelectedCategory,
    categoryOptions,
    maxBudget,
    filteredProducts,
    filterKey: searchParamsKey,
    isSearchLoading: isSearchLoading || isSearchDebouncing,
    isSearchFetching: isSearchFetching || isSearchDebouncing,
    isSearchError,
  };
}
