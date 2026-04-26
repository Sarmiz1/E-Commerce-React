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
        <h2 className="text-3xl font-black text-gray-900">Shop by Category</h2>
        <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span>
        </motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.label} whileHover={{ scale: 1.06, y: -6 }} whileTap={{ scale: 0.97 }}
            className={`hp-cat-card bg-gradient-to-br ${cat.bg} rounded-2xl p-5 text-white text-center cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300`}
            onClick={() => navigate(`/products/categories/${cat.label.toLowerCase()}`)}
          >
            <p className="font-bold text-sm">{cat.label}</p>
            <p className="text-white/70 text-[10px] mt-0.5">{cat.count}</p>

            <img
              src={getCategoryImageUrl(cat.path.toLowerCase())}
              alt={cat.label}
              className="w-auto object-contain rounded-2xl h-full"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}


