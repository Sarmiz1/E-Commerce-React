import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import ProductCard from "../../../../components/Ui/ProductCard";
import Skeleton from "./Skeleton";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function FlashSaleSection({ products, isLoading }) {

  const navigate = useNavigate();

  const ref = useRef(null);
  const [time, setTime] = useState({ h: 3, m: 47, s: 22 });
  const pad = (n) => String(n).padStart(2, "0");

  useEffect(() => {
    const id = setInterval(() => setTime((p) => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 3; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelectorAll(".hp-fl"), right = el.querySelector(".hp-fr");
      if (left.length) gsap.fromTo(left, { x: -55, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
      if (right) gsap.fromTo(right, { x: 55, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-8 md:p-14 mb-10 shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <p className="hp-fl text-sm font-bold uppercase tracking-widest text-orange-100 mb-2">⚡ Limited Time Offer</p>
            <h2 className="hp-fl text-4xl md:text-5xl font-black leading-tight">Flash Sale<br />Up to <span className="text-yellow-300">70% OFF</span></h2>
            <p className="hp-fl mt-3 text-orange-100 max-w-xs">These deals vanish when the timer hits zero.</p>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.97 }} 
              className="hp-fl mt-6 bg-white text-red-600 font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
              onClick={() => navigate('/products/flash-sales')}
            >
              Shop the Sale →
            </motion.button>
          </div>
          <div className="hp-fr flex gap-4">
            {[{ label: "Hours", val: time.h }, { label: "Mins", val: time.m }, { label: "Secs", val: time.s }].map((t) => (
              <div key={t.label} className="text-center">
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl w-20 h-20 flex items-center justify-center text-4xl font-black text-white shadow-xl">{pad(t.val)}</div>
                <p className="mt-2 text-xs text-orange-100 font-semibold uppercase tracking-widest">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {isLoading ? <Skeleton count={4} variant="tall" /> : products.map((p) => <ProductCard key={p.id} product={p} variant="overlay" />)}
      </div>
    </section>
  );
}
