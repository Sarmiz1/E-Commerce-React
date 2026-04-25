import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

// FIX: removed gsap.registerPlugin(ScrollTrigger) — registered once in SellerLanding.jsx

export default function Section1_Hero() {
  const container = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-bg-grid', {
        y: '-30%',
        ease: 'none',
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.from('.ai-chip', {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
      });

      gsap.from('.hero-content', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });
    }, container);

    return () => ctx.revert();
  }, []);


  const gridItems = useMemo(
  () => Array.from({ length: 20 }, (_, i) => `hero-${i}`),
  []
);

  return (
    <div
      ref={container}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black pt-20"
    >
      {/* Background Living Feed */}
      <div className="absolute inset-0 z-0 opacity-40 blur-[2px] pointer-events-none">
        <div className="hero-bg-grid grid grid-cols-3 md:grid-cols-5 gap-4 p-4 w-[120%] -ml-[10%] -mt-32">
          {gridItems.map((id) => (
            <div
              key={id}
              className="aspect-[3/4] bg-neutral-900 rounded-xl overflow-hidden border border-white/5 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI Chips */}
      <div className="absolute top-[16%] md:top[18%] left-[5%] lg:top-[20%] lg:left-[10%] ai-chip bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
        <Sparkles size={12} className="text-blue-400" />
        ₦12,500 · AI priced ✓
      </div>
      <div className="absolute top-[20%] right-[20%] md:top-[29%] md:right-[2%] lg:top-[30%] lg:right-[11%] ai-chip bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold items-center gap-2 hidden md:flex">
        5 buyers viewing 
      </div>
      <div className="absolute bottom-[35%] left-[70%] sm:bottom-[32%] md:bottom-[27%] md:left-[16%] lg:bottom-[25%] lg:left-[19%] ai-chip bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
        Sold 3 mins ago
      </div>

      {/* Main Content */}
      <div className="relative z-10 hero-content text-center max-w-4xl px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-8">
          <Sparkles size={14} /> Woo Sho for Sellers
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent leading-tight">
          Stop Running a Business.<br />Start Growing One.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Woo Sho gives every seller an AI assistant that answers buyers 24/7, writes your listings,
          suggests your prices, and grows your store —{' '}
          <span className="text-white font-semibold">even while you sleep.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-all text-lg flex items-center justify-center gap-2"
            onClick={() => navigate('/auth')}
          >
            List Your First Product Free <ArrowRight size={20} />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold rounded-full hover:bg-white/5 border border-white/20 transition-all text-lg"
            onClick={() => navigate('/auth')}
          >
            See the AI in Action First
          </button>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-gray-500 font-medium">
          <div className="flex flex-col items-center"><span className="text-white text-xl font-bold">3,200+</span> Active sellers</div>
          <div className="flex flex-col items-center"><span className="text-white text-xl font-bold">48hr</span> Payout speed</div>
          <div className="flex flex-col items-center"><span className="text-white text-xl font-bold">4%</span> Lowest fee</div>
          <div className="flex flex-col items-center"><span className="text-white text-xl font-bold">94%</span> Seller retention</div>
        </div>
      </div>
    </div>
  );
}