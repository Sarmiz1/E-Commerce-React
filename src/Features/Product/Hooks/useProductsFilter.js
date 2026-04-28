import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { rankProductsBySemanticQuery } from "../../../Utils/semanticProductSearch";

export function useProductsFilter(allProducts) {
  const [searchParams, setSearchParams] = useSearchParams();
  const maxBudget = useMemo(() => 
    allProducts.length ? Math.max(...allProducts.map((p) => p.price_cents || 0), 1000) : 10000
  , [allProducts]);

  const [filters, setFilters] = useState({ 
    sort: searchParams.get("sort") || "default",
    rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : null,
    inStock: searchParams.get("stock") === "1",
    onSale: searchParams.get("sale") === "1",
    budget: searchParams.get("budget") ? Number(searchParams.get("budget")) : maxBudget,
    search: searchParams.get("search") || "",
  });

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");

  useEffect(() => {
    setFilters((f) => {
      if (f.budget === 10000 || f.budget === 0) return { ...f, budget: maxBudget };
      return f;
    });
  }, [maxBudget]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (selectedCategory && selectedCategory !== "All") next.set("category", selectedCategory);
    else next.delete("category");

    if (filters.sort && filters.sort !== "default") next.set("sort", filters.sort);
    else next.delete("sort");

    if (filters.rating !== null) next.set("rating", String(filters.rating));
    else next.delete("rating");

    if (filters.inStock) next.set("stock", "1");
    else next.delete("stock");

    if (filters.onSale) next.set("sale", "1");
    else next.delete("sale");

    if (filters.search?.trim()) next.set("search", filters.search.trim());
    else next.delete("search");

    if (filters.budget < maxBudget) next.set("budget", String(filters.budget));
    else next.delete("budget");

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [filters, maxBudget, searchParams, selectedCategory, setSearchParams]);

  const filteredProducts = useMemo(() => {
    let r = [...allProducts];
    if (selectedCategory !== "All") {
      const q = selectedCategory.toLowerCase();
      r = r.filter((p) => 
        p.name?.toLowerCase().includes(q) || 
        (Array.isArray(p.keywords) && p.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }
    r = r.filter((p) => (p.price_cents || 0) <= filters.budget);
    if (filters.rating !== null) r = r.filter((p) => (p.rating_stars || 0) >= filters.rating);
    if (filters.inStock) r = r.filter((p) => (p.price_cents || 0) > 0);
    if (filters.onSale) r = r.filter((p) => (p.price_cents || 0) < 2000);

    if (filters.search?.trim()) {
      const ranked = rankProductsBySemanticQuery(r, filters.search);
      r = ranked.length
        ? ranked
        : r.filter((p) => {
            const q = filters.search.toLowerCase();
            return (
              p.name?.toLowerCase().includes(q) ||
              p.seller?.store_name?.toLowerCase().includes(q) ||
              (Array.isArray(p.keywords) && p.keywords.some((k) => k.toLowerCase().includes(q)))
            );
          });
    }
    
    const s = filters.sort;
    if (s === "price-asc") r.sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0));
    else if (s === "price-desc") r.sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0));
    else if (s === "rating") r.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
    else if (s === "newest") r.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    else if (s === "recommended") r.sort((a, b) =>
      ((b.rating_stars || 0) * 5 + Math.log((b.rating_count || 0) + 1)) -
      ((a.rating_stars || 0) * 5 + Math.log((a.rating_count || 0) + 1))
    );
    
    return r;
  }, [allProducts, selectedCategory, filters]);

  return {
    filters,
    setFilters,
    selectedCategory,
    setSelectedCategory,
    maxBudget,
    filteredProducts
  };
}
