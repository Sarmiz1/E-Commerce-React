import { useRef } from "react";
import ModernNavbar from "../../Components/ModernNavbar";
import AboutCtaSection from "./Components/AboutCtaSection";
import AboutHero from "./Components/AboutHero";
import DifferencesSection from "./Components/DifferencesSection";
import HowItWorksSection from "./Components/HowItWorksSection";
import ProblemsSection from "./Components/ProblemsSection";
import SolutionSection from "./Components/SolutionSection";
import TrustSection from "./Components/TrustSection";
import VisionSection from "./Components/VisionSection";
import { useAboutRevealAnimations } from "./Hooks/useAboutRevealAnimations";
import { ABOUT_NAV_LINKS } from "./utils/data";
import { useAboutStyles } from "./utils/STYLES";

export default function AboutPage() {
  const mainRef = useRef(null);
  const aboutStyles = useAboutStyles();
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
