import React, { useRef, useEffect, Suspense, lazy } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ModernNavbar from "../../../Components/ModernNavbar";
import SEO from "../../../Components/SEO";

// Lazy load sections for performance
const Section1_Hero = lazy(() => import("./Components/Section1_Hero"));
const Section2_PainClock = lazy(() => import("./Components/Section2_PainClock"));
const Section3_Dream = lazy(() => import("./Components/Section3_Dream"));
const Section4_Features = lazy(() => import("./Components/Section4_Features"));
const Section5_DualAi = lazy(() => import("./Components/Section5_DualAi"));
const Section6_Map = lazy(() => import("./Components/Section6_Map"));
const Section7_Comparison = lazy(() => import("./Components/Section7_Comparison"));
const Section8_Pricing = lazy(() => import("./Components/Section8_Pricing"));
const Section9_Cta = lazy(() => import("./Components/Section9_Cta"));
const SectionA_Community = lazy(() => import("./Components/SectionA_Community"));
const SectionB_Delivery = lazy(() => import("./Components/SectionB_Delivery"));
const SectionC_SellerWin = lazy(() => import("./Components/SectionC_SellerWin"));
const PulseTicker = lazy(() => import("./Components/PulseTicker"));
const LeadCaptureForm = lazy(() => import("../Components/LeadCaptureForm"));
const SellerRoiCalculator = lazy(() => import("../Components/SellerRoiCalculator"));

// ─── Single registration point for the entire page ───────────
// Do NOT call gsap.registerPlugin(ScrollTrigger) in any child component.
gsap.registerPlugin(ScrollTrigger);
// ─────────────────────────────────────────────────────────────

const links = [
  { label: "Shop", href: "/products" },
  { label: "Features", href: "#seller-features" },
  { label: "Pricing", href: "#seller-pricing" },
  { label: "Get Started", href: "#seller-cta" },
];

/**
 * Page section order:
 *
 *  1. Hero
 *  2. Pain Clock
 *  3. Dream
 *  4. Features
 *  ── A. Community (Nigerian women group photo) ──  ← NEW
 *  5. Dual AI
 *  6. Map
 *  ── B. Delivery (logistics truck photo) ──        ← NEW
 *  7. Comparison
 *  8. Pricing
 *  ── C. Seller Win (solo seller photo) ──          ← NEW
 *  9. CTA
 */
export default function SellerLanding() {
  const mainRef = useRef(null);

  useEffect(() => {
    // Force background and ensure cleanup
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0A0A0A";
    
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  return (
    <div
      ref={mainRef}
      className="min-h-screen w-full relative overflow-x-hidden selection:bg-violet-600/30 bg-[#0A0A0A] text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <SEO 
        title="WooSho Seller - AI-Powered E-Commerce for the Next Generation"
        description="Scale your business effortlessly with WooSho's dual AI system. Automate your store, manage inventory, and grow your sales."
        keywords="sell online, e-commerce platform, AI store management, WooSho seller"
      />

      <ModernNavbar navLinks={links} pageView="sell" />

      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-violet-500/50">Loading Experience...</div>}>
        {/* ── 1. Hero ─────────────────────────────────────────── */}
        <section id="seller-hero" className="seller-section min-h-screen w-full relative">
          <Section1_Hero />
        </section>

        {/* ── 2. Pain Clock ───────────────────────────────────── */}
        <section id="seller-tax" className="seller-section min-h-screen w-full relative">
          <Section2_PainClock />
        </section>

        {/* ── 3. Dream ────────────────────────────────────────── */}
        <section id="seller-dream" className="seller-section min-h-screen w-full relative">
          <Section3_Dream />
        </section>

        {/* ── 4. Features ─────────────────────────────────────── */}
        <section id="seller-features" className="seller-section min-h-screen w-full relative">
          <Section4_Features />
        </section>

        {/* ── A. Community (NEW) ──────────────────────────────── */}
        <section id="seller-community" className="seller-section w-full relative">
          <SectionA_Community />
        </section>

        {/* ── 5. Dual AI ──────────────────────────────────────── */}
        <section id="seller-dual-ai" className="seller-section min-h-screen w-full relative">
          <Section5_DualAi />
        </section>

        {/* ── 6. Map ──────────────────────────────────────────── */}
        <section id="seller-map" className="seller-section min-h-screen w-full relative bg-black">
          <Section6_Map />
        </section>

        {/* ── B. Delivery (NEW) ───────────────────────────────── */}
        <section id="seller-delivery" className="seller-section w-full relative">
          <SectionB_Delivery />
        </section>

        {/* ── 7. Comparison ───────────────────────────────────── */}
        <section id="seller-comparison" className="seller-section min-h-screen w-full relative">
          <Section7_Comparison />
        </section>

        {/* ── 8. Pricing ──────────────────────────────────────── */}
        <section id="seller-pricing" className="seller-section min-h-screen w-full relative">
          <Section8_Pricing />
        </section>

        <SellerRoiCalculator />

        <section className="seller-section w-full bg-[#08080A] px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <LeadCaptureForm
              audience="seller"
              title="Get seller launch access"
              description="Join the seller list for onboarding, AI listing tools, and marketplace growth updates."
              cta="Join Seller List"
              dark
            />
          </div>
        </section>

        {/* ── C. Seller Win (NEW) ─────────────────────────────── */}
        <section id="seller-win" className="seller-section w-full relative">
          <SectionC_SellerWin />
        </section>

        {/* ── 9. CTA ──────────────────────────────────────────── */}
        <section id="seller-cta" className="seller-section min-h-screen w-full relative">
          <Section9_Cta />
        </section>

        <PulseTicker />
      </Suspense>
    </div>
  );
}
