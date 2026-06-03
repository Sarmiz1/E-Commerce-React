import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SEO from "../../Components/SEO";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import { IconSpinner } from "../../Components/Icons/IconSpinner";
import { useTheme } from "../../Store/useThemeStore";
import { getProductImages } from "../../utils/getProductImages";
import FilterSidebar, {
  ActiveFilterChips,
} from "../Product/Components/FilterSidebar";
import MobileFilterDrawer from "../Product/Components/MobileFilterDrawer";
import { PG_STYLES } from "../Product/Styles/ProductsPageStyles";
import ShowcaseAdvert from "./Components/ShowcaseAdvert";
import ShowcaseBreadcrumbs from "./Components/ShowcaseBreadcrumbs";
import ShowcaseHero from "./Components/ShowcaseHero";
import ShowcaseProductGrid from "./Components/ShowcaseProductGrid";
import {
  ShowcaseEmptyState,
  ShowcaseErrorState,
  ShowcaseLoadingState,
} from "./Components/ShowcaseStates";
import { useShowcaseProductsFilter } from "./Hooks/useShowcaseProductsFilter";
import { useShowcaseProductsCache } from "./Hooks/useShowcaseProductsCache";

const getCanonicalUrl = (canonicalPath) => {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${canonicalPath || window.location.pathname}`;
};

export default function ShowcasePage({
  title = "Showcase",
  description = "Explore curated products from the WooSho marketplace.",
  products = [],
  heroImage,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
  noIndex = false,
  canonicalPath,
  eyebrow = "WooSho Showcase",
  parentLabel = "Showcase",
  parentPath = "/products",
  collectionLabel = "Showcase products",
  listTitle = "Shop the selection",
  emptyLabel = "Showcase coming soon",
  emptyBody,
  advert,
}) {
  const { colors, isDark } = useTheme();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const stableProducts = useMemo(() => products || [], [products]);
  const displayHeroImage = heroImage || getProductImages(stableProducts[0])[0];
  const canonicalUrl = getCanonicalUrl(canonicalPath);

  useShowcaseProductsCache(stableProducts);

  const {
    categoryOptions,
    filteredProducts,
    filters,
    maxBudget,
    resetFilters,
    selectedCategory,
    selectedCategoryLabel,
    selectedCategoryValue,
    setFilters,
    setSelectedCategory,
  } = useShowcaseProductsFilter(stableProducts);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    filters.sort !== "default" ||
    filters.rating !== null ||
    filters.inStock ||
    filters.onSale ||
    filters.budget < maxBudget;

  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: stableProducts.length,
        itemListElement: stableProducts.slice(0, 24).map((product, index) => ({
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
    }),
    [canonicalUrl, description, stableProducts, title],
  );

  useEffect(() => {
    if (mobileFilterOpen || quickViewProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen, quickViewProduct]);

  return (
    <div
      className="min-h-screen overflow-x-clip pt-20"
      style={{ background: colors.surface.primary, color: colors.text.primary }}
    >
      <SEO
        canonical={canonicalUrl}
        description={description}
        image={displayHeroImage}
        noIndex={noIndex}
        schema={schema}
        title={`${title} | WooSho`}
      />
      <style>{PG_STYLES}</style>

      {isLoading ? (
        <ShowcaseLoadingState colors={colors} isDark={isDark} />
      ) : isError ? (
        <ShowcaseErrorState colors={colors} onRetry={onRetry} />
      ) : (
        <>
          <ShowcaseBreadcrumbs
            colors={colors}
            parentLabel={parentLabel}
            parentPath={parentPath}
            title={title}
          />
          <ShowcaseHero
            description={description}
            eyebrow={eyebrow}
            image={displayHeroImage}
            productCount={stableProducts.length}
            title={title}
          />
          <ShowcaseAdvert
            colors={colors}
            image={displayHeroImage}
            title={title}
            {...advert}
          />

          <main className="mx-auto max-w-screen-xl px-6 py-10">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.text.accent }}
                >
                  {collectionLabel}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold">{listTitle}</h2>
                <p className="mt-2 text-sm" style={{ color: colors.text.tertiary }}>
                  Showing {filteredProducts.length} of {stableProducts.length} products
                  {isFetching && <IconSpinner />}
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-full border px-5 py-3 text-xs font-black uppercase tracking-wider lg:hidden"
                onClick={() => setMobileFilterOpen(true)}
                style={{
                  background: colors.surface.secondary,
                  borderColor: colors.border.default,
                  color: colors.text.primary,
                }}
                type="button"
              >
                Filters and sort
              </button>
            </div>

            <div className="flex items-start gap-10">
              <aside className="hidden w-[280px] flex-shrink-0 self-start lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pb-8 lg:pr-3">
                <div
                  className="rounded-[24px] border p-6 shadow-sm"
                  style={{
                    background: colors.surface.secondary,
                    borderColor: colors.border.subtle,
                  }}
                >
                  <FilterSidebar
                    categoryOptions={categoryOptions}
                    filters={filters}
                    matchingCount={filteredProducts.length}
                    maxBudget={maxBudget}
                    selectedCategory={selectedCategoryValue}
                    setFilters={setFilters}
                    setSelectedCategory={setSelectedCategory}
                  />
                </div>
              </aside>

              <section className="min-w-0 flex-1">
                <div className="mb-5">
                  <ActiveFilterChips
                    filters={filters}
                    maxBudget={maxBudget}
                    selectedCategory={selectedCategory}
                    selectedCategoryLabel={selectedCategoryLabel}
                    setFilters={setFilters}
                    setSelectedCategory={setSelectedCategory}
                  />
                </div>

                {filteredProducts.length ? (
                  <ShowcaseProductGrid
                    onQuickView={setQuickViewProduct}
                    products={filteredProducts}
                  />
                ) : (
                  <ShowcaseEmptyState
                    colors={colors}
                    emptyBody={emptyBody}
                    emptyLabel={emptyLabel}
                    filtered={stableProducts.length > 0 && hasActiveFilters}
                    onReset={resetFilters}
                    title={title}
                  />
                )}
              </section>
            </div>
          </main>

          <MobileFilterDrawer
            categoryOptions={categoryOptions}
            colors={colors}
            filters={filters}
            isOpen={mobileFilterOpen}
            matchingCount={filteredProducts.length}
            maxBudget={maxBudget}
            onClose={() => setMobileFilterOpen(false)}
            selectedCategory={selectedCategoryValue}
            setFilters={setFilters}
            setSelectedCategory={setSelectedCategory}
          />

          <AnimatePresence>
            {quickViewProduct && (
              <ProductDetailModal
                onClose={() => setQuickViewProduct(null)}
                product={quickViewProduct}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
