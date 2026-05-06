import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CATEGORIES } from "../../Data/categories";
import { BRANDS } from "../../Data/brands";
import { PERKS } from "../../Data/perks";
import { TESTIMONIALS } from "../../Data/testimonials";
import { HOW_IT_WORKS } from "../../Data/how-it-works";
import SectionLabel from "../SectionLabel";
import Stars from "../../../../components/Stars";
import ParticleField from "../ParticleField";
import FloatingOrbs from "../FloatingOrbs";
import ProductCard from "../../../../components/Ui/ProductCard";
import { BentoCard } from "../BentoProductGridComponents/BentoCard";
import AddToCart from "../../../../components/Ui/AddToCart";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function EditorsPicks({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-prod-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "back.out(1.4)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);
  return (
    <section ref={ref} className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e40af 100%)" }}>
      <FloatingOrbs dark />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Hand-Picked</p>
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl font-black text-white">Editor's Picks</h2>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-300 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-72 bg-white/10 rounded-3xl animate-pulse" />) : products.map((p) => <ProductCard key={p.id} product={p} variant="ghost" />)}
        </div>
      </div>
    </section>
  );
}
