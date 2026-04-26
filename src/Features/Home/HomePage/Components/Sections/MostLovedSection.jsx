import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../../../../Components/Ui/ProductCard";
import { useTheme } from "../../../../../Context/theme/ThemeContext";

export default function MostLovedSection({ products, isLoading }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  if (isLoading || !products?.length) return null;

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: colors.surface.secondary }}>
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }} 
            whileInView={{ scale: 1, rotate: 0 }} 
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="w-16 h-16 mx-auto mb-6 bg-rose-50 text-rose-500 shadow-xl shadow-rose-500/20 rounded-full flex items-center justify-center text-3xl"
          >
            ❤️
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight" style={{ color: colors.text.primary }}>
            Most Loved
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
            Our community's absolute favorites. Curated by passion, backed by thousands of 5-star reviews. Find out what everyone is obsessed with.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.slice(0, 4).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
              className={`hover:z-10 ${i % 2 === 0 ? "lg:-translate-y-8" : "lg:translate-y-8"}`}
            >
              <ProductCard product={p} variant="overlay" />
            </motion.div>
          ))}
        </div>

        <div className="mt-32 text-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/products?sort=top_rated")}
            className="px-10 py-4 rounded-full font-bold text-sm inline-flex items-center gap-2 group shadow-[0_10px_40px_-10px_rgba(225,29,72,0.5)]"
            style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', color: 'white' }}
          >
            Explore the Hall of Fame <span className="group-hover:rotate-45 transition-transform">↗</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
