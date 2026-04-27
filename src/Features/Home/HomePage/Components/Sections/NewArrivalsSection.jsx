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
import Stars from "../../../../../Components/Stars";
import ParticleField from "../ParticleField";
import FloatingOrbs from "../FloatingOrbs";
import ProductCard from "../../../../../Components/Ui/ProductCard";
import { BentoCard } from "../BentoProductGridComponents/BentoCard";
import AddToCart from "../../../../../Components/Ui/AddToCart";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function NewArrivalsSection({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-prod-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 55, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09, duration: 0.8, ease: "back.out(1.3)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 200);
    return () => clearTimeout(t);
  }, [products]);
  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-12">
        <div><SectionLabel label="Just Landed" /><h2 className="text-3xl font-black text-gray-900">New Arrivals</h2></div>
        <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {isLoading ? <Skeleton count={4} /> : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
