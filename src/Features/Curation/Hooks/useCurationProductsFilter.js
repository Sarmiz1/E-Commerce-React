import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getEffectivePriceMinor,
  getProductCategoryOptions,
  isInStockProduct,
  isSaleProduct,
  matchesProductCategory,
} from "../../Product/Hooks/useProductsFilter";

const VALID_SORTS = new Set([
  "default",
  "recommended",
  "price-asc",
  "price-desc",
  "rating",
  "newest",
]);

const getNumericParam = (value, fallback) => {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const setOrDelete = (params, key, value, shouldSet = Boolean(value)) => {
  if (shouldSet) params.set(key, String(value));
  else params.delete(key);
};

export function useCurationProductsFilter(products = []) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const categoryOptions = useMemo(
    () => getProductCategoryOptions(products),
    [products],
  );
  const maxBudget = useMemo(
    () =>
      products.length
        ? Math.max(...products.map(getEffectivePriceMinor), 1000)
        : 10000,
    [products],
  );

  const filters = useMemo(() => {
    const requestedSort = searchParams.get("sort") || "default";
    const requestedRating = searchParams.get("rating");
    const rating =
      requestedRating === null
        ? null
        : getNumericParam(requestedRating, null);
    const requestedBudget = getNumericParam(searchParams.get("budget"), maxBudget);

    return {
      sort: VALID_SORTS.has(requestedSort) ? requestedSort : "default",
      rating: rating !== null && rating >= 0 && rating <= 5 ? rating : null,
      inStock: searchParams.get("stock") === "1",
      onSale: searchParams.get("sale") === "1",
      budget: Math.min(Math.max(requestedBudget, 0), maxBudget),
      search: "",
    };
  }, [maxBudget, searchParams]);

  const selectedCategory = searchParams.get("category") || "All";
  const selectedCategoryOption = categoryOptions.find(
    (category) => category.value === selectedCategory,
  );
  const selectedCategoryLabel = selectedCategoryOption?.label || selectedCategory;
  const selectedCategoryValue = selectedCategoryOption?.value || selectedCategory;

  const writeFilters = useCallback(
    (nextFilters, nextCategory) => {
      const next = new URLSearchParams(searchParamsKey);

      setOrDelete(next, "category", nextCategory, nextCategory && nextCategory !== "All");
      setOrDelete(next, "sort", nextFilters.sort, nextFilters.sort !== "default");
      setOrDelete(next, "rating", nextFilters.rating, nextFilters.rating !== null);
      setOrDelete(next, "stock", "1", nextFilters.inStock);
      setOrDelete(next, "sale", "1", nextFilters.onSale);
      setOrDelete(next, "budget", nextFilters.budget, nextFilters.budget < maxBudget);

      if (next.toString() !== searchParamsKey) {
        setSearchParams(next, { replace: true });
      }
    },
    [maxBudget, searchParamsKey, setSearchParams],
  );

  const setFilters = useCallback(
    (update) => {
      const nextFilters = typeof update === "function" ? update(filters) : update;
      writeFilters(nextFilters, selectedCategory);
    },
    [filters, selectedCategory, writeFilters],
  );

  const setSelectedCategory = useCallback(
    (update) => {
      const nextCategory =
        typeof update === "function" ? update(selectedCategory) : update;
      writeFilters(filters, nextCategory);
    },
    [filters, selectedCategory, writeFilters],
  );

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      if (!matchesProductCategory(product, selectedCategory)) return false;
      if (getEffectivePriceMinor(product) > filters.budget) return false;
      if (filters.rating !== null && (product.rating_stars || 0) < filters.rating) {
        return false;
      }
      if (filters.inStock && !isInStockProduct(product)) return false;
      if (filters.onSale && !isSaleProduct(product)) return false;
      return true;
    });

    if (filters.sort === "price-asc") {
      nextProducts.sort(
        (a, b) => getEffectivePriceMinor(a) - getEffectivePriceMinor(b),
      );
    } else if (filters.sort === "price-desc") {
      nextProducts.sort(
        (a, b) => getEffectivePriceMinor(b) - getEffectivePriceMinor(a),
      );
    } else if (filters.sort === "rating") {
      nextProducts.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
    } else if (filters.sort === "newest") {
      nextProducts.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
    } else if (filters.sort === "recommended") {
      nextProducts.sort(
        (a, b) =>
          (b.rating_stars || 0) * 5 +
          Math.log((b.rating_count || 0) + 1) -
          ((a.rating_stars || 0) * 5 + Math.log((a.rating_count || 0) + 1)),
      );
    }

    return nextProducts;
  }, [filters, products, selectedCategory]);

  const resetFilters = useCallback(() => {
    writeFilters(
      {
        sort: "default",
        rating: null,
        inStock: false,
        onSale: false,
        budget: maxBudget,
        search: "",
      },
      "All",
    );
  }, [maxBudget, writeFilters]);

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
    resetFilters,
  };
}
