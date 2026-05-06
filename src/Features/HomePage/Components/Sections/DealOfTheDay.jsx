import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../../utils/FormatMoneyCents";
import Stars from "../../../../components/Stars";
import FloatingOrbs from "../FloatingOrbs";
import { useNavigate } from "react-router";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function DealOfTheDay({ product, isLoading }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [time, setTime] = useState({ h: 11, m: 34, s: 7 });
  const pad = (n) => String(n).padStart(2, '0');

  useEffect(() => {
    const id = setInterval(() => setTime((p) => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 11; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll('.hp-dotd');
      if (!items.length) return;
      gsap.fromTo(items, { y: 45, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: 'power3.out', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [product]);

  if (isLoading) return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
    </section>
  );
  if (!product) return null;

  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-8 md:p-14 shadow-2xl">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <FloatingOrbs dark />
        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          {/* Left — info */}
          <div className="text-white">
            <div className="hp-dotd flex items-center gap-3 mb-6">
              <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">🔥 Deal of the Day</span>
              <span className="text-gray-400 text-xs">Ends in:</span>
              <div className="flex gap-1.5">
                {[{ v: time.h, l: 'h' }, { v: time.m, l: 'm' }, { v: time.s, l: 's' }].map((t) => (
                  <span key={t.l} className="bg-white/10 text-white font-black text-sm px-2 py-1 rounded-lg min-w-[32px] text-center">{pad(t.v)}<span className="text-[9px] text-gray-400 ml-0.5">{t.l}</span></span>
                ))}
              </div>
            </div>
            <h2 className="hp-dotd text-4xl md:text-5xl font-black leading-tight mb-4">{product.name}</h2>
            <div className="hp-dotd flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-black text-white">{formatMoneyCents(product.price_cents)}</span>
              <span className="text-gray-500 line-through text-xl">{formatMoneyCents(Math.round(product.price_cents * 1.4))}</span>
              <span className="bg-green-500 text-white text-xs font-black px-2.5 py-1 rounded-full">−30% OFF</span>
            </div>
            <Stars rating={product.rating_stars } count={product.rating_count} />
            {/* Progress bar */}
            <div className="hp-dotd mt-8">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>🔥 Selling fast</span>
                <span>74 sold · 26 left</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full hp-progress-bar" style={{ width: '74%' }} />
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.04 }} 
              whileTap={{ scale: 0.97 }}
              className="hp-dotd mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black px-10 py-4 rounded-2xl text-lg shadow-xl shadow-indigo-500/30"
              onClick={() => navigate(`/products/${product.slug}`)}
            >
              Grab This Deal →
            </motion.button>
          </div>
          {/* Right — product image */}
          <motion.div className="hp-dotd relative" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="relative w-full max-w-xs mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Pulse rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square rounded-3xl border border-indigo-500/30 hp-pulse-ring" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square rounded-3xl border border-blue-400/20 hp-pulse-ring" style={{ animationDelay: '0.8s' }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
