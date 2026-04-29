import React, { Suspense, lazy } from "react";
import ModernNavbar from "../../../Components/ModernNavbar.jsx";
import SEO from "../../../Components/SEO.jsx";
import ModernHero from "./Components/ModernHero";
import MarketingSkeleton from "../Components/MarketingSkeleton";

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
      <ModernNavbar pageView="home" />

      <SEO 
        title="WooSho - The Future of E-Commerce" 
        description="Discover a smarter way to shop and sell with WooSho's AI-powered e-commerce ecosystem."
        keywords="e-commerce, AI shopping, online marketplace, WooSho"
      />

      <main
        className="bg-white dark:bg-[#0E0E10] selection:bg-blue-600/30"
      >
        <div id="hero">
          <ModernHero />
        </div>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="pain-points">
            <ModernPainPoints />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="platform">
            <ModernPlatform />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="ai-chat">
            <ModernAiChat />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="interactive-demo">
            <InteractiveProductDemo />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="gallery">
            <ModernGallery />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="categories">
            <ModernCategories />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="why-woosho">
            <ModernWhy />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="stats">
            <AnimatedStats />
          </div>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <section id="lead-capture" className="bg-white px-6 py-20 dark:bg-[#0E0E10]">
            <div className="mx-auto max-w-3xl">
              <LeadCaptureForm
                audience="marketplace"
                title="Get WooSho launch updates"
                description="Join the product list for shopper tools, seller releases, and marketplace experiments."
                cta="Join Updates"
              />
            </div>
          </section>
        </Suspense>

        <Suspense fallback={<MarketingSkeleton sections={1} />}>
          <div id="cta">
            <ModernCTA />
          </div>
        </Suspense>

      </main>

      {/* Elite overlays — lazy loaded, non-blocking */}
      <Suspense fallback={null}>
        <SocialProofTicker />
      </Suspense>
      <Suspense fallback={null}>
        <ExitIntentPopup />
      </Suspense>
    </>
  );
}
