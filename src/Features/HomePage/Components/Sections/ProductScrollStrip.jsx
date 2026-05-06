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
import Stars from "../../../../components/Stars";
import ParticleField from "../ParticleField";
import FloatingOrbs from "../FloatingOrbs";
import ProductCard from "../../../../components/Ui/ProductCard";
import { BentoCard } from "../BentoProductGridComponents/BentoCard";
import AddToCart from "../../../../components/Ui/AddToCart";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function ProductScrollStrip({ products, isLoading, title, label }) {
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const dragStartX = useRef(0);
  const speed = useRef(0.6); // px per frame

  // Auto-scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf;
    const step = () => {
      if (!isDragging.current) {
        currentX.current -= speed.current;
        const half = track.scrollWidth / 2;
        if (Math.abs(currentX.current) >= half) currentX.current = 0;
        gsap.set(track, { x: currentX.current });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [products]);

  // Drag
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const clamp = (v) => Math.min(0, v);
    const onDown = (e) => {
      isDragging.current = true;
      dragStartX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      startX.current = currentX.current;
      track.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const cx = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      currentX.current = clamp(startX.current + (cx - dragStartX.current));
      gsap.set(track, { x: currentX.current });
    };
    const onUp = () => { isDragging.current = false; track.style.cursor = 'grab'; };
    track.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    track.addEventListener('touchstart', onDown, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: true });
    track.addEventListener('touchend', onUp);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    return () => {
      track.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      track.removeEventListener('touchstart', onDown);
      track.removeEventListener('touchmove', onMove);
      track.removeEventListener('touchend', onUp);
    };
  }, []);

  const doubled = [...(products || []), ...(products || [])];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex items-end justify-between">
          <div>
            {label && <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">{label}</p>}
            <h2 className="text-3xl font-black text-gray-900">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">← Drag or scroll to explore →</p>
          </div>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
        </div>
      </div>
      <div ref={wrapperRef} className="overflow-hidden">
        <div ref={trackRef} className="flex gap-5 px-6 will-change-transform" style={{ width: 'max-content', cursor: 'grab' }}>
          {isLoading
            ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-52 h-72 bg-gray-100 rounded-3xl animate-pulse" />
            ))
            : doubled.map((p, i) => (
              <div key={i} className="flex-shrink-0 w-52">
                <ProductCard product={p} variant="overlay" />
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}
