import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAllProducts } from "../../Hooks/product/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import { IconSpinner } from "../../Components/Icons/IconSpinner";
import { IconFilter } from "../../Components/Icons/IconFilter";
import { IconClose } from "../../Components/Icons/IconClose";

// Components
import PremiumDropdown from "../../Components/Ui/PremiumDropdown";
import LiveTicker from "./Components/LiveTicker";
import ProductCard from "./Components/ProductCard";
import FilterSidebar, { ActiveFilterChips } from "./Components/FilterSidebar";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";

// Hooks
import { useProductsFilter } from "./Hooks/useProductsFilter";
import { useCompare } from "./Hooks/useCompare";

// Constants
import { PAGE_SIZE, AD_INTERVAL, SORT_OPTIONS, CATEGORIES } from "./constants";

// Extracted Components & Hooks
import { PG_STYLES } from "./Styles/ProductsPageStyles";
import CategoryHeroLinks from "./Components/CategoryHeroLinks";
import InlineAd from "./Components/InlineAd";
import ViewMoreBtn from "./Components/ViewMoreBtn";
import CompareModal from "./Components/CompareModal";
import { useProductsPageLogic } from "./Hooks/useProductsPageLogic";

// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductsPage() {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();

  // Products
  const { data: allProducts = [], isLoading, isFetching } = useAllProducts();

  const {
    filters,
    setFilters,
    selectedCategory,
    setSelectedCategory,
    maxBudget,
    filteredProducts,
  } = useProductsFilter(allProducts);
  const {
    compareList,
    showCompare,
    setShowCompare,
    toggleCompare,
    removeCompare,
    clearCompare,
  } = useCompare();

  const {
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
  } = useProductsPageLogic({
    allProducts,
    filteredProducts,
    isLoading,
    selectedCategory,
    sort: filters.sort,
  });

  // Hide body scrollbar when any modal is open
  useEffect(() => {
    if (mobileFilterOpen || showCompare || quickViewProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen, showCompare, quickViewProduct]);

  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: colors.surface.primary, color: colors.text.primary }}
    >
      <style>{PG_STYLES}</style>

      {!isLoading && allProducts.length > 0 && (
        <LiveTicker products={allProducts} />
      )}

      {/* Hero Links for Categories */}
      <CategoryHeroLinks />

      <div
        className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: colors.border.subtle }}
      >
        <div
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
          style={{ color: colors.text.tertiary }}
        >
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity"
            style={{ color: colors.text.tertiary }}
          >
            Home
          </Link>
          <span>/</span>
          <span style={{ color: colors.text.primary }}>{selectedCategory}</span>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
            style={{
              background: colors.cta.primary,
              color: colors.cta.primaryText,
            }}
          >
            <IconFilter className="w-3.5 h-3.5" /> Filters
          </motion.button>

          <PremiumDropdown
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(val) => setFilters((f) => ({ ...f, sort: val }))}
            className="w-44"
          />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pg-slim pr-3 pb-8">
            <div
              className="rounded-[24px] p-6 shadow-xl relative overflow-hidden"
              style={{
                background: isDark
                  ? "rgba(26,26,26,0.6)"
                  : "rgba(255,255,255,0.6)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${colors.cta.primary}15 0%, transparent 70%)`,
                }}
              />
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                maxBudget={maxBudget}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                matchingCount={filteredProducts.length}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4">
              <ActiveFilterChips
                filters={filters}
                selectedCategory={selectedCategory}
                setFilters={setFilters}
                setSelectedCategory={setSelectedCategory}
                maxBudget={maxBudget}
              />
              <div className="flex gap-6 items-center">
                <p
                  className="text-sm font-medium italic"
                  style={{ color: colors.text.tertiary }}
                >
                  Discovering{" "}
                  <span
                    className="font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    {filteredProducts.length}
                  </span>{" "}
                  curated items for you.
                </p>

                {/* Shows spinner if products is beign refetched */}
                <span>{isFetching && <IconSpinner />}</span>
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: colors.surface.secondary,
                      border: `1px solid ${colors.border.subtle}`,
                    }}
                  >
                    <div
                      className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"}`}
                      style={{ paddingTop: "128%" }}
                    />
                    <div className="p-3 space-y-2">
                      <div
                        className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"} h-3 rounded-full w-3/4`}
                      />
                      <div
                        className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"} h-3 rounded-full w-1/2`}
                      />
                      <div
                        className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"} h-4 rounded-full w-1/3 mt-2`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="text-6xl mb-5">🔍</div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.text.primary }}
                >
                  No products found
                </h2>
                <p
                  className="text-sm mb-6 max-w-xs"
                  style={{ color: colors.text.tertiary }}
                >
                  Try adjusting your filters or search term to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      sort: "default",
                      rating: null,
                      inStock: false,
                      onSale: false,
                      budget: maxBudget,
                    });
                    setSelectedCategory("All");
                  }}
                  className="text-sm font-bold underline"
                  style={{ color: colors.text.accent }}
                >
                  Clear all filters
                </button>
              </div>
            )}

            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {gridItems.map((item) =>
                item.type === "ad" ? (
                  <InlineAd
                    key={`ad-${item.idx}`}
                    product={item.adProduct}
                    type={item.adType}
                    allProducts={allProducts}
                  />
                ) : (
                  <ProductCard
                    key={item.product.id}
                    product={item.product}
                    onQuickView={handleQuickView}
                    onToggleCompare={toggleCompare}
                    isCompared={compareList.some(
                      (c) => c.id === item.product.id,
                    )}
                    canAdd={compareList.length < 2}
                  />
                ),
              )}

              <ViewMoreBtn
                onClick={handleLoadMore}
                loading={loadingMore}
                allLoaded={visibleCount >= filteredProducts.length}
                count={filteredProducts.length}
              />
            </div>

            {/* Comparison floating bar */}
            <AnimatePresence>
              {compareList.length > 0 && (
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  className="fixed bottom-0 sm:bottom-6 left-0 sm:left-1/2 sm:-translate-x-1/2 z-[1100] flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-fit px-3 sm:px-5 py-4 sm:py-3 rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] sm:shadow-2xl border-t sm:border backdrop-blur-xl"
                  style={{
                    background: isDark
                      ? "rgba(30,30,34,0.95)"
                      : "rgba(255,255,255,0.95)",
                    borderColor: colors.border.default,
                  }}
                >
                  <span
                    className="text-[10px] sm:text-xs font-bold shrink-0"
                    style={{ color: colors.text.secondary }}
                  >
                    {compareList.length}/2
                    <span className="hidden sm:inline"> selected</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {compareList.map((p) => (
                      <div
                        key={p.id}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border shrink-0"
                        style={{ borderColor: colors.border.default }}
                      >
                        <img
                          src={p.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCompare(true)}
                    disabled={compareList.length < 2}
                    className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all disabled:opacity-40 shrink-0"
                    style={{
                      background: colors.cta.primary,
                      color: colors.cta.primaryText,
                    }}
                  >
                    Compare
                  </motion.button>
                  <button
                    onClick={clearCompare}
                    className="text-[10px] sm:text-xs font-bold shrink-0"
                    style={{ color: colors.text.tertiary }}
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filter */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.8,
              }}
              className="fixed bottom-0 left-0 right-0 z-[2001] rounded-t-[32px] p-8 lg:hidden max-h-[90vh] overflow-y-auto shadow-[0_-20px_40px_rgba(0,0,0,0.2)]"
              style={{ background: colors.surface.primary }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2
                  className="text-2xl font-serif font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Filters
                </h2>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: colors.surface.tertiary,
                    color: colors.text.primary,
                  }}
                >
                  <IconClose />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                maxBudget={maxBudget}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                matchingCount={filteredProducts.length}
              />
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-8 py-4 rounded-2xl font-bold"
                style={{
                  background: colors.cta.primary,
                  color: colors.cta.primaryText,
                }}
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompare && (
          <CompareModal
            items={compareList}
            onClose={() => setShowCompare(false)}
            onRemove={removeCompare}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
