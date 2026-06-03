import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import {
  HERO_SLIDES,
  SECTIONS,
  SHOWCASE_PRODUCTS,
  TOPBAR_LABELS,
} from "./data";
import HeroBanner from "./Components/HeroBanner";
import SectionBlock from "./Components/SectionBlock";
import ShowcaseTopbar from "./Components/ShowcaseTopbar";
import { useShowcaseFonts } from "./Hooks/useShowcaseFonts";
import { useShowcaseProductsCache } from "./Hooks/useShowcaseProductsCache";

const getSectionProducts = (sections) =>
  sections.flatMap((section) => [
    ...(section.featured ? [section.featured] : []),
    ...(section.items || []),
  ]);

export function ShowcasePage({
  heroSlides = HERO_SLIDES,
  sections = SECTIONS,
  topbarLabels = TOPBAR_LABELS,
  products = SHOWCASE_PRODUCTS,
  topbarOffset = 0,
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id || "trending");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const topbarRef = useRef(null);
  const cacheProducts = useMemo(
    () => (products?.length ? products : getSectionProducts(sections)),
    [products, sections],
  );

  useShowcaseFonts();
  useShowcaseProductsCache(cacheProducts);

  useEffect(() => {
    const observers = sections.map((section) => {
      const el = document.getElementById(section.id);
      if (!el) return null;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveId(section.id);
      }, { threshold: 0.2, rootMargin: "-20% 0px -60% 0px" });

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [sections]);

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
      <ShowcaseTopbar
        sections={sections}
        labels={topbarLabels}
        activeId={activeId}
        topbarRef={topbarRef}
        onScrollSection={scrollToSection}
        onScrollTopbar={scrollTopbar}
        top={topbarOffset}
      />

      <HeroBanner slides={heroSlides} />

      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "64px 48px 0",
      }}>
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>

      <div style={{ height: 80 }} />

      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ShowcaseIndexPage() {
  return <ShowcasePage />;
}
