import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { ACTIVITY_TEMPLATES } from "../constants";

export default function LiveTicker({ products }) {
  const { colors, isDark } = useTheme();

  // Pre-generate a large stable list to loop infinitely without state updates
  const events = useMemo(() => {
    if (!products || !products.length) return [];
    return Array.from({ length: 40 }, (_, i) => {
      const p = products[i % products.length];
      const tpl = ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length];
      return { 
        id: `ticker-ev-${i}`, 
        emoji: tpl.emoji, 
        text: tpl.tpl.replace("[name]", (p?.name || "Premium Item").slice(0, 28)) 
      };
    });
  }, [products]);

  if (!events.length) return null;
  const doubled = [...events, ...events];

  return (
    <div className="border-b overflow-hidden py-2 flex-shrink-0 relative" style={{ background: isDark ? '#09090b' : '#f8fafc', borderColor: colors.border.subtle }}>
      {/* Subtle gradient fades on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${isDark ? '#09090b' : '#f8fafc'}, transparent)` }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${isDark ? '#09090b' : '#f8fafc'}, transparent)` }} />
      
      <motion.div 
        className="flex whitespace-nowrap select-none w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 80 }}
      >
        {doubled.map((ev, i) => (
          <span key={`${ev.id}-${i}`} className="inline-flex items-center gap-2 px-6 text-xs font-medium flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: colors.text.secondary }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block pg-dot flex-shrink-0" style={{ background: colors.state?.success || '#22c55e' }} />
            <span>{ev.emoji}</span>
            <span>{ev.text}</span>
            <span className="mx-2 opacity-40">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
