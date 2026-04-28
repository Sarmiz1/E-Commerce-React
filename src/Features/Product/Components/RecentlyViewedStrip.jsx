import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useRecentlyViewed } from "../Hooks/useRecentlyViewed";
import WishlistHeart from "../../../Components/Ui/WishlistHeart";

export default function RecentlyViewedStrip() {
  const { colors, isDark } = useTheme();
  const { recentlyViewed } = useRecentlyViewed();

  if (!recentlyViewed.length) return null;

  return (
    <div 
      className="border-t mt-12"
      style={{ borderColor: colors.border.subtle }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-serif font-bold" style={{ color: colors.text.primary }}>
              Recently Viewed
            </h3>
            <p className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: colors.text.tertiary }}>
              Pick up where you left off
            </p>
          </div>
          <Link 
            to="/products" 
            className="text-xs font-bold transition-colors hover:opacity-80"
            style={{ color: colors.text.accent || colors.brand?.electricBlue || "#6366f1" }}
          >
            View all →
          </Link>
        </div>

        {/* Product cards strip */}
        <div className="flex gap-4 overflow-x-auto pb-2 select-none rv-strip" style={{ scrollbarWidth: "none" }}>
          <style>{`.rv-strip::-webkit-scrollbar{display:none}`}</style>
          {recentlyViewed.map((product, idx) => (
            <div
              key={product.id}
              className="group shrink-0 relative"
              style={{ width: "140px" }}
            >
              <WishlistHeart 
                className="absolute top-2 right-2 scale-75 origin-top-right"
                onToggle={(s) => console.log(`Recent product ${product.id} liked: ${s}`)}
              />
              <Link
                to={`/products/${product.slug || product.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  {/* Image */}
                  <div 
                    className="w-full aspect-[3/4] rounded-xl overflow-hidden mb-2.5 border"
                    style={{ 
                      background: colors.surface.tertiary,
                      borderColor: colors.border.subtle,
                    }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Info */}
                  <p 
                    className="text-[12px] font-medium line-clamp-1 leading-tight mb-1 group-hover:text-indigo-600 transition-colors"
                    style={{ color: colors.text.primary }}
                  >
                    {product.name}
                  </p>
                  <p className="text-[13px] font-black" style={{ color: colors.text.primary }}>
                    {formatMoneyCents(product.price_cents)}
                  </p>
                </motion.div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
