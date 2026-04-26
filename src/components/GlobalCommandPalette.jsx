import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAllProducts } from "../Features/Product/Hooks/useProducts"; 
import { useTheme } from "../Context/theme/ThemeContext"; 
import { formatMoneyCents } from "../Utils/formatMoneyCents";

export default function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data: products = [] } = useAllProducts();
  const { isDark, colors } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = products
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 6);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-[90%] max-w-2xl rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ background: colors.surface.primary, border: `1px solid ${colors.border.subtle}` }}
          >
            {/* Search Input */}
            <div className="p-5 border-b flex items-center gap-4" style={{ borderColor: colors.border.subtle }}>
              <span className="text-2xl opacity-50">🔍</span>
              <input
                autoFocus
                type="text"
                placeholder="Search products, brands, or commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xl font-medium outline-none placeholder:opacity-40"
                style={{ color: colors.text.primary }}
              />
              <span className="text-[10px] font-bold px-2 py-1 rounded uppercase shadow-sm" style={{ background: colors.surface.secondary, color: colors.text.secondary }}>ESC</span>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar">
              {searchQuery === "" ? (
                <div className="py-12 text-center" style={{ color: colors.text.tertiary }}>
                  <div className="text-4xl mb-4">✨</div>
                  <p className="font-bold">Type to search the platform.</p>
                  <p className="text-sm mt-1">Try searching for "jacket", "tech", or "new".</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center" style={{ color: colors.text.tertiary }}>
                  <p className="font-bold">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>Products</p>
                  {results.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/products/${p.slug || p.id}`);
                      }}
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors"
                      style={{ hover: { background: colors.surface.secondary } }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.surface.secondary}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover shadow-sm" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm" style={{ color: colors.text.primary }}>{p.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: colors.text.tertiary }}>{p.category || 'Clothing'}</p>
                          <p className="text-xs font-black" style={{ color: colors.brand.primary || colors.text.primary }}>{formatMoneyCents(p.price_cents)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold opacity-30 px-4">↵</span>
                    </motion.div>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t px-2" style={{ borderColor: colors.border.subtle }}>
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/products?search=${searchQuery}`);
                      }}
                      className="w-full py-3 rounded-lg text-sm font-bold transition-colors text-center"
                      style={{ background: colors.surface.secondary, color: colors.text.primary }}
                    >
                      View all {results.length}+ results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t flex justify-between items-center text-[10px] uppercase font-bold tracking-widest" style={{ borderColor: colors.border.subtle, color: colors.text.tertiary, background: colors.surface.secondary }}>
              <span>Global Command Palette</span>
              <span className="flex gap-2">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
