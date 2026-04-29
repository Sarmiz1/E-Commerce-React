import React, { useEffect } from "react";
import { useAllProducts } from "../../Hooks/product/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../Context/theme/ThemeContext";
import { IconSpinner } from "../../Components/Icons/IconSpinner";
// Components
import LiveTicker from "./Components/LiveTicker";
import ProductCard from "./Components/ProductCard";
import FilterSidebar, { ActiveFilterChips } from "./Components/FilterSidebar";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";

// Atomic Components
import ProductsBreadcrumb from "./Components/ProductsBreadcrumb";
import ProductSkeletonGrid from "./Components/ProductSkeletonGrid";
import ProductEmptyState from "./Components/ProductEmptyState";
import ProductComparisonBar from "./Components/ProductComparisonBar";
import MobileFilterDrawer from "./Components/MobileFilterDrawer";

// Hooks
import { useProductsFilter } from "./Hooks/useProductsFilter";
import { useCompare } from "./Hooks/useCompare";

// Constants
import { SORT_OPTIONS } from "./Utils/constants";

// Extracted Components & Hooks
import { PG_STYLES } from "./Styles/ProductsPageStyles";
import CategoryHeroLinks from "./Components/CategoryHeroLinks";
import InlineAd from "./Components/InlineAd";
import ViewMoreBtn from "./Components/ViewMoreBtn";
import CompareModal from "./Components/CompareModal";
import StickyResultsBar from "./Components/StickyResultsBar";
import RecentlyViewedStrip from "./Components/RecentlyViewedStrip";
import { useProductsPageLogic } from "./Hooks/useProductsPageLogic";
import { useAnalyticsEvent } from "../../Hooks/useAnalyticsEvent";
import SEO from "../../Components/SEO";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductsPage() {
  const { isDark, colors } = useTheme();
  const trackEvent = useAnalyticsEvent();

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
    loadingMore,
    quickViewProduct,
    setQuickViewProduct,
    gridRef,
    sentinelRef,
    handleQuickView,
    gridItems,
    allLoaded,
  } = useProductsPageLogic({
    allProducts,
    filteredProducts,
    isLoading,
    selectedCategory,
    sort: filters.sort,
  });

  const handleTrackedQuickView = (product) => {
    trackEvent("quick_view_opened", { productId: product?.id });
    handleQuickView(product);
  };

  const handleTrackedCompare = (product) => {
    trackEvent("compare_toggled", { productId: product?.id, selectedCount: compareList.length });
    toggleCompare(product);
  };

  const pageSubject = filters.search
    ? `Search results for "${filters.search}"`
    : selectedCategory && selectedCategory !== "All"
      ? `${selectedCategory} products`
      : "Shop products";
  const pageTitle = `${pageSubject} | WooSho`;
  const pageDescription = filters.search
    ? `Explore WooSho products matching ${filters.search}, compare prices, reviews, and seller details in one place.`
    : selectedCategory && selectedCategory !== "All"
      ? `Shop ${selectedCategory.toLowerCase()} on WooSho. Find curated products with reviews, quick view, wishlist, and easy cart checkout.`
      : "Shop curated products on WooSho with reviews, quick view, wishlist, and easy cart checkout.";
  const pageKeywords = [
    "WooSho",
    "online shopping",
    "products",
    selectedCategory !== "All" ? selectedCategory : "",
    filters.search,
  ].filter(Boolean).join(", ");
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products${
          selectedCategory && selectedCategory !== "All"
            ? `?category=${encodeURIComponent(selectedCategory)}`
            : ""
        }`
      : undefined;
  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: filteredProducts.length,
      itemListElement: filteredProducts.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        image: product.image,
        url:
          typeof window !== "undefined"
            ? `${window.location.origin}/products/${product.slug || product.id}`
            : undefined,
      })),
    },
  };

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
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        canonical={canonicalUrl}
        type="website"
        noIndex={Boolean(filters.search)}
        schema={productListSchema}
      />
      <style>{PG_STYLES}</style>

      {/* ── Sticky Results Bar ── */}
      <StickyResultsBar
        resultCount={filteredProducts.length}
        selectedCategory={selectedCategory}
        sortLabel={SORT_OPTIONS.find((o) => o.value === filters.sort)?.label}
        onOpenFilter={() => setMobileFilterOpen(true)}
      >
        <ActiveFilterChips
          filters={filters}
          selectedCategory={selectedCategory}
          setFilters={setFilters}
          setSelectedCategory={setSelectedCategory}
          maxBudget={maxBudget}
        />
      </StickyResultsBar>

      {/* ── Live Ticker ── */}
      {!isLoading && allProducts.length > 0 && (
        <LiveTicker products={allProducts} />
      )}

      {/* ── Hero Category Links ── */}
      <CategoryHeroLinks />

      {/* ── Breadcrumb + Sort Bar ── */}
      <ProductsBreadcrumb 
        colors={colors}
        selectedCategory={selectedCategory}
        sort={filters.sort}
        search={filters.search}
        setFilters={setFilters}
        setMobileFilterOpen={setMobileFilterOpen}
      />

      {/* ── Main Layout ── */}
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
              {/* Animated glow orb */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${colors.cta.primary}15 0%, transparent 70%)`,
                  animation: "spin 20s linear infinite",
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

                {/* Shows spinner if products is being refetched */}
                <span>{isFetching && <IconSpinner />}</span>
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading && <ProductSkeletonGrid isDark={isDark} colors={colors} />}

            {/* Empty state */}
            {!isLoading && filteredProducts.length === 0 && (
              <ProductEmptyState 
                colors={colors}
                maxBudget={maxBudget}
                onReset={() => {
                  setFilters({
                    sort: "default",
                    rating: null,
                    inStock: false,
                    onSale: false,
                    budget: maxBudget,
                    search: "",
                  });
                  setSelectedCategory("All");
                }}
              />
            )}

            {/* ── Product Grid ── */}
            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
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
                    onQuickView={handleTrackedQuickView}
                    onToggleCompare={handleTrackedCompare}
                    isCompared={compareList.some(
                      (c) => c.id === item.product.id,
                    )}
                    canAdd={compareList.length < 4}
                  />
                ),
              )}

              {/* Infinite scroll sentinel + loading indicator */}
              <ViewMoreBtn
                sentinelRef={sentinelRef}
                loading={loadingMore}
                allLoaded={allLoaded}
                count={filteredProducts.length}
              />
            </div>

            {/* ── Comparison floating bar ── */}
            <ProductComparisonBar 
              compareList={compareList}
              onShowCompare={() => setShowCompare(true)}
              onClearCompare={clearCompare}
              isDark={isDark}
              colors={colors}
            />
          </div>
        </div>
      </div>

      {/* ── Recently Viewed Strip ── */}
      <RecentlyViewedStrip />

      {/* ── Mobile Filter Drawer ── */}
      <MobileFilterDrawer 
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        colors={colors}
        filters={filters}
        setFilters={setFilters}
        maxBudget={maxBudget}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        matchingCount={filteredProducts.length}
      />

      {/* ── Modals ── */}
      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompare && compareList.length >= 2 && (
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
