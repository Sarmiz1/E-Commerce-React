import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";

export default function ViewMoreBtn({ sentinelRef, loading, allLoaded, count }) {
  const { colors, isDark } = useTheme();

  if (allLoaded && count === 0) return null;

  if (allLoaded) {
    return (
      <div
        className="col-span-full text-center py-12"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: colors.border.subtle }}>
          <div className="w-8 h-[1px]" style={{ background: colors.border.default }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>
            All {count} products shown
          </span>
          <div className="w-8 h-[1px]" style={{ background: colors.border.default }} />
        </div>
      </div>
    );
  }

  return (
    <div ref={sentinelRef} className="col-span-full flex flex-col items-center py-12 gap-4">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Premium loading dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: colors.text.tertiary }}
                animate={{ 
                  scale: [1, 1.5, 1], 
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium tracking-wide" style={{ color: colors.text.tertiary }}>
            Loading more…
          </span>
        </motion.div>
      )}

      {!loading && (
        <div className="h-px w-24 rounded-full" style={{ background: colors.border.subtle }} />
      )}
    </div>
  );
}
