import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../Store/useThemeStore";

const TOP_SELLERS = [
  { id: 1, name: "Obsidian Maison", type: "Luxury Apparel", rating: 4.9, sales: "10k+", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Aura Tech", type: "Electronics", rating: 4.8, sales: "25k+", image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Lumina Home", type: "Interior Design", rating: 4.9, sales: "8k+", image: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Kicks & Co.", type: "Streetwear", rating: 4.7, sales: "50k+", image: "https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80&w=800" },
];

export default function TopSellersSection() {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  return (
    <section className="py-24" style={{ background: colors.surface.secondary }}>
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mt-2 tracking-tight" style={{ color: colors.text.primary }}>
              Top Sellers
            </h2>
            <p className="mt-4 text-sm max-w-xl" style={{ color: colors.text.secondary }}>
              The highest-rated boutiques and verified brands on our platform.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/sellers")}
            className="px-8 py-3 rounded-full font-bold text-sm border flex items-center gap-2 group"
            style={{ borderColor: colors.border.default, color: colors.text.primary }}
          >
            Explore All Sellers <span className="group-hover:translate-x-1 transition-transform">→</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOP_SELLERS.map((seller, i) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer rounded-3xl overflow-hidden relative"
              style={{ background: colors.surface.primary, border: `1px solid ${colors.border.subtle}` }}
              onClick={() => navigate(`/seller/${seller.id}`)}
            >
              <div className="h-48 relative overflow-hidden">
                <img src={seller.image} alt={seller.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-black text-xl">{seller.name}</h3>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{seller.type}</p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</p>
                  <p className="font-black text-lg" style={{ color: colors.brand.gold || '#f59e0b' }}>⭐ {seller.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sales</p>
                  <p className="font-black text-lg" style={{ color: colors.text.primary }}>{seller.sales}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
