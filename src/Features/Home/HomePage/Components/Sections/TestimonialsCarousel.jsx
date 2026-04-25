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

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0); const dragDelta = useRef(0);
  const sectionRef = useRef(null);
  const total = TESTIMONIALS.length;
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  useEffect(() => { const id = setInterval(next, 5500); return () => clearInterval(id); }, [next]);
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const t = setTimeout(() => {
      const heads = el.querySelectorAll(".hp-th"); if (!heads.length) return;
      gsap.fromTo(heads, { y: 35, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  const onDS = (e) => { setDragging(true); dragStartX.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX; dragDelta.current = 0; };
  const onDM = (e) => { if (!dragging) return; dragDelta.current = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - dragStartX.current; };
  const onDE = () => { if (!dragging) return; setDragging(false); if (dragDelta.current < -50) next(); else if (dragDelta.current > 50) prev(); };
  return (
    <section ref={sectionRef} className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#fafafa 50%,#f5f0ff 100%)" }}>
      <FloatingOrbs />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <p className="hp-th text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Client Stories</p>
        <h2 className="hp-th text-4xl font-black text-center mb-16 text-gray-900">What Our Members Say</h2>
        <div className="relative cursor-grab active:cursor-grabbing select-none" onMouseDown={onDS} onMouseMove={onDM} onMouseUp={onDE} onMouseLeave={onDE} onTouchStart={onDS} onTouchMove={onDM} onTouchEnd={onDE}>
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 80, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -80, scale: 0.96 }} transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 text-center mx-auto max-w-2xl">
              <div className="flex justify-center gap-1 mb-6">{Array(TESTIMONIALS[current].stars).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-2xl">★</span>)}</div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic font-light">"{TESTIMONIALS[current].text}"</p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">{TESTIMONIALS[current].author[0]}</div>
                <div className="text-left"><p className="font-bold text-gray-900">{TESTIMONIALS[current].author}</p><p className="text-xs text-gray-400">{TESTIMONIALS[current].role}</p></div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-6 mt-10">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prev} className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-50 transition">←</motion.button>
          <div className="flex gap-2">{TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-indigo-600" : "w-2 bg-gray-300"}`} />)}</div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={next} className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-50 transition">→</motion.button>
        </div>
      </div>
    </section>
  );
}
