import { useRef } from "react";
import ModernNavbar from "../../Components/ModernNavbar";
import SEO from "../../Components/SEO";
import AboutCtaSection from "./Components/AboutCtaSection";
import AboutHero from "./Components/AboutHero";
import DifferencesSection from "./Components/DifferencesSection";
import HowItWorksSection from "./Components/HowItWorksSection";
import ProblemsSection from "./Components/ProblemsSection";
import SolutionSection from "./Components/SolutionSection";
import TrustSection from "./Components/TrustSection";
import VisionSection from "./Components/VisionSection";
import { useAboutRevealAnimations } from "./Hooks/useAboutRevealAnimations";
import { ABOUT_NAV_LINKS, ABOUT_SEO } from "./utils/data";
import { useAboutStyles } from "./utils/STYLES";

function getAboutPageSchema(canonical, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About WooSho",
    description: ABOUT_SEO.description,
    ...(canonical ? { url: canonical } : {}),
    mainEntity: {
      "@type": "Organization",
      name: "WooSho",
      description: ABOUT_SEO.description,
      slogan: "Less searching. More buying confidence.",
      ...(siteUrl ? { url: siteUrl } : {}),
    },
  };
}

export default function AboutPage() {
  const mainRef = useRef(null);
  const aboutStyles = useAboutStyles();
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const canonical = siteUrl ? `${siteUrl}/about` : undefined;

  useAboutRevealAnimations(mainRef);

  return (
    <div
      ref={mainRef}
      className="min-h-screen overflow-x-hidden selection:bg-blue-600/30"
      style={{
        fontFamily: "'Inter', sans-serif",
        ...aboutStyles,
      }}
    >
      <SEO
        canonical={canonical}
        description={ABOUT_SEO.description}
        keywords={ABOUT_SEO.keywords}
        schema={getAboutPageSchema(canonical, siteUrl)}
        title={ABOUT_SEO.title}
      />
      <ModernNavbar navLinks={ABOUT_NAV_LINKS} />
      <AboutHero />
      <ProblemsSection />
      <SolutionSection />
      <HowItWorksSection />
      <DifferencesSection />
      <VisionSection />
      <TrustSection />
      <AboutCtaSection />
    </div>
  );
}
