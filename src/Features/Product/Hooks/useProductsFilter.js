import { useState, useEffect, useMemo, useCallback } from "react";

export function useProductsFilter(allProducts) {
  const maxBudget = useMemo(() => 
    allProducts.length ? Math.max(...allProducts.map((p) => p.price_cents || 0), 1000) : 10000
  , [allProducts]);

  const [filters, setFilters] = useState({ 
    sort: "default", 
    rating: null, 
    inStock: false, 
    onSale: false, 
    budget: maxBudget 
  });

  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setFilters((f) => {
      if (f.budget === 10000 || f.budget === 0) return { ...f, budget: maxBudget };
      return f;
    });
  }, [maxBudget]);

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
    
    const s = filters.sort;
    if (s === "price-asc") r.sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0));
    else if (s === "price-desc") r.sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0));
    else if (s === "rating") r.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
    else if (s === "newest") r.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    
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
