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
import Stars from "../../../../Components/Stars";
import ParticleField from "../ParticleField";
import FloatingOrbs from "../FloatingOrbs";
import ProductCard from "../../../../Components/Ui/ProductCard";
import { BentoCard } from "../BentoProductGridComponents/BentoCard";
import AddToCart from "../../../../Components/Ui/AddToCart";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function TrustStrip() {
  const ref = useRef(null);
  const items = [
    { icon: '🛡️', title: 'Authentic Guarantee', desc: '100% genuine products or full refund' },
    { icon: '⚡', title: 'Same-Day Dispatch', desc: 'Order before 2pm for same-day shipping' },
    { icon: '🔄', title: '30-Day Free Returns', desc: 'No questions, hassle-free returns' },
    { icon: '🏆', title: 'Award-Winning Service', desc: 'Rated #1 customer support 3 years running' },
    { icon: '🌍', title: 'Ships Worldwide', desc: 'Delivery to 180+ countries' },
  ];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll('.hp-trust-item');
      if (!cards.length) return;
      gsap.fromTo(cards, { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'power2.out', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item) => (
            <div key={item.title} className="hp-trust-item flex flex-col items-center text-center group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
