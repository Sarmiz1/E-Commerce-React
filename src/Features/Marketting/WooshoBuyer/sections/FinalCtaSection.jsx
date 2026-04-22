import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FinalCtaSection = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const buttonRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Content reveal
      gsap.fromTo(headlineRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 60%" } }
      );

      gsap.fromTo(buttonRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.2, ease: "back.out(1.5)", scrollTrigger: { trigger: sectionRef.current, start: "top 60%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-40 px-6 md:px-12 bg-neutral-900 text-white overflow-hidden flex items-center justify-center">
      <div 
        ref={bgRef} 
        className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"
      ></div>
      
      <div className="relative z-10 text-center max-w-3xl">
        <h2 ref={headlineRef} className="text-5xl md:text-7xl font-bold mb-10 tracking-tight leading-tight">
          Stop Scrolling. <br/> Start Smart Shopping.
        </h2>
        <div ref={buttonRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors">
            Try Woosho Now
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 bg-transparent border border-neutral-700 text-white px-10 py-5 rounded-full font-semibold text-lg hover:bg-neutral-800 transition-colors">
            Create Free Account
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
