import React, { Suspense, lazy } from "react";
import HeroSection from "./sections/HeroSection";
import ModernNavbar from "../../../Components/ModernNavbar";
import SEO from "../../../Components/SEO";
import MarketingSkeleton from "../Components/MarketingSkeleton";

// Lazy load below-the-fold sections for performance
const ProblemSection = lazy(() => import("./sections/ProblemSection"));
const SolutionSection = lazy(() => import("./sections/SolutionSection"));
const SmartFeaturesSection = lazy(() => import("./sections/SmartFeaturesSection"));
const CategoriesSection = lazy(() => import("./sections/CategoriesSection"));
const SocialProofSection = lazy(() => import("./sections/SocialProofSection"));
const TrustSection = lazy(() => import("./sections/TrustSection"));
const FinalCtaSection = lazy(() => import("./sections/FinalCtaSection"));
const ShopSmartSection = lazy(() => import("./sections/ShopSmartSection"));
const AllInOneAppSection = lazy(() => import("./sections/AllInOneAppSection"));
const InteractiveProductDemo = lazy(() => import("../Components/InteractiveProductDemo"));
const LeadCaptureForm = lazy(() => import("../Components/LeadCaptureForm"));

const links = [
  { label: "Shop", href: "/products" },
  { label: "Features", href: "#features" },
  { label: "Categories", href: "#categories" },
  { label: "Get Started", href: "#cta" },
  // { label: "Sign up", href: "/auth" },
];

/**
 * ─── IMPORTANT ───────────────────────────────────────────────────────────────
 * Place `1000174262.png` into your `/public` folder.
 * All 6 brand photo panels are extracted from that single file via CSS sprite
 * technique (background-size: 200% 300% + background-position per panel).
 *
 * Panel mapping:
 *   Panel 1 (0%   0%)  → HeroSection        right frame
 *   Panel 2 (100% 0%)  → SolutionSection    right frame
 *   Panel 3 (0%   50%) → CategoriesSection  featured banner
 *   Panel 4 (100% 50%) → SocialProofSection visual anchor
 *   Panel 5 (0%   100%)→ TrustSection       left split
 *   Panel 6 (100% 100%)→ FinalCtaSection    right split
 * ─────────────────────────────────────────────────────────────────────────────
 */
const BuyerLanding = () => {

  return (
    <>
      <SEO 
        title="WooSho Buyer - Smart Shopping, Curated for You"
        description="Experience AI-curated shopping with WooSho. Find exactly what you need with our intelligent shopping assistant."
        keywords="smart shopping, AI assistant, buy online, WooSho buyer"
      />
      
      <ModernNavbar navLinks={links} />

      <div className="w-full bg-white font-sans antialiased selection:bg-blue-200 selection:text-blue-900 overflow-hidden">
        {/* ── 1. Hero (Standard Load) ────────────────────────── */}
        <HeroSection />

        <Suspense fallback={<MarketingSkeleton sections={3} />}>
          <div id="problem">
            <ProblemSection />
          </div>

          <div id="solution">
            <SolutionSection />
          </div>

          <div id="features">
            <SmartFeaturesSection />
          </div>

          <InteractiveProductDemo />

          <div id="shop-smart">
            <ShopSmartSection />
          </div>

          <div id="categories">
            <CategoriesSection />
          </div>

          <div id="social">
            <SocialProofSection />
            <AllInOneAppSection />
          </div>

          <div id="trust">
            <TrustSection />
          </div>

          <section className="bg-slate-50 px-6 py-20">
            <div className="mx-auto max-w-3xl">
              <LeadCaptureForm
                audience="buyer"
                title="Get smarter shopping drops"
                description="Join the buyer list for launch drops, personalized collections, and AI shopping updates."
                cta="Join Buyer List"
              />
            </div>
          </section>

          <div id="cta">
            <FinalCtaSection />
          </div>
        </Suspense>
      </div>
    </>
  );
};

export default BuyerLanding;
