import React, { useEffect, useRef, Suspense, lazy } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ModernNavbar from "../../../Components/ModernNavbar.jsx";
import SEO from "../../../Components/SEO.jsx";
import ModernHero from "./Components/ModernHero";

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

gsap.registerPlugin(ScrollTrigger);

export default function ModernLanding() {
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const REVEAL = { opacity: 0, y: 56, duration: 0.65, ease: "power4.out" };
      const sections = [
        "#pain-points",
        "#platform",
        "#ai-chat",
        "#interactive-demo",
        "#gallery",
        "#categories",
        "#why-woosho",
        "#lead-capture",
        "#cta",
      ];

      sections.forEach((id) => {
        const el = document.querySelector(id);
        if (el) {
          gsap.from(el, {
            ...REVEAL,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        }
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <ModernNavbar pageView="home" />

      <SEO 
        title="WooSho - The Future of E-Commerce" 
        description="Discover a smarter way to shop and sell with WooSho's AI-powered e-commerce ecosystem."
        keywords="e-commerce, AI shopping, online marketplace, WooSho"
      />

      <main
        ref={mainRef}
        className="bg-white dark:bg-[#0E0E10] selection:bg-blue-600/30"
      >
        <div id="hero">
          <ModernHero />
        </div>

        <Suspense
          fallback={
            <div className="h-screen w-full flex items-center justify-center text-gray-500">
              Loading...
            </div>
          }
        >
          <div id="pain-points">
            <ModernPainPoints />
          </div>

          <div id="platform">
            <ModernPlatform />
          </div>

          <div id="ai-chat">
            <ModernAiChat />
          </div>

          <div id="interactive-demo">
            <InteractiveProductDemo />
          </div>

          <div id="gallery">
            <ModernGallery />
          </div>

          <div id="categories">
            <ModernCategories />
          </div>

          <div id="why-woosho">
            <ModernWhy />
          </div>

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

          <div id="cta">
            <ModernCTA />
          </div>
        </Suspense>
        {/* 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                        Test Ground
 
*/}

        {/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      </main>
    </>
  );
}
