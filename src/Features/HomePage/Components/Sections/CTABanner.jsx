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

export default function CTABanner() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".hp-cta"); if (!items.length) return;
      gsap.fromTo(items, { y: 45, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="relative py-32 overflow-hidden mx-4 mb-4 rounded-3xl" style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#8b5cf6 100%)" }}>
      <ParticleField />
      <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl -top-20 -right-20" />
      <div className="absolute w-80 h-80 rounded-full bg-purple-400/20 blur-3xl -bottom-20 -left-20" />
      <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
        <p className="hp-cta text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">Join the Community</p>
        <h2 className="hp-cta text-5xl font-black mb-6 leading-tight">Ready to Start<br />Shopping?</h2>
        <p className="hp-cta text-blue-100 text-lg mb-10">Join over 2 million happy customers and discover your next favourite thing.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }} className="hp-cta bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl">Get Started Free</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="hp-cta border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition backdrop-blur-sm">Browse All Products</motion.button>
        </div>
      </div>
    </section>
  );
}
