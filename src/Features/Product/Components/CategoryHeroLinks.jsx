import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";

const HERO_LINKS = [
  {
    id: "trending",
    label: "Trending Now",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200&h=200",
    link: "/products?category=Trending",
  },
  {
    id: "new",
    label: "New Arrivals",
    image: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?auto=format&fit=crop&q=80&w=200&h=200",
    link: "/products?category=New",
  },
  {
    id: "sneakers",
    label: "Sneakers",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=200&h=200",
    link: "/products?category=Sneakers",
  },
  {
    id: "high-fashion",
    label: "High Fashion",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=200&h=200",
    link: "/products?category=High Fashion",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    image: "https://images.unsplash.com/photo-1523398002811-999aa8e9f5b9?auto=format&fit=crop&q=80&w=200&h=200",
    link: "/products?category=Streetwear",
  },
  {
    id: "accessories",
    label: "Accessories",
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=200&h=200",
    link: "/products?category=Accessories",
  },
];

export default function CategoryHeroLinks() {
  const { colors, isDark } = useTheme();
  
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setDragged(true);
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full border-b" style={{ borderColor: colors.border.subtle }}>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 overflow-x-auto pb-4 items-center justify-start md:justify-center select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // Hide scrollbar
        >
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          {HERO_LINKS.map((item, idx) => (
            <Link 
              key={item.id} 
              to={item.link} 
              onClick={(e) => {
                if (dragged) e.preventDefault();
              }}
              draggable="false"
              className="group flex flex-col items-center shrink-0 w-20 md:w-24 gap-3 cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] overflow-hidden"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)"
                    : "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 100%)"
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden relative" style={{ background: colors.surface.secondary }}>
                  <img
                    src={item.image}
                    alt={item.label}
                    draggable="false"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                </div>
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
                className="text-xs font-bold text-center leading-tight transition-colors"
                style={{ color: colors.text.primary }}
              >
                {item.label}
              </motion.span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
