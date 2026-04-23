import React from 'react';
import HeroSection from './sections/HeroSection';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import SmartFeaturesSection from './sections/SmartFeaturesSection';
import CategoriesSection from './sections/CategoriesSection';
import SocialProofSection from './sections/SocialProofSection';
import TrustSection from './sections/TrustSection';
import FinalCtaSection from './sections/FinalCtaSection';
import ShopSmartSection from './sections/ShopSmartSection';
import AllInOneAppSection from './sections/AllInOneAppSection';

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
    <div className="w-full bg-white font-sans antialiased selection:bg-blue-200 selection:text-blue-900 overflow-hidden">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <SmartFeaturesSection />
      <ShopSmartSection />
      <CategoriesSection />
      <SocialProofSection />
      <AllInOneAppSection />
      <TrustSection />
      <FinalCtaSection />
    </div>
  );
};

export default BuyerLanding;
