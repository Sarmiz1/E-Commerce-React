import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, Star, SlidersHorizontal } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ModernNavbar from "../../Components/ModernNavbar";
import SEO from "../../Components/SEO";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import { IconSpinner } from "../../Components/Icons/IconSpinner";
import { useAllProducts } from "../../Hooks/product/useProducts";
import { useTheme } from "../../Store/useThemeStore";
import { getProductImages } from "../../utils/getProductImages";
import { ShowcaseLoadingState } from "../ShowcasePage/ShowcaseComponents/ShowcaseStates";
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

// Derives unique categories from the product list
function useProductCategories(products) {
  return useMemo(() => {
    const cats = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
    return cats;
  }, [products]);
}

// Single product card with hover quick-view
function ProductCard({ product, onQuickView, index }) {
  const { colors } = useTheme();
  const images = getProductImages(product);
  const primaryImage = images[0] || product.image;
  const hoverImage = images[1];

  const isNew = product.isNew || product.badge === "new";
  const isSale = product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group relative flex flex-col"
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ aspectRatio: "3/4", background: colors.surface.secondary }}
      >
        {/* Primary image */}
        {primaryImage && (
          <img
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            loading="lazy"
            src={primaryImage}
          />
        )}

        {/* Hover image */}
        {hoverImage && (
          <img
            alt={`${product.name} alternate`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            loading="lazy"
            src={hoverImage}
          />
        )}

        {/* Placeholder when no image */}
        {!primaryImage && (
          <div className="flex h-full items-center justify-center">
            <span
              className="text-4xl font-black tracking-tighter opacity-10"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {product.name?.[0]}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: colors.surface.primary, color: colors.text.primary }}
            >
              New
            </span>
          )}
          {isSale && (
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: "#fef2f2", color: "#b91c1c" }}
            >
              Sale
            </span>
          )}
        </div>

        {/* Quick view — slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <button
            className="w-full py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
            onClick={() => onQuickView(product)}
            style={{ background: colors.surface.primary, color: colors.text.primary }}
            type="button"
          >
            Quick view
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight">{product.name}</p>
          {product.brand && (
            <p className="mt-0.5 text-xs" style={{ color: colors.text.tertiary }}>
              {product.brand}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {isSale && (
            <p className="text-xs line-through" style={{ color: colors.text.tertiary }}>
              ₦{product.originalPrice?.toLocaleString()}
            </p>
          )}
          <p className="text-sm font-semibold">
            ₦{product.price?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Rating */}
      {product.rating && (
        <div className="mt-1 flex items-center gap-1">
          <Star
            className="fill-current"
            size={11}
            style={{ color: "#f59e0b" }}
          />
          <span className="text-[11px]" style={{ color: colors.text.tertiary }}>
            {product.rating}
            {product.reviewCount ? ` (${product.reviewCount})` : ""}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Filter pill row
function FilterPills({ categories, active, onChange, colors }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          className="rounded-full px-4 py-1.5 text-xs font-medium transition-all"
          onClick={() => onChange(cat)}
          style={
            active === cat
              ? { background: colors.text.primary, color: colors.surface.primary }
              : {
                  background: "transparent",
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.subtle}`,
                }
          }
          type="button"
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default function BrandDetailTest() {
  const { brandId = "" } = useParams();
  const { colors, isDark } = useTheme();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const brand = getBrandById(brandId);
  const productsQuery = useAllProducts();

  const allBrandProducts = useMemo(
    () => getProductsForBrand(productsQuery.data, brand),
    [brand, productsQuery.data],
  );

  const categories = useProductCategories(allBrandProducts);

  const products = useMemo(() => {
    if (activeCategory === "All") return allBrandProducts;
    return allBrandProducts.filter((p) => p.category === activeCategory);
  }, [allBrandProducts, activeCategory]);

  const canonical = getCanonicalUrl(brandId);
  const heroImage = getProductImages(allBrandProducts[0])[0] || brand?.image;

  const schema = brand
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${brand.name} products | WooSho`,
        description: brand.description,
        url: canonical,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: allBrandProducts.length,
          itemListElement: allBrandProducts.slice(0, 24).map((product, index) => ({
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

      {/* ── Brand not found ── */}
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
        <ShowcaseLoadingState colors={colors} isDark={isDark} />
      ) : (
        <>
          {/* ── Back link ── */}
          <div className="mx-auto max-w-screen-xl px-6 pt-8">
            <Link
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
              style={{ color: colors.text.secondary }}
              to="/brands"
            >
              <ArrowLeft size={13} />
              All brands
            </Link>
          </div>

          {/* ── Hero ── */}
          <header className="mx-auto max-w-screen-xl px-6 pb-10 pt-5">
            <div
              className="grid overflow-hidden rounded-3xl md:grid-cols-[1fr_380px]"
              style={{ background: colors.surface.secondary }}
            >
              {/* Left: brand info */}
              <div className="flex flex-col justify-between p-8 sm:p-10">
                <div>
                  <p
                    className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: colors.text.accent }}
                  >
                    {brand.category}
                  </p>
                  <h1
                    className="text-5xl font-black leading-none tracking-tight sm:text-6xl"
                    style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}
                  >
                    {brand.name}
                  </h1>
                  <p
                    className="mt-4 max-w-sm text-sm leading-relaxed"
                    style={{ color: colors.text.secondary }}
                  >
                    {brand.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-6">
                  <Link
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                    style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
                    to={buildBrandCatalogHref(brand.name)}
                  >
                    Search full marketplace
                    <ArrowRight size={13} />
                  </Link>
                  <p className="text-xs" style={{ color: colors.text.tertiary }}>
                    {allBrandProducts.length} listings
                  </p>
                </div>
              </div>

              {/* Right: hero image */}
              {heroImage && (
                <div className="relative h-56 md:h-auto">
                  <img
                    alt={`${brand.name} collection`}
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                    src={heroImage}
                  />
                  {/* subtle overlay so it doesn't overpower */}
                  <div className="absolute inset-0 bg-black/5" />
                </div>
              )}
            </div>
          </header>

          {/* ── Products section ── */}
          <main className="mx-auto max-w-screen-xl px-6 pb-16">

            {/* Section header */}
            <div
              className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: colors.border.subtle }}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black tracking-tight">
                  All products
                </h2>
                {productsQuery.isFetching && (
                  <IconSpinner className="h-3.5 w-3.5" />
                )}
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{
                    background: colors.surface.secondary,
                    color: colors.text.tertiary,
                  }}
                >
                  {products.length}
                </span>
              </div>

              {/* Category filter pills */}
              {categories.length > 1 && (
                <FilterPills
                  active={activeCategory}
                  categories={categories}
                  colors={colors}
                  onChange={setActiveCategory}
                />
              )}
            </div>

            {/* Error state */}
            {productsQuery.isError ? (
              <div
                className="rounded-3xl border px-6 py-16 text-center"
                style={{ borderColor: colors.border.subtle }}
              >
                <p className="text-sm font-semibold">Listings could not load right now.</p>
                <button
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                  onClick={() => productsQuery.refetch()}
                  style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
                  type="button"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>

            ) : products.length > 0 ? (
              /* Product grid */
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard
                    key={product.id || product.slug || i}
                    index={i}
                    onQuickView={setQuickViewProduct}
                    product={product}
                  />
                ))}
              </div>

            ) : (
              /* Empty state */
              <div
                className="rounded-3xl border px-6 py-20 text-center"
                style={{ borderColor: colors.border.subtle }}
              >
                <p className="text-sm font-semibold">
                  No{activeCategory !== "All" ? ` ${activeCategory}` : ""} listings for{" "}
                  {brand.name} yet.
                </p>
                <p
                  className="mx-auto mt-2 max-w-md text-sm leading-6"
                  style={{ color: colors.text.secondary }}
                >
                  New sellable listings will appear here automatically.
                </p>
                {activeCategory !== "All" ? (
                  <button
                    className="mt-5 text-xs font-semibold uppercase tracking-wider"
                    onClick={() => setActiveCategory("All")}
                    style={{ color: colors.text.accent }}
                    type="button"
                  >
                    View all categories
                  </button>
                ) : (
                  <Link
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.text.accent }}
                    to={buildBrandCatalogHref(brand.name)}
                  >
                    Search full marketplace
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {/* Quick-view modal */}
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
