// ─── Flash Sale ────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";



function FlashSale() {
  const ref = useRef(null);
  const [time, setTime] = useState({ h: 4, m: 59, s: 42 });
  useEffect(() => {
    const id = setInterval(() => setTime((p) => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 4; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelectorAll(".se-fl"); const right = el.querySelector(".se-fr");
      if (left.length) gsap.fromTo(left, { x: -55, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
      if (right) gsap.fromTo(right, { x: 55, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 text-white">
          <p className="se-fl text-sm font-bold uppercase tracking-widest text-orange-100 mb-2">⚡ Limited Time Offer</p>
          <h3 className="se-fl text-4xl md:text-5xl font-black leading-tight">Flash Sale<br />Up to <span className="text-yellow-300">70% OFF</span></h3>
          <p className="se-fl mt-4 text-orange-100 max-w-xs">Don't miss out. These deals vanish when the timer hits zero.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="se-fl mt-8 bg-white text-red-600 font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition">Shop the Sale →</motion.button>
        </div>
        <div className="se-fr relative z-10 flex gap-4">
          {[{ label: "Hours", val: time.h }, { label: "Mins", val: time.m }, { label: "Secs", val: time.s }].map((t) => (
            <div key={t.label} className="text-center">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl w-20 h-20 flex items-center justify-center text-4xl font-black text-white shadow-xl">{pad(t.val)}</div>
              <p className="mt-2 text-xs text-orange-100 font-semibold uppercase tracking-widest">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlashSale
