import React, { lazy } from "react";
import SEO from "../../../Components/SEO.jsx";
import ModernHero from "./Components/ModernHero";
import MarketingNavbar from "../Components/MarketingNavbar.jsx";
import LazyMarketingSection from "../Components/LazyMarketingSection.jsx";
import { MARKETING_NAV_CTA, MARKETING_NAV_LINKS } from "./Data/navigation";
import { LEAD_CAPTURE_CONTENT, MODERN_LANDING_SEO } from "./Data/pageContent";

// Lazy load below-the-fold components for performance
const ModernPainPoints = lazy(() => import("./Components/ModernPainPoints"));
const ModernPlatform = lazy(() => import("./Components/ModernPlatform"));
const ModernAiChat = lazy(() => import("./Components/ModernAiChat.jsx"));
const ModernCategories = lazy(() => import("./Components/ModernCategories"));
const ModernWhy = lazy(() => import("./Components/ModernWhy"));
const ModernGallery = lazy(() => import("./Components/ModernGallery"));
const InteractiveProductDemo = lazy(() => import("../Components/InteractiveProductDemo"));
const LeadCaptureForm = lazy(() => import("../Components/LeadCaptureForm"));
const ModernCTA = lazy(() =>
  import("./Components/ModernCta").then((module) => ({
    default: module.ModernCTA,
  })),
);
const AnimatedStats = lazy(() => import("./Components/AnimatedStats"));
const SocialProofTicker = lazy(() => import("../Components/SocialProofTicker"));
const ExitIntentPopup = lazy(() => import("../Components/ExitIntentPopup"));


export default function ModernLanding() {
  return (
    <>
      <MarketingNavbar
        cta={MARKETING_NAV_CTA}
        navLinks={MARKETING_NAV_LINKS}
        pageView="home"
      />

      <SEO 
        title={MODERN_LANDING_SEO.title}
        description={MODERN_LANDING_SEO.description}
        keywords={MODERN_LANDING_SEO.keywords}
      />

      <main
        className="bg-white dark:bg-[#0E0E10] selection:bg-blue-600/30"
      >
        <div id="hero">
          <ModernHero />
        </div>

        <LazyMarketingSection>
          <div id="pain-points">
            <ModernPainPoints />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="platform">
            <ModernPlatform />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="ai-chat">
            <ModernAiChat />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="interactive-demo">
            <InteractiveProductDemo />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="gallery">
            <ModernGallery />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="categories">
            <ModernCategories />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="why-woosho">
            <ModernWhy />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="stats">
            <AnimatedStats />
          </div>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <section id="lead-capture" className="bg-white px-6 py-20 dark:bg-[#0E0E10]">
            <div className="mx-auto max-w-3xl">
              <LeadCaptureForm
                audience={LEAD_CAPTURE_CONTENT.audience}
                title={LEAD_CAPTURE_CONTENT.title}
                description={LEAD_CAPTURE_CONTENT.description}
                cta={LEAD_CAPTURE_CONTENT.cta}
              />
            </div>
          </section>
        </LazyMarketingSection>

        <LazyMarketingSection>
          <div id="cta">
            <ModernCTA />
          </div>
        </LazyMarketingSection>

      </main>

      {/* Elite overlays — lazy loaded, non-blocking */}
      <LazyMarketingSection fallback={null} minHeight={0} margin="200px">
        <SocialProofTicker />
      </LazyMarketingSection>
      <LazyMarketingSection fallback={null} minHeight={0} margin="200px">
        <ExitIntentPopup />
      </LazyMarketingSection>
    </>
  );
}
