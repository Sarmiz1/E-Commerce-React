import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { STYLES } from "./Styles/styles";

import MarqueeStrip from "./Components/MarqueeStrip";
import Navbar from "../../Components/Navbar";

import LazyRender from "../../Components/Ui/LazyRender";
import HomePageLoadingState from "./Components/Sections/HomePageLoadingState";
import HomeHeroSection from "./Components/Sections/HomeHeroSection";
import GlobalCommandPalette from "../../Components/GlobalCommandPalette";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import SEO from "../../Components/SEO";

// Lazy loaded below-the-fold sections
const CategoriesSection = lazy(() => import("./Components/Sections/CategoriesSection"));
const TrendingSection = lazy(() => import("./Components/Sections/TrendingSection"));
const FlashSaleSection = lazy(() => import("./Components/Sections/FlashSaleSection"));
const BestSellersSection = lazy(() => import("./Components/Sections/BestSellersSection"));
const StatsBanner = lazy(() => import("./Components/Sections/StatsBanner"));
const NewArrivalsSection = lazy(() => import("./Components/Sections/NewArrivalsSection"));
const SplitShowcase = lazy(() => import("./Components/Sections/SplitShowcase"));
const EditorsPicks = lazy(() => import("./Components/Sections/EditorsPicks"));
const HowItWorksSection = lazy(() => import("./Components/Sections/HowItWorksSection"));
const PerksSection = lazy(() => import("./Components/Sections/PerksSection"));
const TestimonialsCarousel = lazy(() => import("./Components/Sections/TestimonialsCarousel"));
const NewsletterSection = lazy(() => import("./Components/Sections/NewsletterSection"));
const CTABanner = lazy(() => import("./Components/Sections/CTABanner"));
const BackToTop = lazy(() => import("./Components/Sections/BackToTop"));
const DealOfTheDay = lazy(() => import("./Components/Sections/DealOfTheDay"));
const ProductScrollStrip = lazy(() => import("./Components/Sections/ProductScrollStrip"));
const BentoProductGrid = lazy(() => import("./Components/Sections/BentoProductGrid"));
const FilterableGrid = lazy(() => import("./Components/Sections/FilterableGrid"));
const LookbookSection = lazy(() => import("./Components/Sections/LookbookSection"));
const TrustStrip = lazy(() => import("./Components/Sections/TrustStrip"));
const TrendingTags = lazy(() => import("./Components/Sections/TrendingTags"));
const HotRightNowSection = lazy(() => import("./Components/Sections/HotRightNowSection"));
const MostLovedSection = lazy(() => import("./Components/Sections/MostLovedSection"));
const RecommendedForYouSection = lazy(() => import("./Components/Sections/RecommendedForYouSection"));
const BasedOnBrowsingSection = lazy(() => import("./Components/Sections/BasedOnBrowsingSection"));
const TopSellersSection = lazy(() => import("./Components/Sections/TopSellersSection"));
const RecentlyAddedStoresSection = lazy(() => import("./Components/Sections/RecentlyAddedStoresSection"));
const RealPurchaseFeedbackSection = lazy(() => import("./Components/Sections/RealPurchaseFeedbackSection"));
const ExploreSellersSection = lazy(() => import("./Components/Sections/ExploreSellersSection"));
const ShopByBrandSection = lazy(() => import("./Components/Sections/ShopByBrandSection"));
const ContinueShoppingSection = lazy(() => import("./Components/Sections/ContinueShoppingSection"));
const EditorialCollectionsSection = lazy(() => import("./Components/Sections/EditorialCollectionsSection"));
import { useHomeCurations } from "./Hooks/useHomeCurations";
import { HOME_GROWTH_SECTIONS } from "./homeSectionsConfig";

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const uniqueProducts = (...groups) => {
  const byId = new Map();
  groups.flat().forEach((product) => {
    if (product?.id && !byId.has(product.id)) {
      byId.set(product.id, product);
    }
  });
  return [...byId.values()];
};

