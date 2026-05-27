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
import Skeleton from "./Components/Sections/Skeleton";

// Fallback Components
const FallbackGrid = () => (
  <div className="max-w-7xl mx-auto px-6 py-20">
    <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      <Skeleton count={4} />
    </div>
  </div>
);

const FallbackBento = () => (
  <div className="py-20 max-w-7xl mx-auto px-6">
    <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[480px]">
      <div className="col-span-2 row-span-2 bg-gray-100 rounded-3xl animate-pulse" />
      <div className="bg-gray-100 rounded-3xl animate-pulse" />
      <div className="bg-gray-100 rounded-3xl animate-pulse" />
      <div className="bg-gray-100 rounded-3xl animate-pulse" />
      <div className="bg-gray-100 rounded-3xl animate-pulse" />
    </div>
  </div>
);

const FallbackSmall = () => (
  <div className="max-w-7xl mx-auto px-6 py-12">
    <div className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
  </div>
);

const FallbackFlashSale = () => (
  <div className="max-w-7xl mx-auto px-6 py-20">
    <div className="h-64 bg-gray-200 rounded-3xl animate-pulse mb-10" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      <Skeleton count={4} />
    </div>
  </div>
);

const FallbackNewArrivals = () => (
  <div className="max-w-7xl mx-auto px-6 py-20">
    <div className="flex items-end justify-between mb-12">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-20 hidden md:block animate-pulse" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      <Skeleton count={4} />
    </div>
  </div>
);

const FallbackHowItWorks = () => (
  <div className="py-28 bg-white max-w-6xl mx-auto px-6">
    <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-3 animate-pulse" />
    <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-20 animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 mb-6 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-40 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

const FallbackText = () => (
  <div className="max-w-4xl mx-auto px-6 py-20 text-center">
    <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-6 animate-pulse" />
    <div className="h-4 bg-gray-100 rounded w-full max-w-2xl mx-auto mb-3 animate-pulse" />
    <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto animate-pulse" />
  </div>
);

const FallbackBanner = () => (
  <div className="max-w-7xl mx-auto px-6 py-12">
    <div className="h-48 bg-gray-200 rounded-3xl animate-pulse" />
  </div>
);

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
        <Suspense fallback={<FallbackGrid />}>
          <CategoriesSection curations={curationCards} />
        </Suspense>
      </LazyRender>

      {enabledGrowthSections.some((section) => section.id === "continue-shopping") && (
        <LazyRender>
          <Suspense fallback={<FallbackGrid />}>
            <ContinueShoppingSection products={continueShopping} />
          </Suspense>
        </LazyRender>
      )}

      <div className="max-[340px]:[&_.cart-text]:hidden">
        <LazyRender>
          <Suspense fallback={<FallbackGrid />}>
            <HotRightNowSection products={hotRightNow} isLoading={isLoading} />
          </Suspense>
        </LazyRender>
      </div>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <MostLovedSection products={mostLoved} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <div className="max-[340px]:[&_.cart-text]:hidden">
        <LazyRender>
          <Suspense fallback={<FallbackGrid />}>
            <TrendingSection products={trending} isLoading={isLoading} />
          </Suspense>
        </LazyRender>
      </div>

      <LazyRender>
        <Suspense fallback={<FallbackSmall />}>
          <TrendingTags />
        </Suspense>
      </LazyRender>

      <div className="max-[340px]:[&_.cart-text]:hidden">
        <LazyRender>
          <Suspense fallback={<FallbackGrid />}>
            <RecommendedForYouSection
              products={recommendedForYou}
              isLoading={isLoading}
            />
          </Suspense>
        </LazyRender>
      </div>

      <LazyRender>
        <Suspense fallback={<FallbackFlashSale />}>
          <FlashSaleSection products={flashDeals} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackBento />}>
          <DealOfTheDay product={dealOfDay} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <BestSellersSection products={bestSellers} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackBanner />}>
          <StatsBanner />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackBento />}>
          <BentoProductGrid products={bentoProducts} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackSmall />}>
          <TrustStrip />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackNewArrivals />}>
          <NewArrivalsSection products={newArrivals} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <SplitShowcase />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <ProductScrollStrip
            products={scrollStrip}
            isLoading={isLoading}
            title="You Might Also Like"
            label="Recommendations"
          />
        </Suspense>
      </LazyRender>

      <div className="max-[340px]:[&_.cart-text]:hidden">
        <LazyRender>
          <Suspense fallback={<FallbackGrid />}>
            <EditorsPicks products={editorsPicks} isLoading={isLoading} />
          </Suspense>
        </LazyRender>
      </div>

      <LazyRender>
        <Suspense fallback={<FallbackBento />}>
          <LookbookSection products={lookbook} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackBento />}>
          <FilterableGrid products={filterGrid} isLoading={isLoading} />
        </Suspense>
      </LazyRender>

      {enabledGrowthSections.some((section) => section.id === "editorial-collections") && (
        <LazyRender>
          <Suspense fallback={<FallbackGrid />}>
            <EditorialCollectionsSection products={editorialProducts} />
          </Suspense>
        </LazyRender>
      )}

      <LazyRender>
        <Suspense fallback={<FallbackHowItWorks />}>
          <HowItWorksSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackText />}>
          <PerksSection />
        </Suspense>
      </LazyRender>

      {/* Seller & Marketplace Sections */}
      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <TopSellersSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <RecentlyAddedStoresSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <ExploreSellersSection />
        </Suspense>
      </LazyRender>

      {/* Brands & Feedback */}
      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <ShopByBrandSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <RealPurchaseFeedbackSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackGrid />}>
          <BasedOnBrowsingSection
            products={basedOnBrowsing}
            isLoading={isLoading}
          />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackText />}>
          <TestimonialsCarousel />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackBanner />}>
          <NewsletterSection />
        </Suspense>
      </LazyRender>

      <LazyRender>
        <Suspense fallback={<FallbackBanner />}>
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
