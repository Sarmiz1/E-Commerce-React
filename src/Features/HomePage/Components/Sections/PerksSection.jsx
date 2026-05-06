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

export default function PerksSection() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".hp-perk"); if (!items.length) return;
      gsap.fromTo(items, { y: 50, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, stagger: 0.13, duration: 0.8, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 bg-gray-950 relative overflow-hidden">
      <FloatingOrbs dark />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Why Choose Us</p>
        <h2 className="text-4xl font-black text-center text-white mb-14">The WooSho Difference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map((perk, i) => (
            <motion.div key={i} whileHover={{ y: -8, scale: 1.02 }}
              className="hp-perk bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="text-5xl mb-5">{perk.icon}</div>
              <h3 className="font-bold text-xl mb-3">{perk.title}</h3>
              <p className="text-indigo-200/70 text-sm leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
