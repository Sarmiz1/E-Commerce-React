import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "../../../Context/theme/ThemeContext";
import ModernNavbar from "../../../Components/ModernNavbar";
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

const links = [
  { label: "Shop", href: "/products" },
  { label: "Features", href: "#seller-features" },
  { label: "Pricing", href: "#seller-pricing" },
  { label: "Get Started", href: "#seller-cta" },
];

gsap.registerPlugin(ScrollTrigger);

export default function SellerLanding() {
  const mainRef = useRef(null);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = mainRef.current?.querySelectorAll(".seller-section");
      sections?.forEach((section, i) => {
        if (i === 0) return;
        gsap.fromTo(
          section,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 40%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={mainRef}
      className="min-h-screen relative selection:bg-blue-600/30"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: isDark ? "#0A0A0A" : "#ffffff",
        color: isDark ? "#fff" : "#111",
      }}
    >
      <ModernNavbar navLinks={links} />

      {/* V1: The Living Feed Hero */}
      <section
        id="seller-hero"
        className="seller-section min-h-screen w-full relative"
      >
        <Section1_Hero />
      </section>

      {/* V2: The Invisible Tax Clock */}
      <section
        id="seller-tax"
        className="seller-section min-h-screen w-full relative"
      >
        <Section2_PainClock />
      </section>

      {/* V3: Adaeze's Day Notification Cascade */}
      <section
        id="seller-dream"
        className="seller-section min-h-screen w-full relative"
      >
        <Section3_Dream />
      </section>

      {/* V4: Feature Cards That Open */}
      <section
        id="seller-features"
        className="seller-section min-h-screen w-full relative"
      >
        <Section4_Features />
      </section>

      {/* V5: The Dual AI Chat */}
      <section
        id="seller-dual-ai"
        className="seller-section min-h-screen w-full relative"
      >
        <Section5_DualAi />
      </section>

      {/* V6: Nigeria Lighting Up */}
      <section
        id="seller-map"
        className="seller-section min-h-screen w-full relative bg-black"
      >
        <Section6_Map />
      </section>

      {/* V7: The Two Columns Filling */}
      <section
        id="seller-comparison"
        className="seller-section min-h-screen w-full relative"
      >
        <Section7_Comparison />
      </section>

      {/* V8: Value Stack */}
      <section
        id="seller-pricing"
        className="seller-section min-h-screen w-full relative"
      >
        <Section8_Pricing />
      </section>

      {/* V9: Your Store in 60 Seconds */}
      <section
        id="seller-cta"
        className="seller-section min-h-screen w-full relative"
      >
        <Section9_Cta />
      </section>

      {/* V10: Ambient FOMO Ticker */}
      <PulseTicker />
    </div>
  );
}
