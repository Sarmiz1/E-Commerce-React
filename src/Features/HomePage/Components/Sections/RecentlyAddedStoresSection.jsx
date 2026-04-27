import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../Context/theme/ThemeContext";

const NEW_STORES = [
  { id: 10, name: "Aesthetics By Jane", category: "Handmade", tag: "Hot Pick" },
  { id: 11, name: "Gear Headz", category: "Automotive", tag: "New" },
  { id: 12, name: "Vitality Labs", category: "Health", tag: "Trending" },
];

export default function RecentlyAddedStoresSection() {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  return (
    <section className="py-24 border-y" style={{ background: colors.surface.primary, borderColor: colors.border.subtle }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 mb-6 inline-block">Fresh Arrivals</span>
          <h2 className="text-4xl font-black mb-4" style={{ color: colors.text.primary }}>Recently Added Stores</h2>
          <p className="text-sm max-w-md text-center mb-8" style={{ color: colors.text.tertiary }}>Discover the newest entrepreneurial talent joining our ecosystem.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/sellers?sort=newest")}
            className="px-6 py-2 rounded-full text-xs font-bold border transition-colors"
            style={{ borderColor: colors.border.default, color: colors.text.primary }}
          >
            See All New Stores
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NEW_STORES.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
              className="p-8 rounded-[2rem] text-center relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-shadow"
              style={{ background: colors.surface.secondary, border: `1px solid ${colors.border.subtle}` }}
            >
              <div className="w-20 h-20 mx-auto rounded-full mb-6 flex items-center justify-center text-3xl shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" style={{ background: colors.surface.tertiary, color: colors.text.primary }}>
                🏪
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>{store.name}</h3>
              <p className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: colors.text.tertiary }}>{store.category}</p>
              
              <button className="px-6 py-3 rounded-full text-xs font-bold w-full transition-all group-hover:bg-opacity-90" style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
                Visit Store
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
