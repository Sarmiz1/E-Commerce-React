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

export default function HowItWorksSection() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const line = el.querySelector(".hp-hiw-line"), cards = el.querySelectorAll(".hp-hiw-step");
      if (line) gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      if (cards.length) gsap.fromTo(cards, { y: 55, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "back.out(1.6)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Simple Process</p>
        <h2 className="text-4xl font-black text-center text-gray-900 mb-20">How It Works</h2>
        <div className="relative">
          <div className="hp-hiw-line hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full z-0 origin-left" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="hp-hiw-step flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-indigo-500 text-indigo-600 text-xs font-black flex items-center justify-center shadow">{step.num}</span>
                </div>
                <h3 className="font-black text-lg text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[160px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
