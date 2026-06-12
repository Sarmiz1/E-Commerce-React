import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import {
  HERO_SLIDES,
  SECTIONS,
  SHOWCASE_PRODUCTS,
  TOPBAR_LABELS,
} from "./data";
import ShowcaseHeroBanner from "./ShowcaseIndexComponents/ShowcaseHeroBanner";
import ShowcaseSection from "./ShowcaseIndexComponents/ShowcaseSection";
import ShowcaseTopbar from "./ShowcaseIndexComponents/ShowcaseTopbar";
import { useShowcaseFonts } from "./Hooks/useShowcaseFonts";
import { useShowcaseProductsCache } from "./Hooks/useShowcaseProductsCache";
import {
  buildTopbarLabels,
  getSectionProducts,
} from "./utils/showcaseAdapters";
import { useTheme } from "../../Store/useThemeStore";

function ShowcaseIndexStatus({ children, colors }) {
  return (
    <div style={{
      maxWidth: 1200,
      margin: "0 auto",
      padding: "52px 48px 72px",
      color: colors.text.secondary,
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
  const { colors } = useTheme();
  const safeSections = useMemo(() => sections || [], [sections]);
  const safeHeroSlides = heroSlides?.length ? heroSlides : HERO_SLIDES;
  const labels = useMemo(
    () => topbarLabels || buildTopbarLabels(safeSections) || TOPBAR_LABELS,
    [safeSections, topbarLabels],
  );
  const [activeId, setActiveId] = useState(safeSections[0]?.id || "trending");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const topbarRef = useRef(null);
  const scrollLockRef = useRef({ id: null, timeoutId: null });
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

    const updateActiveSection = () => {
      const lockedId = scrollLockRef.current.id;
      if (lockedId) {
        const target = document.getElementById(lockedId);
        if (target) {
          const targetTop = Math.abs(target.getBoundingClientRect().top - topbarOffset - 72);
          if (targetTop > 18) return;
        }
        scrollLockRef.current.id = null;
      }

      const topBoundary = topbarOffset + 96;
      let closest = safeSections[0]?.id;
      let closestDistance = Number.POSITIVE_INFINITY;

      safeSections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - topBoundary);
        const crossesTop = rect.top <= topBoundary && rect.bottom > topBoundary;

        if (crossesTop) {
          closest = section.id;
          closestDistance = -1;
          return;
        }

        if (closestDistance >= 0 && distance < closestDistance) {
          closest = section.id;
          closestDistance = distance;
        }
      });

      if (closest) setActiveId(closest);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [safeSections, topbarOffset]);

  useEffect(() => {
    const activeButton = topbarRef.current?.querySelector(`[data-section-id="${activeId}"]`);
    activeButton?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  useEffect(() => {
    const handleQuickView = (event) => {
      if (event.detail) setQuickViewProduct(event.detail);
    };

    window.addEventListener("open-quickview", handleQuickView);
    return () => window.removeEventListener("open-quickview", handleQuickView);
  }, []);

  useEffect(() => () => {
    if (scrollLockRef.current.timeoutId) {
      window.clearTimeout(scrollLockRef.current.timeoutId);
    }
  }, []);

  const scrollToSection = useCallback((id) => {
    setActiveId(id);
    if (scrollLockRef.current.timeoutId) {
      window.clearTimeout(scrollLockRef.current.timeoutId);
    }
    scrollLockRef.current.id = id;
    scrollLockRef.current.timeoutId = window.setTimeout(() => {
      if (scrollLockRef.current.id === id) scrollLockRef.current.id = null;
    }, 900);

    const el = document.getElementById(id);
    if (!el) return;

    const top = window.scrollY + el.getBoundingClientRect().top - topbarOffset - 72;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }, [topbarOffset]);

  const scrollTopbar = useCallback((dir) => {
    topbarRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: colors.surface.primary,
      minHeight: "100vh",
      color: colors.text.primary,
      transition: "background 0.2s ease, color 0.2s ease",
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
        <ShowcaseIndexStatus colors={colors}>Loading {pageName} sections...</ShowcaseIndexStatus>
      )}
      {isError && (
        <ShowcaseIndexStatus colors={colors}>
          <button
            onClick={onRetry}
            style={{
              border: `1px solid ${colors.border.default}`,
              borderRadius: 999,
              padding: "10px 16px",
              background: colors.surface.elevated,
              color: colors.text.primary,
              fontWeight: 700,
              cursor: "pointer",
            }}
            type="button"
            className="hover:scale-110 transition-all duration-300 ease-in-out"
          >
            Retry {pageName}
          </button>
        </ShowcaseIndexStatus>
      )}
      {!isLoading && !isError && safeSections.length === 0 && (
        <ShowcaseIndexStatus colors={colors}>{emptyMessage}</ShowcaseIndexStatus>
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
