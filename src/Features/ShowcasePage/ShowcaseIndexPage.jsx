import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import {
  HERO_SLIDES,
  SECTIONS,
  SHOWCASE_PRODUCTS,
  TOPBAR_LABELS,
} from "./data";
import ShowcaseHeroBanner from "./Components/ShowcaseHeroBanner";
import ShowcaseSection from "./Components/ShowcaseSection";
import ShowcaseTopbar from "./Components/ShowcaseTopbar";
import { useShowcaseFonts } from "./Hooks/useShowcaseFonts";
import { useShowcaseProductsCache } from "./Hooks/useShowcaseProductsCache";
import {
  buildTopbarLabels,
  getSectionProducts,
} from "./utils/showcaseAdapters";

function ShowcaseIndexStatus({ children }) {
  return (
    <div style={{
      maxWidth: 1200,
      margin: "0 auto",
      padding: "52px 48px 72px",
      color: "#666",
      fontSize: 13,
      fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

const getDefaultSectionPath = (basePath, section) =>
  section.path || `${basePath}/${encodeURIComponent(section.id)}`;

export function ShowcaseIndex({
  heroSlides = HERO_SLIDES,
  sections = SECTIONS,
  topbarLabels,
  products,
  topbarOffset = 0,
  basePath = "/products/showcase",
  isLoading = false,
  isError = false,
  onRetry,
  emptyMessage = "No showcase sections are available yet.",
  pageName = 'showcase',
}) {
  const safeSections = useMemo(() => sections || [], [sections]);
  const safeHeroSlides = heroSlides?.length ? heroSlides : HERO_SLIDES;
  const labels = useMemo(
    () => topbarLabels || buildTopbarLabels(safeSections) || TOPBAR_LABELS,
    [safeSections, topbarLabels],
  );
  const [activeId, setActiveId] = useState(safeSections[0]?.id || "trending");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const topbarRef = useRef(null);
  const cacheProducts = useMemo(
    () => (products?.length ? products : getSectionProducts(safeSections)),
    [products, safeSections],
  );

  // Checking if section is available or not,
  const sectionIsAvailable = useMemo(() => {
    if (isLoading || isError) return false;
    return safeSections.length > 0;
  }, [isLoading, isError, safeSections]);

  useShowcaseFonts();
  useShowcaseProductsCache(cacheProducts);

  useEffect(() => {
    if (!safeSections.length) return undefined;

    const observers = safeSections.map((section) => {
      const el = document.getElementById(section.id);
      if (!el) return null;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveId(section.id);
      }, { threshold: 0.2, rootMargin: "-20% 0px -60% 0px" });

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [safeSections]);

  useEffect(() => {
    const handleQuickView = (event) => {
      if (event.detail) setQuickViewProduct(event.detail);
    };

    window.addEventListener("open-quickview", handleQuickView);
    return () => window.removeEventListener("open-quickview", handleQuickView);
  }, []);

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollTopbar = useCallback((dir) => {
    topbarRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#fff",
      minHeight: "100vh",
      color: "#1a1a1a",
    }}>
      {sectionIsAvailable && (
        <ShowcaseTopbar
          sections={safeSections}
          labels={labels}
          activeId={activeId}
          topbarRef={topbarRef}
          onScrollSection={scrollToSection}
          onScrollTopbar={scrollTopbar}
          top={topbarOffset}
        />
      )}

      <ShowcaseHeroBanner slides={safeHeroSlides}
        sectionIsAvailable={sectionIsAvailable} />

      <div className="showcase-index-sections" style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "64px 48px 0",
      }}>
        {safeSections.map((section) => (
          <ShowcaseSection
            key={section.id}
            section={section}
            viewAllPath={getDefaultSectionPath(basePath, section)}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>

      {isLoading && (
        <ShowcaseIndexStatus>Loading {pageName} sections...</ShowcaseIndexStatus>
      )}
      {isError && (
        <ShowcaseIndexStatus>
          <button
            onClick={onRetry}
            style={{
              border: "1px solid #ddd",
              borderRadius: 999,
              padding: "10px 16px",
              background: "#fff",
              color: "#1a1a1a",
              fontWeight: 700,
              cursor: "pointer",
            }}
            type="button"
          >
            Retry showcase
          </button>
        </ShowcaseIndexStatus>
      )}
      {!isLoading && !isError && safeSections.length === 0 && (
        <ShowcaseIndexStatus>{emptyMessage}</ShowcaseIndexStatus>
      )}

      <div style={{ height: 80 }} />

      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <style>{`
        @media (max-width: 767px) {
          .showcase-index-sections {
            padding: 42px 18px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ShowcaseIndexPage(props) {
  return <ShowcaseIndex {...props} />;
}
