import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

function SplitShowcase() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelector(".se-sl"); const right = el.querySelector(".se-sr"); const badges = el.querySelectorAll(".se-sb");
      if (left) gsap.fromTo(left, { x: -75, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      if (right) gsap.fromTo(right, { x: 75, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      if (badges.length) gsap.fromTo(badges, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.12, duration: 0.55, ease: "back.out(2)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 75%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="se-sl relative h-[480px]">
            <div className="absolute top-0 left-0 w-64 h-80 rounded-3xl overflow-hidden shadow-2xl rotate-[-4deg] hover:rotate-0 transition-transform duration-500"><div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-8xl">👗</div></div>
            <div className="absolute top-10 right-0 w-56 h-72 rounded-3xl overflow-hidden shadow-2xl rotate-[5deg] hover:rotate-0 transition-transform duration-500"><div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-8xl">👟</div></div>
            <div className="absolute bottom-0 left-16 w-52 h-64 rounded-3xl overflow-hidden shadow-2xl rotate-[2deg] hover:rotate-0 transition-transform duration-500"><div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-8xl">⌚</div></div>
            {[{ label: "New Season", color: "bg-rose-500", top: "8%", left: "55%" }, { label: "−40% OFF", color: "bg-indigo-600", top: "55%", left: "5%" }, { label: "Trending 🔥", color: "bg-amber-500", top: "82%", left: "58%" }].map((b) => (
              <div key={b.label} style={{ top: b.top, left: b.left }} className={`se-sb absolute ${b.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 whitespace-nowrap`}>{b.label}</div>
            ))}
          </div>
          <div className="se-sr space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">New Collection</p>
            <h3 className="text-5xl font-black text-gray-900 leading-tight">Style That<span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Speaks for You</span></h3>
            <p className="text-gray-500 text-lg leading-relaxed max-w-md">From statement pieces to everyday essentials — our new season drop has something for every wardrobe and every mood.</p>
            <ul className="space-y-3">
              {["500+ new arrivals this week", "Exclusive member-only discounts", "Sustainable & ethically sourced"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 font-medium"><span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</span>{item}</li>
              ))}
            </ul>
            <div className="flex gap-4 pt-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/30">Explore Collection</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-2xl font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-colors">See Lookbook</motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SplitShowcase
