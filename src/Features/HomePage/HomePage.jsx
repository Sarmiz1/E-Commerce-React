import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAllProducts } from "../../Hooks/product/useProducts"; 
import { STYLES } from "./Styles/styles";

import MarqueeStrip from "./Components/MarqueeStrip";
import Navbar from "../../Components/Navbar";

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
import ContinueShoppingSection from "./Components/Sections/ContinueShoppingSection";
import EditorialCollectionsSection from "./Components/Sections/EditorialCollectionsSection";
import GlobalCommandPalette from "../../Components/GlobalCommandPalette";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import SEO from "../../Components/SEO";
import { usePersonalizedProducts } from "./Hooks/usePersonalizedProducts";
import { HOME_GROWTH_SECTIONS } from "./homeSectionsConfig";

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  // Products
  const { data: products = [], isLoading, error } = useAllProducts();
  
  useEffect(() => {
    if (error) console.log("Home page error", error);
  }, [error]);

  const personalized = usePersonalizedProducts(products);
  const enabledGrowthSections = useMemo(() => 
    HOME_GROWTH_SECTIONS.filter((section) => section.enabled)
      .sort((a, b) => a.priority - b.priority),
    []
  );

  // still testing Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Global listener for Quick View requests from any ProductCard anywhere
  useEffect(() => {
    const handleQuickView = (e) => setQuickViewProduct(e.detail);
    window.addEventListener("open-quickview", handleQuickView);
    return () => window.removeEventListener("open-quickview", handleQuickView);
  }, []);

  // Product slices
  const heroFeatured = useMemo(() => products[0] || null, [products]);
  const trending = useMemo(() => products.slice(0, 6), [products]);
  const bestSellers = useMemo(() => products.slice(2, 8), [products]);
  const newArrivals = useMemo(() => products.slice(4, 8), [products]);
  const flashDeals = useMemo(() => products.slice(1, 5), [products]);
  const editorsPicks = useMemo(() => products.slice(3, 7), [products]);
  const dealOfDay = useMemo(() => products[5] || products[0] || null, [products]);
  const scrollStrip = useMemo(() => products.slice(0, 8), [products]);
  const bentoProducts = useMemo(() => products.slice(0, 5), [products]);
  const filterGrid = useMemo(() => products.slice(0, 12), [products]);
  const lookbook = useMemo(() => products.slice(0, 4), [products]);

  // New premium section slices
  const hotRightNow = useMemo(() => products.slice(2, 10), [products]);
  const mostLoved = useMemo(() => products.slice(5, 13), [products]);
  const recommendedForYou = useMemo(() => personalized.hasSignals
    ? personalized.forYou.slice(0, 5)
    : products.slice(3, 8), [personalized, products]);
  const basedOnBrowsing = useMemo(() => personalized.hasSignals
    ? personalized.basedOnBrowsing
    : products.slice(0, 12), [personalized, products]);
  const continueShopping = personalized.continueShopping;

  // Loading state
  if (isLoading && !products.length) {
    return <HomePageLoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <SEO 
        title="WooSho | Premium Fashion & Lifestyle E-Commerce"
        description="Discover exclusive drops, premium brands, and curated lifestyle collections at WooSho. Elevate your wardrobe with our latest arrivals and flash deals."
        keywords="WooSho, premium fashion, luxury streetwear, exclusive drops, curated collections, lifestyle, online marketplace, e-commerce"
      />
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
      {enabledGrowthSections.some((section) => section.id === "continue-shopping") && (
        <ContinueShoppingSection products={continueShopping} />
      )}
      <HotRightNowSection products={hotRightNow} isLoading={isLoading} />
      <MostLovedSection products={mostLoved} isLoading={isLoading} />
      <TrendingSection products={trending} isLoading={isLoading} />
      <TrendingTags />
      <RecommendedForYouSection
        products={recommendedForYou}
        isLoading={isLoading}
      />
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
      {enabledGrowthSections.some((section) => section.id === "editorial-collections") && (
        <EditorialCollectionsSection products={products} />
      )}
      <HowItWorksSection />
      <PerksSection />

      {/* Seller & Marketplace Sections */}
      <TopSellersSection />
      <RecentlyAddedStoresSection />
      <ExploreSellersSection />

      {/* Brands & Feedback */}
      <ShopByBrandSection />
      <RealPurchaseFeedbackSection />
      <BasedOnBrowsingSection
        products={basedOnBrowsing}
        isLoading={isLoading}
      />

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
