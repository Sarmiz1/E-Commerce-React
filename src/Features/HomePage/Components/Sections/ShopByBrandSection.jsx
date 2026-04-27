import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../../Context/theme/ThemeContext";
import { BRANDS } from "../../Data/brands";

export default function ShopByBrandSection() {
  const { isDark, colors } = useTheme();

  return (
    <section className="py-20 overflow-hidden border-y" style={{ background: colors.surface.primary, borderColor: colors.border.subtle }}>
      <div className="max-w-screen-2xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black" style={{ color: colors.text.primary }}>Shop by brand</h2>
            <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>Explore collections from our premium partners.</p>
          </div>
          <button className="text-xs font-bold uppercase tracking-widest hover:underline" style={{ color: colors.text.primary }}>
            View Brand Directory
          </button>
        </div>
      </div>

      <div className="relative flex overflow-hidden">
        {/* Gradients to hide edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10" style={{ background: `linear-gradient(to right, ${colors.surface.primary}, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10" style={{ background: `linear-gradient(to left, ${colors.surface.primary}, transparent)` }} />
        
        <div className="flex whitespace-nowrap hp-marquee">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1, color: colors.text.primary }}
              className="px-12 py-8 mx-4 cursor-pointer text-4xl md:text-5xl font-black tracking-tighter transition-colors"
              style={{ color: colors.surface.tertiary }}
            >
              {b}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
