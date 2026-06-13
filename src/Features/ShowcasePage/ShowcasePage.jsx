import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SEO from "../../Components/SEO";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import { IconSpinner } from "../../Components/Icons/IconSpinner";
import { useTheme } from "../../Store/useThemeStore";
import { getProductImages } from "../../utils/getProductImages";
import { PG_STYLES } from "../Product/Styles/ProductsPageStyles";
import ShowcaseAdvert from "./ShowcaseComponents/ShowcaseAdvert";
import ShowcaseBreadcrumbs from "./ShowcaseComponents/ShowcaseBreadcrumbs";
import ShowcaseHero from "./ShowcaseComponents/ShowcaseHero";
import ShowcaseProductGrid from "./ShowcaseComponents/ShowcaseProductGrid";
import {
  ShowcaseEmptyState,
  ShowcaseErrorState,
  ShowcaseLoadingState,
} from "./ShowcaseComponents/ShowcaseStates";
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
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) {
  const { colors, isDark } = useTheme();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const stableProducts = useMemo(() => products || [], [products]);
  const displayHeroImage = heroImage || getProductImages(stableProducts[0])[0];
  const canonicalUrl = getCanonicalUrl(canonicalPath);

  useShowcaseProductsCache(stableProducts);

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
    if (quickViewProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [quickViewProduct]);

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
                  Showing {stableProducts.length} products
                  {isFetching && <IconSpinner />}
                </p>
              </div>
            </div>

            {stableProducts.length ? (
              <>
                <ShowcaseProductGrid
                  onQuickView={setQuickViewProduct}
                  products={stableProducts}
                />
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={onLoadMore}
                      disabled={isLoadingMore}
                      className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-black text-gray-900 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                    >
                      {isLoadingMore ? "Loading more..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <ShowcaseEmptyState
                colors={colors}
                emptyBody={emptyBody}
                emptyLabel={emptyLabel}
                filtered={false}
                title={title}
              />
            )}
          </main>

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
