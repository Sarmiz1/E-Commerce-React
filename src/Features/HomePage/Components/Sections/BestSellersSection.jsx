import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../../utils/FormatMoneyCents";
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
import WishlistHeart from "../../../../components/Ui/WishlistHeart";
import QuickView from "../../../../components/Ui/QuickView";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function BestSellersSection({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelector(".hp-bs-left"), right = el.querySelectorAll(".hp-bs-right");
      if (left) gsap.fromTo(left, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      if (right.length) gsap.fromTo(right, { x: 50, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);

  const top = products[0];
  const rest = products.slice(1, 5);


  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div><SectionLabel label="Fan Favourites" /><h2 className="text-3xl font-black text-gray-900">Best Sellers</h2></div>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="hp-bs-left">
            {isLoading ? <div className="h-[420px] bg-gray-100 rounded-3xl animate-pulse" /> : top && (
              <motion.div
                data-cart-card
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="relative h-[420px] overflow-hidden">
                  <img
                    src={top.image}
                    alt={top.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/800x600?text=No+Image";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  
                  {/* Quick View Button */}
                  <QuickView 
                    product={top} 
                    className="top-4 right-14" 
                  />

                  {/* Wishlist Button for #1 Item */}
                  <WishlistHeart 
                    className="absolute top-4 right-4" 
                    productId={top.id}
                    onToggle={() => {}}
                  />

                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-black px-3 py-1.5 rounded-full">#1 BEST SELLER</div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                    <Stars rating={top.rating_stars || 0} />
                    <h3 className="font-black text-2xl mt-2 mb-1 leading-tight">{top.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-black text-3xl">{formatMoneyCents(top.price_cents)}</span>
                      <AddToCart productId={top?.id} variant="ghost" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="space-y-4">
            {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />) : rest.map((p) => <div key={p.id} className="hp-bs-right"><ProductCard product={p} variant="customWide" /></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
