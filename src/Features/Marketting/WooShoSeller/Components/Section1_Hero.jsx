import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Section1_Hero() {
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Blur and scroll the background grid
      gsap.to('.hero-bg-grid', {
        y: '-30%',
        ease: 'none',
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Show AI chips floating in via timeline
      gsap.from('.ai-chip', {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5
      });
      
      // Main text fade up
      gsap.from('.hero-content', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
      
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black pt-20">
      
      {/* Background Living Feed (V1) */}
      <div className="absolute inset-0 z-0 opacity-40 blur-[2px] pointer-events-none">
        <div className="hero-bg-grid grid grid-cols-3 md:grid-cols-5 gap-4 p-4 w-[120%] -ml-[10%] -mt-32">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-900 rounded-xl overflow-hidden border border-white/5 relative">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI Chips */}
      <div className="absolute top-[20%] left-[10%] ai-chip bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
        <Sparkles size={12} className="text-blue-400" />
        ₦12,500 · AI priced ✓
      </div>
      <div className="absolute top-[30%] right-[15%] ai-chip bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold items-center gap-2 hidden md:flex">
        5 buyers viewing
      </div>
      <div className="absolute bottom-[25%] left-[20%] ai-chip bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
        Sold 3 mins ago
      </div>

      {/* Main Content */}
      <div className="relative z-10 hero-content text-center max-w-4xl px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-8">
          <Sparkles size={14} /> Woo Sho for Sellers
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent leading-tight">
          Stop Running a Business.<br/>Start Growing One.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Woo Sho gives every seller an AI assistant that answers buyers 24/7, writes your listings, suggests your prices, and grows your store — <span className="text-white font-semibold">even while you sleep.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-all text-lg flex items-center justify-center gap-2">
            List Your First Product Free <ArrowRight size={20} />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold rounded-full hover:bg-white/5 border border-white/20 transition-all text-lg">
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
