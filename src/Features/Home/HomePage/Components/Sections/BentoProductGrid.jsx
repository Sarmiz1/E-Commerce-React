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

export default function BentoProductGrid({ products, isLoading }) {

  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll('.hp-bento-cell');
      if (!cards.length) return;
      gsap.fromTo(cards, { scale: 0.88, opacity: 0 },
        {
          scale: 1, opacity: 1, stagger: { amount: 0.7, from: 'start' }, duration: 0.8,
          ease: 'power3.out', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);

  if (isLoading) return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[480px]">
        {Array(5).fill(0).map((_, i) => <div key={i} className="bg-gray-100 rounded-3xl animate-pulse" />)}
      </div>
    </section>
  );


  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Discover</p>
          <h2 className="text-3xl font-black text-gray-900">Top Picks for You</h2>
        </div>
        <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4" style={{ gridTemplateRows: '240px 240px' }}>

        {products?.slice(0, 5).map((product, index) => (
          <BentoCard
            key={product?.id || index}
            product={product}
            className={
              index === 0
                ? "col-span-2 row-span-2"
                : "col-span-1"
            }
          />
        ))}
      </div>
    </section>
  );
}
