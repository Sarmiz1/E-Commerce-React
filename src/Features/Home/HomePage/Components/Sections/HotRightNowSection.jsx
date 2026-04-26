import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../../../../Components/Ui/ProductCard";
import { useTheme } from "../../../../../Context/theme/ThemeContext";
import SectionLabel from "../SectionLabel";

export default function HotRightNowSection({ products, isLoading }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const { scrollXProgress } = useScroll({ container: scrollRef });
  
  if (isLoading || !products?.length) return null;

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: colors.surface.primary }}>
      <div className="max-w-screen-2xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <SectionLabel label="Trending Alerts" />
          <h2 className="text-4xl md:text-5xl font-black mt-2 tracking-tight" style={{ color: colors.text.primary }}>
            Hot Right Now
          </h2>
          <p className="mt-4 text-sm max-w-xl" style={{ color: colors.text.secondary }}>
            These items are flying off the shelves. Secure yours before they're gone.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/products/trending")}
          className="px-8 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 group w-full md:w-auto shadow-lg"
          style={{ background: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white' }}
        >
          Shop The Heat <span className="group-hover:translate-x-1 transition-transform">→</span>
        </motion.button>
      </div>

      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-12 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 100px -50px 0px" }}
              transition={{ delay: i * 0.05, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="snap-center shrink-0 w-[280px] md:w-[340px]"
            >
              <ProductCard product={p} variant="standard" />
            </motion.div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: colors.surface.secondary }}>
            <motion.div 
              className="h-full origin-left"
              style={{ background: isDark ? 'white' : 'black', scaleX: scrollXProgress }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
