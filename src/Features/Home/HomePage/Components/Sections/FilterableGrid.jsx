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

export default function FilterableGrid({ products, isLoading }) {
  const ref = useRef(null);
  const [active, setActive] = useState('All');
  const tabs = ['All', 'Under $20', 'Top Rated', 'On Sale'];

  const filtered = useMemo(() => {
    if (!products.length) return [];
    if (active === 'Under $20') return products.filter((p) => p.priceCents < 2000);
    if (active === 'Top Rated') return products.filter((p) => (p.rating?.stars || 0) >= 4.5);
    if (active === 'On Sale') return products.slice(0, 4);
    return products.slice(0, 8);
  }, [products, active]);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const cards = el.querySelectorAll('.hp-fg-card');
    if (!cards.length) return;
    gsap.fromTo(cards, { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: 'power2.out', clearProps: 'all' });
  }, [filtered]);

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Shop Smart</p>
            <h2 className="text-3xl font-black text-gray-900">Browse & Filter</h2>
          </div>
          {/* Tab filter */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <motion.button key={tab} whileTap={{ scale: 0.95 }} onClick={() => setActive(tab)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${active === tab
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}>
                {tab}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xs gap-5">
            {isLoading
              ? Array(8).fill(0).map((_, i) => <Skeleton key={i} />)
              : filtered.length
                ? filtered.map((p) => <div key={p.id} className="hp-fg-card"><ProductCard product={p} /></div>)
                : <div className="col-span-4 text-center py-20 text-gray-400">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="font-semibold">No products match this filter</p>
                </div>
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