export default function HomePage() {
  const {
    data: homeCurations,
    isLoading,
    error,
  } = useHomeCurations();
  
  useEffect(() => {
    if (error) console.log("Home page curation error", error);
  }, [error]);

  useEffect(() => {
    if (homeCurations?.unavailableFeeds?.length) {
      console.warn("Unavailable homepage curation feeds", homeCurations.unavailableFeeds);
    }
  }, [homeCurations?.unavailableFeeds]);

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

  const allCuratedProducts = useMemo(() => uniqueProducts(
    homeCurations?.heroFeatured,
    homeCurations?.trendingProducts,
    homeCurations?.bestSellers,
    homeCurations?.newArrivals,
    homeCurations?.flashDeals,
    homeCurations?.recommendedForUser,
    homeCurations?.continueShopping,
    homeCurations?.editorialCollections,
    homeCurations?.hotRightNow,
    homeCurations?.mostLoved,
    homeCurations?.editorsPicks,
    homeCurations?.dealOfTheDay,
    homeCurations?.productScrollStrip,
    homeCurations?.bentoProducts,
    homeCurations?.filterGrid,
    homeCurations?.lookbook,
    homeCurations?.basedOnBrowsing,
  ), [homeCurations]);

  const heroFeatured = homeCurations?.heroFeatured?.[0] || homeCurations?.trendingProducts?.[0] || null;
  const trending = homeCurations?.trendingProducts || [];
  const bestSellers = homeCurations?.bestSellers || [];
  const newArrivals = homeCurations?.newArrivals || [];
  const flashDeals = homeCurations?.flashDeals || [];
  const editorsPicks = homeCurations?.editorsPicks || [];
  const editorialProducts = homeCurations?.editorialCollections?.length
    ? homeCurations.editorialCollections
    : allCuratedProducts;
  const dealOfDay =
    homeCurations?.dealOfTheDay?.[0] ||
    flashDeals[0] ||
    heroFeatured;
  const scrollStrip = homeCurations?.productScrollStrip?.length
    ? homeCurations.productScrollStrip
    : allCuratedProducts.slice(0, 10);
  const bentoProducts = homeCurations?.bentoProducts?.length
    ? homeCurations.bentoProducts
    : allCuratedProducts.slice(0, 5);
  const filterGrid = homeCurations?.filterGrid?.length
    ? homeCurations.filterGrid
    : allCuratedProducts.slice(0, 12);
  const lookbook = homeCurations?.lookbook?.length
    ? homeCurations.lookbook
    : allCuratedProducts.slice(0, 4);
  const hotRightNow = homeCurations?.hotRightNow || [];
  const mostLoved = homeCurations?.mostLoved || [];
  const recommendedForYou = homeCurations?.recommendedForUser || [];
  const basedOnBrowsing = homeCurations?.basedOnBrowsing || [];
  const continueShopping = homeCurations?.continueShopping || [];
  const curationCards = homeCurations?.curationCards || [];

  // Loading state
  if (isLoading && !allCuratedProducts.length) {
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
      <LazyRender>
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading Categories...</div>}>
          <CategoriesSection curations={curationCards} />
        </Suspense>
      </LazyRender>

      {enabledGrowthSections.some((section) => section.id === "continue-shopping") && (
        <LazyRender>
          <Suspense fallback={<div className="h-64" />}>
            <ContinueShoppingSection products={continueShopping} />
          </Suspense>
        </LazyRender>
      )}

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <HotRightNowSection products={hotRightNow} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <MostLovedSection products={mostLoved} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <TrendingSection products={trending} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-32" />}>
          <TrendingTags />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <RecommendedForYouSection
            products={recommendedForYou}
            isLoading={isLoading}
          />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <FlashSaleSection products={flashDeals} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-96" />}>
          <DealOfTheDay product={dealOfDay} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <BestSellersSection products={bestSellers} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <StatsBanner />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-96" />}>
          <BentoProductGrid products={bentoProducts} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-32" />}>
          <TrustStrip />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <NewArrivalsSection products={newArrivals} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <SplitShowcase />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <ProductScrollStrip
            products={scrollStrip}
            isLoading={isLoading}
            title="You Might Also Like"
            label="Recommendations"
          />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <EditorsPicks products={editorsPicks} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-96" />}>
          <LookbookSection products={lookbook} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-96" />}>
          <FilterableGrid products={filterGrid} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      {enabledGrowthSections.some((section) => section.id === "editorial-collections") && (
        <LazyRender>
          <Suspense fallback={<div className="h-64" />}>
            <EditorialCollectionsSection products={editorialProducts} />
          </Suspense>
        </LazyRender>
      )}

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <HowItWorksSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <PerksSection />
        </Suspense>
      </LazyRender>

      {/* Seller & Marketplace Sections */}
      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <TopSellersSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <RecentlyAddedStoresSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <ExploreSellersSection />
        </Suspense>
      </LazyRender>

      {/* Brands & Feedback */}
      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <ShopByBrandSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <RealPurchaseFeedbackSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <BasedOnBrowsingSection
            products={basedOnBrowsing}
            isLoading={isLoading}
          />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <TestimonialsCarousel />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <NewsletterSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<div className="h-64" />}>
          <CTABanner />
        </Suspense>
      </LazyRender>

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
