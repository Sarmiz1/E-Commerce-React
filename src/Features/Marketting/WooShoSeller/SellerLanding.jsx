import React, { useRef, lazy } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../../../Components/SEO";
import MarketingNavbar from "../Components/MarketingNavbar";
import LazyMarketingSection from "../Components/LazyMarketingSection";

// Lazy load sections for performance
import Section1_Hero from "./Components/Section1_Hero";
import {
  SELLER_LEAD_CAPTURE,
  SELLER_NAV_CTA,
  SELLER_NAV_LINKS,
  SELLER_SEO,
} from "./Data/pageData";

// Lazy load below-the-fold sections for performance
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
const SellerOperationsSection = lazy(() => import("./Components/SellerOperationsSection"));
const PulseTicker = lazy(() => import("./Components/PulseTicker"));
const LeadCaptureForm = lazy(() => import("../Components/LeadCaptureForm"));
const SellerRoiCalculator = lazy(() => import("../Components/SellerRoiCalculator"));

// GSAP registration once at module level is correct.
gsap.registerPlugin(ScrollTrigger);

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

  return (
    <div
      ref={mainRef}
      className="min-h-screen w-full relative overflow-x-hidden selection:bg-violet-600/30 bg-[#0A0A0A] text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <SEO
        title={SELLER_SEO.title}
        description={SELLER_SEO.description}
        keywords={SELLER_SEO.keywords}
      />

      <MarketingNavbar
        cta={SELLER_NAV_CTA}
        navLinks={SELLER_NAV_LINKS}
        pageView="sell"
      />

      {/* ── 1. Hero (Standard Load) ────────────────────────── */}
      <section id="seller-hero" className="seller-section min-h-screen w-full relative">
        <Section1_Hero />
      </section>

      <LazyMarketingSection className="scroll-mt-28" id="seller-features" minHeight="100vh">
        {/* ── 2. Pain Clock ───────────────────────────────────── */}
        <section id="seller-tax" className="seller-section min-h-screen w-full relative">
          <Section2_PainClock />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── 3. Dream ────────────────────────────────────────── */}
        <section id="seller-dream" className="seller-section min-h-screen w-full relative">
          <Section3_Dream />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── 4. Features ─────────────────────────────────────── */}
        <section className="seller-section min-h-screen w-full relative">
          <Section4_Features />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection className="scroll-mt-28" id="seller-pricing" minHeight="100vh">
        {/* ── A. Community (NEW) ──────────────────────────────── */}
        <section id="seller-community" className="seller-section w-full relative">
          <SectionA_Community />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── 5. Dual AI ──────────────────────────────────────── */}
        <section id="seller-dual-ai" className="seller-section min-h-screen w-full relative">
          <Section5_DualAi />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── 6. Map ──────────────────────────────────────────── */}
        <section id="seller-map" className="seller-section min-h-screen w-full relative bg-black">
          <Section6_Map />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── B. Delivery (NEW) ───────────────────────────────── */}
        <section id="seller-delivery" className="seller-section w-full relative">
          <SectionB_Delivery />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── 7. Comparison ───────────────────────────────────── */}
        <section id="seller-comparison" className="seller-section min-h-screen w-full relative">
          <Section7_Comparison />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── 8. Pricing ──────────────────────────────────────── */}
        <section className="seller-section min-h-screen w-full relative">
          <Section8_Pricing />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection className="scroll-mt-28" id="seller-cta" minHeight="100vh">
        <SellerRoiCalculator />
      </LazyMarketingSection>

      <LazyMarketingSection>
        <SellerOperationsSection />
      </LazyMarketingSection>

      <LazyMarketingSection>
        <section className="seller-section w-full bg-[#08080A] px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <LeadCaptureForm
              audience={SELLER_LEAD_CAPTURE.audience}
              title={SELLER_LEAD_CAPTURE.title}
              description={SELLER_LEAD_CAPTURE.description}
              cta={SELLER_LEAD_CAPTURE.cta}
              dark
            />
          </div>
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── C. Seller Win (NEW) ─────────────────────────────── */}
        <section id="seller-win" className="seller-section w-full relative">
          <SectionC_SellerWin />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection>
        {/* ── 9. CTA ──────────────────────────────────────────── */}
        <section className="seller-section min-h-screen w-full relative">
          <Section9_Cta />
        </section>
      </LazyMarketingSection>

      <LazyMarketingSection fallback={null} minHeight={0} margin="200px">
        <PulseTicker />
      </LazyMarketingSection>
    </div>
  );
}
