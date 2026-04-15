// ─── Category Spotlight ────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";



gsap.registerPlugin(ScrollTrigger);

function CategorySpotlight() {
  const ref = useRef(null);
  const categories = [
    { label: "Women", bg: "from-rose-400 to-pink-600", emoji: "👗" },
    { label: "Men", bg: "from-sky-400 to-blue-600", emoji: "👔" },
    { label: "Kids", bg: "from-yellow-400 to-orange-500", emoji: "🧸" },
    { label: "Beauty", bg: "from-purple-400 to-violet-600", emoji: "💄" },
    { label: "Home", bg: "from-emerald-400 to-teal-600", emoji: "🏠" },
    { label: "Tech", bg: "from-gray-600 to-gray-900", emoji: "💻" },
  ];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".se-cat-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 70, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09, duration: 0.75, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Collections</p>
      <h3 className="text-3xl font-black text-center mb-12 text-gray-900">Shop by Category</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <motion.div key={cat.label} whileHover={{ scale: 1.06, y: -6 }} whileTap={{ scale: 0.97 }}
            className={`se-cat-card bg-gradient-to-br ${cat.bg} rounded-2xl p-6 text-white text-center cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300`}>
            <div className="text-4xl mb-3">{cat.emoji}</div>
            <p className="font-semibold text-sm">{cat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default CategorySpotlight
