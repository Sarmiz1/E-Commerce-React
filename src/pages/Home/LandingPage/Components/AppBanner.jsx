import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import FloatingOrbs from "./FloatingOrbs";

gsap.registerPlugin(ScrollTrigger);

function AppBanner() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const texts = el.querySelectorAll(".se-at"); const phone = el.querySelector(".se-ap");
      if (texts.length) gsap.fromTo(texts, { x: -55, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      if (phone) gsap.fromTo(phone, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "back.out(1.4)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)" }}>
      <FloatingOrbs dark />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-white space-y-5">
          <p className="se-at text-xs font-bold uppercase tracking-widest text-indigo-400">Get the App</p>
          <h3 className="se-at text-5xl font-black leading-tight">Shop Smarter<span className="block text-transparent bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text">On the Go</span></h3>
          <p className="se-at text-gray-400 text-lg leading-relaxed max-w-sm">Exclusive app-only deals, instant notifications, and one-tap reorders. Your store, in your pocket.</p>
          <div className="se-at flex flex-wrap gap-4 pt-2">
            {[{ label: "App Store", sub: "Download on the", icon: "🍎" }, { label: "Google Play", sub: "Get it on", icon: "▶" }].map((btn) => (
              <motion.button key={btn.label} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-2xl hover:bg-white/15 transition">
                <span className="text-2xl">{btn.icon}</span>
                <div className="text-left"><p className="text-xs text-gray-400">{btn.sub}</p><p className="font-bold text-sm">{btn.label}</p></div>
              </motion.button>
            ))}
          </div>
          <div className="se-at flex items-center gap-6 pt-2">
            {[["4.9★", "App Rating"], ["2M+", "Downloads"], ["#1", "Shopping App"]].map(([val, lbl]) => (
              <div key={lbl}><p className="text-2xl font-black text-white">{val}</p><p className="text-xs text-gray-500 uppercase tracking-widest">{lbl}</p></div>
            ))}
          </div>
        </div>
        <div className="se-ap flex-shrink-0 se-float-y">
          <div className="relative w-56 mx-auto">
            <div className="relative w-full pt-[200%] rounded-[2.5rem] bg-gradient-to-b from-gray-700 to-gray-900 border-4 border-gray-600 shadow-2xl overflow-hidden">
              <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 overflow-hidden flex flex-col items-center justify-center gap-4 p-4">
                <div className="w-16 h-1.5 rounded-full bg-white/20 mb-2" />
                <div className="text-5xl">🛍️</div>
                <p className="text-white font-black text-lg">ShopEase</p>
                <div className="w-full space-y-2">{[80, 60, 90, 70].map((w, i) => (<div key={i} className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-white/20" /><div className="flex-1 space-y-1"><div className="h-2 rounded-full bg-white/30" style={{ width: `${w}%` }} /><div className="h-1.5 rounded-full bg-white/15" style={{ width: `${w - 20}%` }} /></div></div>))}</div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-500/20 blur-2xl -z-10 scale-110" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppBanner
