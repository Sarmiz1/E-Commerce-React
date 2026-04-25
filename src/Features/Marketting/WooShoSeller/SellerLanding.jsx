import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ModernNavbar from "../../../Components/ModernNavbar";
import SEO from "../../../Components/SEO";
import Section1_Hero from "./Components/Section1_Hero";
import Section2_PainClock from "./Components/Section2_PainClock";
import Section3_Dream from "./Components/Section3_Dream";
import Section4_Features from "./Components/Section4_Features";
import Section5_DualAi from "./Components/Section5_DualAi";
import Section6_Map from "./Components/Section6_Map";
import Section7_Comparison from "./Components/Section7_Comparison";
import Section8_Pricing from "./Components/Section8_Pricing";
import Section9_Cta from "./Components/Section9_Cta";
import PulseTicker from "./Components/PulseTicker";

// ── New photo sections (Framer Motion — no GSAP) ──────────────
import SectionA_Community from "./Components/SectionA_Community";
import SectionB_Delivery from "./Components/SectionB_Delivery";
import SectionC_SellerWin from "./Components/SectionC_SellerWin";
// ─────────────────────────────────────────────────────────────

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
      <style>{`body { background-color: #0A0A0A !important; }`}</style>

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
      {/*
          Placement rationale: right after Features, this section
          backs up every feature claim with real human social proof.
          Cialdini: Social Proof + Unity → "women like me are winning."
      */}
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
      {/*
          Placement rationale: directly after Map — the map shows WHERE
          we reach, the delivery truck shows HOW. Removes the #1 seller
          objection: "who will deliver for me?"
      */}
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

      {/* ── C. Seller Win (NEW) ─────────────────────────────── */}
      {/*
          Placement rationale: after Pricing, just before the CTA.
          This is the final emotional bridge — buyer has seen features,
          pricing, comparisons. Now they see THEMSELVES in the success
          story. Dopamine spike right before the sign-up button.
      */}
      <section id="seller-win" className="seller-section w-full relative">
        <SectionC_SellerWin />
      </section>

      {/* ── 9. CTA ──────────────────────────────────────────── */}
      <section id="seller-cta" className="seller-section min-h-screen w-full relative">
        <Section9_Cta />
      </section>

      <PulseTicker />
    </div>
  );
}
