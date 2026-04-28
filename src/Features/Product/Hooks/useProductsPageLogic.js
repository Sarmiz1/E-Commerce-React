import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import gsap from "gsap";
import { PAGE_SIZE, AD_INTERVAL } from "../Utils/constants";
import { useGridColumns } from "./useGridColumns";

export function useProductsPageLogic({ allProducts, filteredProducts, isLoading, selectedCategory, sort }) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const gridRef = useRef(null);
  const { cols, adColSpan } = useGridColumns();

  useEffect(() => {
    const handleQuickView = (e) => setQuickViewProduct(e.detail);
    window.addEventListener("open-quickview", handleQuickView);
    return () => window.removeEventListener("open-quickview", handleQuickView);
  }, []);

  const handleQuickView = useCallback((p) => setQuickViewProduct(p), []);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((v) => v + PAGE_SIZE);
      setLoadingMore(false);
    }, 600);
  }, []);

  useEffect(() => {
    if (!isLoading && gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: "expo.out",
          overwrite: "auto",
        }
      );
    }
  }, [isLoading, selectedCategory, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const allLoaded = visibleCount >= filteredProducts.length;

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

    // ── Dynamic row-fill trimming ──
    // Only trim when there are more products to load.
    // When all products are shown, allow a partial last row so nothing is hidden.
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
    handleQuickView,
    handleLoadMore,
    gridItems,
  };
}
