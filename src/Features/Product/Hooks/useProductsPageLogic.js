import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PAGE_SIZE, AD_INTERVAL } from "../utils/constants";
import { useGridColumns } from "./useGridColumns";

export function useProductsPageLogic({ allProducts, filteredProducts, isLoading, filterKey }) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({ filterKey, visibleCount: PAGE_SIZE });
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const gridRef = useRef(null);
  const sentinelRef = useRef(null);
  const { cols, adColSpan } = useGridColumns();
  const visibleCount = pagination.filterKey === filterKey
    ? pagination.visibleCount
    : PAGE_SIZE;

  // ── Quick-view global listener ──
  useEffect(() => {
    const handleQuickView = (e) => setQuickViewProduct(e.detail);
    window.addEventListener("open-quickview", handleQuickView);
    return () => window.removeEventListener("open-quickview", handleQuickView);
  }, []);

  const handleQuickView = useCallback((p) => setQuickViewProduct(p), []);

  // ── Infinite scroll via IntersectionObserver ──
  const allLoaded = visibleCount >= filteredProducts.length;

  useEffect(() => {
    if (allLoaded || isLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMoreRef.current) {
          loadingMoreRef.current = true;
          setLoadingMore(true);
          setTimeout(() => {
            setPagination((current) => ({
              filterKey,
              visibleCount:
                (current.filterKey === filterKey ? current.visibleCount : PAGE_SIZE) +
                PAGE_SIZE,
            }));
            loadingMoreRef.current = false;
            setLoadingMore(false);
          }, 100);
        }
      },
      { rootMargin: "1000px" } // Trigger 1000px before reaching bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [allLoaded, filterKey, isLoading]);

  // ── Build grid items with dynamic row-fill ──
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const gridItems = useMemo(() => {
    const items = [];
    let slotCount = 0;

    visibleProducts.forEach((product, i) => {
      items.push({ type: "product", product, idx: i });
      slotCount += 1;

      if ((i + 1) % AD_INTERVAL === 0 && i < visibleProducts.length - 1) {
        items.push({
          type: "ad",
          adType: Math.floor(i / AD_INTERVAL) % 2 === 0 ? "featured" : "deal",
          adProduct: allProducts[(i + 5) % allProducts.length],
          idx: i,
        });
        slotCount += adColSpan;
      }
    });

    // Dynamic row-fill trimming (only when more products available)
    if (!allLoaded) {
      let remainder = slotCount % cols;
      while (remainder > 0 && items.length > 0) {
        const last = items[items.length - 1];
        const slots = last.type === "ad" ? adColSpan : 1;
        items.pop();
        slotCount -= slots;
        remainder = slotCount % cols;
      }
    }

    return items;
  }, [visibleProducts, allProducts, cols, adColSpan, allLoaded]);

  return {
    mobileFilterOpen,
    setMobileFilterOpen,
    visibleCount,
    loadingMore,
    quickViewProduct,
    setQuickViewProduct,
    gridRef,
    sentinelRef,
    handleQuickView,
    gridItems,
    allLoaded,
  };
}
