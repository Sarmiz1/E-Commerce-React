import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useNavigation, useLoaderData } from "react-router-dom";
import { useAllProducts } from "../../Product/Hooks/useProducts";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { STYLES } from "./Styles/styles";
import { CATEGORIES } from "./Data/categories";
import { BRANDS } from "./Data/brands";
import { PERKS } from "./Data/perks";
import { TESTIMONIALS } from "./Data/testimonials";
import { HOW_IT_WORKS } from "./Data/how-it-works";
import SectionLabel from "./Components/SectionLabel";
import Stars from "../../../Components/Stars";
import ParticleField from "./Components/ParticleField";
import FloatingOrbs from "./Components/FloatingOrbs";
import MarqueeStrip from "./Components/MarqueeStrip";
import ProductCard from "../../../Components/Ui/ProductCard";
import { BentoCard } from "./Components/BentoProductGridComponents/BentoCard";
import AddToCart from "../../../Components/Ui/AddToCart";
import Navbar from "../../../Components/Navbar";

import Skeleton from "./Components/Sections/Skeleton";
import CategoriesSection from "./Components/Sections/CategoriesSection";
import TrendingSection from "./Components/Sections/TrendingSection";
import FlashSaleSection from "./Components/Sections/FlashSaleSection";
import BestSellersSection from "./Components/Sections/BestSellersSection";
import StatsBanner from "./Components/Sections/StatsBanner";
import NewArrivalsSection from "./Components/Sections/NewArrivalsSection";
import SplitShowcase from "./Components/Sections/SplitShowcase";
import EditorsPicks from "./Components/Sections/EditorsPicks";
import HowItWorksSection from "./Components/Sections/HowItWorksSection";
import PerksSection from "./Components/Sections/PerksSection";
import TestimonialsCarousel from "./Components/Sections/TestimonialsCarousel";
import NewsletterSection from "./Components/Sections/NewsletterSection";
import CTABanner from "./Components/Sections/CTABanner";
import BackToTop from "./Components/Sections/BackToTop";
import DealOfTheDay from "./Components/Sections/DealOfTheDay";
import ProductScrollStrip from "./Components/Sections/ProductScrollStrip";
import BentoProductGrid from "./Components/Sections/BentoProductGrid";
import FilterableGrid from "./Components/Sections/FilterableGrid";
import LookbookSection from "./Components/Sections/LookbookSection";
import TrustStrip from "./Components/Sections/TrustStrip";
import TrendingTags from "./Components/Sections/TrendingTags";
import BrandMarquee from "./Components/Sections/BrandMarquee";
import HomePageLoadingState from "./Components/Sections/HomePageLoadingState";
import HomeHeroSection from "./Components/Sections/HomeHeroSection";


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// testing MModal

import ProductDetailModal from "../../../Components/Ui/ProductDetailModal";
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─── Skeleton loader ──────────────────────────────────────────────────────────

// ─── Section components (each owns its hooks) ─────────────────────────────────

// ─── Back to Top ──────────────────────────────────────────────────────────────

// ─── Deal of the Day ──────────────────────────────────────────────────────────

// ─── Auto-scroll product strip (infinite loop) ────────────────────────────────

// ─── Bento Product Grid ───────────────────────────────────────────────────────

// ─── Recently Viewed (tag-filtered grid) ──────────────────────────────────────

// ─── Lookbook / Style Guide Section ──────────────────────────────────────────

// ─── Trust & Guarantee Strip ──────────────────────────────────────────────────

// ─── Recently Trending Tags ───────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  // Products
  const { data: products = [], isLoading } = useAllProducts();

  // still testing Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  

  // Product slices
  const heroFeatured = products[0] || null;
  const trending = products.slice(0, 6);
  const bestSellers = products.slice(2, 8);
  const newArrivals = products.slice(4, 8);
  const flashDeals = products.slice(1, 5);
  const editorsPicks = products.slice(3, 7);
  const dealOfDay = products[5] || products[0] || null;
  const scrollStrip = products.slice(0, 8);
  const bentoProducts = products.slice(0, 5);
  const filterGrid = products.slice(0, 12);
  const lookbook = products.slice(0, 4);



  // Loading state
  if (isLoading && !products.length) {
    return <HomePageLoadingState />;
  }

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <style>{STYLES}</style>

      {/* Marquee */}
      <div className="pt-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800" />
      <MarqueeStrip />

      {/* ── HERO ── */}
      <HomeHeroSection heroFeatured={heroFeatured} />

      {/* ── ALL SECTIONS ── */}
      <CategoriesSection />
      <TrendingSection products={trending} isLoading={isLoading} />
      <TrendingTags />
      <FlashSaleSection products={flashDeals} isLoading={isLoading} />
      <DealOfTheDay product={dealOfDay} isLoading={isLoading} />
      <BestSellersSection products={bestSellers} isLoading={isLoading} />
      <StatsBanner />
      <BentoProductGrid products={bentoProducts} isLoading={isLoading} />
      <TrustStrip />
      <NewArrivalsSection products={newArrivals} isLoading={isLoading} />
      <SplitShowcase />
      <ProductScrollStrip
        products={scrollStrip}
        isLoading={isLoading}
        title="You Might Also Like"
        label="Recommendations"
      />
      <EditorsPicks products={editorsPicks} isLoading={isLoading} />
      <LookbookSection products={lookbook} isLoading={isLoading} />
      <FilterableGrid products={filterGrid} isLoading={isLoading} />
      <HowItWorksSection />
      <PerksSection />

      {/* Brand marquee */}
      <section className="py-14 bg-white border-y border-gray-100 overflow-hidden">
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-8 font-medium">
          Trusted Brands
        </p>
        <div className="flex whitespace-nowrap hp-marquee-rev">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span
              key={i}
              className="text-gray-200 font-black text-2xl md:text-3xl tracking-tight px-10 hover:text-gray-400 transition-colors duration-300 cursor-default"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      <TestimonialsCarousel />
      <NewsletterSection />
      <CTABanner />

      {/* Product Detail Modal */}

      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
      {/* TestingModal */}

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}
