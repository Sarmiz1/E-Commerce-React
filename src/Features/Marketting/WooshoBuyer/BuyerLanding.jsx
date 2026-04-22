import React from 'react';
import HeroSection from './sections/HeroSection';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import SmartFeaturesSection from './sections/SmartFeaturesSection';
import CategoriesSection from './sections/CategoriesSection';
import SocialProofSection from './sections/SocialProofSection';
import TrustSection from './sections/TrustSection';
import FinalCtaSection from './sections/FinalCtaSection';

const BuyerLanding = () => {
  return (
    <div className="w-full bg-white font-sans antialiased selection:bg-blue-200 selection:text-blue-900 overflow-hidden">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <SmartFeaturesSection />
      <CategoriesSection />
      <SocialProofSection />
      <TrustSection />
      <FinalCtaSection />
    </div>
  );
};

export default BuyerLanding;
