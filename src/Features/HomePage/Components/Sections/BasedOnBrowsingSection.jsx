import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../../../Components/Ui/ProductCard";
import { useTheme } from "../../../../Store/useThemeStore";

export default function BasedOnBrowsingSection({ products, isLoading }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  if (isLoading || !products?.length) return null;

  const row1 = products.slice(0, Math.ceil(products.length / 2));
  const row2 = products.slice(Math.ceil(products.length / 2));

  return (
    <section className="py-24 border-y" style={{ background: colors.surface.tertiary, borderColor: colors.border.subtle }}>
      <div className="max-w-screen-2xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold italic mb-4" style={{ color: colors.text.primary }}>
          Based on your recent browsing
        </h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/products/history")}
          className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors"
          style={{ borderColor: colors.border.default, color: colors.text.secondary, hover: { background: colors.surface.primary } }}
        >
          View Browsing History
        </motion.button>
      </div>

      <div className="w-full overflow-x-auto pb-8 snap-x cursor-grab active:cursor-grabbing" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex flex-col gap-8 w-max px-6 hide-scrollbar">
          {/* Row 1 */}
          <div className="flex gap-6 items-center pl-10">
            {row1.map((p, i) => (
              <motion.div 
                key={p.id}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                className="w-[240px] md:w-[300px] shrink-0 snap-center"
              >
                <ProductCard product={p} variant="compact" />
              </motion.div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex gap-6 items-center pr-10">
            {row2.map((p, i) => (
              <motion.div 
                key={p.id}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? -2 : 2 }}
                className="w-[240px] md:w-[300px] shrink-0 snap-center"
              >
                <ProductCard product={p} variant="compact" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
