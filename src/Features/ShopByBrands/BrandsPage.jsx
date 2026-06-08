import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../../Components/SEO";
import { useTheme } from "../../Store/useThemeStore";
import {
  BRAND_DIRECTORY_ACTIONS,
  BRAND_FILTERS,
  BRANDS,
  BRANDS_NAV_LINKS,
  BRANDS_SEO,
  FEATURED_BRAND_ID,
} from "./data/brandsData";
import {
  buildBrandHref,
  getBrandById,
  getBrandsByCategory,
} from "./utils/brandUtils";

const getCanonicalUrl = () =>
  typeof window !== "undefined" ? `${window.location.origin}/products/shop-by-brands` : undefined;

export default function BrandsPage() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredBrands = useMemo(
    () => getBrandsByCategory(activeFilter),
    [activeFilter],
  );
  const featuredBrand = getBrandById(FEATURED_BRAND_ID) || BRANDS[0];
  const canonical = getCanonicalUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: BRANDS_SEO.title,
    description: BRANDS_SEO.description,
    url: canonical,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: BRANDS.length,
      itemListElement: BRANDS.map((brand, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: brand.name,
        url: canonical
          ? `${canonical}/${encodeURIComponent(brand.id)}`
          : buildBrandHref(brand.id),
      })),
    },
  };

  return (
    <div
      className="min-h-screen overflow-x-clip pt-20"
      style={{ background: colors.surface.primary, color: colors.text.primary }}
    >
      <SEO
        canonical={canonical}
        description={BRANDS_SEO.description}
        image={featuredBrand.heroImage || featuredBrand.image}
        keywords={BRANDS_SEO.keywords}
        schema={schema}
        title={BRANDS_SEO.title}
      />
      
      <header className="mx-auto grid max-w-screen-xl gap-6 px-6 pb-8 pt-8 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em]"
            style={{ color: colors.text.accent }}
          >
            Brand directory
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Find the labels that fit your next move.
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm leading-6"
            style={{ color: colors.text.secondary }}
          >
            Browse a compact directory, then open a brand page to see its live
            WooSho marketplace listings.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-wider lg:justify-self-end"
          style={{
            background: colors.cta.primary,
            color: colors.cta.primaryText,
          }}
          to={BRAND_DIRECTORY_ACTIONS.browseHref}
        >
          {BRAND_DIRECTORY_ACTIONS.browseLabel}
          <ArrowRight size={15} />
        </Link>
      </header>

      <section className="mx-auto max-w-screen-xl px-6">
        <Link
          className="group grid overflow-hidden rounded-3xl border sm:grid-cols-[1fr_260px]"
          style={{
            background: colors.surface.secondary,
            borderColor: colors.border.subtle,
          }}
          to={buildBrandHref(featuredBrand.id)}
        >
          <div className="p-6 sm:p-8">
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: colors.text.accent }}
            >
              Featured brand
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              {featuredBrand.name}
            </h2>
            <p
              className="mt-2 max-w-xl text-sm leading-6"
              style={{ color: colors.text.secondary }}
            >
              {featuredBrand.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider">
              View live listings
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={15}
              />
            </span>
          </div>
          <img
            alt={`${featuredBrand.name} collection`}
            className="h-44 w-full object-cover sm:h-full"
            fetchPriority="high"
            src={featuredBrand.heroImage || featuredBrand.image}
          />
        </Link>
      </section>

      <main className="mx-auto max-w-screen-xl px-6 py-10">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: colors.border.subtle }}>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold">
              <Search size={15} />
              Browse brands
            </p>
            <p className="mt-1 text-xs" style={{ color: colors.text.tertiary }}>
              {filteredBrands.length} labels in {activeFilter.toLowerCase()}
            </p>
          </div>
          <div
            aria-label="Filter brands by category"
            className="flex gap-2 overflow-x-auto pb-1"
            role="tablist"
          >
            {BRAND_FILTERS.map((filter) => (
              <button
                aria-selected={activeFilter === filter}
                className="whitespace-nowrap rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                role="tab"
                style={{
                  background:
                    activeFilter === filter
                      ? colors.cta.primary
                      : colors.surface.secondary,
                  borderColor:
                    activeFilter === filter
                      ? colors.cta.primary
                      : colors.border.default,
                  color:
                    activeFilter === filter
                      ? colors.cta.primaryText
                      : colors.text.secondary,
                }}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          layout={!reduceMotion}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {filteredBrands.map((brand) => (
              <motion.article
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                key={brand.id}
                layout={!reduceMotion}
                transition={{ duration: reduceMotion ? 0 : 0.24 }}
              >
                <Link
                  className="group block overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg"
                  style={{
                    background: colors.surface.secondary,
                    borderColor: colors.border.subtle,
                  }}
                  to={buildBrandHref(brand.id)}
                >
                  <div className="aspect-[16/10] overflow-hidden" style={{ background: colors.surface.tertiary }}>
                    <img
                      alt={`${brand.name} brand`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      src={brand.image}
                    />
                  </div>
                  <div className="p-4">
                    <p
                      className="text-[9px] font-black uppercase tracking-[0.18em]"
                      style={{ color: colors.text.accent }}
                    >
                      {brand.category}
                    </p>
                    <h2 className="mt-1.5 text-xl font-black tracking-tight">
                      {brand.name}
                    </h2>
                    <p
                      className="mt-1 line-clamp-2 text-xs leading-5"
                      style={{ color: colors.text.secondary }}
                    >
                      {brand.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                      Explore
                      <ArrowRight
                        className="transition-transform group-hover:translate-x-1"
                        size={13}
                      />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
