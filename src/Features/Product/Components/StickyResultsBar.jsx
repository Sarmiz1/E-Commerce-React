import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { IconFilter } from "../../../Components/Icons/IconFilter";

export default function StickyResultsBar({ 
  resultCount, 
  selectedCategory, 
  sortLabel, 
  onOpenFilter,
  children 
}) {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const trigger = 280; // px from top before sticky bar appears
    const onScroll = () => setVisible(window.scrollY > trigger);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[90] flex justify-center px-4"
        >
          <div 
            className="w-full max-w-screen-xl mt-2 px-5 py-2.5 rounded-2xl border flex items-center justify-between gap-4 backdrop-blur-xl"
            style={{ 
              background: isDark ? "rgba(18,18,22,0.88)" : "rgba(255,255,255,0.92)",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* Left: Category + count */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-black uppercase tracking-widest shrink-0" style={{ color: colors.text.tertiary }}>
                {selectedCategory}
              </span>
              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: colors.text.tertiary }} />
              <span className="text-[12px] font-bold shrink-0" style={{ color: colors.text.secondary }}>
                {resultCount} items
              </span>
            </div>

            {/* Center: active filter chips (passed as children) */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center overflow-hidden">
              {children}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenFilter}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all"
                style={{ 
                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  color: colors.text.secondary 
                }}
              >
                <IconFilter className="w-3 h-3" /> Filter
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
                style={{ 
                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  color: colors.text.secondary 
                }}
                title="Back to top"
              >
                ↑
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
