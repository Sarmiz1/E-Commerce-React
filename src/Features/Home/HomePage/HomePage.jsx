import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useAllProducts } from "../../Product/Hooks/useProducts";
import { STYLES } from "./Styles/styles";
import { CATEGORIES } from "./Data/categories";
import { BRANDS } from "./Data/brands";
import { PERKS } from "./Data/perks";
import { TESTIMONIALS } from "./Data/testimonials";

import MarqueeStrip from "./Components/MarqueeStrip";
import ProductCard from "../../../Components/Ui/ProductCard";
import Navbar from "../../../Components/Navbar";

// import Skeleton from "./Components/Sections/Skeleton";
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
import HotRightNowSection from "./Components/Sections/HotRightNowSection";
import MostLovedSection from "./Components/Sections/MostLovedSection";
import RecommendedForYouSection from "./Components/Sections/RecommendedForYouSection";
import BasedOnBrowsingSection from "./Components/Sections/BasedOnBrowsingSection";
import TopSellersSection from "./Components/Sections/TopSellersSection";
import RecentlyAddedStoresSection from "./Components/Sections/RecentlyAddedStoresSection";
import RealPurchaseFeedbackSection from "./Components/Sections/RealPurchaseFeedbackSection";
import ExploreSellersSection from "./Components/Sections/ExploreSellersSection";
import ShopByBrandSection from "./Components/Sections/ShopByBrandSection";
import HomePageLoadingState from "./Components/Sections/HomePageLoadingState";
import HomeHeroSection from "./Components/Sections/HomeHeroSection";
import GlobalCommandPalette from "../../../Components/GlobalCommandPalette";


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// import ProductDetailModal from "../../../Components/Ui/ProductDetailModal";
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";

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
  
  // Global listener for Quick View requests from any ProductCard anywhere
  useEffect(() => {
    const handleQuickView = (e) => setQuickViewProduct(e.detail);
    window.addEventListener('open-quickview', handleQuickView);
    return () => window.removeEventListener('open-quickview', handleQuickView);
  }, []);

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

  // New premium section slices
  const hotRightNow = products.slice(2, 10);
  const mostLoved = products.slice(5, 13);
  const recommendedForYou = products.slice(3, 8);
  const basedOnBrowsing = products.slice(0, 12);



  // Loading state
  if (isLoading && !products.length) {
    return <HomePageLoadingState />;
  }

  return (
    <div className="overflow-x-hidden">
      <GlobalCommandPalette />
      <Navbar />
      <style>{STYLES}</style>

      {/* Marquee */}
      <div className="pt-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800" />
      <MarqueeStrip />

      {/* ── HERO ── */}
      <HomeHeroSection heroFeatured={heroFeatured} />

      {/* ── ALL SECTIONS ── */}
      <CategoriesSection />
      <HotRightNowSection products={hotRightNow} isLoading={isLoading} />
      <MostLovedSection products={mostLoved} isLoading={isLoading} />
      <TrendingSection products={trending} isLoading={isLoading} />
      <TrendingTags />
      <RecommendedForYouSection products={recommendedForYou} isLoading={isLoading} />
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

      {/* Seller & Marketplace Sections */}
      <TopSellersSection />
      <RecentlyAddedStoresSection />
      <ExploreSellersSection />

      {/* Brands & Feedback */}
      <ShopByBrandSection />
      <RealPurchaseFeedbackSection />
      <BasedOnBrowsingSection products={basedOnBrowsing} isLoading={isLoading} />

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
