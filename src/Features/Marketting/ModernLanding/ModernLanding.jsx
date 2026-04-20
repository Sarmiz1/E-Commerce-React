import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import ModernNavbar from './Components/ModernNavbar';
import ModernHero from './Components/ModernHero';
import ModernPainPoints from './Components/ModernPainPoints';
import ModernPlatform from './Components/ModernPlatform';
import ModernAiChat from './Components/ModernAiChat';
import ModernCategories from './Components/ModernCategories';
import ModernWhy from './Components/ModernWhy';
import { ModernCTA, ModernFooter } from './Components/ModernFooter';

gsap.registerPlugin(ScrollTrigger);

export default function ModernLanding() {
  const mainRef = useRef(null);
  const [step, setStep] = useState(1)

  useEffect(() => {
    // Add Scroll Spy URL updater
    const sections = ['hero', 'pain-points', 'platform', 'ai-chat', 'categories', 'why-woosho', 'cta'];
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.history.replaceState(null, '', `#${entry.target.id}`);
        }
      });
    }, {
      rootMargin: "-40% 0px -59% 0px" // Triggers exactly when an element enters the 40% vertical sweet spot
    });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Chained Animation: Pain Points
      gsap.from("#pain-points", {
        scrollTrigger: {
          trigger: "#pain-points",
          start: "top 95%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: "power2.out"
      });

      // 2. Chained Animation: Platform
      gsap.from("#platform", {
        scrollTrigger: {
          trigger: "#platform",
          start: "top 95%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: "power2.out"
      });

      // 3. AI Chat Entrance
      gsap.from("#ai-chat", {
        scrollTrigger: {
          trigger: "#ai-chat",
          start: "top 95%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: "power2.out"
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <ModernNavbar />
      <main ref={mainRef} className="bg-white dark:bg-[#0E0E10] selection:bg-blue-600/30">
      
      <div id="hero">
        <ModernHero />
      </div>

      <div id="pain-points">
        <ModernPainPoints />
      </div>

      <div id="platform">
        <ModernPlatform />
      </div>

      <div id="ai-chat">
        <ModernAiChat />
      </div>

      <div id="categories">
        <ModernCategories />
      </div>

      <div id="why-woosho">
        <ModernWhy />
      </div>

      <div id="cta">
        <ModernCTA />
      </div>

      <ModernFooter />
{/* 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                        Test Ground
 
*/}

{/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
    </main>
    </>
  );
}
