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

export default function StatsBanner() {
  const ref = useRef(null);
  const stats = [
    { value: "2M+", label: "Happy Customers", icon: "😊" },
    { value: "150K+", label: "Products Listed", icon: "📦" },
    { value: "4.9★", label: "Average Rating", icon: "⭐" },
    { value: "99%", label: "On-Time Delivery", icon: "🚀" },
  ];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".hp-stat"); if (!items.length) return;
      gsap.fromTo(items, { scale: 0.5, y: 30, opacity: 0 }, { scale: 1, y: 0, opacity: 1, stagger: 0.12, duration: 0.75, ease: "back.out(2)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="relative overflow-hidden py-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      <FloatingOrbs dark />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">By the Numbers</p>
        <h2 className="text-center text-3xl font-black text-white mb-14">Trusted Worldwide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="hp-stat group">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <p className="text-4xl font-black bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">{s.value}</p>
              <p className="mt-2 text-sm text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
