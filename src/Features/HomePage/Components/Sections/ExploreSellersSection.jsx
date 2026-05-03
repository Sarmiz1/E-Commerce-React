import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../store/useThemeStore";

export default function ExploreSellersSection() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <section className="py-32 relative overflow-hidden flex items-center justify-center text-center" style={{ background: isDark ? '#000' : '#111827' }}>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <motion.span 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white mb-6 inline-block backdrop-blur-md border border-white/20"
        >
          Global Marketplace
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
        >
          Explore Sellers
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-10 font-medium leading-relaxed"
        >
          Connect with independent artisans, luxury boutiques, and global brands. The perfect piece is waiting for you in our curated ecosystem.
        </motion.p>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/sellers")}
          className="px-10 py-4 rounded-full font-bold text-sm bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center gap-2 mx-auto"
        >
          Browse Directory <span>→</span>
        </motion.button>
      </div>
    </section>
  );
}
