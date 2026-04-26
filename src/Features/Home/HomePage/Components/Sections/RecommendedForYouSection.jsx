import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../../../../Components/Ui/ProductCard";
import { useTheme } from "../../../../../Context/theme/ThemeContext";
import SectionLabel from "../SectionLabel";

export default function RecommendedForYouSection({ products, isLoading }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  if (isLoading || products?.length < 5) return null;

  const featured = products[0];
  const gridProducts = products.slice(1, 5);

  return (
    <section className="py-24" style={{ background: colors.surface.primary }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <SectionLabel label="Personalized Picks" />
            <h2 className="text-4xl md:text-5xl font-black mt-2 tracking-tight" style={{ color: colors.text.primary }}>
              Recommended For You
            </h2>
          </div>
          <motion.button 
            whileHover={{ x: 4 }}
            onClick={() => navigate("/products?sort=recommended")}
            className="font-bold text-sm flex items-center gap-2 group"
            style={{ color: colors.text.accent || '#4f46e5' }}
          >
            See all recommendations <span className="group-hover:translate-x-1 transition-transform">→</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured Large Item */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="h-full relative p-1 rounded-3xl" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)' }}>
              <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-widest uppercase">
                Top Match
              </div>
              <ProductCard product={featured} variant="overlay" />
            </div>
          </motion.div>

          {/* 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {gridProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <ProductCard product={p} variant="standard" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
