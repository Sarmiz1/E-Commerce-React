import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BUYER_PROBLEMS } from '../Data/sectionsData.jsx';

// FIX: removed duplicate gsap.registerPlugin(ScrollTrigger)

const ProblemSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out", scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
      );

      gsap.fromTo(cardsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 65%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);


  return (
    <section ref={sectionRef} className="w-full py-24 px-6 md:px-12 bg-neutral-50 dark:bg-[#0a0a0a] text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-16 tracking-tight">
          Online Shopping Is <span className="text-neutral-500 dark:text-neutral-400">Stressful.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BUYER_PROBLEMS.map((prob, i) => {
            const Icon = prob.icon;
            return (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className="bg-white dark:bg-white/[0.04] p-10 rounded-3xl shadow-sm border border-neutral-100 dark:border-white/10 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
            >
              <Icon className="w-10 h-10 text-neutral-400 mb-4" />
              <h3 className="text-xl font-medium text-neutral-800 dark:text-neutral-200">{prob.text}</h3>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
