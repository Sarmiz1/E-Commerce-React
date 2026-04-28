import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductComparisonBar({ 
  compareList, 
  onShowCompare, 
  onClearCompare, 
  isDark, 
  colors 
}) {
  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-0 sm:bottom-6 left-0 sm:left-1/2 sm:-translate-x-1/2 z-[1100] flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-fit px-3 sm:px-5 py-4 sm:py-3 rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] sm:shadow-2xl border-t sm:border backdrop-blur-xl"
          style={{
            background: isDark
              ? "rgba(30,30,34,0.95)"
              : "rgba(255,255,255,0.95)",
            borderColor: colors.border.default,
          }}
        >
          <span
            className="text-[10px] sm:text-xs font-bold shrink-0"
            style={{ color: colors.text.secondary }}
          >
            {compareList.length}/4
            <span className="hidden sm:inline"> selected</span>
          </span>
          <div className="flex items-center gap-2">
            {compareList.map((p) => (
              <div
                key={p.id}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border shrink-0"
                style={{ borderColor: colors.border.default }}
              >
                <img
                  src={p.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onShowCompare}
            disabled={compareList.length < 2}
            className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all disabled:opacity-40 shrink-0"
            style={{
              background: colors.cta.primary,
              color: colors.cta.primaryText,
            }}
          >
            Compare
          </motion.button>
          <button
            onClick={onClearCompare}
            className="text-[10px] sm:text-xs font-bold shrink-0"
            style={{ color: colors.text.tertiary }}
          >
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
