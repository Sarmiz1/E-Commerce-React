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

export default function CategoriesSection() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-cat-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 65, scale: 0.93, opacity: 0 }, { y: 0, scale: 1, opacity: 1, stagger: 0.08, duration: 0.75, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <SectionLabel label="Collections" />
      <h2 className="text-3xl font-black text-gray-900 mb-12">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.label} whileHover={{ scale: 1.06, y: -6 }} whileTap={{ scale: 0.97 }}
            className={`hp-cat-card bg-gradient-to-br ${cat.bg} rounded-2xl p-5 text-white text-center cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300`}>
            <div className="text-4xl mb-2">{cat.emoji}</div>
            <p className="font-bold text-sm">{cat.label}</p>
            <p className="text-white/70 text-[10px] mt-0.5">{cat.count}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
