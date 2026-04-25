import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../../../Utils/formatMoneyCents";
import { CATEGORIES } from "../../Data/categories";
import { BRANDS } from "../../Data/brands";
import { PERKS } from "../../Data/perks";
import { TESTIMONIALS } from "../../Data/testimonials";
import { HOW_IT_WORKS } from "../../Data/how-it-works";
import SectionLabel from "../SectionLabel";
import Stars from "../../../../../Components/Stars";
import ParticleField from "../ParticleField";
import FloatingOrbs from "../FloatingOrbs";
import ProductCard from "../../../../../Components/Ui/ProductCard";
import { BentoCard } from "../BentoProductGridComponents/BentoCard";
import AddToCart from "../../../../../Components/Ui/AddToCart";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function LookbookSection({ products, isLoading }) {
  const ref = useRef(null);
  const looks = [
    { title: 'Street Style', palette: ['from-gray-800 to-black'], tag: 'Urban', icon: '🧢' },
    { title: 'Resort Luxe', palette: ['from-sky-400 to-cyan-600'], tag: 'Vacation', icon: '🏖️' },
    { title: 'Power Dressing', palette: ['from-slate-700 to-slate-900'], tag: 'Office', icon: '💼' },
    { title: 'Weekend Casual', palette: ['from-amber-400 to-orange-500'], tag: 'Relax', icon: '☕' },
  ];

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll('.hp-look-card');
      if (!cards.length) return;
      gsap.fromTo(cards, { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.12, duration: 0.85, ease: 'back.out(1.4)', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Style Inspiration</p>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Shop the Look</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">Curated outfits and vibes for every occasion. Tap a look to explore the full collection.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {looks.map((look, i) => {
            const prod = products?.[i];
            return (
              <motion.div key={look.title} whileHover={{ y: -10 }}
                className="hp-look-card group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer" style={{ height: 360 }}>
                {prod && !isLoading ? (
                  <img src={prod.image} alt={look.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${look.palette[0]} flex items-center justify-center`}>
                    <span className="text-6xl">{look.icon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30">{look.tag}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-black text-lg mb-3">{look.title}</h3>
                  <motion.button whileTap={{ scale: 0.95 }}
                    className="w-full bg-white text-gray-900 font-bold py-2.5 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop This Look →
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
