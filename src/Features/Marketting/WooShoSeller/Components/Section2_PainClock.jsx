import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SELLER_PAIN_CARDS } from '../Data/sectionsData.jsx';

// FIX: removed gsap.registerPlugin(ScrollTrigger) — registered once in SellerLanding.jsx
// FIX: removed useState for `cost` and `isCapped` — replaced with DOM refs.
//      The original called setCost() on every GSAP tick (~60×/sec), forcing React
//      to re-render the entire component tree that many times just to update one number.
//      Writing directly to the text node via a ref is the correct pattern for
//      high-frequency GSAP-driven values.

export default function Section2_PainClock() {
  const containerRef = useRef(null);
  const costRef = useRef(null); // direct DOM ref for the counter digit
  const capRef = useRef(null); // ref for the pulsing "capped" class toggle

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pain-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
      });

      // Drive the counter via a plain object — no React state, no re-renders
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: 500,
        duration: 5,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        onUpdate() {
          if (costRef.current) {
            costRef.current.textContent = Math.floor(proxy.val);
          }
        },
        onComplete() {
          if (capRef.current) {
            capRef.current.classList.add('text-red-500', 'drop-shadow-xl', 'animate-pulse');
            capRef.current.classList.remove('text-white');
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col xl:flex-row items-center justify-center p-8 bg-[#0a0a0a] gap-12 pt-20"
    >
      {/* Left: The Pain Mirror */}
      <div className="flex-[1.5] max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
          You're Working Too Hard For Too Little.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SELLER_PAIN_CARDS.map((card) => (
            <div className="pain-card bg-neutral-900 border border-neutral-800 p-6 rounded-2xl" key={card.title}>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-white font-bold block mb-2">{card.title}</span>
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <p className="pain-card text-xl text-gray-400 mt-8 italic">
          "The worst part? None of this is your fault. You just don't have the right tools yet."
        </p>
      </div>

      {/* Right: The Tax Clock Widget */}
      <div className="flex-1 w-full max-w-sm pain-card">
        <div className="bg-neutral-900/50 backdrop-blur-3xl border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.05)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600/0 via-red-600 to-red-600/0 opacity-50" />

          <p className="text-gray-400 font-medium mb-4 uppercase tracking-widest text-xs">
            The Invisible Tax
          </p>

          <div className="flex items-start text-red-500 font-mono tracking-tighter shadow-sm mb-2 justify-center">
            <span className="text-4xl mt-2 font-bold opacity-80">₦</span>
            {/* FIX: ref-driven DOM update instead of {cost} state interpolation */}
            <span
              ref={capRef}
              className="text-8xl font-black tabular-nums text-white transition-colors duration-500"
            >
              <span ref={costRef}>0</span>
            </span>
          </div>

          <p className="text-red-400/80 text-sm font-semibold mt-2">
            Lost while you were reading this page.
          </p>

          <div className="w-full h-px bg-neutral-800 my-6" />

          <div className="text-left w-full space-y-3">
            <div className="flex justify-between text-xs font-mono text-gray-500">
              <span>Loss Rate</span>
              <span>₦8.33 / min</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-gray-500">
              <span>Daily Extrapolation</span>
              <span className="text-gray-300">₦12,000 / day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
