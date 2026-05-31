import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ModernNavbar from "../../Components/ModernNavbar";
import SEO from "../../Components/SEO";
import { BRANDS_NAV_LINKS } from "./data/brandsData";
import {
  buildBrandCatalogHref,
  buildBrandHref,
  buildBrandsDirectoryHref,
  getBrandById,
  getRelatedBrands,
} from "./utils/brandUtils";

const getCanonicalUrl = (brandId) =>
  typeof window !== "undefined"
    ? `${window.location.origin}${buildBrandHref(brandId)}`
    : undefined;

export default function BrandDetail() {
  const { brandId = "" } = useParams();
  const reduceMotion = useReducedMotion();
  const brand = getBrandById(brandId);
  const canonical = getCanonicalUrl(brandId);
  const relatedBrands = getRelatedBrands(brand);

  const schema = brand
    ? {
        "@context": "https://schema.org",
        "@type": "Brand",
        name: brand.name,
        description: brand.description,
        image: brand.heroImage || brand.image,
        url: canonical,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600/30">
      <SEO
        canonical={canonical}
        description={
          brand?.description ||
          "This WooSho brand profile is not available. Browse the brand directory to find another label."
        }
        image={brand?.heroImage || brand?.image}
        keywords={
          brand ? `${brand.name}, ${brand.category}, WooSho brand profile` : undefined
        }
        noIndex={!brand}
        schema={schema}
        title={brand ? `${brand.name} brand profile | WooSho` : "Brand not found | WooSho"}
      />
      <ModernNavbar navLinks={BRANDS_NAV_LINKS} />

      {!brand ? (
        <main className="mx-auto max-w-lg px-6 py-40 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-400">
            Brand not found
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter">
            This label is not in the directory.
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Browse the WooSho brand directory to find an available profile.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition-colors hover:bg-blue-600 hover:text-white"
            to={buildBrandsDirectoryHref()}
          >
            <ArrowLeft size={15} />
            Back to brands
          </Link>
        </main>
      ) : (
        <>
          <header className="relative min-h-[680px] overflow-hidden pt-20">
            <div className="absolute inset-0">
              <img
                alt={`${brand.name} brand profile`}
                className="h-full w-full object-cover opacity-60"
                fetchPriority="high"
                src={brand.heroImage || brand.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-black/40" />
            </div>

            <div className="relative mx-auto flex min-h-[600px] max-w-[1600px] flex-col justify-end px-6 pb-16 md:px-12">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                transition={{ duration: reduceMotion ? 0 : 0.7 }}
              >
                <Link
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-300 transition-colors hover:text-white"
                  to={buildBrandsDirectoryHref()}
                >
                  <ArrowLeft size={15} />
                  All brands
                </Link>
                <p className="mt-10 text-xs font-black uppercase tracking-[0.3em] text-blue-400">
                  {brand.category}
                </p>
                <h1 className="mt-3 text-7xl font-black uppercase leading-none tracking-tighter sm:text-8xl lg:text-9xl">
                  {brand.name}
                </h1>
                <p className="mt-5 max-w-xl text-xl font-medium text-gray-300 md:text-2xl">
                  {brand.tagline}
                </p>
              </motion.div>
            </div>
          </header>

          <main className="mx-auto max-w-[1600px] px-6 pb-24 pt-10 md:px-12">
            <div className="grid gap-16 border-b border-white/10 pb-20 lg:grid-cols-[1fr_360px]">
              <section>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
                  Brand profile
                </p>
                <h2 className="mt-4 text-5xl font-black uppercase tracking-tighter md:text-6xl">
                  About {brand.name}
                </h2>
                <p className="mt-6 max-w-3xl text-xl font-medium leading-relaxed text-gray-400">
                  {brand.description}
                </p>
              </section>

              <aside className="border-l border-white/10 pl-6 lg:pl-8">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
                  Shop the label
                </p>
                <p className="mt-4 text-sm leading-6 text-gray-400">
                  Product browsing and cart actions live in the dedicated
                  shop-by-brand marketplace experience.
                </p>
                <Link
                  className="mt-6 inline-flex items-center gap-3 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition-colors hover:bg-blue-600 hover:text-white"
                  to={buildBrandCatalogHref(brand.id)}
                >
                  Shop {brand.name}
                  <ArrowRight size={15} />
                </Link>
              </aside>
            </div>

            <section className="pt-16">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
                Related labels
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedBrands.length ? (
                  relatedBrands.map((relatedBrand) => (
                    <Link
                      className="group relative min-h-56 overflow-hidden bg-zinc-900"
                      key={relatedBrand.id}
                      to={buildBrandHref(relatedBrand.id)}
                    >
                      <img
                        alt={relatedBrand.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        src={relatedBrand.image}
                      />
                      <div className="absolute inset-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 to-transparent p-5">
                        <span className="text-2xl font-black uppercase tracking-tighter">
                          {relatedBrand.name}
                        </span>
                        <ArrowRight
                          className="transition-transform group-hover:translate-x-1"
                          size={18}
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-gray-400">
                    More profiles in this category are coming soon.
                  </p>
                )}
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
}
