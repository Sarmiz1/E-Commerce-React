import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import SEO from "../../Components/SEO";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import { IconSpinner } from "../../Components/Icons/IconSpinner";
import { useTheme } from "../../Store/useThemeStore";
import { getProductImages } from "../../utils/getProductImages";
import { CurationsAPI } from "../../api/curationsApi";
import FilterSidebar, {
  ActiveFilterChips,
} from "../Product/Components/FilterSidebar";
import MobileFilterDrawer from "../Product/Components/MobileFilterDrawer";
import { PG_STYLES } from "../Product/Styles/ProductsPageStyles";
import CurationAdvert from "./Components/CurationAdvert";
import CurationBreadcrumbs from "./Components/CurationBreadcrumbs";
import CurationHero from "./Components/CurationHero";
import CurationProductGrid from "./Components/CurationProductGrid";
import {
  CurationEmptyState,
  CurationErrorState,
  CurationLoadingState,
} from "./Components/CurationStates";
import { useCurationProductsFilter } from "./Hooks/useCurationProductsFilter";
import { formatSlugTitle } from "./utils/formatSlugTitle";

const getCurationDescription = (curation, title) =>
  curation?.description ||
  `Discover handpicked ${title.toLowerCase()} selected for the WooSho marketplace.`;

export default function CurationPage() {
  const { curationSlug = "" } = useParams();
  const { colors, isDark } = useTheme();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const displayTitle = formatSlugTitle(curationSlug) || "Curation";

  const curationQuery = useQuery({
    ...CurationsAPI.getBySlug(curationSlug),
    enabled: Boolean(curationSlug),
  });
  const productsQuery = useQuery({
    ...CurationsAPI.getProducts(curationSlug),
    enabled: Boolean(curationSlug),
  });

  const curation = curationQuery.data;
  const products = useMemo(() => productsQuery.data || [], [productsQuery.data]);
  const title = curation?.name || displayTitle;
  const description = getCurationDescription(curation, title);
  const heroImage = getProductImages(products[0])[0];
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
  } = useCurationProductsFilter(products);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    filters.sort !== "default" ||
    filters.rating !== null ||
    filters.inStock ||
    filters.onSale ||
    filters.budget < maxBudget;
  const isLoading = curationQuery.isLoading || productsQuery.isLoading;
  const isFetching = curationQuery.isFetching || productsQuery.isFetching;
  const isError = curationQuery.isError || productsQuery.isError;
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products/curations/${encodeURIComponent(curationSlug)}`
      : undefined;
  const curationSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: products.length,
        itemListElement: products.slice(0, 24).map((product, index) => ({
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
    [canonicalUrl, description, products, title],
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
        image={heroImage}
        noIndex={!curation}
        schema={curationSchema}
        title={`${title} | WooSho`}
      />
      <style>{PG_STYLES}</style>

      {isLoading ? (
        <CurationLoadingState colors={colors} isDark={isDark} />
      ) : isError ? (
        <CurationErrorState
          colors={colors}
          onRetry={() => {
            curationQuery.refetch();
            productsQuery.refetch();
          }}
        />
      ) : (
        <>
          <CurationBreadcrumbs colors={colors} title={title} />
          <CurationHero
            description={description}
            image={heroImage}
            productCount={products.length}
            title={title}
          />
          <CurationAdvert colors={colors} image={heroImage} title={title} />

          <main className="mx-auto max-w-screen-xl px-6 py-10">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.text.accent }}
                >
                  Curated products
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold">Shop the selection</h2>
                <p className="mt-2 text-sm" style={{ color: colors.text.tertiary }}>
                  Showing {filteredProducts.length} of {products.length} products
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
                  <CurationProductGrid
                    onQuickView={setQuickViewProduct}
                    products={filteredProducts}
                  />
                ) : (
                  <CurationEmptyState
                    colors={colors}
                    filtered={products.length > 0 && hasActiveFilters}
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
