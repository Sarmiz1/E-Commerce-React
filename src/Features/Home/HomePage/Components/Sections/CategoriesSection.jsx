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
import { getCategoryImageUrl } from "../../../../../Utils/getCategoryImageUrl";
import AddToCart from "../../../../../Components/Ui/AddToCart";
import { Link, useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function CategoriesSection() {
  const ref = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-cat-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 65, scale: 0.93, opacity: 0 }, { y: 0, scale: 1, opacity: 1, stagger: 0.08, duration: 0.75, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <SectionLabel label="Collections" />
      <div className="flex items-end justify-between mb-12">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white/50">Shop by Category</h2>
        <motion.button 
          whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1"
          onClick={() => navigate("/products/categories")}
        >
          View All <span>→</span>
        </motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <motion.div 
            key={cat.label} 
            whileHover={{ y: -6 }} 
            whileTap={{ scale: 0.96 }}
            className="hp-cat-card group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 h-[180px] sm:h-[220px] lg:h-[260px] bg-gray-900"
            onClick={() => navigate(`/products/categories/${cat.label.toLowerCase()}`)}
          >
            {/* Background Image full cover */}
            <img
              src={getCategoryImageUrl(cat.path.toLowerCase())}
              alt={cat.label}
              className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
            />
            
            {/* Dark gradient from bottom up for text legibility */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Subtle color tint based on category color for brand feel */}
            <div className={`absolute inset-0 z-10 bg-gradient-to-br ${cat.bg} opacity-20 mix-blend-overlay group-hover:opacity-40 transition-opacity duration-500`} />

            {/* Bottom Overlay Text */}
            <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end text-left">
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="font-black text-white text-lg sm:text-xl leading-tight group-hover:text-indigo-200 transition-colors duration-300">
                  {cat.label}
                </h3>
                <p className="text-white/80 text-[10px] sm:text-xs mt-1 font-semibold tracking-widest uppercase">
                  {cat.count}
                </p>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


