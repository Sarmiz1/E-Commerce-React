import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ModernNavbar from "../../../Components/ModernNavbar";
import SEO from "../../../Components/SEO";
import ProductDetailModal from "../../../Components/Ui/ProductDetailModal";
import { IconSpinner } from "../../../Components/Icons/IconSpinner";
import { useAllProducts } from "../../../Hooks/product/useProducts";
import { useTheme } from "../../../Store/useThemeStore";
import { getProductImages } from "../../../utils/getProductImages";
import CurationProductGrid from "../Curation/Components/CurationProductGrid";
import { CurationLoadingState } from "../Curation/Components/CurationStates";
import { PG_STYLES } from "../Product/Styles/ProductsPageStyles";
import { BRANDS_NAV_LINKS } from "./data/brandsData";
import {
  buildBrandCatalogHref,
  getBrandById,
  getProductsForBrand,
} from "./utils/brandUtils";

const getCanonicalUrl = (brandId) =>
  typeof window !== "undefined"
    ? `${window.location.origin}/brands/${encodeURIComponent(brandId)}`
    : undefined;

export default function BrandDetail() {
  const { brandId = "" } = useParams();
  const { colors, isDark } = useTheme();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const brand = getBrandById(brandId);
  const productsQuery = useAllProducts();
  const products = useMemo(
    () => getProductsForBrand(productsQuery.data, brand),
    [brand, productsQuery.data],
  );
  const canonical = getCanonicalUrl(brandId);
  const heroImage = getProductImages(products[0])[0] || brand?.image;
  const schema = brand
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${brand.name} products | WooSho`,
        description: brand.description,
        url: canonical,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.slice(0, 24).map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.name,
            image: getProductImages(product)[0] || product.image,
            url:
              typeof window !== "undefined"
                ? `${window.location.origin}/products/${product.slug || product.id}`
                : undefined,
          })),
        },
      }
    : undefined;

  return (
    <div
      className="min-h-screen overflow-x-clip pt-20"
      style={{ background: colors.surface.primary, color: colors.text.primary }}
    >
      <SEO
        canonical={canonical}
        description={
          brand?.description ||
          "This WooSho brand page is not available. Browse the brand directory to find active marketplace listings."
        }
        image={heroImage}
        keywords={brand ? `${brand.name}, ${brand.category}, WooSho brands` : undefined}
        noIndex={!brand}
        schema={schema}
        title={brand ? `${brand.name} products | WooSho` : "Brand not found | WooSho"}
      />
      <ModernNavbar navLinks={BRANDS_NAV_LINKS} />
      <style>{PG_STYLES}</style>

      {!brand ? (
        <main className="mx-auto max-w-lg px-6 py-24 text-center">
          <p
            className="text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: colors.state.error }}
          >
            Brand not found
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            This label is not in the directory.
          </h1>
          <p className="mt-3 text-sm leading-6" style={{ color: colors.text.secondary }}>
            Browse the WooSho brand directory to find an available label.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-wider"
            style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
            to="/brands"
          >
            <ArrowLeft size={15} />
            Back to brands
          </Link>
        </main>
      ) : productsQuery.isLoading ? (
        <CurationLoadingState colors={colors} isDark={isDark} />
      ) : (
        <>
          <header className="mx-auto max-w-screen-xl px-6 pb-8 pt-8">
            <Link
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ color: colors.text.accent }}
              to="/brands"
            >
              <ArrowLeft size={14} />
              All brands
            </Link>
            <div
              className="mt-5 grid overflow-hidden rounded-3xl border md:grid-cols-[1fr_360px]"
              style={{
                background: colors.surface.secondary,
                borderColor: colors.border.subtle,
              }}
            >
              <div className="p-6 sm:p-8">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.text.accent }}
                >
                  {brand.category}
                </p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  {brand.name}
                </h1>
                <p
                  className="mt-3 max-w-2xl text-sm leading-6"
                  style={{ color: colors.text.secondary }}
                >
                  {brand.description}
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                  to={buildBrandCatalogHref(brand.name)}
                >
                  Search full marketplace
                  <ArrowRight size={15} />
                </Link>
              </div>
              <img
                alt={`${brand.name} collection`}
                className="h-52 w-full object-cover md:h-full"
                fetchPriority="high"
                src={heroImage}
              />
            </div>
          </header>

          <main className="mx-auto max-w-screen-xl px-6 pb-12">
            <div className="mb-5 flex items-end justify-between border-b pb-4" style={{ borderColor: colors.border.subtle }}>
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.text.accent }}
                >
                  Live marketplace listings
                </p>
                <h2 className="mt-1.5 text-2xl font-black tracking-tight">
                  Shop {brand.name}
                </h2>
              </div>
              <p className="text-xs font-bold" style={{ color: colors.text.tertiary }}>
                {productsQuery.isFetching && <IconSpinner className="mr-2 inline h-3 w-3" />}
                {products.length} {products.length === 1 ? "item" : "items"}
              </p>
            </div>

            {productsQuery.isError ? (
              <div className="rounded-3xl border px-6 py-16 text-center" style={{ borderColor: colors.border.subtle }}>
                <p className="text-sm font-bold">Listings could not load right now.</p>
                <button
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider"
                  onClick={() => productsQuery.refetch()}
                  style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
                  type="button"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>
            ) : products.length ? (
              <CurationProductGrid
                onQuickView={setQuickViewProduct}
                products={products}
              />
            ) : (
              <div className="rounded-3xl border px-6 py-16 text-center" style={{ borderColor: colors.border.subtle }}>
                <p className="text-sm font-bold">No active {brand.name} listings yet.</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: colors.text.secondary }}>
                  The directory is ready. New sellable listings will appear here automatically.
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                  style={{ color: colors.text.accent }}
                  to={buildBrandCatalogHref(brand.name)}
                >
                  Search full marketplace
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </main>
        </>
      )}

      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            onClose={() => setQuickViewProduct(null)}
            product={quickViewProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
