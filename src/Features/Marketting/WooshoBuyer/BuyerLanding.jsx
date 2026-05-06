import React, { lazy } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "./sections/HeroSection";
import SEO from "../../../components/SEO";
import MarketingNavbar from "../Components/MarketingNavbar";
import LazyMarketingSection from "../Components/LazyMarketingSection";
import WS_IMG from '../../../assets/marketing/mktimg3.png';
import {
  BUYER_LEAD_CAPTURE,
  BUYER_NAV_CTA,
  BUYER_NAV_LINKS,
  BUYER_SEO,
} from "./Data/pageData";

// GSAP registration once at module level is correct.
gsap.registerPlugin(ScrollTrigger);

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
const BuyerPremiumExperienceSection = lazy(() => import("./sections/BuyerPremiumExperienceSection"));
const InteractiveProductDemo = lazy(() => import("../Components/InteractiveProductDemo"));
const LeadCaptureForm = lazy(() => import("../Components/LeadCaptureForm"));

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
      {/* Critical Performance: Preload the heavy sprite panel */}
      <link rel="preload" as="image" href={WS_IMG} />

      <SEO
        title={BUYER_SEO.title}
        description={BUYER_SEO.description}
        keywords={BUYER_SEO.keywords}
      />
      
      <MarketingNavbar cta={BUYER_NAV_CTA} navLinks={BUYER_NAV_LINKS} />

      <div className="w-full overflow-hidden bg-white font-sans antialiased selection:bg-blue-200 selection:text-blue-900 dark:bg-[#0a0a0a]">
        {/* ── 1. Hero (Standard Load) ────────────────────────── */}
        <HeroSection />

        <LazyMarketingSection>
          <div id="problem">
            <ProblemSection />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="solution">
            <SolutionSection />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="features">
            <SmartFeaturesSection />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <InteractiveProductDemo />
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="shop-smart">
            <ShopSmartSection />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="categories">
            <CategoriesSection />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="social">
            <SocialProofSection />
            <AllInOneAppSection />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="trust">
            <TrustSection />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <BuyerPremiumExperienceSection />
        </LazyMarketingSection>

        <LazyMarketingSection>
          <section className="bg-slate-50 px-6 py-20 dark:bg-[#08080A]">
            <div className="mx-auto max-w-3xl">
              <LeadCaptureForm
                audience={BUYER_LEAD_CAPTURE.audience}
                title={BUYER_LEAD_CAPTURE.title}
                description={BUYER_LEAD_CAPTURE.description}
                cta={BUYER_LEAD_CAPTURE.cta}
              />
            </div>
          </section>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="cta">
            <FinalCtaSection />
          </div>
        </LazyMarketingSection>
      </div>
    </>
  );
};

export default BuyerLanding;
