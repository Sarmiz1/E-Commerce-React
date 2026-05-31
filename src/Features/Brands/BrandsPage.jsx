import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ModernNavbar from "../../Components/ModernNavbar";
import SEO from "../../Components/SEO";
import {
  BRAND_DIRECTORY_ACTIONS,
  BRAND_FILTERS,
  BRANDS,
  BRANDS_HERO,
  BRANDS_NAV_LINKS,
  BRANDS_SEO,
  FEATURED_BRAND,
} from "./data/brandsData";
import { buildBrandHref, getBrandsByCategory } from "./utils/brandUtils";

gsap.registerPlugin(ScrollTrigger);

const getCanonicalUrl = () =>
  typeof window !== "undefined" ? `${window.location.origin}/brands` : undefined;

export default function BrandsPage() {
  const mainRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredBrands = useMemo(
    () => getBrandsByCategory(activeFilter),
    [activeFilter],
  );
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

  useEffect(() => {
    document.body.style.backgroundColor = "#050505";

    if (reduceMotion) {
      return () => {
        document.body.style.backgroundColor = "";
      };
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".featured-brand-text",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: "#featured-brand", start: "top 75%" },
        },
      );

      gsap.fromTo(
        ".featured-brand-img",
        { x: 50, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: "#featured-brand", start: "top 75%" },
        },
      );
    }, mainRef);

    return () => {
      ctx.revert();
      document.body.style.backgroundColor = "";
    };
  }, [reduceMotion]);

  return (
    <div
      className="min-h-screen bg-[#050505] text-white selection:bg-blue-600/30"
      ref={mainRef}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <SEO
        canonical={canonical}
        description={BRANDS_SEO.description}
        image={BRANDS_HERO.image}
        keywords={BRANDS_SEO.keywords}
        schema={schema}
        title={BRANDS_SEO.title}
      />
      <ModernNavbar
        navLinks={BRANDS_NAV_LINKS}
      />

      <section className="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden pb-[2rem] pt-[4rem]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10 bg-black/60" />
          <img
            alt="Brands background"
            className="h-full w-full scale-105 object-cover"
            fetchPriority="high"
            src={BRANDS_HERO.image}
          />
        </div>

        <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 text-6xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl lg:text-9xl"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {BRANDS_HERO.titleLines.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </motion.h1>
          <motion.p
            animate={{ opacity: 1 }}
            className="mb-6 max-w-2xl text-xl font-medium uppercase tracking-widest text-gray-300 md:text-2xl"
            initial={{ opacity: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.2, duration: reduceMotion ? 0 : 0.8 }}
          >
            {BRANDS_HERO.description}
          </motion.p>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            transition={{ delay: reduceMotion ? 0 : 0.3, duration: reduceMotion ? 0 : 0.8 }}
          >
            <Link
              className="inline-flex bg-white px-10 py-5 text-lg font-bold uppercase tracking-widest text-black transition-colors duration-300 hover:bg-blue-600 hover:text-white"
              to={BRAND_DIRECTORY_ACTIONS.browseHref}
            >
              {BRAND_DIRECTORY_ACTIONS.browseLabel}
            </Link>
          </motion.div>
        </div>
      </section>

      <section
        className="mx-auto max-w-[1600px] border-b border-white/10 px-6 py-32 md:px-12"
        id="featured-brand"
      >
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="featured-brand-text">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
              {FEATURED_BRAND.eyebrow}
            </h3>
            <h2 className="mb-8 text-7xl font-black uppercase leading-none tracking-tighter md:text-9xl">
              {FEATURED_BRAND.titleLines.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="mb-12 max-w-md text-2xl font-medium leading-relaxed text-gray-400">
              {FEATURED_BRAND.description}
            </p>
            <Link
              className="group inline-flex items-center gap-3 text-xl font-bold uppercase tracking-widest transition-colors hover:text-blue-500"
              to={FEATURED_BRAND.shopHref}
            >
              Shop This Brand
              <ArrowRight
                className="transition-transform group-hover:translate-x-2"
                size={24}
              />
            </Link>
          </div>
          <div className="featured-brand-img group relative h-[600px] w-full overflow-hidden bg-zinc-900 lg:h-[800px]">
            <img
              alt={FEATURED_BRAND.title}
              className="h-full w-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
              src={FEATURED_BRAND.image}
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-10">
              <span className="text-5xl font-black uppercase tracking-tighter text-white">
                {FEATURED_BRAND.collectionLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-40 border-b border-white/10 bg-[#050505]/90 py-6 backdrop-blur-xl">
        <div
          aria-label="Filter brands by category"
          className="scrollbar-hide mx-auto flex max-w-[1600px] gap-4 overflow-x-auto px-6"
          role="tablist"
        >
          {BRAND_FILTERS.map((filter) => (
            <button
              aria-selected={activeFilter === filter}
              className={`whitespace-nowrap rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                activeFilter === filter
                  ? "bg-white text-black"
                  : "border border-white/20 bg-transparent text-gray-400 hover:border-white hover:text-white"
              }`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              role="tab"
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-[1600px] px-6 py-24 md:px-12"
        id="brand-grid"
      >
        <motion.div
          className="grid auto-rows-[400px] grid-cols-1 gap-6 md:grid-cols-4"
          layout={!reduceMotion}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {filteredBrands.map((brand) => (
              <motion.article
                animate={{ opacity: 1, scale: 1 }}
                className={
                  brand.type === "large"
                    ? "row-span-2 md:col-span-4"
                    : brand.type === "medium"
                      ? "md:col-span-2"
                      : "md:col-span-1"
                }
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                key={brand.id}
                layout={!reduceMotion}
                transition={{ duration: reduceMotion ? 0 : 0.28 }}
              >
                <Link
                  className="group relative block h-full overflow-hidden bg-zinc-900"
                  to={buildBrandHref(brand.id)}
                >
                  <img
                    alt={brand.name}
                    className="h-full w-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-40"
                    loading="lazy"
                    src={brand.image}
                  />
                  <div className="absolute inset-0 flex flex-col justify-between p-10">
                    <span className="self-start bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black">
                      {brand.category}
                    </span>
                    <div>
                      <h3 className="mb-2 text-5xl font-black uppercase tracking-tighter text-white md:text-6xl">
                        {brand.name}
                      </h3>
                      <p className="mb-6 translate-y-4 text-lg font-medium text-gray-300 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                        {brand.tagline}
                      </p>
                      <div className="-translate-x-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white opacity-0 transition-all delay-100 duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                        View Brand <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
